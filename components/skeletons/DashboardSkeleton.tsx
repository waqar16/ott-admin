'use client'

import React from 'react'
import { Skeleton } from './Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-2 md:p-4 max-w-7xl mx-auto" aria-label="Loading dashboard overview">
      {/* Welcome Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Hero KPI Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Dynamic Dashboard Panels Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panels: Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <div className="h-[260px] w-full flex items-end gap-3 pt-6 pb-2">
              {[45, 65, 30, 80, 55, 90, 70, 85, 60, 75, 95, 60].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                  <div
                    className="w-full bg-slate-200 dark:bg-neutral-800/80 rounded-t-md animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                  <Skeleton className="h-2 w-full rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sub Panels */}
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-36" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-[160px] rounded-xl" />
              <Skeleton className="h-[160px] rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Panel: Side summary list */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl">
                  <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
