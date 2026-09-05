'use client'

import React from 'react'
import { Performer } from '../types'
import { FiDollarSign, FiEye, FiFilm, FiPieChart, FiUser } from 'react-icons/fi'

interface CreatorTableProps {
  creators: Performer[]
}

export const CreatorTable: React.FC<CreatorTableProps> = ({ creators }) => {
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num)
  }

  const formatNumber = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '0'
    return new Intl.NumberFormat('en-US').format(Math.round(num))
  }

  const getInitials = (name?: string) => {
    if (!name) return 'UC'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">All Creators Breakdown</h2>
          <p className="text-xs text-muted-foreground">
            Detailed view counts, revenue shares, and content performance by creator
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border">
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
                <th className="py-3.5 px-4 text-right">Total Revenue</th>
                <th className="py-3.5 px-4">Top Contents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {creators.map((creator, index) => {
                const name = creator.creator_name || 'UrView Creator'
                return (
                  <tr
                    key={index}
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
                          <span className="text-xs text-muted-foreground">ID: #{index + 1}</span>
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
                        {creator.percentage_of_total_views}%
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
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {creator.top_contents.map((content) => (
                            <span
                              key={content.content_id}
                              className="inline-flex items-center gap-1.5 text-xs bg-muted hover:bg-accent/80 border border-border/60 px-2.5 py-1 rounded-md transition-colors"
                            >
                              <FiFilm className="w-3 h-3 text-muted-foreground shrink-0" />
                              <span className="truncate max-w-[140px] font-medium text-foreground">
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
          const name = creator.creator_name || 'UrView Creator'
          return (
            <div
              key={index}
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
                      {creator.percentage_of_total_views}% Share
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
