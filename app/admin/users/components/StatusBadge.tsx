'use client'

import React from 'react'

interface StatusBadgeProps {
  isActive?: boolean
  status?: 'active' | 'banned' | 'suspended' | string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isActive, status }) => {
  const normalizedStatus = (status || (isActive ? 'active' : 'inactive')).toLowerCase().trim()

  if (normalizedStatus === 'banned') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Banned
      </span>
    )
  }

  if (normalizedStatus === 'suspended') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Suspended
      </span>
    )
  }

  if (isActive === false || normalizedStatus === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
        Inactive
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  )
}
