'use client'

import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface ContentPaginationProps {
  page: number
  hasPrev: boolean
  hasNext: boolean
  totalCount?: number
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export const ContentPagination: React.FC<ContentPaginationProps> = ({
  page,
  hasPrev,
  hasNext,
  totalCount,
  setPage,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/60">
      <span className="text-xs text-muted-foreground">
        Showing Page <strong className="text-foreground">{page}</strong>
        {totalCount ? (
          <>
            {' '}
            of <strong className="text-foreground">{Math.ceil(totalCount / 10) || 1}</strong> ({totalCount} Items)
          </>
        ) : null}
      </span>

      <div className="flex items-center gap-2">
        <button
          disabled={!hasPrev}
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
          disabled={!hasNext}
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

export default ContentPagination
