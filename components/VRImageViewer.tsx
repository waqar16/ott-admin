'use client'
import { useState } from 'react'

interface VRImageViewerProps {
  src: string
  alt?: string
  className?: string
  resolutionClass?: string // e.g. 13K
}

// Lightweight placeholder viewer: drag to pan a large equirectangular image
// TODO: Replace with WebGL / Three.js powered panorama supporting >14K resolution.
export function VRImageViewer({ src, alt, className = '', resolutionClass }: VRImageViewerProps) {
  const [offsetX, setOffsetX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [lastX, setLastX] = useState(0)

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true)
    setLastX(e.clientX)
  }
  const onMouseUp = () => setDragging(false)
  const onMouseLeave = () => setDragging(false)
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return
    const dx = e.clientX - lastX
    setLastX(e.clientX)
    setOffsetX((prev) => prev + dx)
  }

  return (
    <div
      className={`relative bg-black text-white overflow-hidden select-none ${className}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      role="group"
      aria-label="360 image viewer"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'cover',
          backgroundPosition: `${offsetX}px center`,
          cursor: dragging ? 'grabbing' : 'grab',
          transition: dragging ? 'none' : 'background-position 0.2s ease-out',
        }}
        aria-hidden="true"
      />
      <div className="absolute top-2 left-2 bg-white/10 backdrop-blur px-3 py-1 rounded text-xs border border-white/20">
        360 Image {resolutionClass && `• ${resolutionClass}`}
      </div>
      <div className="absolute bottom-2 left-2 right-2 text-xs text-gray-300 bg-black/40 rounded px-3 py-2">
        Drag to look around (mock viewer). TODO: Implement full WebGL panorama for high-res VR
        stills.
      </div>
      <img src={src} alt={alt || 'VR panorama'} className="opacity-0 w-0 h-0" />
    </div>
  )
}
