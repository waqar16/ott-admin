'use client'

import React from 'react'

interface AvatarPlaceholderProps {
  name?: string
  email?: string
  size?: 'sm' | 'md' | 'lg'
}

const colorPalettes = [
  { bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  { bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  { bg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
]

export const AvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({
  name,
  email,
  size = 'md',
}) => {
  const textSource = name || email || 'User'

  // Calculate initials
  const getInitials = (str: string) => {
    const parts = str.trim().split(/\s+/)
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return str.slice(0, 2).toUpperCase()
  }

  // Deterministic color selection based on string hash
  const getHash = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash)
  }

  const colorIndex = getHash(textSource) % colorPalettes.length
  const palette = colorPalettes[colorIndex]

  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
  }

  return (
    <div
      className={`rounded-full border font-bold flex items-center justify-center shrink-0 shadow-inner select-none ${sizeClasses[size]} ${palette.bg}`}
      title={name || email}
    >
      {getInitials(textSource)}
    </div>
  )
}
