'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { FiPlus, FiFilm } from 'react-icons/fi'

interface ContentHeaderProps {
  handleCreateNew: () => void
  totalCount?: number
}

const ContentHeaderComponent: React.FC<ContentHeaderProps> = ({
  handleCreateNew,
  totalCount = 0,
}) => {
  const pathname = usePathname()

  const contentTypeTitle = pathname.includes('movie-management')
    ? 'Movie'
    : pathname.includes('show-management')
      ? 'Show'
      : pathname.includes('trailer-management')
        ? 'Trailer'
        : pathname.includes('documentary-management')
          ? 'Documentary'
          : pathname.includes('series-management')
            ? 'Series'
            : 'Content'

  return (
    <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                {contentTypeTitle} Management
              </h1>
              {totalCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <FiFilm className="w-3 h-3" /> {totalCount} Items
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Create, transcode, publish, and manage {contentTypeTitle.toLowerCase()} video assets and metadata.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm cursor-pointer shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add New {contentTypeTitle}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContentHeaderComponent
