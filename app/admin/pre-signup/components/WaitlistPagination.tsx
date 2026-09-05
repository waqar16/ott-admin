'use client'

import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface WaitlistPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export const WaitlistPagination: React.FC<WaitlistPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalPages <= 1) return null

  const startIdx = (currentPage - 1) * pageSize + 1
  const endIdx = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 py-3 text-xs text-muted-foreground">
      <div>
        Showing <span className="font-semibold text-foreground">{startIdx}</span> to{' '}
        <span className="font-semibold text-foreground">{endIdx}</span> of{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous Page"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Show first, last, and window around current page
          if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-xl font-medium transition-all ${
                  currentPage === p
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'bg-card border border-border text-foreground hover:bg-accent'
                }`}
              >
                {p}
              </button>
            )
          }
          if (p === currentPage - 2 || p === currentPage + 2) {
            return (
              <span key={p} className="px-1 text-muted-foreground">
                &hellip;
              </span>
            )
          }
          return null
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next Page"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
