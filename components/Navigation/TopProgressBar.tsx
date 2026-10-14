'use client'

import React from 'react'
import { useNavigationLoading } from './NavigationLoadingContext'

export default function TopProgressBar() {
  const { isNavigating, progress } = useNavigationLoading()

  if (!isNavigating && progress === 0) {
    return null
  }

  const isComplete = progress >= 100

  return (
    <div
      role="progressbar"
      aria-label="Navigation page loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-busy={isNavigating}
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] overflow-hidden"
    >
      {/* Background track (subtle translucent line) */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Primary progress bar */}
      <div
        className={`h-full transition-all duration-200 ease-out motion-reduce:transition-none ${
          isComplete ? 'opacity-0 duration-300' : 'opacity-100'
        }`}
        style={{
          width: `${progress}%`,
          backgroundColor: 'var(--main-color, #1c4d8d)',
          boxShadow: '0 0 10px var(--main-color, #1c4d8d), 0 0 4px var(--main-color, #1c4d8d)',
        }}
      >
        {/* Subtle leading-edge highlight/glow */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-white/40 transform translate-x-2" />
      </div>
    </div>
  )
}
