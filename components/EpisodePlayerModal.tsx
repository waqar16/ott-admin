"use client"
import React, { useEffect, useState } from 'react'

import { getStreamingUrl } from '@/lib/contentApi';
import dynamic from 'next/dynamic';

const ShakaPlayer = dynamic(
  () => import('../components/ShakaPlayer/ShakaPlayer'),
  { ssr: false }
);

const VRAframePlayer = dynamic(
  () => import('../components/VrAframePlayer/VRAframePlayer'),
  { ssr: false }
);

// sonner MUST also be client-only
const toastPromise = dynamic(
  () => import('sonner').then(m => m.toast),
  { ssr: false }
);
 
import RoundLoader from './Loader/RoundLoader';
interface EpisodePlayerModalProps {
  episode: any;
  onClose: () => void;
}
export default function EpisodePlayerModal({
  episode,
  onClose,
}: EpisodePlayerModalProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);  
 
  const [mounted,setMounted]=useState(false); 
  const [videoUrlLoading, setVideoUrlLoading] = useState<boolean>(true);
  const [dashUrl, setDashUrl] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [dashToken, setDashToken] = useState('');
  const [hlsToken, setHlsToken] = useState('');
    const isSafari = typeof navigator !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
 
const isVR = episode.media_type.startsWith("vr_");
const playbackUrl = isVR ? hlsUrl : (isSafari ? hlsUrl : dashUrl);
const drmToken = isVR ? hlsToken : (isSafari ? hlsToken : dashToken);

useEffect(()=>{
    const fetchStreamingUrl = async () => {
      try{ 
 
        const urlPayload = await getStreamingUrl(episode.id);
        
        setVideoUrlLoading(false);
        console.log("urlPayload.dash_url",urlPayload.dash_url)
        setVideoUrl(urlPayload.dash_url);
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
    fetchStreamingUrl()
 
},[])
 useEffect(()=>{
    setMounted(true);
  },[])   
 
 useEffect(() => {
    // Disable background scroll when modal opens
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }

    return () => {
      // Restore scroll when modal closes
      if (typeof document !== "undefined") {
        document.body.style.overflow = "auto";
      }
    };
  }, []);


 if (!mounted) return null;
 
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex justify-start items-center">
      <div className="bg-neutral-900 w-full   h-full flex flex-col">
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Player Section */}
        <div className="flex-1 px-4 pb-4">
          {videoUrlLoading && (
            <div className="flex justify-center items-center h-full">
              <RoundLoader />
            </div>
          )}
          {videoUrl && (
            <div className="w-full h-full flex  items-start">
              <div className="w-11/12  aspect-video  flex flex-row items-start overflow-hidden">
                {episode.media_type.startsWith('vr_') ? (
                  <VRAframePlayer src={playbackUrl} token={drmToken} autoplay={true} />
                ) : (
                  <ShakaPlayer
                    src={playbackUrl}
                    drmToken={drmToken}
                    autoPlay={true}
                    t={0}
                    watermarkText=""
                  />
                )}
                <div className='  flex flex-col items-start w-3/12 ml-4'>
                <h1 className="capitalize text-white text-xl font-bold">{episode.title}</h1>
                <p className="text-gray-300">{episode.description}</p>
                <div className='mt-4'>
                  <h2 className='text-white font-semibold mb-2'>Episode Details:</h2>
                  <p className='text-gray-300'><span className='font-semibold'>Duration:</span> {Math.floor(episode.duration / 60)} mins {episode.duration % 60} secs</p>
                  <p className='text-gray-300'><span className='font-semibold'>Media Type:</span> {episode.media_type}</p>
                  <p className='text-gray-300'><span className='font-semibold'>Ingest Status:</span> {episode.ingest_status}</p>

                </div>
                </div>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
