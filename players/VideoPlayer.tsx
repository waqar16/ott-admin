'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export interface VideoPlayerProps {
  src: string
  poster?: string
  autoPlay?: boolean
  controls?: boolean
  initialBitrate?: number
  onQualityChange?: (level: number, bitrate: number) => void
  onError?: (error: string) => void
  className?: string
}

interface QualityLevel {
  index: number
  height: number
  bitrate: number
  name: string
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  controls = true,
  initialBitrate,
  onQualityChange,
  onError,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
  const [currentQuality, setCurrentQuality] = useState<number>(-1)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: initialBitrate !== undefined ? initialBitrate : -1,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      })

      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)

        // Extract quality levels
        const levels: QualityLevel[] = hls.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
          name: level.height ? `${level.height}p` : `Level ${index}`,
        }))

        setQualityLevels(levels)
        setCurrentQuality(hls.currentLevel)

        // Playback preference integration
        try {
          const raw = localStorage.getItem('ott_playback_preferences')
          if (raw) {
            const prefs = JSON.parse(raw)
            if (prefs?.bitratePreset && prefs.bitratePreset !== 'auto') {
              // Choose closest matching level based on bitrate preset/custom bitrate
              const target =
                prefs.bitratePreset === 'custom'
                  ? prefs.customBitrate * 1000
                  : prefs.bitratePreset === 'high'
                    ? 5000 * 1000
                    : prefs.bitratePreset === 'medium'
                      ? 2500 * 1000
                      : prefs.bitratePreset === 'low'
                        ? 1000 * 1000
                        : undefined
              if (target) {
                let closest = -1
                let diff = Infinity
                hls.levels.forEach((lvl, idx) => {
                  const d = Math.abs(lvl.bitrate - target)
                  if (d < diff) {
                    diff = d
                    closest = idx
                  }
                })
                if (closest >= 0) {
                  hls.currentLevel = closest
                  setCurrentQuality(closest)
                }
              }
            }
          }
        } catch {}

        if (autoPlay) {
          video.play().catch((error) => {
            console.error('Autoplay failed:', error)
            if (onError) onError('Autoplay failed')
          })
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level)
        const level = hls.levels[data.level]
        if (onQualityChange && level) {
          onQualityChange(data.level, level.bitrate)
        }
      })

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error')
              hls.recoverMediaError()
              break
            default:
              console.error('Fatal error')
              if (onError) onError('Fatal playback error')
              break
          }
        }
      })

      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = src
      setIsLoading(false)

      if (autoPlay) {
        video.play().catch((error) => {
          console.error('Autoplay failed:', error)
          if (onError) onError('Autoplay failed')
        })
      }
    } else {
      console.error('HLS is not supported')
      if (onError) onError('HLS is not supported in this browser')
      setIsLoading(false)
    }
  }, [src, autoPlay, initialBitrate, onError, onQualityChange])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleDurationChange = () => setDuration(video.duration)
    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('durationchange', handleDurationChange)
    video.addEventListener('volumechange', handleVolumeChange)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('durationchange', handleDurationChange)
      video.removeEventListener('volumechange', handleVolumeChange)
    }
  }, [])

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Keyboard controls for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'arrowleft':
        case 'j':
          e.preventDefault()
          handleSeek(Math.max(0, currentTime - 10))
          break
        case 'arrowright':
        case 'l':
          e.preventDefault()
          handleSeek(Math.min(duration, currentTime + 10))
          break
        case 'arrowup':
          e.preventDefault()
          handleVolumeChange(Math.min(1, volume + 0.1))
          break
        case 'arrowdown':
          e.preventDefault()
          handleVolumeChange(Math.max(0, volume - 0.1))
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, currentTime, duration, volume])

  // Control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value
      setVolume(value)
      if (value === 0) {
        setIsMuted(true)
      } else if (isMuted) {
        setIsMuted(false)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const changeQuality = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex
      setCurrentQuality(levelIndex)
      setShowQualityMenu(false)
      // Persist user manual selection
      try {
        const raw = localStorage.getItem('ott_playback_preferences')
        const prefs = raw ? JSON.parse(raw) : {}
        prefs.bitratePreset = 'custom'
        // Store bitrate in kbps
        const level = hlsRef.current.levels[levelIndex]
        if (level) {
          prefs.customBitrate = Math.round(level.bitrate / 1000)
        }
        localStorage.setItem('ott_playback_preferences', JSON.stringify(prefs))
      } catch {}
    }
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div ref={containerRef} className={`relative bg-black group ${className}`}>
      {/* Video Element */}
      <video ref={videoRef} poster={poster} className="w-full h-full" playsInline />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      )}

      {/* Custom Controls */}
      {controls && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
              aria-label="Video timeline seek (Arrow Left/Right or J/L)"
              title={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-red-500 transition"
                aria-label={isPlaying ? 'Pause video (Space or K)' : 'Play video (Space or K)'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-red-500 transition"
                  aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
                  aria-label="Volume control (Arrow Up/Down)"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>

              {/* Time */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              {/* Quality Selector */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-red-500 transition px-3 py-1 border border-white rounded"
                    aria-label="Video quality settings"
                    title="Change quality"
                  >
                    {currentQuality === -1
                      ? 'Auto'
                      : qualityLevels[currentQuality]?.name || 'Quality'}
                  </button>

                  {showQualityMenu && (
                    <div
                      className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded shadow-lg overflow-hidden"
                      role="menu"
                      aria-label="Quality options"
                    >
                      <button
                        onClick={() => changeQuality(-1)}
                        className={`block w-full text-left px-4 py-2 text-white hover:bg-red-600 transition ${
                          currentQuality === -1 ? 'bg-red-700' : ''
                        }`}
                        role="menuitem"
                        aria-label="Auto quality"
                      >
                        Auto
                      </button>
                      {qualityLevels.map((level) => (
                        <button
                          key={level.index}
                          onClick={() => changeQuality(level.index)}
                          className={`block w-full text-left px-4 py-2 text-white hover:bg-red-600 transition ${
                            currentQuality === level.index ? 'bg-red-700' : ''
                          }`}
                          role="menuitem"
                          aria-label={`${level.name} quality, ${Math.round(level.bitrate / 1000)} kbps`}
                        >
                          {level.name} ({Math.round(level.bitrate / 1000)}kbps)
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-red-500 transition"
                aria-label={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 4a1 1 0 00-1 1v3a1 1 0 002 0V6h2a1 1 0 000-2H5zM4 13a1 1 0 011-1h3a1 1 0 110 2H6v2a1 1 0 11-2 0v-3zm11-9a1 1 0 110 2h-2v2a1 1 0 11-2 0V5a1 1 0 011-1h3zm1 9a1 1 0 00-1 1v2h-2a1 1 0 100 2h3a1 1 0 001-1v-3a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h3a1 1 0 010 2H5.414l2.293 2.293a1 1 0 11-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 110-2h3a1 1 0 011 1v3a1 1 0 11-2 0V5.414l-2.293 2.293a1 1 0 11-1.414-1.414L12.586 4H12zM4 13a1 1 0 011 1v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 16H8a1 1 0 110 2H4a1 1 0 01-1-1v-4a1 1 0 011-1zm13-1a1 1 0 00-1 1v3a1 1 0 01-1 1h-3a1 1 0 100 2h4a1 1 0 001-1v-4a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="bg-red-600 hover:bg-red-700 rounded-full p-6 transition-transform hover:scale-110"
            aria-label="Play video"
            title="Play (Space or K)"
          >
            <svg
              className="w-16 h-16 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
