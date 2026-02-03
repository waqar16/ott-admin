'use client';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import SingleSelect from '@/components/SingleSelect';
import { Content, CreateContentPayload, MediaType } from '@/lib/types/content';
import { toast } from 'sonner';
import RoundLoader from '@/components/Loader/RoundLoader';
import SkeletonLoader from '@/components/Loader/SkeletonLoader';
import HlsVideoPlayer from '@/players/HLSPlayer';
import { formatFileSize, uploadWithCallback, validateFile } from '@/lib/uploadHelper';
import { MEDIA_TYPES } from './ContentEditor.client';
import { updateContent,createContent, initUpload, getContent, getStreamingUrl } from '@/lib/contentApi';
import { ApiError } from '@/lib/authApi';
import { API_BASE, FRONTEND_BASE } from '@/lib/config';
import { GrClose } from 'react-icons/gr';
 import '@/components/ShakaPlayer/shaka.css'
import dynamic from 'next/dynamic';
import UploadProgress from './UploadProgress.client';
import { BiLink } from 'react-icons/bi';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import { UploadToastProgress } from './UploadToastProgress';
const ShakaPlayer = dynamic(
  () => import('@/components/ShakaPlayer/ShakaPlayer'),
  { ssr: false }
);

const VRAframePlayer = dynamic(
  () => import('@/components/VrAframePlayer/VRAframePlayer'),
  { ssr: false }
);
interface UploadTrailerClientProps {
   trailer_url?: string;
    trailer_id?: string;
    content: Content;
  setOpen:React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadTrailerClient: React.FC<UploadTrailerClientProps> = ({
   trailer_url,
    trailer_id,
 setOpen, 
  content,   
}) => {
     const [trailerMode, setTrailerMode] = useState<"upload" | "url">("upload");
      const [trailerMediaType,setTraileMediaType] = React.useState<MediaType>('flat')
      const [isTrailerContentData,setIsTrailerContentData] = React.useState<Content | null>(null)
      const [videoUrlInput, setVideoUrlInput] = useState("");
        const [trailerUrl, setTrailerUrl] = useState<string | null>(trailer_url || null)
        const [trailerFetchLoading, setTrailerFetchLoading] = useState<boolean>(false)
  const [trailerUploadFile, setTrailerUploadFile] = useState<File | null>(null);
  const [trailerDataFetching,setTrailerDataFetching] = React.useState<boolean>(true)
  const [uploading, setUploading] = useState(false);
const [trailerContentDataFetching,setTrailerContentDataFetching] = React.useState<boolean>(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [trailerData, setTrailerData] = useState<Content | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState<CreateContentPayload>({
        title: content?.title || '',
        description: content?.description || '', 
        media_type: content?.media_type || 'flat',
        content_type: 'trailer',
        trailerType: content?.trailerType || 'movie',
        status: content?.status || 'draft',
        is_kid_safe: content?.is_kid_safe || false,
        is_ppv: content?.is_ppv || false,
        price_cents: content?.price_cents || 0,
        genres: content?.genres || [],
        parent: content.id
    
      });
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);
     
      const [mounted,setMounted]=useState(false); 
       const [videoUrlLoading, setVideoUrlLoading] = useState<boolean>(trailer_id?true:false);
       const [dashUrl, setDashUrl] = useState('');
       const [hlsUrl, setHlsUrl] = useState('');
       const [dashToken, setDashToken] = useState('');
       const [hlsToken, setHlsToken] = useState('');
         const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
     const isVR = trailerData?.media_type.startsWith("vr_");
     const playbackUrl = isVR ? hlsUrl : (isSafari ? hlsUrl : dashUrl);
     const drmToken = isVR ? hlsToken : (isSafari ? hlsToken : dashToken);
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
            const toastId = toast.custom(
              () => (
                <UploadToastProgress
                  progress={0}
                  status="Initializing upload…"
                />
              ),
              {
                duration: Infinity, // 🔑 stays until we dismiss/update
              }
            );
          try {
            setLoading(true)
            setUploading(true);
            setError(null);
            setUploadStatus('Initializing upload...');
      
            const uploadInit = await initUpload(isTrailerContentData?.id || "", trailerUploadFile.name);
       
    if(uploadInit.s3_key){
        setOpen(false)

    }
            const result = await uploadWithCallback(uploadInit, trailerUploadFile, {
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
                   id: toastId, // 🔑 update same toast
                 }
               );
           if (progress.percentage >= 100) {
                 toast.dismiss(toastId); // hide the progress toast
                 toast.success(
                   "Upload completed. Please wait for processing before publishing."
                 );
               }
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
            setOpen(false)
      
      
          } catch (err) {
            const apiError = err as ApiError;
             toast.error(apiError.message || 'Upload failed');
          } finally {
            setUploading(false);
            setLoading(false)
            setOpen(false)
            
          }
        }

