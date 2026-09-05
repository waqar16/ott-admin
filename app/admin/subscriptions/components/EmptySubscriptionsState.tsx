'use client'

import React from 'react'
import { FiLayers, FiX } from 'react-icons/fi'

interface EmptySubscriptionsStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export const EmptySubscriptionsState: React.FC<EmptySubscriptionsStateProps> = ({
  hasFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 shadow-sm space-y-4 my-6">
      <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner">
        <FiLayers className="w-8 h-8" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          No Subscriptions Found
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? 'No customer subscriptions match your search parameters or filter selections. Try expanding your search terms.'
            : 'There are currently no active or historical customer subscriptions recorded in the platform.'}
        </p>
      </div>

      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  )
}

export default EmptySubscriptionsState
