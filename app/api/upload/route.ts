import { NextRequest, NextResponse } from 'next/server';
// TODO: Uncomment when NextAuth backend ready
// import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// TODO: Uncomment when AWS integration ready
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { USE_MOCK_DATA, AWS_CONFIG, logMockDataUsage } from '@/lib/config';
import { mockSession, mockUploadResponse, mockUploadStatus } from '@/lib/mockData';

// Mock mode active — replace with real AWS S3 integration later
if (USE_MOCK_DATA) {
  logMockDataUsage('Upload API - Using mock S3 upload');
}

// TODO: Uncomment when AWS integration ready
// Initialize S3 client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION || 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
//   },
// });

const UPLOAD_BUCKET = process.env.S3_UPLOAD_BUCKET || 'ott-platform-uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB
const SIGNED_URL_EXPIRY = 3600; // 1 hour

// Allowed content types
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/webm',
];

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  contentType: 'video' | 'image' | 'subtitle' | 'thumbnail';
}

interface UploadResponse {
  uploadUrl: string;
  fileId: string;
  fileKey: string;
  expiresAt: string;
  metadata: {
    bucket: string;
    region: string;
    contentType: string;
  };
}

/**
 * POST /api/upload
 * Generate a signed S3 URL for direct client-side upload
 * 
 * Request body:
 * {
 *   fileName: string;
 *   fileType: string (MIME type);
 *   fileSize: number (bytes);
 *   contentType: 'video' | 'image' | 'subtitle' | 'thumbnail';
 * }
 * 
 * Response:
 * {
 *   uploadUrl: string (pre-signed S3 URL);
 *   fileId: string (unique identifier);
 *   fileKey: string (S3 object key);
 *   expiresAt: string (ISO timestamp);
 *   metadata: { bucket, region, contentType }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null; // Mock mode active
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to upload files.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: UploadRequest = await request.json();
    const { fileName, fileType, fileSize, contentType } = body;

    // Validation
    if (!fileName || !fileType || !fileSize || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, fileSize, contentType' },
        { status: 400 }
      );
    }

    // File size validation
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024 * 1024)} GB` },
        { status: 400 }
      );
    }

    // Content type validation
    const allowedTypes =
      contentType === 'video'
        ? ALLOWED_VIDEO_TYPES
        : contentType === 'image'
        ? ALLOWED_IMAGE_TYPES
        : ['text/vtt', 'application/x-subrip', 'image/jpeg', 'image/png'];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: `File type ${fileType} is not allowed for ${contentType} content` },
        { status: 400 }
      );
    }

    // Generate unique file ID and S3 key
    const fileId = crypto.randomUUID();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExtension = sanitizedFileName.split('.').pop();
    
    // Organize by content type and user
    const userEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, '_');
    const s3Key = `uploads/${contentType}/${userEmail}/${timestamp}_${fileId}.${fileExtension}`;

    // Mock mode: Return dummy upload URL
    if (USE_MOCK_DATA) {
      const mockResponse = {
        uploadUrl: `${AWS_CONFIG.mockBucketUrl}/${s3Key}`,
        fileId,
        fileKey: s3Key,
        expiresAt: new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString(),
        metadata: {
          bucket: UPLOAD_BUCKET,
          region: AWS_CONFIG.useMockStorage ? 'mock-region' : (process.env.AWS_REGION || 'us-east-1'),
          contentType: fileType,
        },
      };
      console.log('[Upload] Mock mode - returning fake upload URL:', { fileId, s3Key });
      return NextResponse.json(mockResponse, { status: 200 });
    }

    // TODO: Uncomment when AWS integration ready
    // Create S3 PutObject command
    /* const command = new PutObjectCommand({
      Bucket: UPLOAD_BUCKET,
      Key: s3Key,
      ContentType: fileType,
      Metadata: {
        fileId,
        originalFileName: fileName,
        uploadedBy: session.user.email,
        contentType,
        uploadTimestamp: new Date().toISOString(),
      },
      // Tagging for lifecycle and processing rules
      Tagging: `contentType=${contentType}&userId=${userEmail}&status=pending`,
    }); */

    // TODO: Uncomment when AWS integration ready
    // Generate pre-signed URL (valid for 1 hour)
    // const uploadUrl = await getSignedUrl(s3Client, command, {
    //   expiresIn: SIGNED_URL_EXPIRY,
    // });

    // const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString();

    // const response: UploadResponse = {
    //   uploadUrl,
    //   fileId,
    //   fileKey: s3Key,
    //   expiresAt,
    //   metadata: {
    //     bucket: UPLOAD_BUCKET,
    //     region: process.env.AWS_REGION || 'us-east-1',
    //     contentType: fileType,
    //   },
    // };

    // In production, you would store this upload record in your database
    // await db.uploads.create({
    //   fileId,
    //   userId: session.user.id,
    //   fileName,
    //   fileType,
    //   fileSize,
    //   s3Key,
    //   status: 'pending',
    //   createdAt: new Date(),
    // });

    // console.log(`[Upload] Generated signed URL for user ${session.user.email}:`, {
    //   fileId,
    //   fileName,
    //   contentType,
    //   s3Key,
    // });

    // return NextResponse.json(response, { status: 200 });
    
    // Fallback for non-mock mode
    return NextResponse.json({ error: 'AWS S3 not configured in production mode' }, { status: 500 });
  } catch (error) {
    console.error('[Upload] Error generating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload?fileId=xxx
 * Check upload status and processing progress
 * 
 * Query params:
 * - fileId: string (required)
 * 
 * Response:
 * {
 *   fileId: string;
 *   status: 'pending' | 'uploaded' | 'processing' | 'completed' | 'failed';
 *   progress: number (0-100);
 *   outputUrls?: {
 *     video?: { hls: string; dash: string; };
 *     images?: { original: string; webp: string; thumbnails: string[]; };
 *   };
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null; // Mock mode active
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: fileId' },
        { status: 400 }
      );
    }

    // Mock mode: Return dummy upload status
    if (USE_MOCK_DATA) {
      return NextResponse.json({
        ...mockUploadStatus,
        fileId,
      }, { status: 200 });
    }

    // In production, fetch from database
    // const upload = await db.uploads.findUnique({ where: { fileId } });
    // Check if user owns this upload
    // if (upload.userId !== session.user.id) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Mock response for now
    const mockResponse = {
      fileId,
      status: 'processing' as const,
      progress: 45,
      message: 'Transcoding video to multiple resolutions...',
      outputUrls: undefined,
    };

    return NextResponse.json(mockResponse, { status: 200 });
  } catch (error) {
    console.error('[Upload] Error checking upload status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload status' },
      { status: 500 }
    );
  }
}
