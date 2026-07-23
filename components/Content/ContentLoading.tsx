'use client'

import React from 'react'

export const ContentLoading: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse my-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="w-9 h-9 bg-muted rounded-xl" />
            </div>
            <div className="h-8 w-16 bg-muted rounded-md" />
            <div className="h-3 w-36 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-muted rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-10 bg-muted rounded-xl" />
          <div className="h-10 bg-muted rounded-xl" />
          <div className="h-10 bg-muted rounded-xl" />
          <div className="h-10 bg-muted rounded-xl" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="h-40 w-full bg-muted rounded-xl" />
            <div className="h-6 w-3/4 bg-muted rounded-md" />
            <div className="h-4 w-full bg-muted/60 rounded" />
            <div className="flex gap-2 pt-2">
              <div className="h-5 w-16 bg-muted/80 rounded-full" />
              <div className="h-5 w-16 bg-muted/80 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ContentLoading
