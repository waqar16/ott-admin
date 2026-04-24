'use client';

import React, { useState, FormEvent, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import MultiSelect from '@/components/MultiSelect';
import TagInput from '@/components/TagInput';
import {
  Content,
  CreateContentPayload,
  ApiError,
  ContentType,
  MediaType,
  ContentMetadataPayload,
  VisibilityMode,
} from '@/lib/types/content';
import { BiX } from 'react-icons/bi';

import {
  createContent,
  updateContent,
  uploadImage,
  initUpload,
  initMultipartUpload,
  publishContent,
} from '@/lib/contentApi';
import { uploadWithCallback, uploadMultipartWithCallback, validateFile, formatFileSize } from '@/lib/uploadHelper';
import UploadProgress from './UploadProgress.client';
import RoundLoader from '@/components/Loader/RoundLoader';
import axios from 'axios';
import { API_BASE } from '@/lib/config';
import { toast } from 'sonner';
import HlsVideoPlayer from '@/players/HLSPlayer';
import SkeletonLoader from '@/components/Loader/SkeletonLoader';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';
import SingleSelect from '@/components/SingleSelect';
import SearchableSingleSelect from '@/components/SearchableSingleSelect';
import { UploadToastProgress } from './UploadToastProgress';
import GoogleDriveButton, { type DriveFile } from '@/components/GoogleDriveUploadButton/GoogleDriveButton';
import { getCreators } from '@/lib/creatorApi';
import MultiSelectCreator from '@/components/MultiSelectCreator';


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




const contentSteps = {
  "series": [
    {
      title: "Create Content",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16M4 12h16M4 19h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Add Metadata",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 11v6m0-10h.01M4 5h16v14H4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Upload Banner",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16v14H4zM8 11l2 2 4-4 4 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    }
  ],
  "movie": [
    {
      title: "Create Content",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16M4 12h16M4 19h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Add Metadata",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 11v6m0-10h.01M4 5h16v14H4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Upload Image",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16v14H4zM8 11l2 2 4-4 4 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Upload Video",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ],
  "episode": [
    {
      title: "Create Content",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16M4 12h16M4 19h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Upload Thumbnail",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16v14H4zM8 11l2 2 4-4 4 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Upload Video",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ],
  "season": [
    {
      title: "Create Content",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16M4 12h16M4 19h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ],
  "documentary": [
    {
      title: "Create Content",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16M4 12h16M4 19h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Add Metadata",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 11v6m0-10h.01M4 5h16v14H4z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Upload Image",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 5h16v14H4zM8 11l2 2 4-4 4 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      title: "Upload Video",
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ]
}
export const MEDIA_TYPES: Array<{ id: MediaType; name: string }> = [
  { id: 'flat', name: 'Standard Video (2D)' },

  { id: 'vr_360_mono', name: '360° VR Video (Single View)' },
  { id: 'vr_360_sbs', name: '360° VR Video (3D – Side by Side)' },
  { id: 'vr_360_tb', name: '360° VR Video (3D – Top & Bottom)' },

  { id: 'vr_180_mono', name: '180° VR Video (Single View)' },
  { id: 'vr_180_sbs', name: '180° VR Video (3D – Side by Side)' },
  { id: 'vr_180_tb', name: '180° VR Video (3D – Top & Bottom)' },
];

export const VISIBILITY_MODES: Array<{ id: VisibilityMode; name: string }> = [
  { id: 'public', name: 'Public' },
  { id: 'beta', name: 'Beta' },
];

export default function ContentEditor(props: ContentEditorProps) {
  const [mounted, setMounted] = useState(false);
  const gridScrollRef = useRef(null);
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
  const [allcreators, setAllcreators] = useState<[]>([]);
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdContent, setCreatedContent] = useState<Content | null>(content || null);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [driveSelectedFile, setDriveSelectedFile] = useState<DriveFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [trailerMode, setTrailerMode] = useState<"upload" | "url">("upload");
  const [imagesModeForMobile, setImagesModeForMobile] = useState<"poster" | "banner">("poster");
  const [videoUrlInput, setVideoUrlInput] = useState("");
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
    visibility_mode: content?.visibility_mode || 'public',
    trailerType: content?.trailerType || 'movie',
    season_number: content?.season_number,
    episode_number: content?.episode_number,
    status: content?.status || 'draft',
    is_demo_content: content?.is_demo_content || false,
    is_kid_safe: content?.is_kid_safe || false,
    is_ppv: content?.is_ppv || false,
    is_educational: content?.is_educational || false,

    price: content?.price || 0,
    genres: content?.genres || [],
    creators: content?.creators || [],

    parent: parentId

  });


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
    console.log("formData.episode_number", formData.episode_number)
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (
      formData.content_type === "episode" &&
      (formData.episode_number === undefined ||
        formData.episode_number === null
      )
    ) {
      toast.error("Episode number is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (formData.is_ppv && (!formData.price || formData.price <= 0)) {
      toast.error('Price is required for PPV content');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (content || createdContent) {
        const updated = await updateContent(content?.id || createdContent?.id, formData);

        nextStep();

        if (setContent && contentType != "season" && contentType != 'episode') {
          setContent(prev => [updated, ...prev]);

        }
        else {
          if (setContent && contentType == "season") {

            setContent(prev => updateNode(prev, updated)
            );
            onClose()
            return;
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
          onClose()
          return;
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
      toast.error(apiError.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload() {
    if ((!uploadFile && !driveSelectedFile) || !createdContent) {
      toast.error('Please select a file to upload');
      return;
    }

    // Handle Drive file upload
    if (driveSelectedFile && !uploadFile) {
      try {
        setLoading(true);
        setUploading(true);
        setError(null);
        setUploadStatus('Initializing Drive upload...');






        // Call initUpload with Drive file ID and access token
        const uploadInit = await initUpload(createdContent.id, driveSelectedFile.id, true, driveSelectedFile.accessToken);


        setUploadStatus(uploadInit?.msg || 'Google Drive upload initiated');




        toast.success(
          uploadInit?.msg || 'Google Drive upload initiated'
        );


        setDriveSelectedFile(null);
        if (uploadInit.msg) {
          onClose()

        }
        else {
          toast.error('Failed to initiate Google Drive upload');
          onClose()
        }
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message || 'Drive upload failed');
      } finally {
        setUploading(false);
        setLoading(false);
      }

      return;
    }

    // Handle local file upload
    const toastId = toast.custom(
      () => (
        <UploadToastProgress
          progress={0}
          status="Initializing upload…"
        />
      ),
      {
        duration: Infinity,
      }
    );

    const validation = validateFile(uploadFile, {
      allowedTypes: ['video/*', 'audio/*'],
    });

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    try {
      setLoading(true);
      setUploading(true);
      setError(null);
      setUploadStatus('Initializing upload...');


      let result;



      const uploadInit = await initMultipartUpload(createdContent.id, uploadFile.name, uploadFile.size);
      if (uploadInit.s3_key) {
        onClose();
      }

      result = await uploadMultipartWithCallback(uploadInit, uploadFile, createdContent.id, uploadFile.name, {
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
          setUploadStatus(`Uploading: ${progress.percentage}% (${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)})`);
          toast.custom(
            () => (
              <UploadToastProgress
                progress={progress.percentage}
                status={`Uploading ${progress.percentage}%`}
              />
            ),
            {
              id: toastId,
            }
          );
          if (progress.percentage >= 100) {
            toast.dismiss(toastId);
            toast.success(
              "Upload completed. Please wait for processing before publishing."
            );
          }
        },
      });


      setUploadStatus('Upload complete! Processing callback...');
      setContent(prevContents => {
        return prevContents.map(c => c.id === createdContent.id ? { ...c, status: 'processing', ingest_status: 'processing' } : c);
      });

      setSuccess('File uploaded successfully! Waiting for transcoding to start...');
      setUploadStatus('Upload complete - Asset created. Transcoding will begin shortly.');
      setUploadProgress(100);

    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || 'Upload failed');
    } finally {
      setUploading(false);
      setLoading(false);
    }
  }

  async function handleImageUpload(imageType: 'poster' | 'banner' | 'episode-thumbnail') {
    const file = imageType === 'poster' ? posterFile : bannerFile;

    if (!file || !createdContent) {

      return { status: 400, message: `Please select a ${imageType} image` };
    }

    const validation = validateFile(file, {
      maxSizeMB: 10,
      allowedTypes: ['image/*'],
    });

    if (!validation.valid) {

      return { status: 400, message: validation.error || 'Invalid image' };

    }

    try {
      setUploadingImage(imageType);
      console.log("file", file)
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
      setPosterFile(null);
      setBannerFile(null);
      return { status: 200, message: 'Image uploaded successfully' };

    } catch (err) {
      const apiError = err as ApiError;

      return err;
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
      toast.error(apiError.message || 'Failed to publish content');
    } finally {
      setLoading(false);
    }
  }
  const fetchGenre = async () => {
    try {
      let fetchGenre = await axios.get(`${API_BASE}api/v1/content/genres`)

      setAllGenre(fetchGenre?.data)
    }
    catch (err) {
      console.log(err, "error")
      setAllGenre([])
    }
  }
  const fetchCreators = async () => {
    try {
      let creators = await getCreators()
      if (Array.isArray(creators)) {
        setAllcreators(creators)
      }
    }
    catch (err) {
      console.log(err, "error")
      setAllcreators([])
    }
  }
  useEffect(() => {
    fetchGenre()
    fetchCreators()
  }, [])

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoFetchLoading, setVideoFetchLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchVideo() {
      try {
        setVideoFetchLoading(true)

        const token = Cookies.get("access_token");

        const res = await fetch(
          `${API_BASE}api/v1/content/content/${content?.id}/stream`,
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
          `${API_BASE}api/v1/content/content-metadata/${metaData.id}`,
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
          `${API_BASE}api/v1/content/content-metadata`,
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

  useEffect(() => {
    // Disable background scroll when modal opens
    document.body.style.overflow = "hidden";

    return () => {
      // Restore scroll when modal closes
      document.body.style.overflow = "auto";
    };
  }, []);
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // reset errors first


    if (!file) {
      setBannerFile(null);
      return;
    }

    // ---- Check file size (1MB) ----


    // ---- Check orientation (landscape) ----
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const isLandscape = img.width > img.height;

      URL.revokeObjectURL(objectUrl);

      if (!isLandscape) {
        toast.error("Banner must be in landscape orientation.");
        setBannerFile(null);
        return;
      }

      // ✅ Everything valid
      setBannerFile(file);


    };
    setCreatedContent(prev => ({
      ...prev,
      banner_url: null
    }));
    img.src = objectUrl;
  };
  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log(file, "file")
    // reset errors first


    if (!file) {
      setPosterFile(null);
      return;
    }



    // ---- Check orientation (landscape) ----
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const isLandscape = img.width > img.height;

      URL.revokeObjectURL(objectUrl);

      if (isLandscape) {
        toast.error("Banner must be in Portrait orientation.");
        setPosterFile(null);
        return;
      }

      // ✅ Everything valid
      setPosterFile(file);


    };
    setCreatedContent(prev => ({
      ...prev,
      poster_url: null
    }));
    img.src = objectUrl;
  };



  useEffect(() => {
    setMounted(true);
  }, [])
  if (!mounted) return null;
  return (
    <>

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 py-2 sm:p-2 md:p-8">
        {loading && !uploading && <FullScreenLoader />}
        <div className="bg-neutral-900 sm:rounded-lg max-w-6xl w-full h-[100vh]  md:max-h-[95vh] md:h-auto">

          <div className="md:mt-0 mt-8 flex items-center justify-between p-6 border-b border-gray-700 h-[10vh]">
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
          {/* {(uploading || uploadProgress > 0) && (
            <div className="px-6 mt-4">
              <UploadProgress
                progress={uploadProgress}
                status={uploadStatus || 'Preparing upload…'}
              />
            </div>
          )} */}

          {/* STEPPER */}
          {contentType != 'season' &&
            <div className="border-b border-gray-700 px-6 py-2 h-[10vh] flex flex-row items-center justify-center">

              <ol className="items-center w-full space-y-4 sm:flex sm:space-x-2 sm:space-y-0 rtl:space-x-reverse justify-between">
                {contentSteps[contentType].map((s, index) => (

                  <li className="flex items-center  justify-center   rounded-xl text-fg-brand space-x-3 rtl:space-x-reverse w-full" key={index}>

                    {step == (index + 1) ?
                      <div className="flex items-center justify-center  bg-neutral-tertiary rounded-full   shrink-0 ">

                        <RoundLoader className='text-blue-500 w-5 h-5' />

                      </div>
                      :
                      step > index + 1 ?
                        <span className="flex items-center justify-center w-10 h-10 text-green-700 rounded-full lg:h-12 lg:w-12 shrink-0">
                          <svg className="w-5 h-5 text-fg-brand" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" /></svg>
                        </span>
                        :
                        <span className="flex items-center justify-center   bg-neutral-tertiary rounded-full   shrink-0 ">
                          {s.icon}
                        </span>
                    }


                    <span>
                      <h3 className={`  leading-tight font-medium text-sm ${step == (index + 1) ? ' text-blue-600 font-bold' : step < (index + 1) ? '' : 'text-green-600 font-bold'}`}>{`Step ${index + 1}`}</h3>
                      <p className={`text-xs  `}>{`${s.title}`}</p>
                    </span>
                  </li>
                ))}

              </ol>

            </div>}

          <div className="p-4  ">
            {step === 1 && (

              <>

                <div
                  ref={gridScrollRef}
                  className="  grid grid-cols-1 md:grid-cols-2 gap-2  overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60vh]"
                >
                  {contentType == 'episode' ? <>
                    <div className='col-span-2 flex flex-row items-center justify-between w-full'>
                      <div className="w-5/12">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg  outline-none ring-0 
           focus:outline-none focus:ring-0 
           focus-visible:outline-none focus-visible:ring-0"
                          placeholder="Enter content title"
                          required
                        />
                      </div>
                      <div className="w-6/12 ">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Episode Number *
                        </label>

                        <input
                          type="number"
                          value={formData.episode_number}
                          onChange={(e) => handleChange('episode_number', Number(e.target.value))}
                          placeholder="Enter Ep number"
                          required
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none
               ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
               appearance-none [&::-webkit-outer-spin-button]:appearance-none 
               [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div></div></> :
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg  outline-none ring-0 
           focus:outline-none focus:ring-0 
           focus-visible:outline-none focus-visible:ring-0"
                        placeholder="Enter content title"
                        required
                      />
                    </div>}

                  <div className={` md:col-span-2 `}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg  outline-none ring-0 
           focus:outline-none focus:ring-0 
           focus-visible:outline-none focus-visible:ring-0"
                      placeholder="Enter content description"
                      required
                    />
                  </div>

                  {contentType == 'season' && <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Season Number *
                    </label>

                    <input
                      type="number"
                      value={formData.season_number}
                      onChange={(e) => handleChange('season_number', e.target.value)}
                      placeholder="Enter season number"
                      required
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg outline-none
               ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0
               appearance-none [&::-webkit-outer-spin-button]:appearance-none 
               [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>}
                  {contentType != 'season' && <>
                    <div className={`w-full grid ${contentType == 'movie' || contentType == 'series' ? 'grid-cols-4' : 'grid-cols-3'} col-span-2 gap-x-4`}>
                      {contentType != 'episode' && <MultiSelect
                        allGenre={allGenre}
                        formData={formData}
                        setFormData={setFormData}
                      />}
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
                              label="Attach Trailer To"
                              value={formData.parent}
                              onChange={(id) =>
                                setFormData((prev) => ({ ...prev, parent: id }))
                              }
                            />}
                        </>

                      }
                      {(contentType == 'series' || contentType == 'movie') &&
                        <MultiSelectCreator
                          allCreators={allcreators}
                          formData={formData}
                          setFormData={setFormData}
                        />}
                      <SingleSelect
                        label="Media Type"
                        options={MEDIA_TYPES}
                        value={String(formData.media_type)}
                        onChange={(id) =>
                          setFormData((prev) => ({
                            ...prev,
                            media_type: id as MediaType
                          }))
                        }
                      />
                      {contentType != 'episode' && <SingleSelect
                        label="Visibility Mode"
                        options={VISIBILITY_MODES}
                        value={String(formData.visibility_mode)}
                        onChange={(id) =>
                          setFormData((prev) => ({
                            ...prev,
                            visibility_mode: id as VisibilityMode
                          }))
                        }
                      />}
                    </div>

                   <div className='grid grid-cols-4 w-full col-span-2 gap-2'>
                     {formData.content_type != 'episode' && <div className="flex items-center  ">
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
                    </div>}
                    {formData.content_type != 'trailer' && formData.content_type != 'episode' &&
                      <div className="flex items-center ">
                        <input
                          type="checkbox"
                          id="is_demo_content"
                          checked={formData.is_demo_content}
                          onChange={(e) => handleChange('is_demo_content', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_demo_content" className="ml-2 text-sm text-gray-300">
                          Is Demo Content?
                        </label>
                      </div>}
                    {(formData.content_type == 'movie' || formData.content_type == 'series') && <div className="flex items-center ">
                      <input
                        type="checkbox"
                        id="is_educational"
                        checked={formData.is_educational}
                        onChange={(e) => handleChange('is_educational', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_educational" className="ml-2 text-sm text-gray-300">
                        Is Educational?
                      </label>
                    </div>}
                    {contentType != 'democontent' && formData.content_type != 'episode' && <div className="flex items-center ">
                      <input
                        type="checkbox"
                        id="is_ppv"
                        checked={formData.is_ppv}
                        onChange={(e) => {
                          handleChange('is_ppv', e.target.checked);
                          if (e.target.checked && gridScrollRef.current) {
                            setTimeout(() => {
                              const el = gridScrollRef.current;
                              el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
                            }, 100);
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_ppv" className="ml-2 text-sm text-gray-300">
                        Pay-Per-View
                      </label>
                    </div>}
                   </div>

                    {formData.is_ppv && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Price (£)
                        </label>
                        <input
                          type="number"
                          value={formData.price === 0 ? '' : String(formData.price)}
                          onChange={e => {
                            const val = e.target.value;
                            // Allow empty string for controlled input
                            if (val === '') {
                              handleChange('price', 0);
                            } else {
                              // Remove leading zeros
                              const clean = val.replace(/^0+(?!$)/, '');
                              handleChange('price', parseInt(clean) || 0);
                            }
                          }}
                          min="0"
                          step="1"
                          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg  outline-none ring-0 
                               focus:outline-none focus:ring-0 
                               focus-visible:outline-none focus-visible:ring-0"
                          placeholder="price in British Pounds"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Price in British Pounds
                        </p>
                      </div>
                    )}

                  </>

                  }
                </div>


                <div className='w-full flex flex-row items-end justify-end h-[10vh]'>
                  <button
                    onClick={async (e) => {
                      await handleSubmit(e);

                    }}
                    disabled={loading}
                    className="px-3 mt-4 w-auto py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50  "
                  >
                    Save & Next
                  </button>
                </div>
              </>

            )}
            {step === 2 && createdContent &&
              <>
                {contentType != 'episode' ?
                  <div className="flex flex-col w-full">

                    <div className='w-full space-y-2 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60vh]'>
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


                    </div>
                    <div className="flex justify-between my-6">
                      <button onClick={prevStep} className="px-4 py-2 bg-gray-600 rounded">
                        Back
                      </button>

                      <button
                        onClick={handleMetadataSubmit}
                        className="px-6 py-2 bg-blue-600 rounded"
                      >
                        Save & Next
                      </button>
                    </div>
                  </div> :

                  <div className="flex flex-col w-full">
                    <div className="space-y-2  w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60vh]">


                      <div className='hidden md:grid grid-cols-7 w-full gap-2 '>

                        <div className="col-span-5 space-y-3 ">
                          <label className="  text-sm font-medium text-gray-300">
                            Thumbnail Image
                          </label>

                          {/* Thumbnail Upload Area */}
                          <div className="max-h-[50vh] relative w-full aspect-[4/6] rounded-xl border-2 border-dashed border-gray-600 bg-neutral-950 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

                            {/* Preview Priority: banner > thumbnail > selected file */}
                            {createdContent.thumbnail_url ? (
                              <img
                                src={createdContent.thumbnail_url}
                                alt="Thumbnail Preview"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : bannerFile ? (
                              <img
                                src={URL.createObjectURL(bannerFile)}
                                alt="Thumbnail Preview"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : null}

                            {/* Overlay Content */}
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6 group-hover:bg-black/60 transition">
                              <svg
                                className="w-14 h-14 text-blue-400 mb-4"

                                viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
                                <title>file_upload_fill</title>
                                <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                  <g id="File" transform="translate(-384.000000, -144.000000)">
                                    <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
                                      <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                                      </path>
                                      <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

                                      </path>
                                    </g>
                                  </g>
                                </g>
                              </svg>

                              <p className="text-white font-semibold text-lg">
                                {createdContent.banner_url || bannerFile
                                  ? 'Change Thumbnail Image'
                                  : 'Click to Upload Thumbnail'}
                              </p>

                              <p className="text-xs text-gray-300 mt-1">
                                16:9 ratio · Recommended 1920×1080 · Hero Thumbnail
                              </p>
                            </div>

                            {/* Invisible File Input */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerUpload}

                              disabled={uploadingImage === 'banner'}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>

                          {/* Upload Button */}
                          {/* <button
                      onClick={() =>
                        handleImageUpload('episode-thumbnail') 
                      }
                      disabled={!bannerFile || uploadingImage === 'banner'}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {uploadingImage === 'banner' ? 'Uploading...' : 'Upload Banner'}
                    </button> */}
                        </div>

                      </div>


                    </div>
                    <div className="flex justify-between mt-6">
                      <button
                        onClick={prevStep}
                        className="px-4 py-2 bg-gray-600 text-white rounded"
                      >
                        Back
                      </button>
                      {
                        (contentType !== 'season') ?
                          <button

                            onClick={
                              async () => {
                                if (bannerFile) {
                                  console.log('object')
                                  let uploadImage = await handleImageUpload('episode-thumbnail')
                                  if (uploadImage.status == 400) {
                                    toast.error(uploadImage.message || "Failed to upload banner image");
                                    return;
                                  }

                                }


                                nextStep()
                              }

                            }
                            className="px-6 py-2 bg-blue-600 text-white rounded"
                          >
                            Save & Next
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
                }
              </>}

            {/* -------------------- STEP 2 -------------------- */}
            {step === 3 && createdContent &&
              <>{contentType != 'episode' ? <>  <div className="flex flex-col w-full">
                <div className="space-y-2  w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60vh]">


                  <div className='hidden md:grid grid-cols-7 w-full gap-2 '>

                    <div className="space-y-3 col-span-2">
                      <label className=" font-medium text-gray-300 text-sm md:mt-0 mt-4">Poster Image</label>

                      {/* Banner / Poster Upload Area */}
                      <div className="relative w-full max-h-[50vh] aspect-[2/7] rounded-xl border-2 border-dashed border-gray-600 bg-neutral-950 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

                        {/* Preview */}
                        {createdContent.poster_url ? (
                          <img
                            src={createdContent.poster_url}
                            alt="Poster Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : posterFile ? (
                          <img
                            src={URL.createObjectURL(posterFile)}
                            alt="Poster Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : null}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-4 opacity-100 group-hover:bg-black/60 transition">
                          <svg
                            className="w-14 h-14 text-blue-400 mb-4"

                            viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
                            <title>file_upload_fill</title>
                            <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                              <g id="File" transform="translate(-384.000000, -144.000000)">
                                <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
                                  <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                                  </path>
                                  <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

                                  </path>
                                </g>
                              </g>
                            </g>
                          </svg>

                          <p className="text-white font-medium">
                            {createdContent.poster_url || posterFile
                              ? 'Change Poster Image'
                              : 'Click to Upload Poster'}
                          </p>

                          <p className="text-xs text-gray-300 mt-1">
                            2:3 ratio · Recommended 1000×1500
                          </p>
                        </div>

                        {/* Invisible file input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Upload Button */}
                      {/* <button
                        onClick={() =>
                          handleImageUpload(
                            contentType === 'episode' ? 'episode-thumbnail' : 'poster'
                          )
                        }
                        disabled={!posterFile || uploadingImage === 'poster'}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {uploadingImage === 'poster' ? 'Uploading...' : 'Upload Poster'}
                      </button> */}
                    </div>


                    {/* Banner */}
                    <div className="col-span-5 space-y-3 ">
                      <label className="  text-sm font-medium text-gray-300">
                        Banner Image
                      </label>

                      {/* Banner Upload Area */}
                      <div className="max-h-[50vh] relative w-full aspect-[4/6] rounded-xl border-2 border-dashed border-gray-600 bg-neutral-950 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

                        {/* Preview Priority: banner > thumbnail > selected file */}
                        {createdContent.banner_url ? (
                          <img
                            src={createdContent.banner_url}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : createdContent.thumbnail_url ? (
                          <img
                            src={createdContent.thumbnail_url}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : bannerFile ? (
                          <img
                            src={URL.createObjectURL(bannerFile)}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : null}

                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6 group-hover:bg-black/60 transition">
                          <svg
                            className="w-14 h-14 text-blue-400 mb-4"

                            viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
                            <title>file_upload_fill</title>
                            <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                              <g id="File" transform="translate(-384.000000, -144.000000)">
                                <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
                                  <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                                  </path>
                                  <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

                                  </path>
                                </g>
                              </g>
                            </g>
                          </svg>

                          <p className="text-white font-semibold text-lg">
                            {createdContent.banner_url || bannerFile
                              ? 'Change Banner Image'
                              : 'Click to Upload Banner'}
                          </p>

                          <p className="text-xs text-gray-300 mt-1">
                            16:9 ratio · Recommended 1920×1080 · Hero banner
                          </p>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}

                          disabled={uploadingImage === 'banner'}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Upload Button */}
                      {/* <button
                      onClick={() =>
                        handleImageUpload(
                          contentType === 'episode' ? 'episode-thumbnail' : 'banner'
                        )
                      }
                      disabled={!bannerFile || uploadingImage === 'banner'}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {uploadingImage === 'banner' ? 'Uploading...' : 'Uplssoad Banner'}
                    </button> */}
                    </div>

                  </div>
                  <div className=' w-full md:hidden flex flex-col items-start '>
                    <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-lg w-fit mb-4">
                      <button
                        onClick={() => setImagesModeForMobile("poster")}
                        className={`px-4 py-2 rounded-lg ${imagesModeForMobile === "poster"
                            ? "bg-orange-600 text-white"
                            : "bg-gray-700 text-gray-300"
                          }`}
                      >
                        Poster
                      </button>

                      <button
                        onClick={() => setImagesModeForMobile("banner")}
                        className={`px-4 py-2 rounded-lg ${imagesModeForMobile === "banner"
                            ? "bg-orange-600 text-white"
                            : "bg-gray-700 text-gray-300"
                          }`}
                      >
                        Banner
                      </button>
                    </div>
                    {contentType != "episode" && imagesModeForMobile == "poster" &&
                      <div className="space-y-1 w-full">
                        <label className=" font-medium text-gray-300 text-lg ">Poster Image</label>

                        {/* Banner / Poster Upload Area */}
                        <div className="relative w-full max-h-[80vh] aspect-[2/7] rounded-xl border-2 border-dashed border-gray-600 bg-neutral-950 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

                          {/* Preview */}
                          {createdContent.poster_url ? (
                            <img
                              src={createdContent.poster_url}
                              alt="Poster Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : posterFile ? (
                            <img
                              src={URL.createObjectURL(posterFile)}
                              alt="Poster Preview"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : null}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-4 opacity-100 group-hover:bg-black/60 transition">
                            <svg
                              className="w-14 h-14 text-blue-400 mb-4"

                              viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
                              <title>file_upload_fill</title>
                              <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g id="File" transform="translate(-384.000000, -144.000000)">
                                  <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
                                    <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                                    </path>
                                    <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

                                    </path>
                                  </g>
                                </g>
                              </g>
                            </svg>

                            <p className="text-white font-medium">
                              {createdContent.poster_url || posterFile
                                ? 'Change Poster Image'
                                : 'Click to Upload Poster'}
                            </p>

                            <p className="text-xs text-gray-300 mt-1">
                              2:3 ratio · Recommended 1000×1500
                            </p>
                          </div>

                          {/* Invisible file input */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePosterUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* Upload Button */}
                        <button
                          onClick={() =>
                            handleImageUpload(
                              contentType === 'episode' ? 'episode-thumbnail' : 'poster'
                            )
                          }
                          disabled={!posterFile || uploadingImage === 'poster'}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {uploadingImage === 'poster' ? 'Uploading...' : 'Upload Poster'}
                        </button>
                      </div>
                    }

                    {/* Banner */}
                    {imagesModeForMobile == "banner" && <div className="w-full space-y-1 ">
                      <label className="  text-lg font-medium text-gray-300">
                        Banner Image
                      </label>

                      {/* Banner Upload Area */}
                      <div className="max-h-[30vh] md:max-h-[45vh] relative w-full aspect-[4/6] rounded-xl border-2 border-dashed border-gray-600 bg-neutral-950 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

                        {/* Preview Priority: banner > thumbnail > selected file */}
                        {createdContent.banner_url ? (
                          <img
                            src={createdContent.banner_url}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : createdContent.thumbnail_url ? (
                          <img
                            src={createdContent.thumbnail_url}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : bannerFile ? (
                          <img
                            src={URL.createObjectURL(bannerFile)}
                            alt="Banner Preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : null}

                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-6 group-hover:bg-black/60 transition">
                          <svg
                            className="w-14 h-14 text-blue-400 mb-4"

                            viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
                            <title>file_upload_fill</title>
                            <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                              <g id="File" transform="translate(-384.000000, -144.000000)">
                                <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
                                  <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                                  </path>
                                  <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

                                  </path>
                                </g>
                              </g>
                            </g>
                          </svg>

                          <p className="text-white font-semibold text-lg">
                            {createdContent.banner_url || bannerFile
                              ? 'Change Banner Image'
                              : 'Click to Upload Banner'}
                          </p>

                          <p className="text-xs text-gray-300 mt-1">
                            16:9 ratio · Recommended 1920×1080 · Hero banner
                          </p>
                        </div>

                        {/* Invisible File Input */}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerUpload}

                          disabled={uploadingImage === 'banner'}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>

                      {/* Upload Button */}
                      <button
                        onClick={() =>
                          handleImageUpload(
                            contentType === 'episode' ? 'episode-thumbnail' : 'banner'
                          )
                        }
                        disabled={!bannerFile || uploadingImage === 'banner'}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {uploadingImage === 'banner' ? 'Uploading...' : 'Upload Banner'}
                      </button>
                    </div>}

                  </div>

                </div>
                <div className="flex justify-between mt-6">
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                  >
                    Back
                  </button>
                  {
                    (contentType !== 'season') ?
                      <button
                        onClick={
                          async () => {
                            if (bannerFile) {
                              console.log('object')
                              let uploadImage = await handleImageUpload('banner')
                              if (uploadImage.status == 400) {
                                toast.error(uploadImage.message || "Failed to upload banner image");
                                return;
                              }

                            }
                            if (posterFile) {
                              console.log('object')
                              let uploadImage = await handleImageUpload('poster')
                              if (uploadImage.status == 400) {
                                toast.error(uploadImage.message || "Failed to upload banner image");

                                return;

                              }

                            }
                            if (contentType == 'series') {
                              onClose()
                            }
                            else {
                              nextStep()
                            }
                          }

                        }
                        className="px-6 py-2 bg-blue-600 text-white rounded"
                      >
                        Save & Next
                      </button> :
                      <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded"
                      >
                        Finish
                      </button>
                  }

                </div>
              </div></> :
                <div className="flex flex-col w-full">
                  <div className="space-y-2  w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60]">


                    {videoFetchLoading ? (
                      <SkeletonLoader className="w-full h-[40vh] bg-gray-700 rounded-xl" />
                    ) : (
                      <>
                        {/* Status Heading */}
                        <h3 className="text-xl text-white font-semibold">
                          {content?.ingest_status === 'processing'
                            ? 'Content is uploading to cloud (this may take a while)'
                            : 'Upload Episode File'}
                        </h3>

                        {/* Media Upload Area */}
                        <div className="relative max-h-[30vh] md:max-h-[45vh] w-full aspect-video rounded-xl border-2 border-dashed border-gray-600 bg-neutral-900 hover:border-blue-500 transition cursor-pointer overflow-hidden group">


                          {!videoFetchLoading && videoUrl && isEditing ? (
                            <div className="absolute inset-0">
                              <HlsVideoPlayer src={videoUrl} />
                            </div>
                          ) : uploadFile ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60">
                              <svg
                                className="w-12 h-12 text-orange-400 mb-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5 5 5M12 5v14"
                                />
                              </svg>

                              <p className="text-white font-medium">
                                {uploadFile.name}
                              </p>
                              <p className="text-xs text-gray-300 mt-1">
                                {formatFileSize(uploadFile.size)}
                              </p>
                            </div>
                          ) : driveSelectedFile ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60">
                              <svg
                                className="w-12 h-12 text-orange-400 mb-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5 5 5M12 5v14"
                                />
                              </svg>

                              <p className="text-white font-medium break-all">
                                {driveSelectedFile.name}
                              </p>
                              <p className="text-xs text-gray-300 mt-1">
                                {typeof driveSelectedFile.sizeBytes === 'number'
                                  ? formatFileSize(driveSelectedFile.sizeBytes)
                                  : 'Size unavailable'}
                              </p>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60 group-hover:bg-black/60 transition">
                              <svg
                                className="w-14 h-14 text-blue-400 mb-4"

                                viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
                                <title>file_upload_fill</title>
                                <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                  <g id="File" transform="translate(-384.000000, -144.000000)">
                                    <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
                                      <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                                      </path>
                                      <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

                                      </path>
                                    </g>
                                  </g>
                                </g>
                              </svg>

                              <p className="text-white font-semibold text-lg">
                                Click to Upload Video for {content?.content_type || createdContent.content_type}
                              </p>
                              <p className="text-xs text-gray-300 mt-1">
                                MP4, MOV, MKV, MP3 · Large files supported
                              </p>
                            </div>
                          )}

                          {/* Invisible Input */}
                          <input
                            type="file"
                            accept="video/*,audio/*"
                            onChange={(e) => {
                              setUploadFile(e.target.files?.[0] || null);
                              setDriveSelectedFile(null);
                            }}
                            disabled={uploading || content?.ingest_status === 'processing'}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* Large File Warning */}
                        {uploadFile && uploadFile.size >= 1024 * 1024 * 1024 && (
                          <p className="text-xs text-amber-500">
                            Large file detected. Upload may take time
                          </p>
                        )}

                        {/* Actions */}

                      </>
                    )}
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={prevStep}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                    >
                      Back
                    </button>

                    <button
                      onClick={handleFileUpload}
                      disabled={(!uploadFile && !driveSelectedFile) || uploading || content?.ingest_status === 'processing'}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {uploading || content?.ingest_status === 'processing' ? (
                        <>
                          <RoundLoader />
                          <span>
                            {content?.ingest_status === 'processing'
                              ? 'Initializing Content'
                              : 'Uploading'}
                          </span>
                        </>
                      ) : (
                        'Initialize Content'
                      )}
                    </button>
                  </div>
                </div>

              }  </>
            }


            {step === 4 && createdContent && contentType !== 'series' && contentType !== 'season' && (
              <>
                <div className="flex flex-col w-full">
                  <div className="space-y-2  w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60vh]">

                    {contentType === "trailer" && (
                      <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-lg w-fit">
                        <button
                          onClick={() => setTrailerMode("upload")}
                          className={`px-4 py-2 rounded-lg ${trailerMode === "upload"
                              ? "bg-orange-600 text-white"
                              : "bg-gray-700 text-gray-300"
                            }`}
                        >
                          Upload File
                        </button>

                        <button
                          onClick={() => setTrailerMode("url")}
                          className={`px-4 py-2 rounded-lg ${trailerMode === "url"
                              ? "bg-orange-600 text-white"
                              : "bg-gray-700 text-gray-300"
                            }`}
                        >
                          Use Video URL
                        </button>
                      </div>
                    )}
                    {contentType === "trailer" && trailerMode === "url" ? (
                      <div className="space-y-3">
                        <label className="text-white text-sm">Trailer Video URL</label>
                        <input
                          type="url"
                          placeholder="https://example.com/trailer.mp4"
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          className="w-full p-3 rounded-lg bg-neutral-900 text-white border border-gray-700"
                        />
                        <div className="flex justify-between mt-6">
                          <button
                            onClick={() => {
                              prevStep()
                              setVideoUrlInput("")
                              setTrailerMode("upload")
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                          >
                            Back
                          </button>

                          <button
                            onClick={() => { toast.info('Backend Work for this section is undergoing. Wait for that to complete') }}

                            // onClick={handleFileUpload}
                            disabled={!videoUrlInput || !videoUrlInput.includes("https://") || videoUrlInput.length < 8}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                          >
                            {uploading || content?.ingest_status === 'processing' ? (
                              <>
                                <RoundLoader />
                                <span>
                                  {content?.ingest_status === 'processing'
                                    ? 'Initializing Content'
                                    : 'Uploading'}
                                </span>
                              </>
                            ) : (
                              'Initialize Content'
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>{videoFetchLoading ? (
                        <SkeletonLoader className="w-full h-[40vh] bg-gray-700 rounded-xl" />
                      ) : (
                        <>
                          {/* Status Heading */}
                          <h3 className="text-xl text-white font-semibold">
                            {content?.ingest_status === 'processing'
                              ? 'Content is uploading to cloud (this may take a while)'
                              : 'Upload Media File'}
                          </h3>

                          {/* Media Upload Area */}
                          <div className="relative max-h-[20vh] md:max-h-[45vh] w-full aspect-video rounded-xl border-2 border-dashed border-gray-600 bg-neutral-900 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

                            {/* Video Preview */}
                            {!videoFetchLoading && videoUrl && isEditing ? (
                              <div className="absolute inset-0">
                                <HlsVideoPlayer src={videoUrl} />
                              </div>
                            ) : uploadFile ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60">
                                <svg
                                  className="w-12 h-12 text-orange-400 mb-3"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5 5 5M12 5v14"
                                  />
                                </svg>

                                <p className="text-white font-medium">
                                  {uploadFile.name}
                                </p>
                                <p className="text-xs text-gray-300 mt-1">
                                  {formatFileSize(uploadFile.size)}
                                </p>
                              </div>
                            ) : driveSelectedFile ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60">
                                <svg
                                  className="w-12 h-12 text-orange-400 mb-3"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M7 10l5-5 5 5M12 5v14"
                                  />
                                </svg>

                                <p className="text-white font-medium break-all">
                                  {driveSelectedFile.name}
                                </p>
                                <p className="text-xs text-gray-300 mt-1">
                                  {typeof driveSelectedFile.sizeBytes === 'number'
                                    ? formatFileSize(driveSelectedFile.sizeBytes)
                                    : 'Size unavailable'}
                                </p>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/60 group-hover:bg-black/60 transition">
                                <svg
                                  className="w-14 h-14 text-blue-400 mb-4"

                                  viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"  >
                                  <title>file_upload_fill</title>
                                  <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="File" transform="translate(-384.000000, -144.000000)">
                                      <g id="file_upload_fill" transform="translate(384.000000, 144.000000)">
                                        <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero">

                                        </path>
                                        <path d="M12,2 L12,8.5 C12,9.27969882 12.5949121,9.920449 13.3555442,9.99313345 L13.5,10 L20,10 L20,20 C20,21.0543909 19.18415,21.9181678 18.1492661,21.9945144 L18,22 L6,22 C4.94563773,22 4.08183483,21.18415 4.00548573,20.1492661 L4,20 L4,4 C4,2.94563773 4.81587733,2.08183483 5.85073759,2.00548573 L6,2 L12,2 Z M11.2929,11.1729 L9.17157,13.2942 C8.78105,13.6847 8.78105,14.3179 9.17157,14.7084 C9.5621,15.099 10.1953,15.099 10.5858,14.7084 L11,14.2942 L11,17 C11,17.5523 11.4477,18 12,18 C12.5523,18 13,17.5523 13,17 L13,14.2942 L13.4142,14.7084 C13.8047,15.099 14.4379,15.099 14.8284,14.7084 C15.219,14.3179 15.219,13.6847 14.8284,13.2942 L12.7071,11.1729 C12.3166,10.7824 11.6834,10.7824 11.2929,11.1729 Z M14,2.04336 C14.3222,2.11158 14.624049,2.25868408 14.8774606,2.47305359 L15,2.58579 L19.4142,7 C19.6506857,7.23646857 19.8218571,7.52605551 19.9160012,7.8407123 L19.9566,8 L14,8 L14,2.04336 Z" id="形状" fill="#09244B">

                                        </path>
                                      </g>
                                    </g>
                                  </g>
                                </svg>

                                <p className="text-white font-semibold text-lg">
                                  Click to Upload Video for {content?.content_type || createdContent.content_type}
                                </p>
                                <p className="text-xs text-gray-300 mt-1">
                                  MP4, MOV, MKV, MP3 · Large files supported
                                </p>
                              </div>
                            )}

                            {/* Invisible Input */}
                            <input
                              type="file"
                              accept="video/*,audio/*"
                              onChange={(e) => {
                                setUploadFile(e.target.files?.[0] || null);
                                setDriveSelectedFile(null);
                              }}
                              disabled={uploading || content?.ingest_status === 'processing'}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>

                          {/* Large File Warning */}
                          {uploadFile && uploadFile.size >= 1024 * 1024 * 1024 && (
                            <p className="text-xs text-amber-500">
                              Large file detected. Upload may take time — keep this tab open.
                            </p>
                          )}

                          {/* Actions */}

                        </>
                      )}</>
                    )}
                  </div>
                  <div className="flex justify-between mt-6">
                    <div className='flex flex-row items-center'>
                      <button
                        onClick={prevStep}
                        className="mr-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
                      >
                        Back
                      </button>
                      <GoogleDriveButton
                        allowMultiple={false}
                        mimeTypes={['video/mp4', 'video/*']}
                        onFilePicked={(files) => {
                          const picked = files?.[0] ?? null;
                          setDriveSelectedFile(picked);
                          if (picked) {
                            console.log('Picked from Drive:', picked);
                            // Keep local file upload flow unchanged; this only updates preview text.
                            setUploadFile(null);
                          }
                        }}
                      >
                        Upload Video from Google Drive
                      </GoogleDriveButton> </div>
                    <button
                      onClick={handleFileUpload}
                      disabled={(!uploadFile && !driveSelectedFile) || uploading || content?.ingest_status === 'processing'}

                      className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {uploading || content?.ingest_status === 'processing' ? (
                        <>
                          <RoundLoader />
                          <span>
                            {content?.ingest_status === 'processing'
                              ? 'Initializing Content'
                              : 'Uploading'}
                          </span>
                        </>
                      ) : (
                        'Initialize Content'
                      )}
                    </button>
                  </div>
                </div></>
            )}

          </div>
        </div>
      </div>
    </>
  );
}






