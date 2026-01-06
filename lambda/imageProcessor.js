/**
 * AWS Lambda Function - Image Processor
 * 
 * This Lambda is triggered when an image file is uploaded to S3.
 * It generates multiple variants:
 * - WebP format for modern browsers (smaller file size)
 * - Multiple resolutions (original, large, medium, small, thumbnail)
 * - Optimized JPEG/PNG versions
 * - Thumbnails for previews
 * 
 * Uses Sharp library for high-performance image processing
 * 
 * Environment Variables Required:
 * - OUTPUT_BUCKET: S3 bucket for processed images
 * - DYNAMODB_TABLE: Table to store processing status
 * 
 * Trigger: S3 PutObject event on uploads/image/* prefix
 */

const AWS = require('aws-sdk');
const sharp = require('sharp');
const stream = require('stream');

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE;

// Image variant configurations
const VARIANTS = {
  original: { width: null, height: null, quality: 90 },
  large: { width: 1920, height: 1080, quality: 85 },
  medium: { width: 1280, height: 720, quality: 80 },
  small: { width: 640, height: 360, quality: 75 },
  thumbnail: { width: 320, height: 180, quality: 70 },
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Image Processor triggered:', JSON.stringify(event, null, 2));

  try {
    // Parse S3 event
    const record = event.Records[0];
    const sourceBucket = record.s3.bucket.name;
    const sourceKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const fileSize = record.s3.object.size;

    console.log(`Processing image: s3://${sourceBucket}/${sourceKey}`);

    // Extract metadata
    const s3Object = await s3.headObject({
      Bucket: sourceBucket,
      Key: sourceKey,
    }).promise();

    const fileId = s3Object.Metadata?.fileid || extractFileIdFromKey(sourceKey);
    const originalContentType = s3Object.ContentType;

    // Update status to processing
    await updateProcessingStatus(fileId, {
      status: 'processing',
      progress: 0,
      message: 'Starting image processing...',
      sourceKey,
      startedAt: new Date().toISOString(),
    });

    // Download image from S3
    const imageData = await s3.getObject({
      Bucket: sourceBucket,
      Key: sourceKey,
    }).promise();

    // Get image metadata
    const image = sharp(imageData.Body);
    const metadata = await image.metadata();
    
    console.log('Image metadata:', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      space: metadata.space,
      hasAlpha: metadata.hasAlpha,
    });

    // Process all variants
    const results = {
      original: {},
      webp: {},
      optimized: {},
    };

    const totalVariants = Object.keys(VARIANTS).length * 2; // x2 for WebP
    let processedCount = 0;

    // Generate variants
    for (const [variantName, config] of Object.entries(VARIANTS)) {
      const outputKeyPrefix = `processed/image/${fileId}/${variantName}`;

      // Process original format (JPEG or PNG optimized)
      const optimizedResult = await processAndUploadImage({
        imageBuffer: imageData.Body,
        outputBucket: OUTPUT_BUCKET,
        outputKey: `${outputKeyPrefix}.${getOutputFormat(originalContentType)}`,
        width: config.width,
        height: config.height,
        quality: config.quality,
        format: getOutputFormat(originalContentType),
        metadata,
      });

      results.optimized[variantName] = optimizedResult;
      processedCount++;

      await updateProcessingStatus(fileId, {
        progress: Math.round((processedCount / totalVariants) * 100),
        message: `Processing ${variantName} variants...`,
      });

      // Process WebP format
      const webpResult = await processAndUploadImage({
        imageBuffer: imageData.Body,
        outputBucket: OUTPUT_BUCKET,
        outputKey: `${outputKeyPrefix}.webp`,
        width: config.width,
        height: config.height,
        quality: config.quality,
        format: 'webp',
        metadata,
      });

      results.webp[variantName] = webpResult;
      processedCount++;

      await updateProcessingStatus(fileId, {
        progress: Math.round((processedCount / totalVariants) * 100),
        message: `Processing ${variantName} WebP...`,
      });
    }

    // Update final status
    await updateProcessingStatus(fileId, {
      status: 'completed',
      progress: 100,
      message: 'Image processing completed',
      results,
      completedAt: new Date().toISOString(),
    });

    console.log('Image processing completed:', fileId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Image processing completed successfully',
        fileId,
        variants: Object.keys(VARIANTS),
        results,
      }),
    };
  } catch (error) {
    console.error('Error processing image:', error);

    // Update status to failed
    try {
      const fileId = extractFileIdFromKey(event.Records[0].s3.object.key);
      await updateProcessingStatus(fileId, {
        status: 'failed',
        error: error.message,
        failedAt: new Date().toISOString(),
      });
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    throw error;
  }
};

/**
 * Process image and upload to S3
 */
async function processAndUploadImage({
  imageBuffer,
  outputBucket,
  outputKey,
  width,
  height,
  quality,
  format,
  metadata,
}) {
  try {
    let pipeline = sharp(imageBuffer);

    // Resize if dimensions specified
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Apply format-specific optimizations
    switch (format) {
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({
          quality,
          progressive: true,
          mozjpeg: true,
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9,
          adaptiveFiltering: true,
        });
        break;
      case 'webp':
        pipeline = pipeline.webp({
          quality,
          effort: 6,
        });
        break;
    }

    // Process image
    const processedBuffer = await pipeline.toBuffer();
    const processedMetadata = await sharp(processedBuffer).metadata();

    // Upload to S3
    await s3.putObject({
      Bucket: outputBucket,
      Key: outputKey,
      Body: processedBuffer,
      ContentType: getContentType(format),
      CacheControl: 'public, max-age=31536000', // 1 year cache
      Metadata: {
        originalWidth: String(metadata.width),
        originalHeight: String(metadata.height),
        processedWidth: String(processedMetadata.width),
        processedHeight: String(processedMetadata.height),
        format,
      },
    }).promise();

    const fileUrl = `https://${outputBucket}.s3.amazonaws.com/${outputKey}`;

    console.log(`Uploaded ${format} variant: ${outputKey}`);

    return {
      key: outputKey,
      url: fileUrl,
      width: processedMetadata.width,
      height: processedMetadata.height,
      format,
      size: processedBuffer.length,
    };
  } catch (error) {
    console.error(`Failed to process ${format} variant:`, error);
    throw error;
  }
}

/**
 * Update processing status in DynamoDB
 */
async function updateProcessingStatus(fileId, updates) {
  const params = {
    TableName: DYNAMODB_TABLE,
    Key: { fileId },
    UpdateExpression: 'SET ' + Object.keys(updates).map((key, i) => `#${key} = :${key}`).join(', '),
    ExpressionAttributeNames: Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {}),
    ExpressionAttributeValues: Object.keys(updates).reduce((acc, key) => {
      acc[`:${key}`] = updates[key];
      return acc;
    }, {}),
  };

  return await dynamodb.update(params).promise();
}

/**
 * Extract file ID from S3 key
 */
function extractFileIdFromKey(key) {
  const match = key.match(/_([a-f0-9-]{36})\./i);
  return match ? match[1] : key.split('/').pop().split('.')[0];
}

/**
 * Get output format from content type
 */
function getOutputFormat(contentType) {
  const formatMap = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'png', // Convert GIF to PNG for static images
  };
  return formatMap[contentType] || 'jpeg';
}

/**
 * Get content type from format
 */
function getContentType(format) {
  const contentTypeMap = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  return contentTypeMap[format] || 'image/jpeg';
}