     useEffect(()=>{
         const fetchStreamingUrl = async () => {
           try{ 
      
             const urlPayload = await getStreamingUrl(trailer_id);
             
             setVideoUrlLoading(false);
             console.log("urlPayload.dash_url",urlPayload.dash_url) 
             setHlsUrl(urlPayload.hls_url);
             setDashUrl(urlPayload.dash_url);
             //  setHlsToken(urlPayload?.hls_token);
             // setDashToken(urlPayload?.dash_token);
           } catch (rendErr) {
             console.error('Error fetching renditions:', rendErr);
             // Don't fail the whole operation if renditions fail
           }
           setVideoUrlLoading(false)
         }
        if(trailer_id){
             fetchStreamingUrl()
        }
      
     },[])
      useEffect(()=>{
         setMounted(true);
       },[])  
     
        useEffect(()=>{
    //     async function fetchVideo() {
    //           try {
    //             setTrailerFetchLoading(true)
        
    //             const token = Cookies.get("access_token");
        
    //             const res = await fetch(
    //               `${API_BASE}api/v1/content/content/${trailer_id || undefined}/stream/`,
    //               {
    //                 headers: {
    //                   Authorization: `Bearer ${token}`,
    //                 },
    //               }
    //             );
        
    //             if (!res.ok) throw new Error("Failed to fetch video");
    //             const data = await res.json();
    //             setTrailerUrl(data.playback_url);
    //             setTrailerFetchLoading(false)
    //           } catch (e) {
    //             setTrailerFetchLoading(false)
    //           } finally {
    //             setTrailerFetchLoading(false)
    //           }
    //         }
    //      fetchVideo()
     async function fetchTrailerData() {
              try {
                setTrailerDataFetching(true)
        
                const token = Cookies.get("access_token");
        const res = await getContent(trailer_id ?? '')
        setTraileMediaType(res.media_type) 
        setTrailerData(res)
                setTrailerDataFetching(false)
                 
           
              } catch (e) {
                setTrailerDataFetching(false)
              } 
            }
         fetchTrailerData()
        },[])
        useEffect(() => {
  if (!trailerUploadFile) {
    setPreviewUrl(null);
    return;
  }

  const url = URL.createObjectURL(trailerUploadFile);
  setPreviewUrl(url);

  return () => URL.revokeObjectURL(url);
}, [trailerUploadFile]);

  return (
    
    <>
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      
      {trailerDataFetching?
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh]  ">
     <div className='flex flex-col items-start w-full'>
        <SkeletonLoader className='w-12 h-4 bg-neutral-900 mt-4'/>
        <SkeletonLoader className='w-full h-12 bg-neutral-900 mt-2'/>
        <div className='flex flex-row items-center justify-end w-full'>
        <SkeletonLoader className='w-16 h-12 bg-neutral-900 mt-2 mr-2'/>
        <SkeletonLoader className='w-24 h-12 bg-neutral-900 mt-2'/>

        </div>
     </div>
     
      </div>:
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh]  ">
        
