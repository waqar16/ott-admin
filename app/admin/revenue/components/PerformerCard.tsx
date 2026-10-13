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
  currency?: string
}

export const PerformerCard: React.FC<PerformerCardProps> = ({
  type,
  performer,
  currency = 'GBP',
}) => {
  const isTop = type === 'top'

  const title = isTop ? 'Top Performer' : 'Lowest Performer'
  const badgeText = isTop ? 'Highest Views' : 'Needs Optimization'
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

  const name = performer?.creator_name || 'URview Creator'

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${borderStyles} ${bgStyles} p-5 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between`}
    >
      <div>
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </span>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeStyles}`}
          >
            {badgeText}
          </span>
        </div>

        {/* Creator Info */}
        <div className="mt-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
            {getInitials(name)}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate">{name}</h3>
            <span className="text-xs text-muted-foreground">
              {Number(performer?.percentage_of_total_views ?? 0).toFixed(1)}% of Platform Views
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border/40">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <FiEye className="w-3 h-3 text-primary" /> Unique Views
            </span>
            <div className="text-xl font-extrabold text-foreground">
              {formatNumber(performer?.unique_views ?? 0)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <FiDollarSign className="w-3 h-3 text-emerald-500" /> Payout Due
            </span>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(performer?.earning ?? 0)}
            </div>
          </div>
        </div>

        {/* Top Content List */}
        {performer?.top_contents && performer.top_contents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FiFilm className="w-3 h-3 text-primary" /> Top Performing Content
            </span>
            <div className="space-y-1.5">
              {performer.top_contents.slice(0, 3).map((item) => (
                <div
                  key={item.content_id}
                  className="flex items-center justify-between text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/40"
                >
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-semibold shrink-0">
                    {formatNumber(item.views)} views
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
