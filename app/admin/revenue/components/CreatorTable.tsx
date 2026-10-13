'use client'

import React, { useState } from 'react'
import { Performer } from '../types'
import {
  FiDollarSign,
  FiEye,
  FiFilm,
  FiFileText,
  FiDownload,
  FiUser,
  FiRefreshCw,
} from 'react-icons/fi'

interface CreatorTableProps {
  creators: Performer[]
  currency?: string
  onViewStatement: (creatorId: string, creatorName: string) => void
  onExportStatement: (creatorId: string, creatorName: string) => Promise<void>
}

export const CreatorTable: React.FC<CreatorTableProps> = ({
  creators,
  currency = 'GBP',
  onViewStatement,
  onExportStatement,
}) => {
  const [exportingId, setExportingId] = useState<string | null>(null)

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return `£0.00`
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency || 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
    } catch {
      return `${num.toFixed(2)} ${currency}`
    }
  }

  const formatNumber = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getInitials = (name?: string) => {
    if (!name) return 'UC'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const handleExport = async (id: string, name: string) => {
    try {
      setExportingId(id)
      await onExportStatement(id, name)
    } finally {
      setExportingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Section 2: Creator Revenue Breakdown
          </h2>
          <p className="text-xs text-muted-foreground">
            View counts, platform share %, royalty earnings, and individual creator statements
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border self-start sm:self-auto">
          {creators.length} Creators
        </span>
      </div>

      {/* Desktop Enterprise Table View (md+) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold tracking-wider">
                <th className="py-3.5 px-4">Creator</th>
                <th className="py-3.5 px-4 text-right">Unique Views</th>
                <th className="py-3.5 px-4 text-right">Share %</th>
                <th className="py-3.5 px-4 text-right">Earnings ({currency})</th>
                <th className="py-3.5 px-4">Top Contents</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {creators.map((creator, index) => {
                const name = creator.creator_name || 'URview Creator'
                const creatorId = creator.creator_id || String(index + 1)
                const isExporting = exportingId === creatorId

                return (
                  <tr
                    key={creatorId || index}
                    className="hover:bg-accent/40 transition-colors duration-150 group"
                  >
                    {/* Creator Info */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(name)}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground block group-hover:text-primary transition-colors">
                            {name}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {creator.creator_id ? `${creator.creator_id.slice(0, 8)}...` : `ID: #${index + 1}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 text-right align-top">
                      <span className="font-semibold text-foreground">
                        {formatNumber(creator.unique_views)}
                      </span>
                    </td>

                    {/* Share % */}
                    <td className="py-4 px-4 text-right align-top">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {Number(creator.percentage_of_total_views).toFixed(1)}%
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="py-4 px-4 text-right align-top">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(creator.earning)}
                      </span>
                    </td>

                    {/* Top Contents Chips */}
                    <td className="py-4 px-4 align-top">
                      {creator.top_contents && creator.top_contents.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {creator.top_contents.map((content) => (
                            <span
                              key={content.content_id}
                              className="inline-flex items-center gap-1.5 text-xs bg-muted hover:bg-accent/80 border border-border/60 px-2 py-0.5 rounded-md transition-colors"
                              title={content.title}
                            >
                              <FiFilm className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[120px] font-medium text-foreground">
                                {content.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                ({formatNumber(content.views)})
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No top content</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right align-top whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {creator.creator_id && (
                          <>
                            <button
                              onClick={() => onViewStatement(creator.creator_id!, name)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 border border-border transition-colors cursor-pointer"
                              title="View Confidential Royalty Statement"
                            >
                              <FiFileText className="w-3.5 h-3.5 text-primary" />
                              <span>Statement</span>
                            </button>

                            <button
                              onClick={() => handleExport(creator.creator_id!, name)}
                              disabled={isExporting}
                              className="inline-flex items-center gap-1 p-1 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent hover:border-border transition-colors cursor-pointer disabled:opacity-50"
                              title="Download Statement Excel"
                            >
                              {isExporting ? (
                                <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                              ) : (
                                <FiDownload className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View (< md) */}
      <div className="md:hidden space-y-3">
        {creators.map((creator, index) => {
          const name = creator.creator_name || 'URview Creator'
          const creatorId = creator.creator_id || String(index + 1)
          const isExporting = exportingId === creatorId

          return (
            <div
              key={creatorId || index}
              className="bg-card border border-border/80 rounded-xl p-4 shadow-sm space-y-3 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                    {getInitials(name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {Number(creator.percentage_of_total_views).toFixed(1)}% Share
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(creator.earning)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FiEye className="w-3.5 h-3.5 text-primary" /> Unique Views:
                </span>
                <span className="font-semibold text-foreground">
                  {formatNumber(creator.unique_views)}
                </span>
              </div>

              {creator.top_contents && creator.top_contents.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border/40">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Top Content
                  </span>
                  <div className="space-y-1">
                    {creator.top_contents.map((content) => (
                      <div
                        key={content.content_id}
                        className="flex items-center justify-between text-xs bg-muted/60 px-2.5 py-1.5 rounded-lg"
                      >
                        <span className="truncate max-w-[180px] text-foreground font-medium">
                          {content.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium">
                          {formatNumber(content.views)} views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {creator.creator_id && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    onClick={() => onViewStatement(creator.creator_id!, name)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-accent-foreground border border-border transition-colors cursor-pointer"
                  >
                    <FiFileText className="w-3.5 h-3.5 text-primary" />
                    <span>View Statement</span>
                  </button>

                  <button
                    onClick={() => handleExport(creator.creator_id!, name)}
                    disabled={isExporting}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:bg-accent border border-border transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <FiDownload className="w-3.5 h-3.5" />
                    )}
                    <span>Excel</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
