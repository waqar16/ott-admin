'use client'

import React from 'react'
import { Skeleton } from './Skeleton'

export function SettingsSkeleton() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto" aria-label="Loading settings">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-4 border-b border-slate-200/80 dark:border-neutral-800/80">
        <Skeleton className="h-8 w-56 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Tabs navigation skeleton */}
      <div className="flex gap-2 border-b border-slate-200/80 dark:border-neutral-800/80 pb-2 overflow-x-auto">
        {['General', 'Branding', 'Features', 'Security', 'Billing'].map((tab) => (
          <Skeleton key={tab} className="h-9 w-24 rounded-lg flex-shrink-0" />
        ))}
      </div>

      {/* Settings Form Card */}
      <div className="bg-white dark:bg-neutral-900/50 border border-slate-200/80 dark:border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-3.5 w-72 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Upload box skeleton */}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-32 rounded" />
          <div className="border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-neutral-800">
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export default SettingsSkeleton
