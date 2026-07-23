'use client'

import React from 'react'
import { FiInbox, FiRefreshCw, FiSearch } from 'react-icons/fi'

interface EmptyStateProps {
  onReset?: () => void
  hasFilters?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset, hasFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/50 shadow-sm space-y-4 my-6">
      <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner">
        <FiInbox className="w-8 h-8" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">No Creators Found</h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? 'There are no creator analytics available for the selected date range. Try clearing or expanding your date filters.'
            : 'There are currently no creator revenue records available to display.'}
        </p>
      </div>

      {hasFilters && onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  )
}
