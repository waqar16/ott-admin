/**
 * Content Management API Module
 * 
 * API client for content CRUD, upload initialization, image uploads,
 * series/seasons/episodes, renditions, and manifest operations.
 * 
 * Reference: API_DOCUMENTATION_PART3.pdf - Content Management endpoints
 * Base URL: Uses NEXT_PUBLIC_API_BASE from environment variables
 * 
 * Implements:
 * - Content CRUD (create, read, update, list, publish)
 * - Upload initialization (presigned POST)
 * - S3 callback simulation (dev only)
 * - Image uploads (poster, banner, thumbnail)
 * - Series, Seasons, Episodes management
 * - Renditions listing
 * - Manifest retrieval
 * - DRM key retrieval
 * 
 * Security Notes:
 * - All authenticated endpoints require Authorization header with JWT
 * - S3 callback endpoint requires x-api-key header (dev simulation only)
 * - MediaConvert webhook requires x-api-key header (dev simulation only)
 * - In production, S3 and MediaConvert should call backend directly via event notifications
 * 
 * TODO: security - Confirm server-side webhook signature validation
 * TODO: security - Implement API key rotation strategy
 * TODO: security - Use httpOnly cookies for production authentication
 */

import { API_BASE, USE_MOCK_DATA, logMockDataUsage } from './config';
import { getAccessToken } from './tokenStore';
import type {
  Content,
  CreateContentPayload,
  UpdateContentPayload,
  ContentListResponse,
  UploadInitResponse,
  S3CallbackPayload,
  ImageUploadResponse,
  Rendition,
  RenditionsListResponse,
  ManifestResponse,
  Series,
  Season,
  Episode,
  CreateSeriesPayload,
  CreateSeasonPayload,
  CreateEpisodePayload,
  DrmKeyResponse,
  ApiError,
} from './types/content';

// ============================================================================
// CONFIGURATION
// ============================================================================

