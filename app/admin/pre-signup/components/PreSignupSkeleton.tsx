'use client'

import React from 'react'

export const PreSignupSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded-xl" />
          <div className="h-4 w-96 bg-muted/60 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted rounded-xl" />
          <div className="h-9 w-32 bg-muted rounded-xl" />
          <div className="h-9 w-32 bg-muted rounded-xl" />
        </div>
      </div>

      {/* Top 2 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <div className="h-6 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-muted/60 rounded-xl" />
            <div className="h-20 bg-muted/60 rounded-xl" />
            <div className="h-20 bg-muted/60 rounded-xl" />
          </div>
          <div className="h-3 w-full bg-muted rounded-full" />
        </div>

        <div className="h-64 bg-card border border-border/80 rounded-2xl p-6 space-y-4">
          <div className="h-6 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-4 gap-3">
            <div className="h-20 bg-muted/60 rounded-xl" />
            <div className="h-20 bg-muted/60 rounded-xl" />
            <div className="h-20 bg-muted/60 rounded-xl" />
            <div className="h-20 bg-muted/60 rounded-xl" />
          </div>
          <div className="h-6 w-52 bg-muted rounded-md" />
        </div>
      </div>

      {/* Next In Line + Recent Conversions Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-10 bg-muted/40 rounded-xl" />
          <div className="h-10 bg-muted/40 rounded-xl" />
          <div className="h-10 bg-muted/40 rounded-xl" />
        </div>

        <div className="h-64 bg-card border border-border/80 rounded-2xl p-6 space-y-3">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-10 bg-muted/40 rounded-xl" />
          <div className="h-10 bg-muted/40 rounded-xl" />
          <div className="h-10 bg-muted/40 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="h-96 bg-card border border-border/80 rounded-2xl p-6 space-y-4">
        <div className="h-10 w-full bg-muted/60 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
      </div>
    </div>
  )
}