        <div className="flex flex-col w-full h-auto h-auto ">
        <div className="space-y-2 w-full space-y-2   max-h-[55vh] md:max-h-[70vh] min-h-auto ">
<div className='w-full flex flex-row items-center justify-end'> <button
onClick={()=>setOpen(false)}
>
    <GrClose/>
    </button></div>
 
       
        <div className='w-full flex flex-col max-h-[70vh] '>
  {isTrailerContentData ? (
            <div className="flex flex-col items-start w-full rounded-lg w-fit  mb-4">
            
              
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Trailer Upload Mode
              </label>
              <div className='flex items-center'>
                <button
                  onClick={() => setTrailerMode("upload")}
                  className={`px-4 py-2 rounded-lg ${
                    trailerMode === "upload"
                      ? "bg-orange-600 text-white"
                      : "bg-neutral-700 text-neutral-300"
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setTrailerMode("url")}
                  className={`ml-2 px-4 py-2 rounded-lg ${
                    trailerMode === "url"
                      ? "bg-orange-600 text-white"
                      : "bg-neutral-700 text-neutral-300"
                  }`}
                >
                  Use Trailer URL
                </button>
              </div>
             
            </div>
          ) :  
            <div className=" flex flex-col items-start w-full rounded-lg w-fit overflow-y-auto minimal-scrollbar">
            <SingleSelect
              label="Trailer Media Type"
              options={MEDIA_TYPES}
              value={String(trailerMediaType)}
              onChange={(id) => setTraileMediaType(id as MediaType)}
            />
                         
                        {trailer_id && 
                        <div className="   w-full h-auto flex flex-col items-start">
            

            {videoUrlLoading && <RoundLoader />} 
                        {playbackUrl && !videoUrlLoading &&  <div className='flex flex-col items-start w-full'>

                        <h2 className='mt-2 mb-1 text-sm text-neutral-300'>Trailer Preview</h2>
                          <Link
                          href={`${FRONTEND_BASE}admin/watch/${trailer_id}?media_type=${trailerMediaType}`}
                           target="_blank"
                           className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"

                           >Watch Trailer
                            <FiExternalLink size={16} className="opacity-80" />
                           </Link>
             {/* <div className=" w-full h-auto  ">
              
                         <> {trailerData?.media_type.startsWith('vr_') ? 
          
      
          <VRAframePlayer src={playbackUrl} token={drmToken} autoplay={false} />
       
          : 
         <>  
          <ShakaPlayer
            src={playbackUrl}
            drmToken={drmToken}
            autoPlay={true}
            t={0}
            watermarkText=""
          />
         </>

                        
                          } </>
                          </div> */}

                        </div>
                        }
                        </div>}
                        </div>

          }

          {!isTrailerContentData && (
            <div className="flex justify-end mt-6 mb-3">
         
              <div className='flex flex-row items-center justify-end'>
                <button
                              onClick={()=>setOpen(false)}

                  className="px-4 py-2 bg-neutral-600 text-white rounded-lg mr-1"
                >
                  Skip Trailer for now
                </button>
                <button
                  onClick={async () => {
                    if (trailer_id) {
                      const created = await updateContent(trailer_id, {
                        ...formData,
                        content_type: 'trailer',
                        media_type: trailerMediaType
                      });
                      if (created.id) {
                        toast.success(`Your Trailer's Video Media type is successfully created. Proceed with the process of uploading trailer`);
                        setIsTrailerContentData(created);
                      } else {
                        toast.error(`Something Went Wrong`);
                      }
                    } else {
                      const created = await createContent({
                        ...formData,
                        media_type: trailerMediaType,
                        parent: content.id ,
                        content_type: 'trailer'
                      });
                      if (created.id) {
                        toast.success(`Your Trailer's Video Media type is successfully updated. Proceed with the process of uploading trailer`);
                        setIsTrailerContentData(created);
                      } else {
                        toast.error(`Something Went Wrong`);
                      }
                    }
                  }}
                  disabled={trailerContentDataFetching}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {trailerContentDataFetching ? (
                    <>
                      <RoundLoader />
                      <span>Wait a moment..</span>
                    </>
                  ) :  
                    <> 
                   {trailer_id ? <>
                   {playbackUrl?
                   'Upload New Trailer'
                :
                'Update & Proceed'}
                    </> : 'Create & Proceed'}
                   </>
                   }
                </button>
              </div>
            </div>
          )}

          {isTrailerContentData && (
            <>
              {trailerMode === "url" ? (
                <div className="space-y-3">
                  <label className="text-white text-sm">Trailer Video URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/trailer.mp4"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="w-full p-3 rounded-lg bg-neutral-900 text-white border border-neutral-700
                     outline-none ring-0 
           focus:outline-none focus:ring-0 
           focus-visible:outline-none focus-visible:ring-0
                    "
                  />
                </div>
              ) : (
                <>
                  {trailerFetchLoading ? (
                    <SkeletonLoader className="w-full h-[40vh] bg-neutral-700 rounded-xl" />
                  ) : (
                    <>
                    
                     

                      {/* Media Upload Area */}
                    <div className="w-full space-y-4 ">

  {/* PREVIEW AREA */}
  <div className="max-h-[30vh] relative w-full aspect-video rounded-xl bg-black overflow-hidden border border-neutral-700">

    {!trailerFetchLoading && trailerUrl ? (
      trailerMediaType.startsWith("vr_") ? (
        <VRAframePlayer src={playbackUrl} token={drmToken} autoplay />
      ) : (
        <ShakaPlayer
          key={playbackUrl}
          src={playbackUrl}
          drmToken={drmToken}
          autoPlay
          t={0}
          watermarkText=""
        />
      )
    ) : trailerUploadFile && previewUrl ? (
      trailerUploadFile.type.startsWith("video/") ? (
        <video
          src={previewUrl}
          controls
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
          <audio src={previewUrl} controls />
          <p className="text-sm">{trailerUploadFile.name}</p>
          <p className="text-xs text-neutral-400">
            {formatFileSize(trailerUploadFile.size)}
          </p>
        </div>
      )
    ) : (
      <div className="  h-full flex items-center justify-center  text-neutral-500 text-sm">
        No preview available
      </div>
    )}
  </div>

  {/* UPLOAD BUTTON */}
  <div className="flex justify-start">
    <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer disabled:opacity-50">
     
     <BiLink/>
      Attach Trailer
      <input
        type="file"
        accept="video/*,audio/*"
        onChange={(e) => setTrailerUploadFile(e.target.files?.[0] || null)}
        disabled={uploading || isTrailerContentData?.ingest_status === "processing"}
        className="hidden"
      />
    </label>
  </div>

</div>


                      {/* Large File Warning */}
                      {trailerUploadFile && trailerUploadFile.size >= 1024 * 1024 * 1024 && (
                        <p className="text-xs text-amber-500">
                          Large file detected. Upload may take time — keep this tab open.
                        </p>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

        </div>
        </div>

        {isTrailerContentData && (
          <div className="flex justify-between mt-6 mb-3">
            <button
              onClick={() => { setIsTrailerContentData(null) }}
              className="px-4 py-2 bg-neutral-600 text-white rounded-lg"
            >
              Back
            </button>
            <div className='flex flex-row items-center justify-end'>
              
              {trailerMode === "url" ? (
                <button
                  onClick={async () => {
                    let update = await updateContent(isTrailerContentData.id, { trailer_youtube_url: videoUrlInput });
                    if (update.id) {
                      toast.success('Trailer URL successfully updated');
                      setOpen(false);
                    } else {
                      toast.error('Something went wrong');
                    }
                  }}
                  disabled={!videoUrlInput || !videoUrlInput.includes("https://") || uploading || isTrailerContentData?.ingest_status === 'processing'}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RoundLoader />
                      <span>Uploading</span>
                    </>
                  ) : (
                    'Upload Trailer'
                  )}
                </button>
              ) : (
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
              )}
            </div>
          </div>
        )}
      </div>
      </div>}
      </div>
    </>
  );
};

export default UploadTrailerClient;