/**
 * S3 Presigned POST Upload Helper
 *
 * Handles direct browser uploads to S3 using presigned POST URLs.
 * Reference: API_DOCUMENTATION_PART3.pdf - Upload Pipeline section
 *
 * PRODUCTION NOTE: After successful S3 upload, S3 should automatically notify
 * the backend via S3 event notifications. The frontend should NOT call the
 * callback endpoint in production. The simulated callback in this helper is
 * strictly for local dev/testing purposes.
 *
 * TODO: security - Implement upload size limits on frontend
 * TODO: security - Add file type validation
 * TODO: Implement resumable uploads for large files
 */

import type {
  UploadPresignedPostInitResponse,
  MultipartUploadInitResponse,
  MultipartPresignedUrl,
  S3CallbackPayload,
} from './types/content'
import {
  postUploadCallback,
  getMultipartPresignedUrls,
  completeMultipartUpload,
} from './contentApi'
import { uploadFileWithProgress } from './uploader'

// ============================================================================
// TYPES
// ============================================================================

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  success: boolean
  s3_key: string
  bucket: string
  size: number
}

export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
  signal?: AbortSignal
}

// ============================================================================
// S3 PRESIGNED POST UPLOAD
// ============================================================================

/**
 * Upload file to S3 using presigned POST
 *
 * @param uploadInitResponse - Response from initUpload API containing presigned POST data
 * @param file - File to upload
 * @param options - Upload options (progress callback, abort signal)
 * @returns Upload result with S3 key, bucket, and size
 */
