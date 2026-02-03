'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
 
import { BsArrowLeft as ArrowLeft } from 'react-icons/bs';
import ShakaPlayer from '@/components/ShakaPlayer/ShakaPlayer';
import VRAframePlayer from '@/components/VrAframePlayer/VRAframePlayer';
 

import '../../../../components/ShakaPlayer/shaka.css';
import { apiClient } from '@/lib/api';
import axios from 'axios';
import { API_BASE } from '@/lib/config';
import { getStreamingUrl } from '@/lib/contentApi';

export default function AdminWatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const title = searchParams.get('title') || 'Now Playing';
  const mediaType = searchParams.get('media_type') || '';
  const t = Number(searchParams.get('t') || 0);

  const [dashUrl, setDashUrl] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [dashToken, setDashToken] = useState('');
  const [hlsToken, setHlsToken] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSafari =
    typeof window !== 'undefined' &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const isVR = mediaType.startsWith('vr_');

  const playbackUrl = isVR
    ? hlsUrl
    : isSafari
    ? hlsUrl
    : dashUrl;

  const drmToken = isVR
    ? hlsToken
    : isSafari
    ? hlsToken
    : dashToken;

  /* ---------------------------------------------------
     Disable scroll + navbar behavior (same as before)
  --------------------------------------------------- */
  useEffect(() => {
    document.body.classList.add('player-open');
    return () => document.body.classList.remove('player-open');
  }, []);

  /* ---------------------------------------------------
     Fetch playback URLs
  --------------------------------------------------- */
  useEffect(() => {
    if (!id) {
      setError('No content ID provided.');
      setLoading(false);
      return;
    }

    const fetchPlaybackUrl = async () => {
      try {
        setLoading(true);
        setError(null);
 const res = await getStreamingUrl(id)
      
console.log(res,"res")
        if (res?.dash_url || res?.hls_url) {
          setDashUrl(res.dash_url || '');
          setHlsUrl(res.hls_url || '');
          setDashToken(res?.drm?.token || '');
          setHlsToken(res?.drm?.hls_token || '');
          return;
        }

        console.log('object')

        setError('Failed to get playback URL');
      } catch (err: any) {
         

        setError('Failed to get playback URL');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybackUrl();
  }, [id, router, searchParams]);

  /* ---------------------------------------------------
     Loading State
  --------------------------------------------------- */
  if (loading) {
    return (
      <div className="watch-page-netflix">
        <div className="shaka-loading-layer" style={{ zIndex: 99999 }}>
          <div className="shaka-spinner-custom" />
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------
     Error State
  --------------------------------------------------- */
  if (error) {
    return (
      <div
        className="watch-page-netflix"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Unable to Play
          </div>
          <div style={{ opacity: 0.8, marginBottom: 18 }}>
            {error}
          </div>

          <button
            onClick={() => router.back()}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!dashUrl && !hlsUrl) return null;

  /* ---------------------------------------------------
     Player
  --------------------------------------------------- */
  return (
    <div className="watch-page-netflix">
      <div className="watch-player-overlay" />

      {/* Back Button */}
      <button
        className="watch-back-btn"
        onClick={() => router.back()}
        aria-label="Back"
      >
        <ArrowLeft size={28} />
      </button>

      <div className="watch-player-absolute">
        
        {isVR ? (
          <VRAframePlayer
            src={playbackUrl}
            token={drmToken}
            autoplay
            mediaType={mediaType}
            initialRotation="0 270 0"
          />
        ) : (
          <ShakaPlayer
            src={playbackUrl}
            drmToken={drmToken}
            autoPlay
            t={t}
            watermarkText=""
          />
        )}
      </div>
    </div>
  );
}