const S3_CALLBACK_KEY = process.env.NEXT_PUBLIC_S3_CALLBACK_KEY || 'devtestkey';

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_CONTENT: Content[] = [
  {
    id: 'content-1',
    title: 'Sample Movie',
    description: 'A great sample movie for testing',
    content_type: 'movie',
    media_type: 'flat',
    status: 'published',
    is_kid_safe: false,
    is_ppv: false,
    genres: ['Action', 'Sci-Fi'],
    poster_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
    banner_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
    duration_seconds: 7200,
    rating: 'PG-13',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'content-2',
    title: 'Kids Adventure',
    description: 'Fun adventure for children',
    content_type: 'movie',
    media_type: 'flat',
    status: 'published',
    is_kid_safe: true,
    is_ppv: false,
    genres: ['Kids', 'Adventure'],
    poster_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_RENDITIONS: Rendition[] = [
  {
    id: 'rendition-1',
    asset: 'asset-1',
    preset: 'HLS_720p',
    width: 1280,
    height: 720,
    bitrate: 2500000,
    codec: 'h264',
    s3_key: 'processed/content-1/hls_720p/playlist.m3u8',
    manifest_url: 'https://cdn.example.com/content-1/720p/playlist.m3u8',
    drm_required: false,
    quality_label: '720p',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rendition-2',
    asset: 'asset-1',
    preset: 'HLS_1080p',
    width: 1920,
    height: 1080,
    bitrate: 5000000,
    codec: 'h264',
    s3_key: 'processed/content-1/hls_1080p/playlist.m3u8',
    manifest_url: 'https://cdn.example.com/content-1/1080p/playlist.m3u8',
    drm_required: false,
    quality_label: '1080p',
    created_at: new Date().toISOString(),
  },
];

let mockContentStore = [...MOCK_CONTENT];

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Build authorization headers for authenticated requests
 */
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Handle API errors and create structured error object
 */
async function handleApiError(response: Response): Promise<ApiError> {
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  
  // Handle array-based error messages (e.g., from validation)
  let message = response.statusText || 'An error occurred';
  if (Array.isArray(body)) {
    message = typeof body[0] === 'string' ? body[0] : message;
  } else {
    message = body?.message || body?.detail || message;
  }
  
  const error: ApiError = {
    status: response.status,
    message,
    body,
  };
  
  // Mark 401 errors for auth handling
  if (response.status === 401) {
    error.needAuth = true;
  }
  
  return error;
}

// ============================================================================
// CONTENT CRUD API
// ============================================================================

/**
 * Create a new content record
 * POST /api/v1/content/contents
 */
export async function deleteContentContent(contentId): Promise<any> {
  
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/contents/${contentId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(), 
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
export async function createContent(payload: CreateContentPayload): Promise<Content> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('createContent');
    
    const newContent: Content = {
      id: `content-${Date.now()}`,
      ...payload,
      status: payload.status || 'draft',
      is_kid_safe: payload.is_kid_safe || false,
      is_ppv: payload.is_ppv || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockContentStore.push(newContent);
    return newContent;
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/contents`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Update an existing content record
 * PATCH /api/v1/content/contents/{contentId}
 */
export async function updateContent(
  contentId: string,
  payload: UpdateContentPayload
): Promise<Content> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('updateContent');
    
    const index = mockContentStore.findIndex(c => c.id === contentId);
    if (index === -1) {
      throw {
        status: 404,
        message: 'Content not found',
      } as ApiError;
    }
    
    mockContentStore[index] = {
      ...mockContentStore[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    
    return mockContentStore[index];
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/contents/${contentId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    } 
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
export async function deleteContent(
  contentId: string
): Promise<number|string> {
   
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/contents/${contentId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(), 
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return response.status
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
/**
 * Get a single content record by ID
 * GET /api/v1/content/contents/{contentId}
 */
export async function getContent(contentId: string): Promise<Content> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('getContent');
    
    const content = mockContentStore.find(c => c.id === contentId);
    if (!content) {
      throw {
        status: 404,
        message: 'Content not found',
      } as ApiError;
    }
    
    return content;
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/contents/${contentId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * List content with pagination and filters
 * GET /api/v1/content/contents
 */
export async function listContent({
  page = 1,
  pageSize = 20,
  status, 
  content_type,
  is_kid_safe,
  is_ppv,
  search, 
  media_type 
}: {
  page?: number;
  pageSize?: number;
  status?: string; 
  content_type?: string;
  is_kid_safe?: boolean;
  is_ppv?: boolean;
  search?: string;
  media_type?: string;
} = {}): Promise<ContentListResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('listContent');
        console.log(typeof Boolean(is_kid_safe),"typeof typeof Boolean(is_kid_safe) == boolean")
    console.log(typeof Boolean(is_ppv),"typeof Boolean(is_ppv) == boolean")
    let filtered = [...mockContentStore];
    
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (media_type) {
      filtered = filtered.filter(c => c.media_type === media_type);
    }
    if (content_type) {
      filtered = filtered.filter(c => c.content_type === content_type);
    }
    if (typeof Boolean(is_kid_safe) == 'boolean') {
      filtered = filtered.filter(c => c.is_kid_safe === is_kid_safe);
    }

    if (typeof Boolean(is_ppv) == 'boolean') {
      filtered = filtered.filter(c => c.is_ppv === is_ppv);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);
    
    return {
      count: filtered.length,
      next: end < filtered.length ? `page=${page + 1}` : null,
      previous: page > 1 ? `page=${page - 1}` : null,
      results: paginated,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (status) params.append('status', status);
    if (media_type) params.append('media_type', media_type);
    if (content_type) params.append('content_type', content_type);
    if (typeof Boolean(is_kid_safe) === 'boolean') params.append('is_kid_safe', String(is_kid_safe));
    if (typeof Boolean(is_ppv) === 'boolean') params.append('is_ppv', String(is_ppv));
    if (search) params.append('search', search);
    
    const url =  
    `${API_BASE}api/v1/content/contents?content_type=${content_type}&${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
export async function retryTranscoding(contentId: string): Promise<any> {
  
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/admin-dashboard/content/video-assets/${contentId}/retry-transcode`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(), 
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
/**
 * Publish content (change status to published)
 * POST /api/v1/content/content/{content_id}/publish
 */
export async function publishContent(contentId: string,status?:string): Promise<Content> {
  
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/contents/${contentId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: status??'published' }),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

// ============================================================================
// UPLOAD INITIALIZATION API
// ============================================================================

/**
 * Initialize upload and get presigned POST URL
 * POST /api/v1/content/content/upload/init
 */
export async function initUpload(
  contentId: string,
  filename: string,
  isDriveUpload?: boolean,
  googleAccessToken?: string
): Promise<UploadInitResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('initUpload');
    
    // Mock presigned POST response
    return {
      upload_url: {
        url: 'https://urview-raw.s3.amazonaws.com',
        fields: {
          key: `raw/content/${contentId}/${filename}`,
          'x-amz-algorithm': 'AWS4-HMAC-SHA256',
          'x-amz-credential': 'MOCK_CREDENTIAL',
          'x-amz-date': new Date().toISOString(),
          policy: 'MOCK_POLICY',
          'x-amz-signature': 'MOCK_SIGNATURE',
        },
      },
      s3_key: `raw/content/${contentId}/${filename}`,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  } 
  try {
    const url = `${API_BASE}api/v1/content/content/upload/init`;
    let response;
    if(isDriveUpload){
      response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        google_drive_file_id:filename,
        content_id: contentId,
        filename,
        google_drive_access_token: googleAccessToken
      }),
    })
    } 
    else{
      response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        filename,
        content_id: contentId,
      }),
    })
    }
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Simulate S3 callback (DEV ONLY)
 * POST /api/v1/content/uploads/s3-callback
 * 
 * PRODUCTION NOTE: In production, this endpoint should ONLY be called by S3 via event notifications.
 * The frontend should NOT call this endpoint in production.
 * This function is strictly for local dev/testing to simulate the S3 callback.
 * 
 * TODO: security - Implement webhook signature validation on backend
 * TODO: security - Rotate API keys regularly
 */
export async function postUploadCallback(payload: S3CallbackPayload): Promise<any> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('postUploadCallback');
    
    return {
      message: 'S3 callback processed (mock)',
      asset_id: `asset-${Date.now()}`,
      status: 'pending',
    };
  }
  
  try {
    const url = `${API_BASE}api/v1/content/uploads/s3-callback`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': S3_CALLBACK_KEY,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

// ============================================================================
// IMAGE UPLOAD API
// ============================================================================

/**
 * Upload poster or banner image
 * POST /api/v1/content/content/{content_id}/images
 */
export async function fetchSubtitles(
  contentId: string,
  
): Promise<any> {
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/content/${contentId}/subtitles/list`;
    
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('image_type', imageType);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      }, 
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
export async function uploadSubtitles(assetId: string, files: File[], languages: string[], names: string[]) {
  try {
    const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
    const fd = new FormData()

    files.forEach((file, i) => {
      fd.append("files[]", file)            // file
      fd.append("languages[]", languages[i]) // language of the subtitle
      fd.append("names[]", names[i])         // subtitle display name
    })

    const response = await fetch(`${API_BASE}api/v1/content/content/${assetId}/subtitles/bulk`, {
      method: "POST",
      headers:{
        Authorization: `Bearer ${token}`,
      },
      body: fd,
      // Important: DO NOT set Content-Type manually! browser sets correct multipart boundary
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("Upload successful", data)
    return data

  } catch (err) {
    console.error("Error uploading subtitles:", err)
    throw err
  }
}
export async function uploadDubbings(
  assetId: string,
  files: File[],
  languages: string[],
  names: string[],
  isDefault: boolean[]  
) {
  try {
    const token = getAccessToken()
    if (!token) {
      throw {
        status: 401,
        message: 'Not authenticated — please login',
        needAuth: true,
      } as ApiError
    }

    const fd = new FormData()

    files.forEach((file, i) => {
      fd.append('files[]', file)                     // FILE
      fd.append('languages[]', languages[i])         // POST
      fd.append('names[]', names[i])                 // POST
      fd.append('is_default[]', String(isDefault[i])) // POST → "true" | "false"
    })

    const response = await fetch(
      `${API_BASE}api/v1/content/content/${assetId}/audiotracks/bulk`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
        // ❗ Do NOT set Content-Type
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (err) {
    console.error('Error uploading subtitles:', err)
    throw err
  }
}

export async function uploadImageForEpisode(
  contentId: string,
  file: File,
  imageType: 'poster' | 'banner' | 'thumbnail'
): Promise<ImageUploadResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('uploadImage');
    
    // Mock image upload response
    return {
      thumbnail_url: `https://cdn.example.com/images/${contentId}/${imageType}_${Date.now()}.jpg`,
      s3_key: `images/${contentId}/${imageType}_${Date.now()}.jpg`,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/content/${contentId}/images`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_type', 'episode-thumbnail');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
// ============================================================================
// SERIES / SEASONS / EPISODES API
// ============================================================================

/**
 * Create a new series
 * POST /api/v1/content/series
 */
export async function uploadImage(
  contentId: string,
  file: File,
  imageType: 'poster' | 'banner' | 'episode-thumbnail'
): Promise<ImageUploadResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('uploadImage');
    
    // Mock image upload response
    return {
      thumbnail_url: `https://cdn.example.com/images/${contentId}/${imageType}_${Date.now()}.jpg`,
      s3_key: `images/${contentId}/${imageType}_${Date.now()}.jpg`,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/content/${contentId}/images`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image_type', imageType);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
export async function createSeries(payload: CreateSeriesPayload): Promise<Series> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('createSeries');
    
    return {
      id: `series-${Date.now()}`,
      ...payload,
      status: payload.status || 'draft',
      is_kid_safe: payload.is_kid_safe || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/series`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Create a new season
 * POST /api/v1/content/seasons
 */
export async function createSeason(payload: CreateSeasonPayload): Promise<Season> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('createSeason');
    
    return {
      id: `season-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/seasons`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Create a new episode
 * POST /api/v1/content/episodes
 */
export async function createEpisode(payload: CreateEpisodePayload): Promise<Episode> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('createEpisode');
    
    return {
      id: `episode-${Date.now()}`,
      ...payload,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/episodes`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Upload episode thumbnail
 * POST /api/v1/content/episodes/{episode_id}/upload-thumbnail
 */
export async function uploadEpisodeThumbnail(
  episodeId: string,
  file: File
): Promise<ImageUploadResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('uploadEpisodeThumbnail');
    
    return {
      thumbnail_url: `https://cdn.example.com/episodes/${episodeId}/thumbnail_${Date.now()}.jpg`,
      s3_key: `episodes/${episodeId}/thumbnail_${Date.now()}.jpg`,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/episodes/${episodeId}/upload-thumbnail`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

// ============================================================================
// RENDITIONS & MANIFEST API
// ============================================================================

/**
 * Get renditions for a content item
 * GET /api/v1/content/content/{contentId}/renditions
 */
export async function getRenditions(contentId: string): Promise<RenditionsListResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('getRenditions');
    
    return {
      count: MOCK_RENDITIONS.length,
      results: MOCK_RENDITIONS,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/content/${contentId}/renditions`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
export async function getStreamingUrl(contentId: string): Promise<any> {
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/content/${contentId}/stream`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Get manifest for a content item
 * GET /api/v1/content/content/manifest/{contentId}
 */
export async function getManifest(contentId: string): Promise<ManifestResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('getManifest');
    
    // Mock HLS manifest
    const mockManifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
https://cdn.example.com/content-${contentId}/720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
https://cdn.example.com/content-${contentId}/1080p/playlist.m3u8`;
    
    return {
      text: mockManifest,
      content_type: 'application/vnd.apple.mpegurl',
      url: `https://cdn.example.com/content-${contentId}/master.m3u8`,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/content/manifest/${contentId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    const text = await response.text();
    
    return {
      text,
      content_type: response.headers.get('content-type') || 'text/plain',
      url: response.url,
    };
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

// ============================================================================
// DRM API
// ============================================================================

/**
 * Get DRM key for content playback
 * GET /api/v1/content/drm/key
 * 
 * NOTE: This endpoint should be called by the video player during playback when DRM is required.
 * The key is sensitive and should only be retrieved when needed.
 * 
 * TODO: Implement DRM license server integration
 * TODO: Add DRM key rotation mechanism
 */
export async function getDrmKey(contentId: string): Promise<DrmKeyResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('getDrmKey');
    
    return {
      key: btoa('mock_drm_key_12345'),
      key_id: `key_${contentId}`,
      license_url: `https://drm.example.com/license/${contentId}`,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/content/drm/key?content_id=${contentId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

// ============================================================================
// MEDIACONVERT WEBHOOK SIMULATION (DEV ONLY)
// ============================================================================

/**
 * Simulate MediaConvert webhook (DEV ONLY)
 * POST /api/v1/content/uploads/mediaconvert-webhook
 * 
 * PRODUCTION NOTE: In production, this endpoint should ONLY be called by AWS MediaConvert.
 * The frontend should NOT call this endpoint in production.
 * This function is strictly for local dev/testing to simulate the MediaConvert webhook.
 */
export async function simulateMediaConvertWebhook(payload: any): Promise<any> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('simulateMediaConvertWebhook');
    
    return {
      message: 'MediaConvert webhook processed (mock)',
      status: 'COMPLETE',
      renditions_created: 2,
    };
  }
  
  try {
    const url = `${API_BASE}api/v1/content/uploads/mediaconvert-webhook`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': S3_CALLBACK_KEY,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
