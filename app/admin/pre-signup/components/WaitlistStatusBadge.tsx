'use client'

import React from 'react'
import { FiClock, FiCheckCircle, FiBell, FiAlertCircle } from 'react-icons/fi'
import { WaitlistStatus } from '@/lib/preSignupApi'

interface WaitlistStatusBadgeProps {
  status: WaitlistStatus | string
}

export const WaitlistStatusBadge: React.FC<WaitlistStatusBadgeProps> = ({ status }) => {
  const norm = (status || '').toLowerCase()

  switch (norm) {
    case 'converted':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <FiCheckCircle className="w-3 h-3" />
          <span>Converted</span>
        </span>
      )

    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <FiClock className="w-3 h-3" />
          <span>Pending</span>
        </span>
      )

    case 'notified':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <FiBell className="w-3 h-3" />
          <span>Notified</span>
        </span>
      )

    case 'expired':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
          <FiAlertCircle className="w-3 h-3" />
          <span>Expired</span>
        </span>
      )

    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
          <span>{status}</span>
        </span>
      )
  }
}
