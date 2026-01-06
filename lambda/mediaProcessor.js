/**
 * AWS Lambda Function - Media Processor
 * 
 * This Lambda is triggered when a video file is uploaded to S3.
 * It submits a MediaConvert job to transcode the video into multiple formats:
 * - HLS adaptive bitrate streaming (multiple resolutions)
 * - MP4 progressive downloads (fallback)
 * - Thumbnail extraction
 * 
 * Environment Variables Required:
 * - MEDIACONVERT_ENDPOINT: AWS MediaConvert regional endpoint
 * - MEDIACONVERT_ROLE: IAM role ARN for MediaConvert
 * - OUTPUT_BUCKET: S3 bucket for processed outputs
 * - JOB_TEMPLATE: MediaConvert job template name (optional)
 * - DYNAMODB_TABLE: Table to store processing status
 * 
 * Trigger: S3 PutObject event on uploads/video/* prefix
 */

const AWS = require('aws-sdk');

// Initialize AWS services
const s3 = new AWS.S3();
const mediaconvert = new AWS.MediaConvert({
  endpoint: process.env.MEDIACONVERT_ENDPOINT,
});
const dynamodb = new AWS.DynamoDB.DocumentClient();

const OUTPUT_BUCKET = process.env.OUTPUT_BUCKET;
const MEDIACONVERT_ROLE = process.env.MEDIACONVERT_ROLE;
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE;

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Media Processor triggered:', JSON.stringify(event, null, 2));

  try {
    // Parse S3 event
    const record = event.Records[0];
    const sourceBucket = record.s3.bucket.name;
    const sourceKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    const fileSize = record.s3.object.size;

    console.log(`Processing video: s3://${sourceBucket}/${sourceKey}`);

    // Extract metadata from S3 object
    const s3Object = await s3.headObject({
      Bucket: sourceBucket,
      Key: sourceKey,
    }).promise();

    const fileId = s3Object.Metadata?.fileid || extractFileIdFromKey(sourceKey);
    const uploadedBy = s3Object.Metadata?.uploadedby || 'unknown';

    // Update status to processing
    await updateProcessingStatus(fileId, {
      status: 'processing',
      progress: 0,
      message: 'Starting transcoding job...',
      sourceKey,
      startedAt: new Date().toISOString(),
    });

    // Create MediaConvert job
    const jobResult = await createMediaConvertJob({
      sourceBucket,
      sourceKey,
      outputBucket: OUTPUT_BUCKET,
      fileId,
    });

    console.log('MediaConvert job created:', jobResult.Job.Id);

    // Update status with job ID
    await updateProcessingStatus(fileId, {
      status: 'processing',
      progress: 10,
      message: 'Transcoding in progress...',
      jobId: jobResult.Job.Id,
      jobArn: jobResult.Job.Arn,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'MediaConvert job submitted successfully',
        jobId: jobResult.Job.Id,
        fileId,
      }),
    };
  } catch (error) {
    console.error('Error processing media:', error);

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
 * Create a MediaConvert transcoding job
 */
async function createMediaConvertJob({ sourceBucket, sourceKey, outputBucket, fileId }) {
  const inputPath = `s3://${sourceBucket}/${sourceKey}`;
  const outputPath = `s3://${outputBucket}/processed/video/${fileId}/`;

  // MediaConvert job configuration
  const jobParams = {
    Role: MEDIACONVERT_ROLE,
    Settings: {
      Inputs: [
        {
          FileInput: inputPath,
          AudioSelectors: {
            'Audio Selector 1': {
              DefaultSelection: 'DEFAULT',
            },
          },
          VideoSelector: {},
          TimecodeSource: 'ZEROBASED',
        },
      ],
      OutputGroups: [
        // HLS Adaptive Bitrate Streaming
        {
          Name: 'HLS',
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              SegmentLength: 6,
              MinSegmentLength: 0,
              Destination: `${outputPath}hls/`,
              ManifestDurationFormat: 'INTEGER',
              SegmentControl: 'SEGMENTED_FILES',
              HlsCaptionLanguageSetting: 'OMIT',
              ClientCache: 'ENABLED',
              StreamInfResolution: 'INCLUDE',
              OutputSelection: 'MANIFESTS_AND_SEGMENTS',
            },
          },
          Outputs: [
            // 1080p High Quality
            {
              NameModifier: '_1080p',
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    QualityTuningLevel: 'SINGLE_PASS_HQ',
                    MaxBitrate: 5000000,
                    CodecProfile: 'HIGH',
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: 'Audio Selector 1',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      Bitrate: 128000,
                      CodingMode: 'CODING_MODE_2_0',
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              ContainerSettings: {
                Container: 'M3U8',
              },
            },
            // 720p Medium Quality
            {
              NameModifier: '_720p',
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    QualityTuningLevel: 'SINGLE_PASS_HQ',
                    MaxBitrate: 2500000,
                    CodecProfile: 'MAIN',
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: 'Audio Selector 1',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: 'CODING_MODE_2_0',
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              ContainerSettings: {
                Container: 'M3U8',
              },
            },
            // 480p Low Quality
            {
              NameModifier: '_480p',
              VideoDescription: {
                Width: 854,
                Height: 480,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    QualityTuningLevel: 'SINGLE_PASS',
                    MaxBitrate: 1000000,
                    CodecProfile: 'MAIN',
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: 'Audio Selector 1',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      Bitrate: 64000,
                      CodingMode: 'CODING_MODE_2_0',
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              ContainerSettings: {
                Container: 'M3U8',
              },
            },
          ],
        },
        // MP4 Progressive Download (fallback)
        {
          Name: 'MP4',
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: {
              Destination: `${outputPath}mp4/`,
            },
          },
          Outputs: [
            {
              NameModifier: '_720p',
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    MaxBitrate: 2500000,
                  },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: 'Audio Selector 1',
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      Bitrate: 96000,
                      SampleRate: 48000,
                    },
                  },
                },
              ],
              ContainerSettings: {
                Container: 'MP4',
                Mp4Settings: {},
              },
            },
          ],
        },
        // Thumbnail Frames
        {
          Name: 'Thumbnails',
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: {
              Destination: `${outputPath}thumbnails/`,
            },
          },
          Outputs: [
            {
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: 'FRAME_CAPTURE',
                  FrameCaptureSettings: {
                    FramerateNumerator: 1,
                    FramerateDenominator: 10,
                    MaxCaptures: 20,
                    Quality: 80,
                  },
                },
              },
              ContainerSettings: {
                Container: 'RAW',
              },
            },
          ],
        },
      ],
    },
    AccelerationSettings: {
      Mode: 'DISABLED', // Change to 'PREFERRED' or 'ENABLED' for faster processing (costs more)
    },
    StatusUpdateInterval: 'SECONDS_60',
    Priority: 0,
  };

  return await mediaconvert.createJob(jobParams).promise();
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
  // Assuming key format: uploads/video/{user}/{timestamp}_{fileId}.{ext}
  const match = key.match(/_([a-f0-9-]{36})\./i);
  return match ? match[1] : key.split('/').pop().split('.')[0];
}
