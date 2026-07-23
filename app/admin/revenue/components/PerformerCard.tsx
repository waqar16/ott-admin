'use client'

import React from 'react'
import { Performer } from '../types'
import {
  FiAward,
  FiTrendingDown,
  FiTrendingUp,
  FiFilm,
  FiDollarSign,
  FiEye,
  FiPieChart,
} from 'react-icons/fi'

interface PerformerCardProps {
  type: 'top' | 'lowest'
  performer: Performer
}

export const PerformerCard: React.FC<PerformerCardProps> = ({ type, performer }) => {
  const isTop = type === 'top'

  const title = isTop ? 'Top Performer' : 'Lowest Performer'
  const badgeText = isTop ? 'Top Revenue' : 'Needs Optimization'
  const Icon = isTop ? FiAward : FiTrendingDown

  const borderStyles = isTop
    ? 'border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50'
    : 'border-amber-500/30 dark:border-amber-500/20 hover:border-amber-500/50'

  const bgStyles = isTop
    ? 'bg-gradient-to-br from-emerald-500/5 via-card to-card'
    : 'bg-gradient-to-br from-amber-500/5 via-card to-card'

  const badgeStyles = isTop
    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'

  const iconBg = isTop
    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const creatorName = performer.creator_name || 'UrView Creator'

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${borderStyles} ${bgStyles} p-5 shadow-sm transition-all duration-200 hover:shadow-md space-y-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Creator analytics highlight</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyles}`}
        >
          {isTop ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
          {badgeText}
        </span>
      </div>

      {/* Creator Summary Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/50 border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
            {getInitials(creatorName)}
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground tracking-tight">
              {creatorName}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <FiEye className="w-3.5 h-3.5 text-primary" /> {formatNumber(performer.unique_views)}{' '}
                views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiPieChart className="w-3.5 h-3.5 text-primary" />{' '}
                {performer.percentage_of_total_views}% share
              </span>
            </div>
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
          <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block">
            Earning
          </span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(performer.earning)}
          </span>
        </div>
      </div>

      {/* Top Contents Section */}
      {performer.top_contents && performer.top_contents.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Top Performing Content</span>
            <span>{performer.top_contents.length} Titles</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {performer.top_contents.map((content) => (
              <div
                key={content.content_id}
                className="flex items-center justify-between gap-2 text-xs bg-card hover:bg-accent/80 border border-border/60 p-2.5 rounded-lg transition-all duration-150 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <FiFilm className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-foreground truncate">{content.title}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-accent text-muted-foreground text-[11px] font-semibold shrink-0">
                  {formatNumber(content.views)} views
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
