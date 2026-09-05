'use client'

import { useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { uploadFileWithProgress } from '@/lib/uploader'

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  uploadUrl?: string
  fileKey?: string
}

interface UploadFlowProps {
  contentType: 'video' | 'image' | 'subtitle' | 'thumbnail'
  onUploadComplete?: (fileKey: string, fileId: string) => void
  maxFiles?: number
  acceptedFileTypes?: string
}

export function UploadFlow({
  contentType,
  onUploadComplete,
  maxFiles = 5,
  acceptedFileTypes,
}: UploadFlowProps) {
  const { data: session } = useSession()
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)

  const isUploading = useMemo(
    () => files.some((f) => f.status === 'uploading' || f.status === 'processing'),
    [files]
  )

  const LARGE_FILE_WARNING_BYTES = 1024 * 1024 * 1024 // 1 GB warning threshold (soft warning only)

  const getAcceptedTypes = () => {
    if (acceptedFileTypes) return acceptedFileTypes

    switch (contentType) {
      case 'video':
        return 'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm'
      case 'image':
        return 'image/jpeg,image/png,image/webp,image/gif'
      case 'subtitle':
        return '.vtt,.srt'
      case 'thumbnail':
        return 'image/jpeg,image/png'
      default:
        return '*'
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFiles(droppedFiles)
    },
    [files]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files)
        handleFiles(selectedFiles)
      }
    },
    [files]
  )

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'pending',
    }))

    setFiles((prev) => [...prev, ...uploadFiles])

    setGlobalError(null)

    // Start uploading each file
    uploadFiles.forEach((uploadFile) => {
      startUpload(uploadFile)
    })
  }

  const startUpload = async (uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      updateFileStatus(uploadFile.id, { status: 'uploading', progress: 0 })

      // Step 1: Get signed URL from our API
      let signedUrlResponse: Response
      try {
        signedUrlResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: uploadFile.file.name,
            fileType: uploadFile.file.type,
            fileSize: uploadFile.file.size,
            contentType,
          }),
        })
      } catch (err) {
        throw new Error('Network error while requesting upload URL')
      }

      if (!signedUrlResponse.ok) {
        let errorMessage = 'Failed to get upload URL'
        try {
          const error = await signedUrlResponse.json()
          errorMessage = error.error || error.message || errorMessage
        } catch {}
        throw new Error(errorMessage)
      }

      const { uploadUrl, fileId, fileKey } = await signedUrlResponse.json()

      // Step 2: Upload file directly using streaming-friendly XHR
      await uploadFileWithProgress({
        url: uploadUrl,
        method: 'PUT',
        file: uploadFile.file,
        headers: {
          'Content-Type': uploadFile.file.type,
        },
        onProgress: ({ percent }) => {
          updateFileStatus(uploadFile.id, { progress: percent, status: 'uploading' })
        },
      })

      updateFileStatus(uploadFile.id, {
        status: 'processing',
        progress: 100,
        uploadUrl,
        fileKey,
      })

      // Poll for processing status
      pollProcessingStatus(uploadFile.id, fileId, fileKey)
    } catch (error) {
      console.error('Upload error:', error)
      updateFileStatus(uploadFile.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      })
      setGlobalError(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const pollProcessingStatus = async (uploadFileId: string, fileId: string, fileKey: string) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await fetch(`/api/upload?fileId=${fileId}`)
        if (!response.ok) throw new Error('Failed to check status')

        const data = await response.json()

        if (data.status === 'completed') {
          updateFileStatus(uploadFileId, { status: 'completed' })
          onUploadComplete?.(fileKey, fileId)
        } else if (data.status === 'failed') {
          updateFileStatus(uploadFileId, {
            status: 'error',
            error: 'Processing failed',
          })
        } else if (attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          updateFileStatus(uploadFileId, {
            status: 'error',
            error: 'Processing timeout',
          })
        }
      } catch (error) {
        console.error('Status check error:', error)
      }
    }

    poll()
  }

  const updateFileStatus = (id: string, updates: Partial<Omit<UploadFile, 'id' | 'file'>>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 bg-gray-100'
      case 'uploading':
        return 'text-blue-600 bg-blue-100'
      case 'processing':
        return 'text-yellow-600 bg-yellow-100'
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'uploading':
        return '⬆️'
      case 'processing':
        return '⚙️'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '📄'
    }
  }

  if (!session) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600">Please sign in to upload files</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {globalError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {globalError}
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        aria-busy={isUploading}
      >
        <input
          type="file"
          id={`file-upload-${contentType}`}
          multiple={maxFiles > 1}
          accept={getAcceptedTypes()}
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-4">
          <div className="text-6xl">📤</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="text-sm text-gray-600 mt-1">or</p>
          </div>
          <label
            htmlFor={`file-upload-${contentType}`}
            className={`inline-block px-6 py-3 rounded-lg font-medium transition ${
              isUploading
                ? 'bg-purple-300 text-white cursor-not-allowed'
                : 'bg-purple-600 text-white cursor-pointer hover:bg-purple-700'
            }`}
            aria-disabled={isUploading}
          >
            {isUploading ? 'Uploading…' : 'Browse Files'}
          </label>
          <div className="text-xs text-gray-500 mt-2">
            <p>Accepted formats: {contentType}</p>
            <p>Maximum {maxFiles} files</p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Uploads ({files.length})</h3>
          {files.map((uploadFile) => (
            <div
              key={uploadFile.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-2xl flex-shrink-0">{getStatusIcon(uploadFile.status)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{uploadFile.file.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(uploadFile.file.size)}</p>
                    {uploadFile.file.size >= LARGE_FILE_WARNING_BYTES && (
                      <p className="text-xs text-amber-600 mt-1">
                        Large file detected. Upload may take time; keep this tab open.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                      uploadFile.status
                    )}`}
                  >
                    {uploadFile.status}
                  </span>
                  {(uploadFile.status === 'pending' || uploadFile.status === 'error') && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>
                      {uploadFile.status === 'uploading' ? 'Uploading…' : 'Processing...'}
                    </span>
                    <span>{uploadFile.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        uploadFile.status === 'uploading' ? 'bg-blue-600' : 'bg-yellow-600'
                      }`}
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadFile.error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {uploadFile.error}
                </div>
              )}

              {/* Success Message */}
              {uploadFile.status === 'completed' && uploadFile.fileKey && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  Upload complete! File key: {uploadFile.fileKey}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
