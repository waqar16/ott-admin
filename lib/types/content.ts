/**
 * Content Management Types
 * 
 * TypeScript type definitions for content, assets, renditions, uploads, and manifests.
 * Reference: API_DOCUMENTATION_PART3.pdf - Content Management endpoints
 */

// ============================================================================
// CONTENT TYPES
// ============================================================================

// Aligned with backend choices
// Content Type: structural classification of content entity
export type ContentType = 'movie' | 'series' | 'episode' | 'trailer' | 'documentary' | 'season' | 'democontent';
// Media Type: video projection / VR mode
export type MediaType =
  | 'flat'
  | 'vr_360_mono'
  | 'vr_360_sbs'
  | 'vr_360_tb'
  | 'vr_180_mono'
  | 'vr_180_sbs'
  | 'vr_180_tb';
// Status lifecycle
export type ContentStatus = 'ready' |'draft' | 'uploaded' | 'published' | 'inactive' | 'failed' | 'archived';
export type IngestStatus = 'ready' | 'processing' | 'uploading' | 'failed';
export type ImageType = 'poster' | 'banner' | 'thumbnail';
export type ContentMetadataPayload = {
  content: string;
  id?:string;
  directors: string[];
  producers: string[];
  cast: string[];
  genres: string[];
  release_year?: number;
  age_rating?: string;
  language?: string;
  subtitles_available: string[];
  production_company?: string;
  country?: string;
  awards: string[];
};
export interface Content {
  id: string;
  trailer_id?:string;
  trailer_youtube_url?:string;
  transcoding_progress?: number;
  ingest_status?: IngestStatus;
  is_demo_content?:boolean;
  title: string;
  trailerType?:string;
  description: string;
  content_type: ContentType;
  trailer_url:null | string;
  media_type: MediaType;
  content_metadata?: ContentMetadataPayload;
  status: ContentStatus;
  is_kid_safe: boolean;
  is_ppv: boolean;
  price_dollars?: number;
  genres?: string[];
  children?:[];
  parent?:number;
  poster_url?: string;
  banner_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  release_date?: string;
  rating?: string;
  director?: string;
  cast?: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;

}

export interface CreateContentPayload {
  title: string;
  trailer_id?:string;
  is_demo_content?:boolean;
  description: string;
  content_type: ContentType;
  media_type: MediaType;
  status?: ContentStatus;
  is_kid_safe?: boolean;
  is_ppv?: boolean;
  trailerType?:string;
  price_dollars?: number;
  genres?: string[];
  duration_seconds?: number;
  trailer_youtube_url?: string;

  release_date?: string;
  rating?: string;
  director?: string;
  cast?: string[];
  parent?:string;
  seasonNumber?:number;
}

export interface UpdateContentPayload {
  title?: string;
  description?: string;
  content_type?: ContentType;
  media_type?: MediaType;
  trailer_youtube_url?: string;
  status?: ContentStatus;
  is_kid_safe?: boolean;
  is_ppv?: boolean;
  price_dollars?: number;
  genres?: string[];
  duration_seconds?: number;
  release_date?: string;
  rating?: string;
  director?: string;
  cast?: string[];
}

export interface ContentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Content[];
}
export   interface ContentFilters {
  status?: string;
  media_type?: string;
  content_type?:string;

  search?: string;
  is_kid_safe?: boolean;
  is_ppv?: boolean;
}
// ============================================================================
// ASSET & UPLOAD TYPES
// ============================================================================

export interface Asset {
  id: string;
  content: string;
  s3_key: string;
  bucket: string;
  size_bytes: number;
  mime_type?: string;
  ingest_status: IngestStatus;
  original_filename?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadInitResponse {
  upload_url: {
    url: string;
    fields: Record<string, string>;
  };
  s3_key: string;
}

export interface S3CallbackPayload {
  s3_key: string;
  bucket: string;
  size: number;
}

export interface ImageUploadResponse {
  thumbnail_url: string;
  s3_key: string;
}

// ============================================================================
// RENDITION TYPES
// ============================================================================

export interface Rendition 
  {
    
  id: string;  
  width: number;
  stream_url:string;
  height: number;
  bitrate: number; 
  label: string; 
}

export interface RenditionsListResponse {
  content_id: number;
  renditions: Rendition[];
}

// ============================================================================
// MANIFEST TYPES
// ============================================================================

export interface ManifestResponse {
  text: string;
  content_type: string;
  url?: string;
}

// ============================================================================
// SERIES / SEASONS / EPISODES TYPES
// ============================================================================

export interface Series {
  id: string;
  title: string;
  description: string;
  poster_url?: string;
  banner_url?: string;
  status: ContentStatus;
  is_kid_safe: boolean;
  genres?: string[];
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  series: string;
  season_number: number;
  title: string;
  description: string;
  poster_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  season: string;
  episode_number: number;
  title: string;
  description: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateSeriesPayload {
  title: string;
  description: string;
  status?: ContentStatus;
  is_kid_safe?: boolean;
  genres?: string[];
}

export interface CreateSeasonPayload {
  series: string;
  season_number: number;
  title: string;
  description: string;
}

export interface CreateEpisodePayload {
  season: string;
  episode_number: number;
  title: string;
  description: string;
  duration_seconds?: number;
}

// ============================================================================
// MEDIACONVERT WEBHOOK TYPES
// ============================================================================

export interface MediaConvertWebhookPayload {
  version: string;
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    status: 'COMPLETE' | 'ERROR' | 'PROGRESSING';
    outputGroupDetails?: Array<{
      outputDetails?: Array<{
        outputFilePaths?: string[];
        durationInMs?: number;
        videoDetails?: {
          widthInPx?: number;
          heightInPx?: number;
        };
      }>;
    }>;
    userMetadata?: Record<string, string>;
    errorMessage?: string;
  };
}

export interface ParsedMediaConvertResult {
  status: 'COMPLETE' | 'ERROR' | 'PROGRESSING';
  created_renditions: Array<{
    output_file: string;
    width?: number;
    height?: number;
    duration_ms?: number;
  }>;
  error_message?: string;
  metadata?: Record<string, string>;
}

// ============================================================================
// DRM TYPES
// ============================================================================

export interface DrmKeyResponse {
  key: string;
  key_id?: string;
  license_url?: string;
}

// ============================================================================
// API ERROR TYPE
// ============================================================================

export interface ApiError {
  status: number;
  message: string;
  body?: any;
  needAuth?: boolean;
}
