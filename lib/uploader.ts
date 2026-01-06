import { logMockDataUsage, USE_MOCK_DATA } from './config'

export type UploadMethod = 'PUT' | 'POST'

export interface UploadRequest {
  url: string
  method?: UploadMethod
  file: File
  fieldName?: string
  headers?: Record<string, string>
  timeoutMs?: number
  signal?: AbortSignal
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void
}

export interface UploadResult {
  status: number
  response?: any
  fileKey?: string
}

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes; backend can adjust if needed

/**
 * Stream a file via XHR to support progress + timeout.
 * - Supports PUT (raw body) and POST (multipart FormData).
 * - Avoids base64 / JSON encoding of file payloads.
 */
export function uploadFileWithProgress(req: UploadRequest): Promise<UploadResult> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('uploadFileWithProgress')
  }

  const {
    url,
    method = 'PUT',
    file,
    fieldName = 'file',
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal,
    onProgress,
  } = req

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    const abortHandler = () => {
      xhr.abort()
      reject(new Error('Upload aborted'))
    }

    if (signal) {
      if (signal.aborted) {
        return abortHandler()
      }
      signal.addEventListener('abort', abortHandler, { once: true })
    }

    xhr.timeout = timeoutMs

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return
      const percent = Math.round((event.loaded / event.total) * 100)
      onProgress({ loaded: event.loaded, total: event.total, percent })
    }

    xhr.onerror = () => {
      reject(new Error('Network error during upload'))
    }

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out'))
    }

    xhr.onload = () => {
      const status = xhr.status
      // Try to parse JSON but do not fail if not JSON
      let response: any = undefined
      try {
        response = JSON.parse(xhr.responseText)
      } catch {
        response = xhr.responseText
      }

      if (status >= 200 && status < 300) {
        resolve({ status, response })
      } else {
        const message = typeof response === 'string' ? response : response?.error || 'Upload failed'
        reject(new Error(message))
      }
    }

    xhr.open(method, url)

    // Set headers
    Object.entries(headers).forEach(([k, v]) => {
      if (v !== undefined) xhr.setRequestHeader(k, v)
    })

    if (method === 'POST') {
      const form = new FormData()
      form.append(fieldName, file, file.name)
      xhr.send(form)
    } else {
      // PUT/RAW upload
      xhr.send(file)
    }
  })
}
