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
import SingleSelect from '@/components/SingleSelect';
import SearchableSingleSelect from '@/components/SearchableSingleSelect';


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
const normalSteps = [
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
    title: "Upload Trailer",
    icon: (
      <svg
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M5 4v16l14-8z"
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
];

let abnormalSteps = [
  {
  title:'Create Content'
},
{
  title:'Add Metadata'
},
{
  title:'Upload Image'
}, 
]
export const MEDIA_TYPES: Array<{ id: MediaType; name: string }> = [
  { id: 'flat', name: 'Standard Video (2D)' },

  { id: 'vr_360_mono', name: '360° VR Video (Single View)' },
  { id: 'vr_360_sbs', name: '360° VR Video (3D – Side by Side)' },
  { id: 'vr_360_tb', name: '360° VR Video (3D – Top & Bottom)' },

  { id: 'vr_180_mono', name: '180° VR Video (Single View)' },
  { id: 'vr_180_sbs', name: '180° VR Video (3D – Side by Side)' },
  { id: 'vr_180_tb', name: '180° VR Video (3D – Top & Bottom)' },
];


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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdContent, setCreatedContent] = useState<Content | null>(content || null);

  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [trailerUploadFile, setTrailerUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [uploadSubtitleFile, setUploadSubtitleFile] = useState<File | null>(null) 
  const [progress, setProgress] = useState<number>(0)
  const [subtitles, setSubtitles] = useState<any>(null);
  const [subtitlesLoading, setSubtitlesLoading] = useState<boolean>(false);
  const [trailerMode, setTrailerMode] = useState<"upload" | "url">("upload");
  const [imagesModeForMobile, setImagesModeForMobile] = useState<"poster" | "banner">("poster");
const [videoUrlInput, setVideoUrlInput] = useState("");
const [isTrailerContentData,setIsTrailerContentData] = React.useState<Content | null>(null)
const [trailerContentDataFetching,setTrailerContentDataFetching] = React.useState<boolean>(false)
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
 const [trailerMediaType,setTraileMediaType] = React.useState<MediaType>('flat')
 

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
      toast.error('Title is required');
      return;
    }

    if (!formData.description.trim()) {
       toast.error('Description is required');
      return;
    }

    if (formData.is_ppv && (!formData.price_cents || formData.price_cents <= 0)) {
       toast.error('Price is required for PPV content');
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
       toast.error(apiError.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload() {
    if (!uploadFile || !createdContent) {
       toast.error('Please select a file to upload');
      return;
    }

    const validation = validateFile(uploadFile, { 
      allowedTypes: ['video/*', 'audio/*'],
    });

    if (!validation.valid) {
       toast.error(validation.error || 'Invalid file');
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
       toast.error(apiError.message || 'Upload failed');
    } finally {
      setUploading(false);
      setLoading(false)

    }
  }
async function handleTrailerUpload() {
    if (!trailerUploadFile ) {
       toast.error('Please select a file to upload');
      return;
    }

    const validation = validateFile(trailerUploadFile, { 
      allowedTypes: ['video/*', 'audio/*'],
    });

    if (!validation.valid) {
       toast.error(validation.error || 'Invalid file');
      return;
    }
    try {
      setLoading(true)
      setUploading(true);
      setError(null);
      setUploadStatus('Initializing upload...');

      const uploadInit = await initUpload(isTrailerContentData.id, trailerUploadFile.name);

      const result = await uploadWithCallback(uploadInit, trailerUploadFile, {
        onProgress: (progress) => {
          setUploadProgress(progress.percentage);
          setUploadStatus(`Uploading: ${progress.percentage}% (${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)})`);
        },
      });

      setUploadStatus('Upload complete! Processing callback...');
      
      
      toast.info("Your Video Content upload wait for the processing to comlete then proceed to publish");

      setSuccess('File uploaded successfully! Waiting for transcoding to start...');
      setUploadStatus('Upload complete - Asset created. Transcoding will begin shortly.');
      setUploadProgress(100);
      setUploading(false);
      setLoading(false)
      setTrailerUploadFile(null)
      setIsTrailerContentData(null)

nextStep()
    } catch (err) {
      const apiError = err as ApiError;
       toast.error(apiError.message || 'Upload failed');
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
console.log("file",file)
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
       toast.error(apiError.message || 'Failed to publish content');
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
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [trailerFetchLoading, setTrailerFetchLoading] = useState<boolean>(true)
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
console.log(file,"file")
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


useEffect(()=>{
async function fetchVideo() {
      try {
        setTrailerFetchLoading(true)

        const token = Cookies.get("access_token");

        const res = await fetch(
          `${API_BASE}api/v1/content/content/${isTrailerContentData?.id}/stream/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch video");
        const data = await res.json();
        setTrailerUrl(data.playback_url);
        setTrailerFetchLoading(false)
      } catch (e) {
        setTrailerFetchLoading(false)
      } finally {
        setTrailerFetchLoading(false)
      }
    }
  if(step == 4 && isTrailerContentData?.ingest_status!='failed' && contentType !== 'series' && contentType !== 'trailer' && contentType !== 'season'){
 fetchVideo()

  }
},[step])
  return (
    <>

      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 py-2 sm:p-2 md:p-8">
        {loading && !uploading && <FullScreenLoader />}
        <div className="bg-neutral-900 sm:rounded-lg max-w-4xl w-full h-[100vh]  md:max-h-[95vh]">

          <div className="md:mt-0 mt-8 flex items-center justify-between p-6 border-b border-gray-700">
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
            {/* <div className="flex items-center justify-between">
              {<>{contentType == 'series' || contentType == 'season' ?
                <>{[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    // onClick={() => { setStep(num) }}
                    className={`flex-1 h-2 mx-1 rounded-full ${step >= num ? "bg-blue-500" : "bg-gray-600"
                      }`}
                  ></div>
                ))}</> :
                <>{[1, 2, 3, 4,5].map((num) => (
                  <div
                    key={num}
                    // onClick={() => { setStep(num) }}
                    className={`flex-1 h-2 mx-1 rounded-full ${step >= num ? "bg-blue-500" : "bg-gray-600"
                      }`}
                  ></div>
                ))}</>}
              </>}
            </div> */}
<ol className="items-center w-full space-y-4 sm:flex sm:space-x-2 sm:space-y-0 rtl:space-x-reverse justify-between">
   <>{contentType == 'series' || contentType == 'season' ?<>{
    abnormalSteps.map((s,i)=>(
      <li className="flex items-center text-fg-brand space-x-1 rtl:space-x-reverse ">
        <span className="flex items-center justify-center   bg-brand-softer rounded-full lg:h-12 lg:w-12 shrink-0">
            <svg className="w-5 h-5 text-fg-brand" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/></svg>
        </span>
        <span>
            <h3 className="font-medium leading-tight">{`Step ${i+1 }`}</h3>
            <p className="text-sm">{`${s.title}`}</p>
        </span>
    </li>
  ))
   } </>:
   <>
   {
    normalSteps.map((s,i)=>(
  
       <li className="flex items-center text-fg-brand space-x-3 rtl:space-x-reverse w-full" key={i}>
         
        {step == (i+1)?
        <div className="flex items-center justify-center  bg-neutral-tertiary rounded-full   shrink-0 ">

         <RoundLoader className='text-blue-500 w-5 h-5'/>

        </div>
         :
         step>i+1?
         <span className="flex items-center justify-center w-10 h-10 text-green-700 rounded-full lg:h-12 lg:w-12 shrink-0">
            <svg className="w-5 h-5 text-fg-brand" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/></svg>
        </span>
         :
          <span className="flex items-center justify-center   bg-neutral-tertiary rounded-full   shrink-0 ">
            {s.icon}
        </span>
        }
        
      
        <span>
            <h3 className={`  leading-tight font-medium text-sm ${step == (i+1) ? ' text-blue-600 font-bold':step < (i+1)?'':'text-green-600 font-bold'}`}>{`Step ${i+1 }`}</h3>
            <p className={`text-xs  `}>{`${s.title}`}</p>
        </span>
    </li>
  
    ))
   } </>
}
</> 
    
</ol>
            {/* <p className="text-center text-gray-300 text-sm mt-2">
              {step === 1 && "Step 1: Create Content"}
              {step === 2 && "Step 2: Content Metadata"}
              {step === 3 && "Step 3: Upload Images"} 
              {step === 4 && "Step 4: Upload Trailer (If Any)"}
              {step === 5 && "Step 5: Upload Media File"}
            </p> */}
          </div>

          <div className="p-6  ">
            {step === 1 && (

              <>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2  overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[55vh]">
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
                            label="Attach Trailer To"
                            value={formData.parent}
                            onChange={(id) =>
                              setFormData((prev) => ({ ...prev, parent: id }))
                            }
                          />}
                      </>

                    }
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
 {formData.content_type!='trailer' &&
                     <div className="flex items-center">
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
                    {contentType!='democontent' && <div className="flex items-center">
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
                    </div>}

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
                   
                    </>

                  }
                </div>


                <button
                  onClick={async (e) => {
                    await handleSubmit(e);

                  }}
                  className="mb-2 mt-4 w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save & Next
                </button></>

            )}
            {step === 2 && createdContent && (
              <div className="flex flex-col w-full">

            <div className='w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60]'>
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
              </div>
            )}

            {/* -------------------- STEP 2 -------------------- */}
            {step === 3 && createdContent && (
            <div className="flex flex-col w-full">
              <div className="space-y-2  w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60]">
                <h3 className="text-xl text-white font-semibold">
                  Upload Images 
                </h3>
<p className="  text-neutral-400 text-sm leading-relaxed"> 
  • Banner: Landscape orientation (recommended 16:9). <br />
  • Poster: Portrait orientation (recommended 2:3).
</p>
                {/* Poster */}
                <div className='hidden md:grid grid-cols-7 w-full gap-2 '>
                  {contentType != "episode" &&
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
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4 opacity-100 group-hover:bg-black/60 transition">
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
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6 group-hover:bg-black/60 transition">
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
                  </div>

                </div>
<div className=' w-full md:hidden flex flex-col items-start '>
  <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-lg w-fit mb-4">
    <button
      onClick={() => setImagesModeForMobile("poster")}
      className={`px-4 py-2 rounded-lg ${
        imagesModeForMobile === "poster"
          ? "bg-orange-600 text-white"
          : "bg-gray-700 text-gray-300"
      }`}
    >
      Poster
    </button>

    <button
      onClick={() => setImagesModeForMobile("banner")}
      className={`px-4 py-2 rounded-lg ${
        imagesModeForMobile === "banner"
          ? "bg-orange-600 text-white"
          : "bg-gray-700 text-gray-300"
      }`}
    >
      Banner
    </button>
  </div>
                  {contentType != "episode" && imagesModeForMobile =="poster" && 
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
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4 opacity-100 group-hover:bg-black/60 transition">
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
                  { imagesModeForMobile =="banner" && <div className="w-full space-y-1 ">
                    <label className="  text-lg font-medium text-gray-300">
                      Banner Image
                    </label>

                    {/* Banner Upload Area */}
                    <div className="max-h-[30vh] relative w-full aspect-[4/6] rounded-xl border-2 border-dashed border-gray-600 bg-neutral-950 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

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
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6 group-hover:bg-black/60 transition">
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
                    (contentType !== 'series' && contentType !== 'season') ?
                      <button
                        onClick={nextStep}
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
            )}
 {step === 4 && createdContent && contentType !== 'series' && contentType !== 'trailer' && contentType !== 'season' && (
          <>  
            <div className="flex flex-col w-full">
              <div className="space-y-2  w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60] min-h-[40vh]"> 
              
            {isTrailerContentData?
             <div className="flex flex-col items-start w-full   rounded-lg w-fit">
                <label className="block text-sm font-medium text-gray-300 mb-2">
        Trailer Upload Mode
      </label>
   <div className='flex items-center  '>
     <button
      onClick={() => setTrailerMode("upload")}
      className={`  px-4 py-2 rounded-lg ${
        trailerMode === "upload"
          ? "bg-orange-600 text-white"
          : "bg-gray-700 text-gray-300"
      }`}
    >
      Upload Trailer File
    </button>

    <button
      onClick={() => setTrailerMode("url")}
      className={`ml-2 px-4 py-2 rounded-lg ${
        trailerMode === "url"
          ? "bg-orange-600 text-white"
          : "bg-gray-700 text-gray-300"
      }`}
    >
      Use Trailer URL
    </button>
   </div>
  </div> :
   <SingleSelect
                          label="Trailer Media Type"
                          options={MEDIA_TYPES}
                          value={String(trailerMediaType)}
                       onChange={(id) =>

                        setTraileMediaType(id as MediaType)
  
}
                        />}
               {!isTrailerContentData && <div className="flex justify-between mt-6">
                      <button
                        onClick={prevStep}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                      >
                        Back
                      </button>
                       <div className='flex flex-row items-center justify-end'>
                        <button

                        onClick={nextStep}
 className="px-4 py-2 bg-gray-600 text-white rounded-lg mr-1"
                      >
                        Skip Trailer for now
                      </button>
 
                      
                      <button
                        onClick={async()=>{
 if(createdContent.trailer_id){
  const created = await updateContent(createdContent.trailer_id,{...formData,content_type:'trailer',media_type:trailerMediaType     });
       if(created.id){
         toast.success(`Your Trailer's Video Media type is succesfully created. proceed with the process of uploading trailer`)
        setIsTrailerContentData(created)
       }
       else{
                 toast.error(`Something Went Wrong`)

       }
 }
 else{
  const created = await createContent({...formData,parent:createdContent.id || content?.id,content_type:'trailer'   });
       if(created.id){
         toast.success(`Your Trailer's Video Media type is succesfully updated. proceed with the process of uploading trailer`)
        setIsTrailerContentData(created)
       }
       else{
                 toast.error(`Something Went Wrong`)

       }
 }
        // nextStep();

                        }}
                        disabled={trailerContentDataFetching}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                      >
                        {trailerContentDataFetching ? (
                          <>
                            <RoundLoader />
                            <span>
                              {'Wait a moment..'}
                            </span>
                          </>
                        ) : (
                          'Save & Next'
                        )}
                      </button>
                      </div>
                    </div>}
 
{isTrailerContentData && <>{ trailerMode === "url" ? (
  <div className="space-y-3">
    <label className="text-white text-sm">Trailer Video URL</label>
    <input
      type="url"
      placeholder="https://example.com/trailer.mp4"
      value={videoUrlInput}
      onChange={(e) => setVideoUrlInput(e.target.value)}
      className="w-full p-3 rounded-lg bg-neutral-900 text-white border border-gray-700"
    />
    
  </div>
) : (
                <>{trailerFetchLoading ? (
                  <SkeletonLoader className="w-full h-[40vh] bg-gray-700 rounded-xl" />
                ) : (
                  <>
                    {/* Status Heading */}
                    <h3 className="text-xl text-white font-semibold">
                      {isTrailerContentData?.ingest_status === 'processing'
                        ? 'Trailer is uploading to cloud (this may take a while)'
                        : 'Upload Trailer File'}
                    </h3>

                    {/* Media Upload Area */}
                    <div className="relative max-h-[30vh] w-full aspect-video rounded-xl border-2 border-dashed border-gray-600 bg-neutral-900 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

                      {/* Video Preview */}
                      {!trailerFetchLoading && trailerUrl  ? (
                        <div className="absolute inset-0">
                          <HlsVideoPlayer src={trailerUrl} />
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
                            {trailerUploadFile?.name}
                          </p>
                          <p className="text-xs text-gray-300 mt-1">
                            {formatFileSize(trailerUploadFile?.size)}
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/40 group-hover:bg-black/60 transition">
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
                            Click to Upload Video file for Trailer
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
                        onChange={(e) => setTrailerUploadFile(e.target.files?.[0] || null)}
                        disabled={uploading || isTrailerContentData?.ingest_status === 'processing'}
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
                )}</>}
           </div>   
           {isTrailerContentData && <div className="flex justify-between mt-6">
                      <button
                        onClick={()=>{setIsTrailerContentData(null)}}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                      >
                        Back
                      </button>
                      <div className='flex flex-row items-center justify-end'>
                        <button

                        onClick={nextStep}
 className="px-4 py-2 bg-gray-600 text-white rounded-lg mr-1"
                      >
                        Skip Trailer for now
                      </button>
                      <button
                        onClick={handleTrailerUpload}
                        disabled={!trailerUploadFile || uploading || isTrailerContentData?.ingest_status === 'processing'}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                      >
                        {uploading || isTrailerContentData?.ingest_status === 'processing' ? (
                          <>
                            <RoundLoader />
                            <span>
                              {isTrailerContentData?.ingest_status === 'processing'
                                ? 'Initializing Content'
                                : 'Uploading'}
                            </span>
                          </>
                        ) : (
                          'Initialize Content'
                        )}
                      </button>
                      </div>
                    </div>}
           </div></>
            )}
             
            {step === 5 && createdContent && contentType !== 'series' && contentType !== 'season' && (
          <>  
            <div className="flex flex-col w-full">
              <div className="space-y-2  w-full space-y-6 overflow-y-auto minimal-scrollbar max-h-[55vh] md:max-h-[60]"> 
            
{contentType === "trailer" && (
  <div className="flex items-center gap-3 bg-neutral-800 p-2 rounded-lg w-fit">
    <button
      onClick={() => setTrailerMode("upload")}
      className={`px-4 py-2 rounded-lg ${
        trailerMode === "upload"
          ? "bg-orange-600 text-white"
          : "bg-gray-700 text-gray-300"
      }`}
    >
      Upload File
    </button>

    <button
      onClick={() => setTrailerMode("url")}
      className={`px-4 py-2 rounded-lg ${
        trailerMode === "url"
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
                        onClick={()=>{
                          prevStep()
                          setVideoUrlInput("")
                          setTrailerMode("upload")
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                      >
                        Back
                      </button>

                      <button
                        onClick={()=>{toast.info('Backend Work for this section is undergoing. Wait for that to complete')}}

                        // onClick={handleFileUpload}
                        disabled={  !videoUrlInput || !videoUrlInput.includes("https://") || videoUrlInput.length<8}
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
                    <div className="relative max-h-[30vh] w-full aspect-video rounded-xl border-2 border-dashed border-gray-600 bg-neutral-900 hover:border-blue-500 transition cursor-pointer overflow-hidden group">

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
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-black/40 group-hover:bg-black/60 transition">
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
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
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
                      <button
                        onClick={prevStep}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                      >
                        Back
                      </button>

                      <button
                        onClick={handleFileUpload}
                        disabled={!uploadFile || uploading || content?.ingest_status === 'processing'}
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






