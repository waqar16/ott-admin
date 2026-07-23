'use client'

import React, { useState } from 'react'
import { FiHelpCircle, FiPlus, FiRefreshCw } from 'react-icons/fi'

interface FaqPageHeaderProps {
  onRefresh: () => void
  onAddFaq: () => void
  loading: boolean
  totalFaqsCount: number
}

export const FaqPageHeader: React.FC<FaqPageHeaderProps> = ({
  onRefresh,
  onAddFaq,
  loading,
  totalFaqsCount,
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
            FAQs Management
          </h1>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <FiHelpCircle className="w-3 h-3" /> {totalFaqsCount} FAQs
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage frequently asked questions and answers published to user support portals.
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
          title="Refresh FAQ Data"
        >
          <FiRefreshCw
            className={`w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors ${
              loading ? 'animate-spin text-primary' : ''
            }`}
          />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        <button
          onClick={onAddFaq}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add FAQ</span>
        </button>
      </div>
    </div>
  )
}
