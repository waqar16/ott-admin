'use client'

import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface SubscriptionPaginationProps {
  page: number
  count: number
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export const SubscriptionPagination: React.FC<SubscriptionPaginationProps> = ({
  page,
  count,
  setPage,
}) => {
  const isNextDisabled = page * 10 >= count
  const isPrevDisabled = page === 1

  const totalPages = Math.ceil(count / 10) || 1

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
      <span className="text-xs text-muted-foreground">
        Showing Page <strong className="text-foreground">{page}</strong> of{' '}
        <strong className="text-foreground">{totalPages}</strong> ({count} Total Subscriptions)
      </span>

      <div className="flex items-center gap-2">
        <button
          disabled={isPrevDisabled}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-foreground bg-card hover:bg-accent border border-border/80 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-accent text-accent-foreground border border-border">
          {page}
        </span>

        <button
          disabled={isNextDisabled}
          onClick={() => setPage((p) => p + 1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-foreground bg-card hover:bg-accent border border-border/80 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Next</span>
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default SubscriptionPagination
