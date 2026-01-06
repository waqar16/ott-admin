'use client';

import { useState, FormEvent } from 'react';
import { 
  createContent,
  updateContent,
  getContent,
  listContent,
  publishContent,
  initUpload,
  postUploadCallback,
  uploadImage,
  getRenditions,
  getManifest,
  simulateMediaConvertWebhook,
} from '@/lib/contentApi';
import { uploadToS3Presigned, formatFileSize, validateFile } from '@/lib/uploadHelper';
import { 
  Content,
  CreateContentPayload,
  UploadInitResponse,
  Asset,
  Rendition,
  ManifestResponse,
  ApiError 
} from '@/lib/types/content';

export default function ContentUploadCheckPage() {
  const [output, setOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testFile, setTestFile] = useState<File | null>(null);
  const [testImageFile, setTestImageFile] = useState<File | null>(null);
  const [contentId, setContentId] = useState<string>('');
  const [assetId, setAssetId] = useState<string>('');

  function log(message: string, data?: any) {
    const timestamp = new Date().toLocaleTimeString();
    let logMessage = `[${timestamp}] ${message}`;
    if (data) {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    }
    setOutput((prev) => prev + logMessage + '\n\n');
    console.log(message, data);
  }

  function clearOutput() {
    setOutput('');
  }

  // Test 1: Create Content
  async function testCreateContent() {
    setLoading(true);
    log('=== TEST: Create Content ===');

    const payload: CreateContentPayload = {
      title: 'Test Movie ' + Date.now(),
      description: 'This is a test movie created via API',
      content_type: 'movie',
      media_type: 'flat',
      status: 'draft',
      is_kid_safe: false,
      is_ppv: true,
      price_cents: 599,
      genres: ['action', 'sci-fi'],
    };

    try {
      log('Creating content with payload:', payload);
      const content = await createContent(payload);
      log('✅ Content created successfully!', content);
      setContentId(content.id);
      return content;
    } catch (error) {
      log('❌ Error creating content:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 2: List Content
  async function testListContent() {
    setLoading(true);
    log('=== TEST: List Content ===');

    try {
      log('Fetching content list...');
      const result = await listContent({ status: 'draft' });
      log(`✅ Found ${result.content.length} content items`, result);
    } catch (error) {
      log('❌ Error listing content:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 3: Get Content Detail
  async function testGetContent() {
    if (!contentId) {
      log('❌ No content ID available. Create content first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Get Content Detail ===');

    try {
      log(`Fetching content ${contentId}...`);
      const content = await getContent(contentId);
      log('✅ Content retrieved successfully!', content);
    } catch (error) {
      log('❌ Error getting content:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 4: Update Content
  async function testUpdateContent() {
    if (!contentId) {
      log('❌ No content ID available. Create content first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Update Content ===');

    try {
      log(`Updating content ${contentId}...`);
      const updated = await updateContent(contentId, {
        title: 'Updated Title ' + Date.now(),
        description: 'This description has been updated',
      });
      log('✅ Content updated successfully!', updated);
    } catch (error) {
      log('❌ Error updating content:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 5: Initialize Upload
  async function testInitUpload() {
    if (!contentId) {
      log('❌ No content ID available. Create content first.');
      return;
    }

    if (!testFile) {
      log('❌ No file selected. Please select a file first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Initialize Upload ===');

    try {
      log(`Initializing upload for content ${contentId}...`);
      log(`File: ${testFile.name} (${formatFileSize(testFile.size)})`);

      const uploadInit = await initUpload(contentId, testFile.name);
      log('✅ Upload initialized successfully!', uploadInit);
      setAssetId(uploadInit.asset_id);
      return uploadInit;
    } catch (error) {
      log('❌ Error initializing upload:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 6: Upload File to S3
  async function testUploadToS3() {
    if (!contentId || !testFile) {
      log('❌ Need content ID and file. Run "Initialize Upload" first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Upload File to S3 ===');

    try {
      // Validate file
      const validation = validateFile(testFile, {
        maxSizeMB: 5000,
        allowedTypes: ['video/*', 'audio/*'],
      });

      if (!validation.valid) {
        log('❌ File validation failed:', validation.error);
        return;
      }

      log('File validation passed');

      // Initialize upload
      const uploadInit = await initUpload(contentId, testFile.name);
      log('Upload initialized', uploadInit);

      // Upload to S3 with progress tracking
      log('Starting upload to S3...');
      const result = await uploadToS3Presigned(uploadInit, testFile, {
        onProgress: (progress) => {
          log(`Upload progress: ${progress.percentage}% (${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)})`);
        },
      });

      log('✅ File uploaded to S3 successfully!', result);
      log(`ETag: ${result.etag}`);
      log(`S3 Key: ${uploadInit.s3_key}`);

      // Simulate callback
      log('Simulating S3 callback to backend...');
      const asset = await postUploadCallback(contentId, uploadInit.asset_id, {
        s3_key: uploadInit.s3_key,
        file_size_bytes: testFile.size,
        content_type: testFile.type,
      });
      log('✅ Callback processed successfully!', asset);
      setAssetId(asset.id);

    } catch (error) {
      log('❌ Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 7: Upload Image
  async function testUploadImage() {
    if (!contentId) {
      log('❌ No content ID available. Create content first.');
      return;
    }

    if (!testImageFile) {
      log('❌ No image selected. Please select an image first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Upload Image ===');

    try {
      log(`Uploading image for content ${contentId}...`);
      log(`File: ${testImageFile.name} (${formatFileSize(testImageFile.size)})`);

      const result = await uploadImage(contentId, testImageFile, 'poster');
      log('✅ Image uploaded successfully!', result);
    } catch (error) {
      log('❌ Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 8: Simulate MediaConvert Webhook
  async function testMediaConvertWebhook() {
    if (!contentId || !assetId) {
      log('❌ Need content ID and asset ID. Complete upload first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Simulate MediaConvert Webhook ===');

    try {
      log(`Simulating transcoding completion for asset ${assetId}...`);
      
      const renditions = await simulateMediaConvertWebhook(contentId, assetId);
      log('✅ MediaConvert webhook simulated successfully!', renditions);
      log(`Created ${renditions.length} renditions`);
    } catch (error) {
      log('❌ Error simulating webhook:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 9: Get Renditions
  async function testGetRenditions() {
    if (!contentId) {
      log('❌ No content ID available. Create content first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Get Renditions ===');

    try {
      log(`Fetching renditions for content ${contentId}...`);
      const renditions = await getRenditions(contentId);
      log(`✅ Found ${renditions.length} renditions`, renditions);
    } catch (error) {
      log('❌ Error getting renditions:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 10: Get Manifest
  async function testGetManifest() {
    if (!contentId) {
      log('❌ No content ID available. Create content first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Get Manifest ===');

    try {
      log(`Fetching manifest for content ${contentId}...`);
      const manifest = await getManifest(contentId);
      log('✅ Manifest retrieved successfully!', manifest);
    } catch (error) {
      log('❌ Error getting manifest:', error);
    } finally {
      setLoading(false);
    }
  }

  // Test 11: Publish Content
  async function testPublishContent() {
    if (!contentId) {
      log('❌ No content ID available. Create content first.');
      return;
    }

    setLoading(true);
    log('=== TEST: Publish Content ===');

    try {
      log(`Publishing content ${contentId}...`);
      const published = await publishContent(contentId);
      log('✅ Content published successfully!', published);
    } catch (error) {
      log('❌ Error publishing content:', error);
    } finally {
      setLoading(false);
    }
  }

  // Full Pipeline Test
  async function testFullPipeline() {
    if (!testFile) {
      log('❌ Please select a video file first.');
      return;
    }

    clearOutput();
    setLoading(true);
    log('🚀 Starting Full Upload Pipeline Test\n');

    try {
      // Step 1: Create content
      log('Step 1: Creating content...');
      const content = await createContent({
        title: 'Full Pipeline Test ' + Date.now(),
        description: 'Testing complete upload pipeline',
        content_type: 'movie',
        media_type: 'flat',
        status: 'draft',
        is_kid_safe: false,
        is_ppv: false,
      });
      log('✅ Content created', { id: content.id });
      setContentId(content.id);

      // Step 2: Initialize upload
      log('\nStep 2: Initializing upload...');
      const uploadInit = await initUpload(content.id, testFile.name);
      log('✅ Upload initialized', { asset_id: uploadInit.asset_id });
      setAssetId(uploadInit.asset_id);

      // Step 3: Upload to S3
      log('\nStep 3: Uploading file to S3...');
      await uploadToS3Presigned(uploadInit, testFile, {
        onProgress: (progress) => {
          if (progress.percentage % 10 === 0) {
            log(`Upload progress: ${progress.percentage}%`);
          }
        },
      });
      log('✅ File uploaded to S3');

      // Step 4: Post-upload callback
      log('\nStep 4: Sending upload callback...');
      const asset = await postUploadCallback(content.id, uploadInit.asset_id, {
        s3_key: uploadInit.s3_key,
        file_size_bytes: testFile.size,
        content_type: testFile.type,
      });
      log('✅ Callback processed', { asset_status: asset.status });

      // Step 5: Simulate transcoding
      log('\nStep 5: Simulating transcoding...');
      const renditions = await simulateMediaConvertWebhook(content.id, uploadInit.asset_id);
      log(`✅ Transcoding complete - ${renditions.length} renditions created`);

      // Step 6: Get renditions
      log('\nStep 6: Fetching renditions...');
      const fetchedRenditions = await getRenditions(content.id);
      log(`✅ Retrieved ${fetchedRenditions.length} renditions`);

      // Step 7: Get manifest
      log('\nStep 7: Getting playback manifest...');
      const manifest = await getManifest(content.id);
      log('✅ Manifest retrieved', { 
        hls_url: manifest.hls_url,
        dash_url: manifest.dash_url 
      });

      // Step 8: Publish content
      log('\nStep 8: Publishing content...');
      const published = await publishContent(content.id);
      log('✅ Content published!', { status: published.status });

      log('\n🎉 Full Pipeline Test Complete!');
      log(`Content ID: ${content.id}`);
      log(`Status: ${published.status}`);

    } catch (error) {
      log('\n❌ Pipeline test failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Content Upload API Test Page</h1>
        <p className="text-gray-400 mb-8">
          Test the complete content management and upload pipeline
        </p>

        {/* File Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Video File</h2>
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={(e) => setTestFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg"
            />
            {testFile && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {testFile.name} ({formatFileSize(testFile.size)})
              </p>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Image File</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTestImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg"
            />
            {testImageFile && (
              <p className="text-sm text-gray-400 mt-2">
                Selected: {testImageFile.name} ({formatFileSize(testImageFile.size)})
              </p>
            )}
          </div>
        </div>

        {/* Current IDs */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Test IDs</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Content ID:</span>
              <code className="ml-2 text-blue-400">{contentId || 'Not set'}</code>
            </div>
            <div>
              <span className="text-gray-400">Asset ID:</span>
              <code className="ml-2 text-blue-400">{assetId || 'Not set'}</code>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Individual Tests</h2>
            <button
              onClick={clearOutput}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Output
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={testCreateContent}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              1. Create Content
            </button>

            <button
              onClick={testListContent}
              disabled={loading}
              className="px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              2. List Content
            </button>

            <button
              onClick={testGetContent}
              disabled={loading || !contentId}
              className="px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              3. Get Content
            </button>

            <button
              onClick={testUpdateContent}
              disabled={loading || !contentId}
              className="px-4 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              4. Update Content
            </button>

            <button
              onClick={testInitUpload}
              disabled={loading || !contentId || !testFile}
              className="px-4 py-3 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              5. Init Upload
            </button>

            <button
              onClick={testUploadToS3}
              disabled={loading || !contentId || !testFile}
              className="px-4 py-3 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              6. Upload to S3
            </button>

            <button
              onClick={testUploadImage}
              disabled={loading || !contentId || !testImageFile}
              className="px-4 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              7. Upload Image
            </button>

            <button
              onClick={testMediaConvertWebhook}
              disabled={loading || !contentId || !assetId}
              className="px-4 py-3 bg-yellow-600 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              8. Simulate Webhook
            </button>

            <button
              onClick={testGetRenditions}
              disabled={loading || !contentId}
              className="px-4 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              9. Get Renditions
            </button>

            <button
              onClick={testGetManifest}
              disabled={loading || !contentId}
              className="px-4 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              10. Get Manifest
            </button>

            <button
              onClick={testPublishContent}
              disabled={loading || !contentId}
              className="px-4 py-3 bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              11. Publish
            </button>
          </div>
        </div>

        {/* Full Pipeline Test */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🚀 Full Pipeline Test</h2>
          <p className="text-gray-300 mb-4">
            Test the complete workflow: Create → Upload → Transcode → Publish
          </p>
          <button
            onClick={testFullPipeline}
            disabled={loading || !testFile}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all font-bold text-lg"
          >
            {loading ? 'Running Pipeline...' : 'Run Full Pipeline Test'}
          </button>
        </div>

        {/* Output */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Output Log</h2>
          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
            {output || 'No output yet. Run a test to see results.'}
          </pre>
        </div>
      </div>
    </div>
  );
}
