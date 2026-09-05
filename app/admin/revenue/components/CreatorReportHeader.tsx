'use client'

import React from 'react'
import { FiDownload, FiFileText, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'

interface CreatorReportHeaderProps {
  onDownload: () => void
  downloadLoading: boolean
}

export const CreatorReportHeader: React.FC<CreatorReportHeaderProps> = ({
  onDownload,
  downloadLoading,
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Creator Revenue Report
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <FiTrendingUp className="w-3 h-3" /> Real-time
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Analytics and revenue distribution for all platform creators.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onDownload}
          disabled={downloadLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
        >
          {downloadLoading ? (
            <>
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Excel...</span>
            </>
          ) : (
            <>
              <FiDownload className="w-4 h-4" />
              <span>Export Excel Report</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
