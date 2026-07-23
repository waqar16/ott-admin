'use client'

import React from 'react'

export const PaymentPlansSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted rounded-lg" />
          <div className="h-4 w-80 bg-muted/70 rounded-md" />
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

      {/* Filters Skeleton */}
      <div className="bg-card border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-muted rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 h-10 bg-muted rounded-lg" />
          <div className="lg:col-span-4 h-10 bg-muted rounded-lg" />
          <div className="lg:col-span-4 h-10 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Pricing Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 w-20 bg-muted/80 rounded-full" />
              <div className="h-8 w-16 bg-muted rounded-lg" />
            </div>
            <div className="h-7 w-40 bg-muted rounded-md" />
            <div className="h-4 w-full bg-muted/60 rounded" />
            <div className="h-10 w-28 bg-muted rounded-lg" />
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="h-4 w-full bg-muted/50 rounded" />
              <div className="h-4 w-full bg-muted/50 rounded" />
              <div className="h-4 w-full bg-muted/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PaymentPlansSkeleton
