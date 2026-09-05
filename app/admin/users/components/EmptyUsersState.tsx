'use client'

import React from 'react'
import { FiRefreshCw, FiUsers } from 'react-icons/fi'

interface EmptyUsersStateProps {
  onRefresh?: () => void
  hasQuery?: boolean
  onClearQuery?: () => void
}

export const EmptyUsersState: React.FC<EmptyUsersStateProps> = ({
  onRefresh,
  hasQuery,
  onClearQuery,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/50 shadow-sm space-y-4 my-6">
      <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner">
        <FiUsers className="w-8 h-8" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">No Users Found</h3>
        <p className="text-sm text-muted-foreground">
          {hasQuery
            ? 'No user accounts match your search query or filter selection. Try adjusting your search term.'
            : 'There are currently no user accounts available in the platform.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {hasQuery && onClearQuery && (
          <button
            onClick={onClearQuery}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer"
          >
            Clear Search
          </button>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Refresh List</span>
          </button>
        )}
      </div>
    </div>
  )
}
