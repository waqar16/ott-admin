'use client'

import { useState, useEffect, useCallback } from 'react'

export type BitratePreset = 'auto' | 'high' | 'medium' | 'low' | 'custom'

export interface PlaybackPreferences {
  bitratePreset: BitratePreset
  customBitrate?: number // in kbps
  autoQuality: boolean
  preferredQuality: '1080p' | '720p' | '480p' | '360p' | 'auto'
}

const DEFAULT_PREFERENCES: PlaybackPreferences = {
  bitratePreset: 'auto',
  autoQuality: true,
  preferredQuality: 'auto',
}

const BITRATE_PRESETS = {
  high: 5000, // 5 Mbps
  medium: 2500, // 2.5 Mbps
  low: 1000, // 1 Mbps
}

const STORAGE_KEY = 'ott_playback_preferences'

/**
 * Custom hook for managing user playback preferences
 * Stores preferences in localStorage and provides utilities for bitrate management
 */
export function useUserPlaybackPreference() {
  const [preferences, setPreferences] = useState<PlaybackPreferences>(DEFAULT_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as PlaybackPreferences
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
      }
      setIsLoaded(true)
    } catch (error) {
      console.error('Failed to load playback preferences:', error)
      setIsLoaded(true)
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      } catch (error) {
        console.error('Failed to save playback preferences:', error)
      }
    }
  }, [preferences, isLoaded])

  // Update bitrate preset
  const setBitratePreset = useCallback((preset: BitratePreset) => {
    setPreferences((prev) => ({
      ...prev,
      bitratePreset: preset,
      autoQuality: preset === 'auto',
    }))
  }, [])

  // Update custom bitrate value
  const setCustomBitrate = useCallback((bitrate: number) => {
    setPreferences((prev) => ({
      ...prev,
      bitratePreset: 'custom',
      customBitrate: bitrate,
      autoQuality: false,
    }))
  }, [])

  // Update preferred quality
  const setPreferredQuality = useCallback((quality: PlaybackPreferences['preferredQuality']) => {
    setPreferences((prev) => ({
      ...prev,
      preferredQuality: quality,
      autoQuality: quality === 'auto',
    }))
  }, [])

  // Toggle auto quality
  const toggleAutoQuality = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      autoQuality: !prev.autoQuality,
      bitratePreset: !prev.autoQuality ? 'auto' : prev.bitratePreset,
    }))
  }, [])

  // Get bitrate value in kbps based on current preset
  const getBitrateValue = useCallback((): number | undefined => {
    switch (preferences.bitratePreset) {
      case 'auto':
        return undefined // Let HLS.js decide
      case 'high':
        return BITRATE_PRESETS.high
      case 'medium':
        return BITRATE_PRESETS.medium
      case 'low':
        return BITRATE_PRESETS.low
      case 'custom':
        return preferences.customBitrate
      default:
        return undefined
    }
  }, [preferences])

  // Get HLS.js level index based on available levels and preference
  const getPreferredLevel = useCallback(
    (availableLevels: { bitrate: number; height: number }[]): number => {
      if (preferences.bitratePreset === 'auto') {
        return -1 // Auto
      }

      const targetBitrate = getBitrateValue()
      if (!targetBitrate) {
        return -1
      }

      // Find closest matching level
      let closestIndex = 0
      let closestDiff = Math.abs(availableLevels[0].bitrate - targetBitrate * 1000)

      availableLevels.forEach((level, index) => {
        const diff = Math.abs(level.bitrate - targetBitrate * 1000)
        if (diff < closestDiff) {
          closestDiff = diff
          closestIndex = index
        }
      })

      return closestIndex
    },
    [preferences, getBitrateValue]
  )

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
  }, [])

  // Get human-readable preset name
  const getPresetLabel = useCallback(
    (preset: BitratePreset): string => {
      switch (preset) {
        case 'auto':
          return 'Auto (Adaptive)'
        case 'high':
          return 'High (5 Mbps)'
        case 'medium':
          return 'Medium (2.5 Mbps)'
        case 'low':
          return 'Low (1 Mbps)'
        case 'custom':
          return `Custom (${preferences.customBitrate || 0} kbps)`
        default:
          return 'Unknown'
      }
    },
    [preferences.customBitrate]
  )

  return {
    // State
    preferences,
    isLoaded,

    // Setters
    setBitratePreset,
    setCustomBitrate,
    setPreferredQuality,
    toggleAutoQuality,
    resetPreferences,

    // Getters
    getBitrateValue,
    getPreferredLevel,
    getPresetLabel,

    // Constants
    presets: BITRATE_PRESETS,
  }
}

// Export types and constants for use in components
export { BITRATE_PRESETS }
