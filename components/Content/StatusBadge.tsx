'use client'

import React from 'react'

interface StatusBadgeProps {
  status?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toLowerCase()

  switch (normalized) {
    case 'published':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Published
        </span>
      )
    case 'ready':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Ready
        </span>
      )
    case 'processing':
    case 'uploading':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin" />
          {normalized}
        </span>
      )
    case 'inactive':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Inactive
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Failed
        </span>
      )
    case 'draft':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          {status || 'Draft'}
        </span>
      )
  }
}

export default StatusBadge
