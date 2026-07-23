'use client'

import React, { useState } from 'react'
import { FiLayers, FiRefreshCw } from 'react-icons/fi'

interface SubscriptionHeaderProps {
  onRefresh: () => void
  loading: boolean
  totalSubscriptionsCount: number
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({
  onRefresh,
  loading,
  totalSubscriptionsCount,
}) => {
  const [lastUpdated, setLastUpdated] = useState<string>('Just now')

  const handleRefreshClick = () => {
    onRefresh()
    const now = new Date()
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            User Subscriptions
          </h1>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <FiLayers className="w-3.5 h-3.5" /> {totalSubscriptionsCount} Total
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage customer subscription plans, active tiers, and billing periods.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden lg:inline-block text-xs text-muted-foreground">
          Updated: <span className="font-medium text-foreground">{lastUpdated}</span>
        </span>

        <button
          onClick={handleRefreshClick}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg text-foreground bg-card hover:bg-accent border border-border/80 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer group"
          title="Refresh Subscriptions"
        >
          <FiRefreshCw
            className={`w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ${
              loading ? 'animate-spin text-primary' : ''
            }`}
          />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
    </div>
  )
}

export default SubscriptionHeader
