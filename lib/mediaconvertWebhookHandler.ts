/**
 * MediaConvert Webhook Handler
 * 
 * Parses and processes AWS MediaConvert webhook payloads for dev display.
 * Reference: API_DOCUMENTATION_PART3.pdf - MediaConvert Webhook section
 * 
 * NOTE: This is primarily for development/debugging purposes to understand
 * MediaConvert webhook payloads. In production, the backend handles these
 * webhooks directly from AWS MediaConvert.
 */

import type { MediaConvertWebhookPayload, ParsedMediaConvertResult } from './types/content';

// ============================================================================
// WEBHOOK PARSING
// ============================================================================

/**
 * Parse MediaConvert webhook payload and extract useful information
 * 
 * @param payload - Raw MediaConvert CloudWatch Events payload
 * @returns Parsed result with status, renditions, and error info
 */
export function parseMediaConvertWebhook(
  payload: MediaConvertWebhookPayload
): ParsedMediaConvertResult {
  const { detail } = payload;
  const status = detail.status;

  const result: ParsedMediaConvertResult = {
    status,
    created_renditions: [],
    metadata: detail.userMetadata,
  };

  // Handle errors
  if (status === 'ERROR') {
    result.error_message = detail.errorMessage || 'Unknown error occurred during transcoding';
    return result;
  }

  // Parse output files for successful jobs
  if (status === 'COMPLETE' && detail.outputGroupDetails) {
    detail.outputGroupDetails.forEach((group) => {
      group.outputDetails?.forEach((output) => {
        output.outputFilePaths?.forEach((filePath) => {
          result.created_renditions.push({
            output_file: filePath,
            width: output.videoDetails?.widthInPx,
            height: output.videoDetails?.heightInPx,
            duration_ms: output.durationInMs,
          });
        });
      });
    });
  }

  return result;
}

/**
 * Generate a sample MediaConvert webhook payload for testing
 * 
 * @param contentId - Content ID to include in metadata
 * @param status - Job status (COMPLETE, ERROR, PROGRESSING)
 * @returns Sample webhook payload
 */
export function generateSampleWebhookPayload(
  contentId: string,
  status: 'COMPLETE' | 'ERROR' | 'PROGRESSING' = 'COMPLETE'
): MediaConvertWebhookPayload {
  const basePayload: MediaConvertWebhookPayload = {
    version: '0',
    id: `sample-event-${Date.now()}`,
    'detail-type': 'MediaConvert Job State Change',
    source: 'aws.mediaconvert',
    account: '123456789012',
    time: new Date().toISOString(),
    region: 'us-east-1',
    resources: [`arn:aws:mediaconvert:us-east-1:123456789012:jobs/sample-job-${Date.now()}`],
    detail: {
      status,
      userMetadata: {
        content_id: contentId,
        created_at: new Date().toISOString(),
      },
    },
  };

  if (status === 'COMPLETE') {
    basePayload.detail.outputGroupDetails = [
      {
        outputDetails: [
          {
            outputFilePaths: [
              `s3://urview-processed/content/${contentId}/hls_720p/playlist.m3u8`,
            ],
            durationInMs: 120000,
            videoDetails: {
              widthInPx: 1280,
              heightInPx: 720,
            },
          },
          {
            outputFilePaths: [
              `s3://urview-processed/content/${contentId}/hls_1080p/playlist.m3u8`,
            ],
            durationInMs: 120000,
            videoDetails: {
              widthInPx: 1920,
              heightInPx: 1080,
            },
          },
        ],
      },
    ];
  } else if (status === 'ERROR') {
    basePayload.detail.errorMessage = 'Sample error: Unable to decode input file';
  }

  return basePayload;
}

/**
 * Format parsed webhook result for display
 * 
 * @param result - Parsed webhook result
 * @returns Formatted string for display
 */
export function formatWebhookResult(result: ParsedMediaConvertResult): string {
  const lines: string[] = [];

  lines.push(`Status: ${result.status}`);
  lines.push('');

  if (result.error_message) {
    lines.push(`Error: ${result.error_message}`);
    lines.push('');
  }

  if (result.metadata) {
    lines.push('Metadata:');
    Object.entries(result.metadata).forEach(([key, value]) => {
      lines.push(`  ${key}: ${value}`);
    });
    lines.push('');
  }

  if (result.created_renditions.length > 0) {
    lines.push(`Created Renditions (${result.created_renditions.length}):`);
    result.created_renditions.forEach((rendition, index) => {
      lines.push(`  ${index + 1}. ${rendition.output_file}`);
      if (rendition.width && rendition.height) {
        lines.push(`     Resolution: ${rendition.width}x${rendition.height}`);
      }
      if (rendition.duration_ms) {
        lines.push(`     Duration: ${Math.round(rendition.duration_ms / 1000)}s`);
      }
    });
  } else if (result.status === 'COMPLETE') {
    lines.push('No renditions found in webhook payload');
  }

  return lines.join('\n');
}

/**
 * Validate MediaConvert webhook payload structure
 * 
 * @param payload - Payload to validate
 * @returns Validation result
 */
export function validateWebhookPayload(payload: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!payload) {
    errors.push('Payload is null or undefined');
    return { valid: false, errors };
  }

  if (typeof payload !== 'object') {
    errors.push('Payload must be an object');
    return { valid: false, errors };
  }

  // Check required fields
  const requiredFields = ['version', 'id', 'detail-type', 'source', 'detail'];
  requiredFields.forEach((field) => {
    if (!(field in payload)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check detail object
  if (payload.detail) {
    if (typeof payload.detail !== 'object') {
      errors.push('detail must be an object');
    } else {
      if (!payload.detail.status) {
        errors.push('detail.status is required');
      } else if (!['COMPLETE', 'ERROR', 'PROGRESSING'].includes(payload.detail.status)) {
        errors.push(
          `detail.status must be one of: COMPLETE, ERROR, PROGRESSING (got: ${payload.detail.status})`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Extract content ID from webhook payload
 * 
 * @param payload - MediaConvert webhook payload
 * @returns Content ID if found, null otherwise
 */
export function extractContentId(payload: MediaConvertWebhookPayload): string | null {
  return payload.detail.userMetadata?.content_id || null;
}

/**
 * Get summary statistics from webhook result
 * 
 * @param result - Parsed webhook result
 * @returns Summary stats
 */
export function getWebhookStats(result: ParsedMediaConvertResult): {
  totalRenditions: number;
  resolutions: string[];
  totalDurationMs: number;
  hasErrors: boolean;
} {
  const resolutions = result.created_renditions
    .filter((r) => r.width && r.height)
    .map((r) => `${r.width}x${r.height}`)
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  const totalDurationMs = result.created_renditions.reduce(
    (sum, r) => sum + (r.duration_ms || 0),
    0
  );

  return {
    totalRenditions: result.created_renditions.length,
    resolutions,
    totalDurationMs,
    hasErrors: result.status === 'ERROR' || !!result.error_message,
  };
}
