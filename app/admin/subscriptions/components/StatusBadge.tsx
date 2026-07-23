'use client'

import React from 'react'

interface StatusBadgeProps {
  status: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = (status || '').toLowerCase()

  switch (normalizedStatus) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      )
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Expired
        </span>
      )
    case 'cancelled':
    case 'canceled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Cancelled
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border capitalize">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          {status || 'Unknown'}
        </span>
      )
  }
}

export default StatusBadge
