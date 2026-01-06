'use client';

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import {
  Content,
  CreateContentPayload,
  ApiError,
  ContentType,
  MediaType,
  ContentMetadataPayload,
} from '@/lib/types/content';
import { BiX } from 'react-icons/bi';

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
import axios from 'axios';
import { API_BASE } from '@/lib/config';
import { toast } from 'sonner';
import HlsVideoPlayer from '@/players/HLSPlayer';
import SkeletonLoader from '@/components/Loader/SkeletonLoader';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';


export interface ContentEditorProps {
  content?: Content | null;
  setContent?: React.Dispatch<React.SetStateAction<Content[]>>;
  onClose: () => void;
  onSuccess: (content: Content) => void;
  contentType: ContentType
  seasonNumber?: number
  parentId?: string
}

export const CONTENT_TYPES: Array<{ value: ContentType; label: string }> = [
  { value: 'movie', label: 'movie - Single movie file' },
  { value: 'series', label: 'series - Series container (has seasons/episodes)' },
  { value: 'season', label: 'Season - Series container (has seasons/episodes)' },
  { value: 'episode', label: 'episode - Individual episode (part of season)' },
  { value: 'trailer', label: 'trailer - Promotional trailer' },
  { value: 'documentary', label: 'documentary - Documentary content' },
];

