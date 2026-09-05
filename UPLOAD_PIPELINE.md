# Media Upload and Processing Pipeline

Complete serverless media upload flow with S3 signed URLs, Lambda processing, and MediaConvert transcoding.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Upload Flow](#upload-flow)
- [Processing Pipeline](#processing-pipeline)
- [Infrastructure Setup](#infrastructure-setup)
- [API Reference](#api-reference)
- [Component Usage](#component-usage)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## 🏗️ Architecture Overview

```
┌─────────────┐     1. Request     ┌──────────────┐
│   Client    │ ───────────────────>│ /api/upload  │
│  (Browser)  │                     │   Route      │
└─────────────┘                     └──────────────┘
       │                                    │
       │ 2. Signed URL                      │ Generate
       │<───────────────────────────────────┘ Pre-signed URL
       │
       │ 3. Direct Upload
       ├──────────────────────>┌──────────────┐
       │                       │  S3 Uploads  │
       │                       │    Bucket    │
       │                       └──────────────┘
       │                              │
       │                              │ S3 Event
       │                              ▼
       │                       ┌──────────────┐
       │                       │    Lambda    │
       │                       │  Processors  │
       │                       └──────────────┘
       │                        /            \
       │                       /              \
       │              ┌────────────┐   ┌────────────┐
       │              │ MediaConvert│   │   Sharp    │
       │              │  (Videos)   │   │  (Images)  │
       │              └────────────┘   └────────────┘
       │                       \              /
       │                        \            /
       │                         ▼          ▼
       │                       ┌──────────────┐
       │                       │ S3 Processed │
       │ 4. Poll Status        │    Bucket    │
       │<──────────────────────└──────────────┘
       │
       │ 5. Playback URLs
       │<───────────────────────────────────────
```

## 📤 Upload Flow

### 1. Client Requests Signed URL

```typescript
POST /api/upload
{
  "fileName": "my-video.mp4",
  "fileType": "video/mp4",
  "fileSize": 104857600,
  "contentType": "video"
}
```

### 2. Server Generates Signed URL

```typescript
Response:
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileId": "550e8400-e29b-41d4-a716-446655440000",
  "fileKey": "uploads/video/user_email/timestamp_fileid.mp4",
  "expiresAt": "2025-11-11T12:00:00Z",
  "metadata": {
    "bucket": "ott-platform-uploads",
    "region": "us-east-1",
    "contentType": "video/mp4"
  }
}
```

### 3. Client Uploads Directly to S3

```typescript
// Using XMLHttpRequest for progress tracking
const xhr = new XMLHttpRequest()
xhr.open('PUT', uploadUrl)
xhr.setRequestHeader('Content-Type', fileType)
xhr.send(fileBuffer)
```

### 4. Lambda Processors Triggered

- **Video Files** → MediaConvert transcoding
- **Image Files** → Sharp image optimization

### 5. Client Polls for Status

```typescript
GET /api/upload?fileId=550e8400-e29b-41d4-a716-446655440000

Response:
{
  "fileId": "...",
  "status": "processing",
  "progress": 45,
  "message": "Transcoding video..."
}
```

## 🎬 Processing Pipeline

### Video Processing (MediaConvert)

**Outputs:**

- **HLS Adaptive Streaming**
  - 1080p @ 5 Mbps (High Quality)
  - 720p @ 2.5 Mbps (Medium Quality)
  - 480p @ 1 Mbps (Low Quality)
- **MP4 Progressive Download** (fallback)
  - 720p @ 2.5 Mbps
- **Thumbnails** (20 frames extracted)

**Output Structure:**

```
s3://processed-bucket/processed/video/{fileId}/
├── hls/
│   ├── master.m3u8
│   ├── 1080p.m3u8
│   ├── 1080p_00001.ts
│   ├── 720p.m3u8
│   ├── 720p_00001.ts
│   ├── 480p.m3u8
│   └── 480p_00001.ts
├── mp4/
│   └── 720p.mp4
└── thumbnails/
    ├── thumb_00001.jpg
    ├── thumb_00002.jpg
    └── ...
```

### Image Processing (Sharp)

**Outputs:**

- **WebP Format** (modern browsers)
  - Original size
  - Large (1920x1080)
  - Medium (1280x720)
  - Small (640x360)
  - Thumbnail (320x180)
- **Optimized JPEG/PNG** (fallback)
  - Same resolution variants

**Output Structure:**

```
s3://processed-bucket/processed/image/{fileId}/
├── original.webp
├── original.jpeg
├── large.webp
├── large.jpeg
├── medium.webp
├── medium.jpeg
├── small.webp
├── small.jpeg
├── thumbnail.webp
└── thumbnail.jpeg
```

## 🚀 Infrastructure Setup

### Option 1: Terraform

```bash
cd web/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="environment=dev"

# Apply infrastructure
terraform apply -var="environment=dev"
```

**Variables:**

- `aws_region`: AWS region (default: us-east-1)
- `project_name`: Project name for resources (default: ott-platform)
- `environment`: Environment name (dev/staging/prod)

### Option 2: CloudFormation

```bash
cd web/cloudformation

# Deploy stack
aws cloudformation create-stack \
  --stack-name ott-platform-media-pipeline \
  --template-body file://media-pipeline.yaml \
  --parameters \
    ParameterKey=Environment,ParameterValue=dev \
    ParameterKey=AllowedOrigins,ParameterValue="https://yourdomain.com" \
  --capabilities CAPABILITY_NAMED_IAM

# Check status
aws cloudformation describe-stacks \
  --stack-name ott-platform-media-pipeline
```

### Lambda Deployment Preparation

**1. Package Lambda Functions:**

```bash
# Media Processor
cd lambda
npm install aws-sdk
zip -r media-processor.zip mediaProcessor.js node_modules/

# Image Processor
npm install sharp
zip -r image-processor.zip imageProcessor.js node_modules/

# Create Sharp Lambda Layer
mkdir -p layer/nodejs
npm install --prefix layer/nodejs sharp
cd layer && zip -r ../sharp-layer.zip nodejs/
```

**2. Upload to S3:**

```bash
aws s3 cp media-processor.zip s3://ott-platform-deployment-artifacts-dev/lambda/
aws s3 cp image-processor.zip s3://ott-platform-deployment-artifacts-dev/lambda/
aws s3 cp sharp-layer.zip s3://ott-platform-deployment-artifacts-dev/layers/
```

## 📚 API Reference

### POST /api/upload

Generate a pre-signed S3 URL for direct upload.

**Request:**

```typescript
{
  fileName: string
  fileType: string // MIME type
  fileSize: number // bytes
  contentType: 'video' | 'image' | 'subtitle' | 'thumbnail'
}
```

**Response:**

```typescript
{
  uploadUrl: string
  fileId: string
  fileKey: string
  expiresAt: string
  metadata: {
    bucket: string
    region: string
    contentType: string
  }
}
```

**Errors:**

- `401`: Unauthorized (not signed in)
- `400`: Invalid request (missing fields, invalid file type, file too large)
- `500`: Server error

### GET /api/upload?fileId={fileId}

Check upload and processing status.

**Query Parameters:**

- `fileId` (required): File identifier

**Response:**

```typescript
{
  fileId: string;
  status: 'pending' | 'uploaded' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  message?: string;
  outputUrls?: {
    video?: {
      hls: string;
      dash: string;
    };
    images?: {
      original: string;
      webp: string;
      thumbnails: string[];
    };
  };
}
```

## 🎨 Component Usage

### UploadFlow Component

```tsx
import { UploadFlow } from '@/components/UploadFlow'

function AdminContentPage() {
  const handleUploadComplete = (fileKey: string, fileId: string) => {
    console.log('Upload completed:', { fileKey, fileId })
    // Update your database, show success message, etc.
  }

  return (
    <UploadFlow
      contentType="video"
      onUploadComplete={handleUploadComplete}
      maxFiles={5}
      acceptedFileTypes="video/mp4,video/quicktime"
    />
  )
}
```

**Props:**

- `contentType`: Type of content ('video' | 'image' | 'subtitle' | 'thumbnail')
- `onUploadComplete?`: Callback when processing completes
- `maxFiles?`: Maximum number of files (default: 5)
- `acceptedFileTypes?`: File types to accept (uses defaults based on contentType)

**Features:**

- ✅ Drag-and-drop support
- ✅ Multiple file selection
- ✅ Upload progress tracking
- ✅ Processing status updates
- ✅ Error handling and retry
- ✅ File size formatting
- ✅ Visual status indicators

## 🔧 Environment Variables

### Next.js Application (.env.local)

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_UPLOAD_BUCKET=ott-platform-uploads-dev
S3_PROCESSED_BUCKET=ott-platform-processed-dev

# NextAuth (existing)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Database (existing)
# ... your database config
```

### Lambda Functions

Set via Terraform/CloudFormation:

- `MEDIACONVERT_ENDPOINT`: MediaConvert regional endpoint
- `MEDIACONVERT_ROLE`: IAM role ARN for MediaConvert
- `OUTPUT_BUCKET`: S3 bucket for processed outputs
- `DYNAMODB_TABLE`: Table for processing status

## 📦 Package Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.490.0",
    "@aws-sdk/s3-request-presigner": "^3.490.0"
  }
}
```

For Lambda functions:

```json
{
  "dependencies": {
    "aws-sdk": "^2.1500.0",
    "sharp": "^0.33.0"
  }
}
```

## 🔐 Security Considerations

### Production Checklist

1. **S3 Buckets:**
   - [ ] Enable bucket encryption
   - [ ] Restrict CORS to specific domains
   - [ ] Enable CloudFront for processed media
   - [ ] Set up bucket logging

2. **IAM Policies:**
   - [ ] Use least privilege access
   - [ ] Rotate access keys regularly
   - [ ] Use temporary credentials (STS)
   - [ ] Enable MFA for sensitive operations

3. **Lambda Functions:**
   - [ ] Set memory/timeout limits
   - [ ] Enable X-Ray tracing
   - [ ] Use environment-specific configs
   - [ ] Implement retry logic

4. **API Route:**
   - [ ] Validate file types server-side
   - [ ] Implement rate limiting
   - [ ] Add virus scanning (ClamAV)
   - [ ] Log all upload attempts

## 📊 Monitoring

### CloudWatch Metrics

- **S3:**
  - BucketSizeBytes
  - NumberOfObjects
  - AllRequests

- **Lambda:**
  - Invocations
  - Duration
  - Errors
  - ConcurrentExecutions

- **MediaConvert:**
  - JobsCompleted
  - JobsErrored
  - TranscodingTime

### CloudWatch Alarms

```bash
# Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name media-processor-errors \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold

# MediaConvert failures
aws cloudwatch put-metric-alarm \
  --alarm-name mediaconvert-job-errors \
  --metric-name JobsErrored \
  --namespace AWS/MediaConvert \
  --statistic Sum \
  --period 300 \
  --threshold 3 \
  --comparison-operator GreaterThanThreshold
```

## 💰 Cost Optimization

### S3

- Use Intelligent-Tiering for uploads
- Delete raw uploads after 7 days
- Enable compression for processed files

### Lambda

- Optimize memory allocation
- Use provisioned concurrency for predictable load
- Enable Lambda Insights for monitoring

### MediaConvert

- Use on-demand pricing for variable workload
- Consider reserved pricing for high volume
- Optimize encoding settings for quality/speed balance

## 🧪 Testing

### Local Testing

```bash
# Test upload API
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.mp4",
    "fileType": "video/mp4",
    "fileSize": 1048576,
    "contentType": "video"
  }'

# Test Lambda locally with SAM
sam local invoke MediaProcessorFunction \
  --event events/s3-event.json
```

### Integration Tests

```typescript
// Test S3 upload
describe('Upload API', () => {
  it('should generate signed URL', async () => {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'test.mp4',
        fileType: 'video/mp4',
        fileSize: 1048576,
        contentType: 'video',
      }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.uploadUrl).toBeDefined()
    expect(data.fileId).toBeDefined()
  })
})
```

## 📖 Additional Resources

- [AWS MediaConvert Documentation](https://docs.aws.amazon.com/mediaconvert/)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [S3 Pre-signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

## 🤝 Contributing

When adding new features:

1. Update Lambda functions with new processing logic
2. Modify MediaConvert job settings as needed
3. Update Terraform/CloudFormation templates
4. Document environment variables and outputs
5. Add monitoring and alarms
