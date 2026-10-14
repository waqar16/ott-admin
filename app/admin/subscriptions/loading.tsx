import React from 'react'
import { SubscriptionCardSkeleton } from './components/SubscriptionCardSkeleton'

export default function SubscriptionsLoading() {
  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto" aria-label="Loading subscriptions">
      <div className="space-y-2 pb-4 border-b border-slate-200/80 dark:border-neutral-800/80">
        <div className="h-8 w-56 bg-slate-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-slate-200/70 dark:bg-neutral-850 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SubscriptionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
