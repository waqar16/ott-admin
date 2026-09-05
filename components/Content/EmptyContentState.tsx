'use client'

import React from 'react'
import { FiFilm, FiPlus } from 'react-icons/fi'

interface EmptyContentStateProps {
  onCreateNew: () => void
  hasFilters?: boolean
  onClearFilters?: () => void
}

export const EmptyContentState: React.FC<EmptyContentStateProps> = ({
  onCreateNew,
  hasFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border bg-card/50 shadow-sm space-y-4 my-6">
      <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner">
        <FiFilm className="w-8 h-8" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          No Content Found
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? 'No video assets match your active search filters. Try clearing or broadening your filter criteria.'
            : 'There are currently no video assets created in this catalog section.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        )}

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Create First Content</span>
        </button>
      </div>
    </div>
  )
}

export default EmptyContentState
