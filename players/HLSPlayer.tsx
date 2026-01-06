'use client'

import React, { useRef, useEffect } from 'react'

interface HLSPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  className?: string
}

export const HLSPlayer: React.FC<HLSPlayerProps> = ({
  src,
  poster,
  autoPlay = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // HLS.js integration would go here
    // For now, native HLS support (Safari) or fallback
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else {
      // You would initialize HLS.js here
      console.log('HLS.js would be initialized here')
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      poster={poster}
      autoPlay={autoPlay}
      controls
      className={`w-full h-auto rounded-lg ${className}`}
    >
      Your browser does not support HLS streaming.
    </video>
  )
}
