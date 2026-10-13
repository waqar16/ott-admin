'use client'

import React from 'react'
import { Section1TotalIn, Section2CreatorRevenue, SummaryData } from '../types'
import {
  FiDollarSign,
  FiPieChart,
  FiEye,
  FiUsers,
  FiShield,
  FiLayers,
  FiTrendingUp,
  FiHelpCircle,
} from 'react-icons/fi'

interface PlatformInflowSectionProps {
  section1?: Section1TotalIn
  section2?: Section2CreatorRevenue
  summary?: SummaryData
}

export const PlatformInflowSection: React.FC<PlatformInflowSectionProps> = ({
  section1,
  section2,
  summary,
}) => {
  const currencyCode = section1?.currency || summary?.currency || 'GBP'

  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null) return `£0.00`
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return `£0.00`
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
    } catch {
      return `${num.toFixed(2)} ${currencyCode}`
    }
  }

  const formatNumber = (val?: number | string) => {
    if (val === undefined || val === null) return '0'
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }

  // Derive values from section1 or fallback to summary
  const grossRevenue = section1?.gross_revenue ?? summary?.total_revenue ?? 0
  const creatorSharePct =
    section1?.creator_share_percentage ?? summary?.creator_share_percentage ?? 30.0
  const platformRetainedPct =
    section1?.platform_costs_and_margin_percentage ?? 100 - creatorSharePct
  const creatorPool =
    section1?.creator_revenue_pool ??
    section2?.creator_revenue_pool ??
    summary?.creator_revenue_pool ??
    0
  const platformRetained =
    section1?.platform_retained_revenue ?? summary?.platform_retained_revenue ?? 0
  const totalViews =
    section1?.total_unique_views ?? summary?.total_unique_views ?? section2?.total_unique_views ?? 0
  const unassignedViews = section1?.unassigned_views ?? 0
  const totalCreators = section2?.total_creators ?? summary?.total_creators ?? 0
  const avgViewsPerCreator =
    section2?.avg_views_per_creator ?? summary?.avg_views_per_creator ?? 0

  return (
    <div className="space-y-6">
      {/* SECTION 1: PLATFORM GROSS INFLOW */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Section 1
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {section1?.title || 'Platform Gross Inflow'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Master inflow accounting: Gross revenues, platform operating margins, and creator pool allocation
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border border-border/60 self-start sm:self-auto">
            <span>Currency:</span>
            <strong className="text-foreground font-semibold uppercase">{currencyCode}</strong>
          </div>
        </div>

        {/* Section 1 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Revenue */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Gross Platform Revenue</span>
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <FiDollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {formatCurrency(grossRevenue)}
            </div>
            <p className="text-[11px] text-muted-foreground">Total platform earnings this period</p>
          </div>

          {/* Platform Retained (70%) */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Platform Retained ({platformRetainedPct.toFixed(1)}%)</span>
              <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <FiShield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatCurrency(platformRetained)}
            </div>
            <p className="text-[11px] text-muted-foreground">Operational overhead & URview margin</p>
          </div>

          {/* Creator Revenue Pool (30%) */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Creator Pool ({creatorSharePct.toFixed(1)}%)</span>
              <div className="p-2 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400">
                <FiLayers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {formatCurrency(creatorPool)}
            </div>
            <p className="text-[11px] text-muted-foreground">Total distributable royalty pool</p>
          </div>

          {/* Total Unique Views */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Platform Unique Views</span>
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <FiEye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {formatNumber(totalViews)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {unassignedViews > 0
                ? `${formatNumber(unassignedViews)} unassigned views`
                : 'All views attributed to creators'}
            </p>
          </div>
        </div>

        {/* Visual Revenue Split Bar */}
        <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/60">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Platform Costs & Margin: {platformRetainedPct.toFixed(1)}% ({formatCurrency(platformRetained)})</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Creator Revenue Pool: {creatorSharePct.toFixed(1)}% ({formatCurrency(creatorPool)})</span>
            </div>
          </div>

          <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.min(Math.max(platformRetainedPct, 5), 95)}%` }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-full transition-all duration-500"
              title={`Platform Retained: ${platformRetainedPct}%`}
            />
            <div
              style={{ width: `${Math.min(Math.max(creatorSharePct, 5), 95)}%` }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-500"
              title={`Creator Pool: ${creatorSharePct}%`}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: CREATOR REVENUE POOL METRICS */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Section 2
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
              {section2?.title || 'Creator Revenue Pool Distribution'}
            </h3>
          </div>

          <span className="text-xs text-muted-foreground italic">
            {section2?.pool_label || `${creatorSharePct.toFixed(1)}% of Total In (100% of Distributable Pool)`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-1">
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Distributable Pool
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(creatorPool)}
            </div>
            <p className="text-[11px] text-muted-foreground">Treated as 100% payout base</p>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Monetized Creators
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(totalCreators)}
            </div>
            <p className="text-[11px] text-muted-foreground">Eligible creators this cycle</p>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avg. Views / Creator
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(avgViewsPerCreator)}
            </div>
            <p className="text-[11px] text-muted-foreground">Platform average audience ratio</p>
          </div>
        </div>
      </div>
    </div>
  )
}
