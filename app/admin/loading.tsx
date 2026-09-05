import React from 'react'
import SkeletonLoader from '@/components/Loader/SkeletonLoader'

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Top progress bar (shimmer) */}
      <div className="fixed top-0 left-0 right-0 h-1 overflow-hidden bg-slate-100 dark:bg-neutral-800 z-50">
        <div className="h-full w-1/3 bg-[#1C4D8D] rounded-full animate-shimmer-progress" />
      </div>

      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <SkeletonLoader className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        <SkeletonLoader className="h-4 w-72 bg-neutral-100 dark:bg-neutral-900 rounded-md animate-pulse" />
      </div>

      {/* Grid of stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 space-y-3"
          >
            <SkeletonLoader className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
            <SkeletonLoader className="h-8 w-16 bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table/Content Skeleton */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 space-y-4">
        <SkeletonLoader className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <SkeletonLoader
              key={idx}
              className="h-10 w-full bg-neutral-100 dark:bg-neutral-900 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
