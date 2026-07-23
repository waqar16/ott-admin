import { useRouter } from 'next/navigation'
// --- Playback Heartbeat Integration Checklist ---
// [x] Only sends heartbeat if user is authenticated
// [x] No duplicate intervals or memory leaks
// [x] No UI pollution
// [x] Stops on pause, end, or unmount
// [x] Pauses in background tabs
// [x] Sends only { position, is_playing } (no event/session/duration/completion)
// [x] Reusable for all VR content

import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import 'aframe'
import './vr-aframe-player.css'
import { UsePlaybackHeartbeat } from './UsePlaybackHeartbeat'
// import { useAuth } from '../src/shared/hooks/useAuth';

interface VRAframePlayerProps {
  src: string
  autoplay?: boolean
}

const VRAframePlayer: React.FC<VRAframePlayerProps> = ({ src, autoplay = false }) => {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const seekBarRef = useRef<HTMLInputElement>(null)

  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(false)
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const settingsRef = useRef<HTMLDivElement | null>(null)
  const [qualityLevels, setQualityLevels] = useState<any[]>([])
  const [currentQuality, setCurrentQuality] = useState<number>(-1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Extract contentId from src (prefer full UUID if present)
  let contentId: string | number | undefined = undefined
  try {
    // Try to match a full UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidMatch = src.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    )
    if (uuidMatch) {
      contentId = uuidMatch[0]
    } else {
      // Fallback: match a long hex string (legacy)
      const hexMatch = src.match(/[0-9a-fA-F]{8,}/)
      if (hexMatch) contentId = hexMatch[0]
    }
  } catch {}

  UsePlaybackHeartbeat({
    contentId,
    video: videoRef.current,
    isPlaying,
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Get resume time from query param 't'
    let resumeTime = 0

    const onPlay = () => setIsPlaying(true)
    const onPause = () => {
      setIsPlaying(false)
      setShowControls(true) // Show controls when paused
    }
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('volumechange', onVolumeChange)

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        // Ensure VR sphere isn't capped by hidden video size
        capLevelToPlayerSize: false,
        // Start in auto but with a healthier initial estimate
        startLevel: -1,
        abrEwmaDefaultEstimate: 2000000, // 2 Mbps initial bandwidth estimate
      })

      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        setIsLoaded(true)

        // Get quality levels
        if (hls.levels && hls.levels.length > 0) {
          setQualityLevels(hls.levels)
          setCurrentQuality(hls.currentLevel)
        }

        // No autoplay - user must click to play
        // Seek to resume time if provided
        if (resumeTime > 0) {
          video.currentTime = resumeTime
        }
        if (autoplay) {
          video.muted = true // must be muted
          try {
            await video.play()
          } catch (e) {
            console.warn('Autoplay blocked, waiting for user gesture')
          }
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level)
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            setError('Fatal error loading video')
            hls.destroy()
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        setIsLoaded(true)
        if (autoplay) {
          video.muted = true
          video.play().catch(() => {})
        }
        // Seek to resume time if provided
        if (resumeTime > 0) {
          video.currentTime = resumeTime
        }
      })
    } else {
      setError('HLS not supported in this browser')
    }

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('volumechange', onVolumeChange)
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, autoplay, router.query])

  const handlePlayClick = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = false
    video.play().catch(() => {})

    // Request fullscreen to hide URL bar and browser UI
    const container = document.querySelector('.vr-aframe-container')
    if (container && container.requestFullscreen) {
      container.requestFullscreen().catch(() => {})
    }
  }

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch(() => {})
    }

    // Show play/pause indicator
    setShowPlayPauseIndicator(true)
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current)
    }
    indicatorTimeoutRef.current = setTimeout(() => {
      setShowPlayPauseIndicator(false)
    }, 600)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time) // Update state immediately for smooth UI
  }

  const handleRewind = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - 10)
  }

  const handleFastForward = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(video.duration, video.currentTime + 10)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current
    if (!video) return
    video.volume = newVolume
    if (newVolume > 0) video.muted = false
  }

  const toggleFullscreen = () => {
    const container = document.querySelector('.vr-aframe-container') as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
      mozRequestFullScreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }

    if (!container) return

    const doc = document as Document & {
      webkitFullscreenElement?: Element
      mozFullScreenElement?: Element
      msFullscreenElement?: Element
      webkitExitFullscreen?: () => Promise<void>
      mozCancelFullScreen?: () => Promise<void>
      msExitFullscreen?: () => Promise<void>
    }

    const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const isCurrentlyFullscreen =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement

    if (!isCurrentlyFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {})
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen().catch(() => {})
      } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen().catch(() => {})
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen().catch(() => {})
      } else if (isiOS) {
        // Fallback: fake fullscreen on iOS to preserve VR sphere
        container.classList.add('ios-fake-fullscreen')
        document.body.classList.add('ios-fs-lock')
        setIsFullscreen(true)
      }
    } else {
      if ((doc as Document).exitFullscreen) {
        ;(doc as Document).exitFullscreen().catch(() => {})
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen().catch(() => {})
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen().catch(() => {})
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen().catch(() => {})
      } else if (isiOS) {
        container.classList.remove('ios-fake-fullscreen')
        document.body.classList.remove('ios-fs-lock')
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element
        mozFullScreenElement?: Element
        msFullscreenElement?: Element
      }
      const isFullscreen = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      )
      setIsFullscreen(isFullscreen)
    }

    // Listen to all fullscreen change events
    document.addEventListener('fullscreenchange', onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', onFullscreenChange)
    document.addEventListener('mozfullscreenchange', onFullscreenChange)
    document.addEventListener('MSFullscreenChange', onFullscreenChange)

    // iOS video fullscreen events
    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('webkitbeginfullscreen', onFullscreenChange)
      videoElement.addEventListener('webkitendfullscreen', onFullscreenChange)
    }

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
      document.removeEventListener('mozfullscreenchange', onFullscreenChange)
      document.removeEventListener('MSFullscreenChange', onFullscreenChange)

      if (videoElement) {
        videoElement.removeEventListener('webkitbeginfullscreen', onFullscreenChange)
        videoElement.removeEventListener('webkitendfullscreen', onFullscreenChange)
      }
    }
  }, [])

  // Close settings menu on outside click
  useEffect(() => {
    if (!showSettingsMenu) return
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const el = settingsRef.current
      const target = e.target as Node | null
      if (el && target && !el.contains(target)) {
        setShowSettingsMenu(false)
        setActiveSubmenu(null)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
  }, [showSettingsMenu])

  const handleQualityChange = (level: number) => {
    const hls = hlsRef.current
    if (!hls) return
    hls.currentLevel = level
    setCurrentQuality(level)
    setActiveSubmenu(null)
    setShowSettingsMenu(false)
  }

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRate(rate)
    setActiveSubmenu(null)
    setShowSettingsMenu(false)
  }

  const toggleSettingsMenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSettingsMenu(!showSettingsMenu)
    setActiveSubmenu(null)
  }

  const openSubmenu = (submenu: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveSubmenu(submenu)
  }

  const closeAllMenus = () => {
    setShowSettingsMenu(false)
    setActiveSubmenu(null)
  }

  const handleContainerClick = () => {
    // Toggle play/pause when clicking on video
    if (isLoaded && isPlaying) {
      togglePlayPause()
    }

    // Show controls
    setShowControls(true)
    startControlsTimeout()
  }

  const startControlsTimeout = () => {
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    // Only auto-hide controls if video is playing
    // If paused, keep controls visible
    if (isPlaying) {
      // Hide controls after 3 seconds
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const handleControlsMouseEnter = () => {
    // Keep controls visible when hovering over them
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
  }

  const handleControlsMouseLeave = () => {
    // Start timeout when mouse leaves controls (only if playing)
    if (isPlaying) {
      startControlsTimeout()
    }
  }
  useEffect(() => {
    const resize = () => {
      const scene = document.querySelector('a-scene') as any
      if (scene?.renderer) {
        scene.renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', resize)
    resize()

    return () => window.removeEventListener('resize', resize)
  }, [])
  useEffect(() => {
    const seekBar = seekBarRef.current
    if (!seekBar || !duration) return

    const progress = (currentTime / duration) * 100
    seekBar.style.setProperty('--progress', `${progress}%`)
  }, [currentTime, duration])

  return (
    <div className="vr-aframe-container" onClick={handleContainerClick}>
      {error && (
        <div className="vr-error">
          <p>{error}</p>
        </div>
      )}

      <video
        ref={videoRef}
        id="vr-video"
        crossOrigin="anonymous"
        playsInline
        webkit-playsinline="true"
        muted
        loop
      />

      <a-scene embedded vr-mode-ui="enabled: false" className="vr-scene">
        <a-assets />

        <a-videosphere
          src="#vr-video"
          rotation="0 -90 0"
          segments-width="128"
          segments-height="64"
          radius="500"
        />

        <a-camera></a-camera>

        {!isLoaded && <a-sky color="#000000" />}
      </a-scene>

      {/* Play/Pause indicator that appears briefly when toggling while playing */}
      {showPlayPauseIndicator && isPlaying && (
        <div className="vr-play-pause-indicator">
          {isPlaying ? (
            <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </div>
      )}

      {!isPlaying && isLoaded && (
        <div className="vr-play-overlay" onClick={handlePlayClick}>
          <div className="vr-play-button">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="white"
                strokeWidth="2"
                fill="rgba(0,0,0,0.5)"
              />
              <path d="M32 26L56 40L32 54V26Z" fill="white" />
            </svg>
            <p>Click to Play</p>
          </div>
        </div>
      )}

      {/* Video controls that appear when user taps screen */}
      {isLoaded && (!isPlaying || showControls) && (
        <div
          className="vr-controls-container"
          onMouseEnter={handleControlsMouseEnter}
          onMouseLeave={handleControlsMouseLeave}
        >
          {/* Seek bar */}
          <div className="vr-seek-bar-container" onClick={(e) => e.stopPropagation()}>
            <input
              ref={seekBarRef}
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              step="0.01"
              className="vr-seek-bar"
              onChange={handleSeek}
            />

            <div className="vr-time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div className="vr-controls-panel" onClick={(e) => e.stopPropagation()}>
            {/* Left controls */}
            <div className="vr-controls-left">
              <button
                className={`vr-control-btn ${!isPlaying ? 'vr-play-btn-paused' : ''}`}
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button className="vr-control-btn" onClick={handleRewind} title="Rewind 10s">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                  <text
                    x="12"
                    y="16"
                    fontSize="8"
                    fill="white"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    10
                  </text>
                </svg>
              </button>

              <button className="vr-control-btn" onClick={handleFastForward} title="Forward 10s">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                  <text
                    x="12"
                    y="16"
                    fontSize="8"
                    fill="white"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    10
                  </text>
                </svg>
              </button>

              <div className="vr-volume-container">
                <button
                  className="vr-control-btn"
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  className="vr-volume-slider"
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Right controls */}
            <div className="vr-controls-right">
              {/* Settings button */}
              <div className="vr-settings-wrapper" ref={settingsRef}>
                <button className="vr-control-btn" onClick={toggleSettingsMenu} title="Settings">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                </button>

                {/* Settings Menu */}
                {showSettingsMenu && (
                  <div className="vr-settings-menu" onClick={(e) => e.stopPropagation()}>
                    {activeSubmenu === null ? (
                      <>
                        {qualityLevels.length > 0 && (
                          <div className="vr-menu-item" onClick={(e) => openSubmenu('quality', e)}>
                            <span>Quality</span>
                            <div className="vr-menu-item-right">
                              <span className="vr-menu-value">
                                {currentQuality === -1
                                  ? 'Auto'
                                  : `${qualityLevels[currentQuality]?.height}p`}
                              </span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                              </svg>
                            </div>
                          </div>
                        )}
                        <div className="vr-menu-item" onClick={(e) => openSubmenu('speed', e)}>
                          <span>Speed</span>
                          <div className="vr-menu-item-right">
                            <span className="vr-menu-value">{playbackRate}x</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : activeSubmenu === 'quality' ? (
                      <div className="vr-submenu">
                        <div className="vr-submenu-header" onClick={() => setActiveSubmenu(null)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                          </svg>
                          <span>Quality</span>
                        </div>
                        <div
                          className={`vr-menu-item ${currentQuality === -1 ? 'active' : ''}`}
                          onClick={() => handleQualityChange(-1)}
                        >
                          <span>Auto</span>
                          {currentQuality === -1 && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </div>
                        {qualityLevels.map((level, index) => (
                          <div
                            key={index}
                            className={`vr-menu-item ${currentQuality === index ? 'active' : ''}`}
                            onClick={() => handleQualityChange(index)}
                          >
                            <span>
                              {level.height}p{' '}
                              {level.bitrate ? `(${Math.round(level.bitrate / 1000)} kbps)` : ''}
                            </span>
                            {currentQuality === index && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : activeSubmenu === 'speed' ? (
                      <div className="vr-submenu">
                        <div className="vr-submenu-header" onClick={() => setActiveSubmenu(null)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                          </svg>
                          <span>Playback Speed</span>
                        </div>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <div
                            key={rate}
                            className={`vr-menu-item ${playbackRate === rate ? 'active' : ''}`}
                            onClick={() => handlePlaybackRateChange(rate)}
                          >
                            <span>
                              {rate}x {rate === 1 ? '(Normal)' : ''}
                            </span>
                            {playbackRate === rate && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <button
                className="vr-control-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default VRAframePlayer
