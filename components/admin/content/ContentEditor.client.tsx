'use client';

import { useState, FormEvent } from 'react';
import { 
  Content,
  CreateContentPayload,
  ApiError,
  ContentType,
  MediaType,
} from '@/lib/types/content';
import {
  createContent,
  updateContent,
  uploadImage,
  initUpload,
  publishContent,
} from '@/lib/contentApi';
import { uploadWithCallback, validateFile, formatFileSize } from '@/lib/uploadHelper';
import UploadProgress from './UploadProgress.client';
import RoundLoader from '@/components/Loader/RoundLoader';

interface ContentEditorProps {
  content?: Content | null;
  setContent :React.Dispatch<React.SetStateAction<Content[]>>;
  onClose: () => void;
  onSuccess: (content: Content) => void;
  contentType:ContentType
}

const CONTENT_TYPES: Array<{ value: ContentType; label: string }> = [
  { value: 'movie', label: 'movie - Single movie file' },
  { value: 'series', label: 'series - Series container (has seasons/episodes)' },
  { value: 'episode', label: 'episode - Individual episode (part of season)' },
  { value: 'trailer', label: 'trailer - Promotional trailer' },
  { value: 'documentary', label: 'documentary - Documentary content' },
];

const MEDIA_TYPES: Array<{ value: MediaType; label: string }> = [
  { value: 'flat', label: 'flat - Standard 2D video' },
  { value: 'vr_360_mono', label: 'vr_360_mono - 360 VR Mono (single view)' },
  { value: 'vr_360_sbs', label: 'vr_360_sbs - 360 VR 3D Side-by-Side stereo' },
  { value: 'vr_360_tb', label: 'vr_360_tb - 360 VR 3D Top-Bottom stereo' },
  { value: 'vr_180_mono', label: 'vr_180_mono - 180 VR Mono' },
  { value: 'vr_180_sbs', label: 'vr_180_sbs - 180 VR 3D Side-by-Side stereo' },
  { value: 'vr_180_tb', label: 'vr_180_tb - 180 VR 3D Top-Bottom stereo' },
];