export const MEDIA_TYPES: Array<{ value: MediaType; label: string }> = [
  { value: 'flat', label: 'flat - Standard 2D video' },
  { value: 'vr_360_mono', label: 'vr_360_mono - 360 VR Mono (single view)' },
  { value: 'vr_360_sbs', label: 'vr_360_sbs - 360 VR 3D Side-by-Side stereo' },
  { value: 'vr_360_tb', label: 'vr_360_tb - 360 VR 3D Top-Bottom stereo' },
  { value: 'vr_180_mono', label: 'vr_180_mono - 180 VR Mono' },
  { value: 'vr_180_sbs', label: 'vr_180_sbs - 180 VR 3D Side-by-Side stereo' },
  { value: 'vr_180_tb', label: 'vr_180_tb - 180 VR 3D Top-Bottom stereo' },
];
type SearchableSingleSelectProps = {
  label?: string;
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
};
export default function ContentEditor(props: ContentEditorProps) {
  const [metaData, setMetaData] = useState<ContentMetadataPayload>({
    content: '',
    directors: [],
    producers: [],
    cast: [],
    genres: [],
    release_year: undefined,
    age_rating: '',
    language: '',
    subtitles_available: [],
    production_company: '',
    country: '',
    awards: [],
  });

  const trailerTypes = [{ id: 'movie', name: 'Movie Trailer' }, { id: 'series', name: 'Series Trailer' }, { id: 'season', name: 'Season Trailer' }, { id: 'demo-content', name: 'Demo Content Trailer' }, { id: 'documentary', name: 'Documentary Trailer' }]
  const { content, onClose, onSuccess, setContent, contentType, seasonNumber, parentId } = props;
  const isEditing = !!content;
  const [step, setStep] = useState(1);
  const [allGenre, setAllGenre] = useState<[]>([]);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  function updateNode(
    nodes: Content[],
    updated: Content
  ): Content[] {
    return nodes.map((node) => {
      if (node.id === updated.id) {
        return updated;
      }

      if (node.children?.length) {
        return {
          ...node,
          children: updateNode(node.children, updated),
        };
      }

      return node;
    });
  }

  const [formData, setFormData] = useState<CreateContentPayload>({
    title: content?.title || '',
    description: content?.description || '',
    content_type: content?.content_type || contentType,
    media_type: content?.media_type || 'flat',
    trailerType: content?.trailerType || 'movie',
    status: content?.status || 'draft',
    is_kid_safe: content?.is_kid_safe || false,
    is_ppv: content?.is_ppv || false,
    price_cents: content?.price_cents || 0,
    genres: content?.genres || [],
    parent: parentId

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
  useEffect(() => {
    if (createdContent?.id) {
      setMetaData(prev => ({
        ...prev,
        content: createdContent.id,
        genres: formData.genres,
      }));
    }
  }, [createdContent]);

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

        if (setContent && contentType != "season" && contentType != 'episode') {
          setContent(prev => [updated, ...prev]);

        }
        else {
          if (setContent && contentType == "season") {

            setContent(prev => updateNode(prev, updated)
            );

          }
        }


        setCreatedContent(updated);
        setSuccess('Content updated successfully!');
        // onSuccess(updated);
      } else {
        const created = await createContent(formData);
        if (setContent && contentType != "season" && contentType != "episode") {
          setContent(prev => [created, ...prev]);

        }
        if (setContent && contentType == "season") {
          setContent(prev =>
            prev.map(s =>
              s.id == parentId
                ? {
                  ...s,
                  children: [...(s.children || []), created],
                }
                : s
            )
          );

        }
        if (setContent && contentType === "episode") {
          setContent(prev =>
            prev.map(series => ({
              ...series,
              children: series.children?.map(season =>
                season.id === parentId
                  ? {
                    ...season,
                    children: [...(season.children ?? []), created],
                  }
                  : season
              ),
            }))
          );
        }

        toast.success(`Your ${contentType} is succesfully Created. Add Meta deta of Content i.e: Author, Director`)
        nextStep();
        setCreatedContent(created);
        setSuccess(`Content created successfully! ID: ${created.id}`);
        setShowUpload(true);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload() {
    if (!uploadFile || !createdContent) {
      setError('Please select a file to upload');
      return;
    }

    const validation = validateFile(uploadFile, {
      // Allow large files (GBs). Default is 5000MB in helper.
      allowedTypes: ['video/*', 'audio/*'],
    });

    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    try {
      setLoading(true)
      setUploading(true);
      setError(null);
      setUploadStatus('Initializing upload...');

      const uploadInit = await initUpload(createdContent.id, uploadFile.name);

      const result = await uploadWithCallback(uploadInit, uploadFile, {
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
          setUploadStatus(`Uploading: ${progress.percentage}% (${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)})`);
        },
      });

      setUploadStatus('Upload complete! Processing callback...');
      setContent(prevContents => {
        return prevContents.map(c => c.id === createdContent.id ? { ...c, status: 'processing', ingest_status: 'processing' } : c);
      });
      onClose()
      toast.info("Your Video Content upload wait for the processing to comlete then proceed to publish");

      setSuccess('File uploaded successfully! Waiting for transcoding to start...');
      setUploadStatus('Upload complete - Asset created. Transcoding will begin shortly.');
      setUploadProgress(100);

    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Upload failed');
    } finally {
      setUploading(false);
      setLoading(false)

    }
  }

  async function handleImageUpload(imageType: 'poster' | 'banner' | 'episode-thumbnail') {
    const file = imageType === 'poster' ? posterFile : bannerFile;

    if (!file || !createdContent) {
      toast.error(`Please select a ${imageType} image`);
      return;
    }

    const validation = validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/*'],
    });

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image');
      return;
    }

    try {
      setUploadingImage(imageType);

      const result = await uploadImage(createdContent.id, file, imageType);
      if (contentType != 'episode') {
        setCreatedContent(prev => prev ? {
          ...prev,
          [`${imageType}_url`]: result.thumbnail_url,
        } : null);
      }
      else {
        setCreatedContent(prev => prev ? {
          ...prev,
          [`thumbnail_url`]: result.thumbnail_url,
        } : null);
      }
      toast.success(`${imageType.charAt(0).toUpperCase() + imageType.slice(1)} uploaded successfully!`);

    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || `Failed to upload ${imageType}`);
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
    } finally {
      setLoading(false);
    }
  }
  const fetchGenre = async () => {
    try {
      let fetchGenre = await axios.get(`${API_BASE}api/v1/content/genres`)
      setAllGenre(fetchGenre.data.results)
    }
    catch (err) {
    }
  }
  useEffect(() => {
    fetchGenre()
  }, [])

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoFetchLoading, setVideoFetchLoading] = useState<boolean>(true)
  setVideoUrl
  useEffect(() => {
    async function fetchVideo() {
      try {
        setVideoFetchLoading(true)

        const token = Cookies.get("access_token");

        const res = await fetch(
          `${API_BASE}api/v1/content/content/${content?.id}/stream/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch video");
        const data = await res.json();
        setVideoUrl(data.playback_url);
        setVideoFetchLoading(false)
      } catch (e) {
        setVideoFetchLoading(false)
      } finally {
        setVideoFetchLoading(false)
      }
    }

    if (isEditing) {
      fetchVideo();
    }
    if (isEditing && content.content_metadata) {
      setMetaData(content.content_metadata)
    }
    console.log('content', content)
    setVideoFetchLoading(false)

  }, []);
  async function handleMetadataSubmit() {
    try {
      setLoading(true);

      if (isEditing && metaData?.id) {
        await axios.patch(
          `${API_BASE}api/v1/content/content-metadata/${metaData.id}/`,
          metaData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        }
        );

        toast.success("Metadata saved successfully");
      }
      else {
        await axios.post(
          `${API_BASE}api/v1/content/content-metadata/`,
          metaData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('access_token')}`
          }
        }
        );

        toast.success("Metadata saved successfully");
      }
      nextStep(); // go to image upload
    } catch (err) {
      toast.error("Failed to save metadata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
        {loading && !uploading && <FullScreenLoader />}
        <div className="bg-neutral-900 rounded-lg max-w-4xl w-full overflow-y-scroll max-h-[90vh]">

          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white capitalize">
              {isEditing ? "Edit Content" : `Create ${contentType}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          {/* Upload progress & status for large files */}
          {(uploading || uploadProgress > 0) && (
            <div className="px-6 mt-4">
              <UploadProgress
                progress={uploadProgress}
                status={uploadStatus || 'Preparing upload…'}
              />
            </div>
          )}

          {/* STEPPER */}
          <div className="border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              {<>{contentType == 'series' || contentType == 'season' ?
                <>{[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    onClick={() => { setStep(num) }}
                    className={`flex-1 h-2 mx-1 rounded-full ${step >= num ? "bg-blue-500" : "bg-gray-600"
                      }`}
                  ></div>
                ))}</> :
                <>{[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    onClick={() => { setStep(num) }}
                    className={`flex-1 h-2 mx-1 rounded-full ${step >= num ? "bg-blue-500" : "bg-gray-600"
                      }`}
                  ></div>
                ))}</>}
              </>}
            </div>

            <p className="text-center text-gray-300 text-sm mt-2">
              {step === 1 && "Step 1: Create Content"}
              {step === 2 && "Step 2: Content Metadata"}
              {step === 3 && "Step 2: Upload Images"}
              {step === 4 && "Step 3: Upload Media File"}
            </p>
          </div>

          <div className="p-6">
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

                  <div className={` md:col-span-2 `}>
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


                  {contentType != 'season' && contentType != 'episode' && <>
                    <MultiSelect
                      allGenre={allGenre}
                      formData={formData}
                      setFormData={setFormData}
                    />
                    {
                      contentType == 'trailer' &&
                      <>
                        <SingleSelect
                          label="Trailer Type"
                          options={trailerTypes}
                          value={String(formData.trailerType)}
                          onChange={(id) =>
                            setFormData((prev) => ({ ...prev, trailerType: id }))
                          }
                        />
                        {formData.trailerType &&
                          <SearchableSingleSelect
                            label="Select Trailer"
                            value={formData.parent}
                            onChange={(id) =>
                              setFormData((prev) => ({ ...prev, parent: id }))
                            }
                          />}
                      </>

                    }

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
                    )}</>

                  }
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
            {step === 2 && createdContent && (
              <div className="space-y-6">

                <h3 className="text-xl text-white font-semibold">
                  Content Metadata
                </h3> 
                <TagInput
                  label="Director"
                  values={metaData.directors}
                  onChange={(v) => setMetaData(p => ({ ...p, directors: v }))}
                />

                <TagInput
                  label="Producers"
                  values={metaData.producers}
                  onChange={(v) => setMetaData(p => ({ ...p, producers: v }))}
                />

                <TagInput
                  label="Cast"
                  values={metaData.cast}
                  onChange={(v) => setMetaData(p => ({ ...p, cast: v }))}
                />

                <input
                  type="number"
                  placeholder="Release Year"
                  value={metaData.release_year || ''}
                  onChange={(e) =>
                    setMetaData(p => ({ ...p, release_year: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                />

                <select
                  value={metaData.age_rating}
                  onChange={(e) =>
                    setMetaData(p => ({ ...p, age_rating: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                >
                  <option value="">Select Age Rating</option>
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                </select>

                <input
                  placeholder="Language"
                  value={metaData.language}
                  onChange={(e) =>
                    setMetaData(p => ({ ...p, language: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                />

                <TagInput
                  label="Subtitles Available"
                  values={metaData.subtitles_available}
                  onChange={(v) =>
                    setMetaData(p => ({ ...p, subtitles_available: v }))
                  }
                />

                <input
                  placeholder="Production Company"
                  value={metaData.production_company}
                  onChange={(e) =>
                    setMetaData(p => ({ ...p, production_company: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                />

                <input
                  placeholder="Country"
                  value={metaData.country}
                  onChange={(e) =>
                    setMetaData(p => ({ ...p, country: e.target.value }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded"
                />

                <TagInput
                  label="Awards"
                  values={metaData.awards}
                  onChange={(v) => setMetaData(p => ({ ...p, awards: v }))}
                />

                <div className="flex justify-between">
                  <button onClick={prevStep} className="px-4 py-2 bg-gray-600 rounded">
                    Back
                  </button>

                  <button
                    onClick={handleMetadataSubmit}
                    className="px-6 py-2 bg-blue-600 rounded"
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            )}

            {/* -------------------- STEP 2 -------------------- */}
            {step === 3 && createdContent && (
              <div className="space-y-6">
                <h3 className="text-xl text-white font-semibold">
                  Upload Images
                </h3>

                {/* Poster */}
                {contentType != "episode" && <div>
                  <label className="text-gray-300 text-sm">Poster Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}

                    className="w-full px-3 py-2 bg-gray-700 text-white rounded my-2"
                  />
                  <p className="text-xs text-gray-400 mb-2">
                    Aspect ratio: 2:3 - Recommended size: 1000x1500.
                  </p>
                  {createdContent.poster_url && (
                    <img
                      src={createdContent.poster_url}
                      alt="Poster"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  <button
                    onClick={() => handleImageUpload(contentType == 'episode' ? 'episode-thumbnail' : 'poster')}


                    disabled={!posterFile || uploadingImage === 'poster'}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {uploadingImage === 'poster' ? 'Uploading...' : 'Upload Poster'}
                  </button>
                </div>}

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
                  <p className="text-xs text-gray-400 mb-2">
                    Aspect ratio: 16:9 - Recommended size: 1920x1080. Scales responsively across devices.
                  </p>
                  {createdContent.banner_url && (
                    <img
                      src={createdContent.banner_url}
                      alt="Banner"
                      className="w-full h-40 object-cover rounded-lg mb-2"
                    />
                  )}
                  {createdContent.thumbnail_url && (
                    <>

                      <img
                        src={createdContent.thumbnail_url}
                        alt="Banner"
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                    </>

                  )}
                  <button
                    onClick={() => handleImageUpload(contentType == 'episode' ? 'episode-thumbnail' : 'banner')}
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
                  {
                    (contentType !== 'series' && contentType !== 'season') ?
                      <button
                        onClick={nextStep}
                        className="px-6 py-2 bg-blue-600 text-white rounded"
                      >
                        Continue to Video Upload
                      </button> :
                      <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded"
                      >
                        Finish
                      </button>
                  }

                </div>
              </div>
            )}

            {/* -------------------- STEP 3 -------------------- */}
            {step === 4 && createdContent && (contentType !== 'series' && contentType != 'season') && (
              <div className="space-y-6">
                {videoFetchLoading ?
                  <SkeletonLoader className='w-full h-[40vh] bg-gray-600' /> :
                  <>

                    {content?.ingest_status == 'processing' ?

                      <><h3 className="text-xl text-white font-semibold">
                        Content is Uploading to cloud (this might take a while)
                      </h3> </>
                      :
                      <><h3 className="text-xl text-white font-semibold">
                        Upload Media File
                      </h3>

                        {!videoFetchLoading && videoUrl && isEditing && (
                          <div className="relative w-full h-full">
                            <HlsVideoPlayer src={videoUrl} />
                          </div>
                        )}
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

                    {/* Large file soft warning (≥1GB) */}
                    {uploadFile && uploadFile.size >= 1024 * 1024 * 1024 && (
                      <p className="text-xs text-amber-500 mt-1">
                        Large file detected. Upload may take time; keep this tab open.
                      </p>
                    )}

                    <div className="flex justify-between mt-6">
                      <button
                        onClick={prevStep}
                        className="px-4 py-2 bg-gray-600 text-white rounded"
                      >
                        Back
                      </button>

                      <button
                        onClick={handleFileUpload}
                        disabled={!uploadFile || uploading || content?.ingest_status == "processing"}
                        className="px-6 py-2 bg-orange-600 text-white rounded flex flex-row items-center "
                      >
                        {uploading ? <RoundLoader /> : <>
                          {content?.ingest_status == "processing" && <RoundLoader className='mr-1' />}
                          {content?.ingest_status == "processing" ? "Initializing Content" : 'Initialize Content'}</>}
                      </button>
                    </div>
                  </>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
function MultiSelect({ allGenre, formData, setFormData }) {
  const [open, setOpen] = useState(false);

  const toggleGenre = (id: string) => {
    setFormData((prev) => {
      const exists = prev.genres.includes(id);
      return {
        ...prev,
        genres: exists
          ? prev.genres.filter((g: string) => g !== id)
          : [...prev.genres, id],
      };
    });
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Genre
      </label>

      {/* Dropdown Button */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-pointer border border-gray-600"
      >
        {formData.genres.length === 0 ? (
          <span className="text-gray-400">Select genres...</span>
        ) : (
          formData.genres.map((id) => {
            const g = allGenre.find((x) => x.id === id);
            return (
              <span
                key={id}
                className="bg-blue-600 px-2 py-1 text-xs rounded-md"
              >
                {g?.name}
              </span>
            );
          })
        )}
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-20 w-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto">
          {allGenre.map((type: { id: string; name: string }) => {
            const isSelected = formData.genres.includes(type.id);

            return (
              <div
                key={type.id}
                onClick={() => toggleGenre(type.id)}
                className="flex items-center px-4 py-2 text-white cursor-pointer hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="mr-3"
                />
                {type.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

type Option = {
  id: string;
  name: string;
};
type Option2 = {
  id: string;
  title: string;
  poster_url: string;
};

type SingleSelectProps = {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
};
export function SingleSelect({
  label,
  options,
  value,
  onChange,
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.id === value);

  const selectOption = (id: string) => {
    onChange(id);
    setOpen(false); // close after select
  };
  React.useEffect(() => {
    let fetch = async () => {
      let fetchUnattachedTrailers = await axios.get(`${API_BASE}/api/v1/content/frontend/search?q=the`)
    }
    fetch()
  }, [])
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      {/* Dropdown Button */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer border border-gray-600 flex justify-between items-center"
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.name : "Select option..."}
        </span>
        <span className="text-gray-400">▾</span>
      </div>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-20 w-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.id === value;

            return (
              <div
                key={opt.id}
                onClick={() => selectOption(opt.id)}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 ${isSelected ? "bg-gray-700" : ""
                  }`}
              >

                {opt.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SearchableSingleSelect({
  label,
  value,
  onChange,
  placeholder = "Select option...",
}: SearchableSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Option2[]>([]);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  /* 🔁 Fetch options from API (debounced) */
  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE}/api/v1/content/search-movies`,
          { params: { q: search } }
        );

        setOptions(
          res.data || []
        );
      } catch (err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(timeout);
  }, [search, open]);

  const selectOption = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  /* ❌ Close on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        onClick={() => setOpen((p) => !p)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer border border-gray-600 flex justify-between items-center"
      >
        <span className={selected ? "" : "text-gray-400"}>
          {selected ? selected.title : placeholder}
        </span>
        <span className="text-gray-400">▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 w-full mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          {/* 🔍 Search */}
          <div className="p-2 border-b border-gray-700">
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 outline-none"
            />
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto">
            {loading && (
              <div className="px-4 py-3 text-gray-400 text-sm">
                Searching...
              </div>
            )}

            {!loading && options.length === 0 && (
              <div className="px-4 py-3 text-gray-400 text-sm">
                No results found
              </div>
            )}

            {!loading &&
              options.map((opt) => {
                const isSelected = opt.id === value;

                return (
                  <div
                    key={opt.id}
                    onClick={() => selectOption(opt.id)}
                    className={`my-[2px] flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700 ${isSelected ? "bg-gray-700" : ""
                      }`}
                  >
                    <img className='w-12 h-auto rounded-sm ' src={`${opt.poster_url}`} />
                    <span className="text-white ml-2">{opt.title} </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}


type TagInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
};

export function TagInput({
  label,
  values,
  onChange,
  placeholder = "Type and press Enter",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();
    if (!value || values.includes(value)) return;

    onChange([...values, value]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  return (
    <div>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-blue-600 text-white px-2 py-1 rounded text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-red-300"
            >
              <BiX size={14} />
            </button>
          </span>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTag()}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
      />
    </div>
  );
}