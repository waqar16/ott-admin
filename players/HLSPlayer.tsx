'use client'

import Hls from 'hls.js'
import { useEffect, useRef } from 'react'

interface Props {
  src: string
}

export default function HlsVideoPlayer({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // destroy previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
    }

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src // Safari
    }

    return () => {
      hlsRef.current?.destroy()
    }
  }, [src])

  return <video ref={videoRef} controls autoPlay className="w-full h-full rounded-lg bg-black" />
}