export default function ContentEditor(props: ContentEditorProps) {
  const { content, onClose, onSuccess,setContent } = props;
  const isEditing = !!content;
  const [step, setStep] = useState(1);
console.log('content',content)
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const [formData, setFormData] = useState<CreateContentPayload>({
    title: content?.title || '',
    description: content?.description || '',
    content_type: content?.content_type || 'movie',
    media_type: content?.media_type || 'flat',
    status: content?.status || 'draft',
    is_kid_safe: content?.is_kid_safe || false,
    is_ppv: content?.is_ppv || false,
    price_cents: content?.price_cents || 0,
    genres: content?.genres || [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdContent, setCreatedContent] = useState<Content | null>(content || null);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  function handleChange(field: keyof CreateContentPayload, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); 
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.is_ppv && (!formData.price_cents || formData.price_cents <= 0)) {
      setError('Price is required for PPV content');
      return;
    } 
   
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (isEditing && content) {
        const updated = await updateContent(content.id, formData);
        
        nextStep();
        console.log(updated,"updated")
setContent(prevContents => {
          return prevContents.map(c => c.id === content.id ? updated : c);
        });
        setCreatedContent(updated);
        setSuccess('Content updated successfully!');
        // onSuccess(updated);
      } else {
        console.log('object')
        const created = await createContent(formData);
        nextStep();
        setCreatedContent(created);
        setSuccess(`Content created successfully! ID: ${created.id}`);
        setShowUpload(true);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save content');
      console.error('Error saving content:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload() {
    console.log('object is rednering')
    if (!uploadFile || !createdContent) {
      setError('Please select a file to upload');
      return;
    }

    const validation = validateFile(uploadFile, {
      maxSizeMB: 5000,
      allowedTypes: ['video/*', 'audio/*'],
    });

    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      setUploadStatus('Initializing upload...');

      const uploadInit = await initUpload(createdContent.id, uploadFile.name);
      setUploadStatus('Uploading to S3...');

      const result = await uploadWithCallback(uploadInit, uploadFile, {
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
          setUploadStatus(`Uploading: ${progress.percentage}% (${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)})`);
        },
      });

      setUploadStatus('Upload complete! Processing callback...');
      // console.log('Upload result:', result);
      setContent(prevContents => {
        return prevContents.map(c => c.id === createdContent.id ? { ...c, status: 'processing' } : c);
      });
      setSuccess('File uploaded successfully! Waiting for transcoding to start...');
      setUploadStatus('Upload complete - Asset created. Transcoding will begin shortly.');
      setUploadProgress(100);

    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  async function handleImageUpload(imageType: 'poster' | 'banner') {
    const file = imageType === 'poster' ? posterFile : bannerFile;
    
    if (!file || !createdContent) {
      setError(`Please select a ${imageType} image`);
      return;
    }

    const validation = validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/*'],
    });

    if (!validation.valid) {
      setError(validation.error || 'Invalid image');
      return;
    }

    try {
      setUploadingImage(imageType);
      setError(null);

      const result = await uploadImage(createdContent.id, file, imageType);
      
      setCreatedContent(prev => prev ? {
        ...prev,
        [`${imageType}_url`]: result.thumbnail_url,
      } : null);

      setSuccess(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} uploaded successfully!`);

    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || `Failed to upload ${imageType}`);
      console.error(`${imageType} upload error:`, err);
    } finally {
      setUploadingImage(null);
    }
  }

  async function handlePublish() {
    if (!createdContent) return;

    if (!confirm('Are you sure you want to publish this content? It will be visible to users.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const published = await publishContent(createdContent.id);
      setCreatedContent(published);
      setSuccess('Content published successfully!');
      onSuccess(published);

    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to publish content');
      console.error('Publish error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
   <>  
   {/* <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Content' : 'Create Content'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {success && (
            <div className="mb-4 bg-green-900/50 border border-green-600 text-green-200 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => handleChange('content_type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Media Type
                </label>
                <select
                  value={formData.media_type}
                  onChange={(e) => handleChange('media_type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MEDIA_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_kid_safe"
                  checked={formData.is_kid_safe}
                  onChange={(e) => handleChange('is_kid_safe', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_kid_safe" className="ml-2 text-sm text-gray-300">
                  Kid Safe Content
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_ppv"
                  checked={formData.is_ppv}
                  onChange={(e) => handleChange('is_ppv', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_ppv" className="ml-2 text-sm text-gray-300">
                  Pay-Per-View
                </label>
              </div>

              {formData.is_ppv && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (cents)
                  </label>
                  <input
                    type="number"
                    value={formData.price_cents}
                    onChange={(e) => handleChange('price_cents', parseInt(e.target.value) || 0)}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="599 = $5.99"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Price in cents (e.g., 599 = $5.99)
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                onClick={async ()=>{
                  // let create = await createContent(formData);
                  console.log(formData,"formData")
                }
                }
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Content' : 'Create Content'}
              </button>
            </div>
          </form>

          {createdContent && showUpload && (
            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Upload Media File</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {uploadFile && (
                    <p className="text-sm text-gray-400 mt-1">
                      Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  )}
                </div>

                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>

                {uploading && (
                  <UploadProgress
                    progress={uploadProgress}
                    status={uploadStatus}
                  />
                )}
              </div>
            </div>
          )}

          {createdContent && (
            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Upload Images</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Poster Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                    disabled={uploadingImage === 'poster'}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  {createdContent.poster_url && (
                    <img
                      src={createdContent.poster_url}
                      alt="Poster"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <button
                    onClick={() => handleImageUpload('poster')}
                    disabled={!posterFile || uploadingImage === 'poster'}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {uploadingImage === 'poster' ? 'Uploading...' : 'Upload Poster'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    disabled={uploadingImage === 'banner'}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  {createdContent.banner_url && (
                    <img
                      src={createdContent.banner_url}
                      alt="Banner"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <button
                    onClick={() => handleImageUpload('banner')}
                    disabled={!bannerFile || uploadingImage === 'banner'}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {uploadingImage === 'banner' ? 'Uploading...' : 'Upload Banner'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {createdContent && createdContent.status !== 'published' && (
            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Publish Content</h3>
              <p className="text-gray-400 mb-4">
                Once published, this content will be visible to users. Ensure all files are uploaded and processed.
              </p>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {loading ? 'Publishing...' : 'Publish Content'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div> */}
     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full overflow-y-scroll max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? "Edit Content" : "Create Content"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* STEPPER */}
        <div className="border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                onClick={()=>{setStep(num)}}
                className={`flex-1 h-2 mx-1 rounded-full ${
                  step >= num ? "bg-blue-500" : "bg-gray-600"
                }`}
              ></div>
            ))}
          </div>

          <p className="text-center text-gray-300 text-sm mt-2">
            {step === 1 && "Step 1: Create Content"}
            {step === 2 && "Step 2: Upload Images"}
            {step === 3 && "Step 3: Upload Media File"}
          </p>
        </div>

        <div className="p-6">

          {/* -------------------- STEP 1 -------------------- */}
          {step === 1 && (
            
<>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content Type
                </label>
                <select
                  value={formData.content_type}
                  onChange={(e) => handleChange('content_type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CONTENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Media Type
                </label>
                <select
                  value={formData.media_type}
                  onChange={(e) => handleChange('media_type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MEDIA_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_kid_safe"
                  checked={formData.is_kid_safe}
                  onChange={(e) => handleChange('is_kid_safe', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_kid_safe" className="ml-2 text-sm text-gray-300">
                  Kid Safe Content
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_ppv"
                  checked={formData.is_ppv}
                  onChange={(e) => handleChange('is_ppv', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_ppv" className="ml-2 text-sm text-gray-300">
                  Pay-Per-View
                </label>
              </div>

              {formData.is_ppv && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (cents)
                  </label>
                  <input
                    type="number"
                    value={formData.price_cents}
                    onChange={(e) => handleChange('price_cents', parseInt(e.target.value) || 0)}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="599 = $5.99"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Price in cents (e.g., 599 = $5.99)
                  </p>
                </div>
              )}
            </div>

             
              <button
                onClick={async (e) => {
                  await handleSubmit(e);
                  
                }}
                className="mt-4 w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button></>
           
          )}

          {/* -------------------- STEP 2 -------------------- */}
          {step === 2 && createdContent && (
            <div className="space-y-6">
              <h3 className="text-xl text-white font-semibold">
                Upload Images
              </h3>

              {/* Poster */}
              <div>
                <label className="text-gray-300 text-sm">Poster Image</label>
                <input
                  type="file"
                  accept="image/*"
                                      onChange={(e) => setPosterFile(e.target.files?.[0] || null)}

                  className="w-full px-3 py-2 bg-gray-700 text-white rounded my-2"
                />
                 {createdContent.poster_url && (
                    <img
                      src={createdContent.poster_url}
                      alt="Poster"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <button
                    onClick={() => handleImageUpload('poster')}
                    disabled={!posterFile || uploadingImage === 'poster'}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {uploadingImage === 'poster' ? 'Uploading...' : 'Upload Poster'}
                  </button>
              </div>

              {/* Banner */}
              <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banner Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    disabled={uploadingImage === 'banner'}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  {createdContent.banner_url && (
                    <img
                      src={createdContent.banner_url}
                      alt="Banner"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <button
                    onClick={() => handleImageUpload('banner')}
                    disabled={!bannerFile || uploadingImage === 'banner'}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {uploadingImage === 'banner' ? 'Uploading...' : 'Upload Banner'}
                  </button>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Back
                </button>

                <button
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded"
                >
                  Continue to Video Upload
                </button>
              </div>
            </div>
          )}

          {/* -------------------- STEP 3 -------------------- */}
          {step === 3 && createdContent && (
            <div className="space-y-6">
              {content?.status=='processing'?

              <><h3 className="text-xl text-white font-semibold">
                Content is Uploading to cloud (this might take a while)
              </h3> </>
:
              <><h3 className="text-xl text-white font-semibold">
                Upload Media File
              </h3>

              <input
                    type="file"
                    accept="video/*,audio/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {uploadFile && (
                    <p className="text-sm text-gray-400 mt-1">
                      Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                    </p>
                  )}</>}

              <div className="flex justify-between mt-6">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Back
                </button>

                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploading || content?.status == "processing"}
                  className="px-6 py-2 bg-orange-600 text-white rounded flex flex-row items-center "
                >
                  {content?.status == "processing" &&  <RoundLoader  className='mr-1'/>}
                  {content?.status == "processing"?"Initializing Content":'Initialize Content'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
