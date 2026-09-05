import React, { useEffect, useMemo, useRef, useState } from 'react'
import shaka from 'shaka-player/dist/shaka-player.ui'
import 'shaka-player/dist/controls.css'
import './shaka.css'

import { UsePlaybackHeartbeat } from '../UsePlaybackHeartbeat'
const ShakaPlayer = ({
  src,
  contentId: propContentId,
  autoPlay = false,
  watermarkText = '',
  t = 0,
}) => {
  const wrapperRef = useRef(null)
  const videoRef = useRef(null)

  const playerRef = useRef(null)
  const uiRef = useRef(null)

  const [isBuffering, setIsBuffering] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  const contentId = useMemo(() => {
    if (propContentId) return propContentId
    if (typeof src !== 'string') return null

    const uuidMatch = src.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
    )
    return uuidMatch?.[0] || null
  }, [propContentId, src])

  UsePlaybackHeartbeat({
    contentId,
    video: videoRef.current,
    isPlaying,
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    if (!src) return

    let cancelled = false

    const cleanup = async () => {
      try {
        if (uiRef.current) {
          await uiRef.current.destroy()
          uiRef.current = null
        }

        if (playerRef.current) {
          try {
            await playerRef.current.detach()
          } catch {}

          await playerRef.current.destroy()
          playerRef.current = null
        }

        const video = videoRef.current
        if (video) {
          video.pause?.()
          video.removeAttribute('src')
          try {
            video.load()
          } catch {}
        }
      } catch (e) {
        console.warn('Cleanup warning:', e)
      }
    }

    const init = async () => {
      await cleanup()

      if (cancelled) return

      const video = videoRef.current
      const wrapper = wrapperRef.current
      if (!video || !wrapper) return

      shaka.polyfill.installAll()

      if (!shaka.Player.isBrowserSupported()) {
        console.error('Browser not supported')
        return
      }

      const player = new shaka.Player()
      playerRef.current = player

      await player.attach(video)

      player.addEventListener('error', (e) => {
        console.error('Shaka Error Event:', e.detail)
      })

      player.configure({
        streaming: {
          rebufferingGoal: 2,
          bufferingGoal: 10,
          lowLatencyMode: false,
        },
      })

      const onBuffering = (e) => {
        if (cancelled) return
        setIsBuffering(!!e.buffering)
      }
      player.addEventListener('buffering', onBuffering)

      const ui = new shaka.ui.Overlay(player, wrapper, video)
      uiRef.current = ui

      ui.configure({
        addSeekBar: true,
        enableKeyboardPlaybackControls: true,
        seekBarColors: {
          base: 'rgba(255,255,255,0.18)',
          buffered: 'rgba(255,255,255,0.35)',
          played: '#E50914',
        },
        controlPanelElements: [
          'play_pause',
          'rewind',
          'fast_forward',
          'time_and_duration',
          'spacer',
          'mute',
          'volume',
          'language',
          'captions',
          'quality',
          'picture_in_picture',
          'fullscreen',
        ],
        overflowMenuButtons: ['quality', 'language', 'captions', 'playback_rate'],
        fastForwardRates: [2, 10, 30],
        rewindRates: [2, 10, 30],
        doubleClickForFullscreen: true,
      })

      try {
        setIsBuffering(true)

        await player.load(src)

        if (cancelled) return

        // Seek after load
        const startTime = Number(t || 0)
        if (!Number.isNaN(startTime) && startTime > 0) {
          try {
            video.currentTime = startTime
          } catch (e) {
            console.log('Seek failed:', e)
          }
        }

        // autoplay
        if (autoPlay) {
          try {
            video.muted = true
            await video.play()
          } catch (e) {
            console.log('Autoplay blocked:', e)
          }
        }
      } catch (err) {
        if (!cancelled) console.error('Shaka load error:', err)
      } finally {
        if (!cancelled) setIsBuffering(false)
      }
    }

    init()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [src, autoPlay, t])

  return (
    <div ref={wrapperRef} className="shaka-advanced-wrapper">
      {isBuffering && (
        <div className="shaka-loading-layer">
          <div className="shaka-spinner-custom" />
        </div>
      )}

      {watermarkText ? <div className="shaka-watermark">{watermarkText}</div> : null}

      <video ref={videoRef} autoPlay={true} className="shaka-video" controls={false} playsInline />
    </div>
  )
}

export default ShakaPlayer