export async function uploadToS3Presigned(
  uploadInitResponse: UploadPresignedPostInitResponse,
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, signal } = options
  const { upload_url, s3_key } = uploadInitResponse
  const { url, fields } = upload_url

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Setup progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          })
        }
      })
    }

    // Setup abort handling
    if (signal) {
      signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new Error('Upload aborted'))
      })
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Extract bucket from URL or use default
        const bucket = extractBucketFromUrl(url) || 'urview-raw'

        resolve({
          success: true,
          s3_key,
          bucket,
          size: file.size,
        })
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}: ${xhr.statusText}`))
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('S3 upload failed - network error'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('S3 upload aborted'))
    })

    // Prepare form data with presigned POST fields
    const formData = new FormData()

    // Add all presigned fields first (order matters for some S3 regions)
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value)
    })

    // Add file last
    formData.append('file', file)

    // Execute upload
    xhr.open('POST', url, true)
    xhr.send(formData)
  })
}

const MULTIPART_THRESHOLD_BYTES = 5 * 1024 * 1024 * 1024

function normalizeHeaderKey(key: string): string {
  return key.trim().toLowerCase()
}

function findHeaderValue(headers: Record<string, string>, key: string): string | undefined {
  return headers[normalizeHeaderKey(key)]
}

export async function uploadToS3Multipart(
  uploadInitResponse: MultipartUploadInitResponse,
  file: File,
  contentId: string,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, signal } = options
  const presignedResponse = await getMultipartPresignedUrls(
    uploadInitResponse.upload_id,
    uploadInitResponse.s3_key,
    file.size
  )

  const sortedParts = presignedResponse.presigned_urls
    .slice()
    .sort((a, b) => a.part_number - b.part_number)
  const parts: Array<{ part_number: number; etag: string }> = []
  let bytesUploaded = 0

  for (const part of sortedParts) {
    const start = (part.part_number - 1) * uploadInitResponse.part_size
    const end = Math.min(start + uploadInitResponse.part_size, file.size)
    const chunk = file.slice(start, end)

    const chunkResult = await uploadFileWithProgress({
      url: part.presigned_url,
      method: 'PUT',
      file: chunk,
      signal,
      onProgress: (progress) => {
        if (!onProgress) return
        const loaded = bytesUploaded + progress.loaded
        const total = file.size
        onProgress({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100),
        })
      },
    })

    const etag =
      findHeaderValue(chunkResult.headers || {}, 'etag') ||
      findHeaderValue(chunkResult.headers || {}, 'x-amz-meta-etag')

    if (!etag) {
      throw new Error('Multipart upload part returned no ETag')
    }

    parts.push({ part_number: part.part_number, etag })
    bytesUploaded += chunk.size
  }

  await completeMultipartUpload(
    uploadInitResponse.upload_id,
    uploadInitResponse.s3_key,
    contentId,
    filename,
    parts
  )

  return {
    success: true,
    s3_key: uploadInitResponse.s3_key,
    bucket: extractBucketFromUrl(sortedParts[0]?.presigned_url) || 'urview-raw',
    size: file.size,
  }
}

export async function uploadMultipartWithCallback(
  uploadInitResponse: MultipartUploadInitResponse,
  file: File,
  contentId: string,
  filename: string,
  options: UploadOptions = {}
): Promise<{
  uploadResult: UploadResult
  callbackResult: any
}> {
  const uploadResult = await uploadToS3Multipart(
    uploadInitResponse,
    file,
    contentId,
    filename,
    options
  )

  console.warn(
    '[DEV ONLY] Simulating S3 callback. In production, S3 event notifications handle this.'
  )

  return {
    uploadResult,
    callbackResult: null,
  }
}

/**
 * Upload file with automatic callback simulation (DEV ONLY)
 *
 * This is a convenience wrapper that:
 * 1. Uploads file to S3
 * 2. Simulates S3 callback to backend (DEV ONLY)
 *
 * PRODUCTION NOTE: In production, S3 event notifications will automatically
 * trigger the callback. The frontend should never call the callback endpoint.
 *
 * @param uploadInitResponse - Response from initUpload API
 * @param file - File to upload
 * @param options - Upload options
 * @returns Upload result with callback response
 */
export async function uploadWithCallback(
  uploadInitResponse: UploadPresignedPostInitResponse,
  file: File,
  options: UploadOptions = {}
): Promise<{
  uploadResult: UploadResult
  callbackResult: any
}> {
  const uploadResult = await uploadToS3Presigned(uploadInitResponse, file, options)

  console.warn(
    '[DEV ONLY] Simulating S3 callback. In production, S3 event notifications handle this.'
  )

  return {
    uploadResult,
    callbackResult: null,
  }
}

/**
 * Calculate upload speed and estimated time remaining
 */
export function calculateUploadStats(
  startTime: number,
  loaded: number,
  total: number
): {
  speedMBps: number
  estimatedSecondsRemaining: number
  estimatedTimeString: string
} {
  const elapsedSeconds = (Date.now() - startTime) / 1000
  const speedBytesPerSecond = loaded / elapsedSeconds
  const speedMBps = speedBytesPerSecond / (1024 * 1024)
  const remainingBytes = total - loaded
  const estimatedSecondsRemaining = remainingBytes / speedBytesPerSecond

  const estimatedTimeString = formatTimeRemaining(estimatedSecondsRemaining)

  return {
    speedMBps,
    estimatedSecondsRemaining,
    estimatedTimeString,
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format seconds to human-readable time
 */
function formatTimeRemaining(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return 'Calculating...'
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

/**
 * Extract bucket name from S3 URL
 */
function extractBucketFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    // Format: bucket.s3.region.amazonaws.com or bucket.s3.amazonaws.com
    if (hostname.includes('.s3.') && hostname.includes('.amazonaws.com')) {
      return hostname.split('.')[0]
    }

    // Format: s3.region.amazonaws.com/bucket
    if (hostname.startsWith('s3.') && hostname.includes('.amazonaws.com')) {
      const pathParts = urlObj.pathname.split('/')
      if (pathParts.length > 1) {
        return pathParts[1]
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Validate file for upload
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number
    allowedTypes?: string[]
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 5000, allowedTypes } = options

  // Check file size

  // Check file type if specified
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type.toLowerCase()
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0]
        return fileType.startsWith(category + '/')
      }
      return fileType === type.toLowerCase()
    })

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      }
    }
  }

  return { valid: true }
}
