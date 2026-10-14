'use client'

import React from 'react'
import { Skeleton } from './Skeleton'

interface TablePageSkeletonProps {
  title?: string
  statCardsCount?: number
  rowsCount?: number
}

export function TablePageSkeleton({
  title = 'Manage Items',
  statCardsCount = 4,
  rowsCount = 6,
}: TablePageSkeletonProps) {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto" aria-label="Loading data">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-neutral-800/80">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      {statCardsCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: statCardsCount }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-neutral-900/50 border border-slate-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="w-9 h-9 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter Toolbar Skeleton */}
      <div className="bg-white dark:bg-neutral-900/50 border border-slate-200/80 dark:border-neutral-800/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
          <div className="flex gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Data Table Skeleton */}
      <div className="bg-white dark:bg-neutral-900/50 border border-slate-200/80 dark:border-neutral-800/80 rounded-2xl p-5 shadow-xs space-y-4 overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: rowsCount }).map((_, row) => (
            <div
              key={row}
              className="h-14 w-full flex items-center justify-between px-4 rounded-xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-100 dark:border-neutral-850 gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TablePageSkeleton
