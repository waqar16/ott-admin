'use client'

import React from 'react'

export const RevenueSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-lg" />
          <div className="h-4 w-80 bg-muted/70 rounded-md" />
        </div>
        <div className="h-10 w-44 bg-muted rounded-lg" />
      </div>

      {/* Filter Card Skeleton */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-muted rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
          <div className="lg:col-span-4 space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-full bg-muted/80 rounded-lg" />
          </div>
          <div className="lg:col-span-4 space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 w-full bg-muted/80 rounded-lg" />
          </div>
          <div className="lg:col-span-4 flex gap-2">
            <div className="h-10 flex-1 bg-muted rounded-lg" />
            <div className="h-10 w-20 bg-muted rounded-lg" />
          </div>
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="w-9 h-9 bg-muted rounded-xl" />
            </div>
            <div className="h-8 w-36 bg-muted rounded-md" />
            <div className="h-3 w-44 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Performers Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-36 bg-muted rounded-md" />
              <div className="h-6 w-28 bg-muted/70 rounded-full" />
            </div>
            <div className="h-20 w-full bg-muted/60 rounded-xl" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-10 bg-muted/80 rounded-lg" />
              <div className="h-10 bg-muted/80 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Creator Table Skeleton */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="h-6 w-24 bg-muted/70 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-14 w-full bg-muted/40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
