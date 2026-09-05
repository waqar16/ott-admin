'use client'

import React from 'react'
import { FiHelpCircle, FiPlus, FiRefreshCw } from 'react-icons/fi'

interface EmptyFaqStateProps {
  onAddFaq?: () => void
  hasQuery?: boolean
  onClearQuery?: () => void
}

export const EmptyFaqState: React.FC<EmptyFaqStateProps> = ({
  onAddFaq,
  hasQuery,
  onClearQuery,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-card/50 shadow-sm space-y-4 my-6">
      <div className="p-4 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-inner">
        <FiHelpCircle className="w-8 h-8" />
      </div>

      <div className="max-w-sm space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">No FAQs Found</h3>
        <p className="text-sm text-muted-foreground">
          {hasQuery
            ? 'No FAQs match your search keywords or filter selection. Try adjusting your query or resetting filters.'
            : 'There are currently no frequently asked questions available in the knowledge base.'}
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

        {onAddFaq && (
          <button
            onClick={onAddFaq}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Add First FAQ</span>
          </button>
        )}
      </div>
    </div>
  )
}
