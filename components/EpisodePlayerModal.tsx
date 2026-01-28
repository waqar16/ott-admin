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

import "../components/ShakaPlayer/shaka.css"
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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center ">
      <div className="bg-neutral-900   w-full   relative max-h-[calc(100vh)] overflow-y-auto minimal-scrollbar flex flex-col">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-xl z-10"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-4 border-b border-neutral-700 shrink-0">
          <h2 className="text-xl font-semibold">{episode.title}</h2>
          <p className="text-sm text-neutral-400">
            Episode {episode.episode_number}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">

          {/* 🎥 Player */}
          <div className="aspect-video bg-black flex items-center justify-center p-4">
            

            {videoUrlLoading && <RoundLoader />} 
          {videoUrl && (
             <div className="watch-player-absolute">
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

        {/* <div className="watch-title-netflix">{title}</div> */}
      </div>
            // <div className='w-full flex flex-col items-center'>
            //   <video src={videoUrl} controls className="w-full md:w-7/12  rounded-lg" />
            // </div>
          )}


           
          </div>

     

        </div>
      </div>
    </div>
  );
}
