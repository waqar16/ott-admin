'use client'

import React from 'react'
import Link from 'next/link'
import { FiCreditCard, FiPlus, FiRefreshCw } from 'react-icons/fi'

interface EmptyPlansStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export const EmptyPlansState: React.FC<EmptyPlansStateProps> = ({
  hasFilters,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/50 shadow-sm space-y-4 my-6">
      <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner">
        <FiCreditCard className="w-8 h-8" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          No Payment Plans Found
        </h3>
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? 'No plans match your current search terms or filter selections. Try clearing or expanding your filter parameters.'
            : 'There are currently no subscription payment plans configured in the platform.'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        )}

        <Link
          href="/admin/payment-plans/add"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>New Payment Plan</span>
        </Link>
      </div>
    </div>
  )
}

export default EmptyPlansState
