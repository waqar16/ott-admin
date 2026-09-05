'use client'

import React from 'react'

export const FaqTableSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted/70 rounded-md" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="w-9 h-9 bg-muted rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-muted rounded-md" />
            <div className="h-3 w-36 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="h-10 w-full sm:w-80 bg-muted/80 rounded-lg" />
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="h-8 w-20 bg-muted rounded-lg" />
            <div className="h-8 w-20 bg-muted rounded-lg" />
            <div className="h-8 w-20 bg-muted rounded-lg" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-36 bg-muted rounded-md" />
          <div className="h-6 w-20 bg-muted/70 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-16 w-full bg-muted/40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
