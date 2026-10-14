'use client'

import React from 'react'
import { Skeleton } from './Skeleton'

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 p-2 md:p-4 max-w-7xl mx-auto" aria-label="Loading analytics">
      {/* Analytics Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-neutral-800/80">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Hero KPI Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28 uppercase" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-8 w-32 rounded-lg" />
              <Skeleton className="h-3 w-40 mt-2" />
            </div>
          </div>
        ))}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-neutral-800/80 pb-3 mt-10">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3 w-64 rounded" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900/50 p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-3 w-56 rounded" />
              </div>
              <Skeleton className="h-6 w-6 rounded-lg" />
            </div>

            {/* Simulated Chart Wave/Bars */}
            <div className="h-60 w-full flex items-end gap-3 pt-6 pb-2 px-2">
              {[35, 60, 45, 75, 50, 85, 65, 95, 70, 80, 55, 90].map((h, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                  <div
                    className="w-full bg-slate-200/80 dark:bg-neutral-800/70 rounded-t-md animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                  <Skeleton className="h-2 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Panels Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900/50 p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 shadow-xs space-y-4"
          >
            <Skeleton className="h-5 w-32 rounded" />
            <div className="flex justify-center py-4">
              <Skeleton className="w-36 h-36 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalyticsSkeleton
