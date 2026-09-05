'use client'

import React from 'react'
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertCircle,
  FiBell,
} from 'react-icons/fi'
import { PreSignupAnalytics } from '@/lib/preSignupApi'

interface PreSignupWaitlistHealthCardProps {
  analytics: PreSignupAnalytics | null
  onOpenPromote: () => void
}

export const PreSignupWaitlistHealthCard: React.FC<PreSignupWaitlistHealthCardProps> = ({
  analytics,
  onOpenPromote,
}) => {
  const waitlist = analytics?.waitlist

  const total = waitlist?.total_entries ?? 0
  const pending = waitlist?.pending ?? 0
  const converted = waitlist?.converted ?? 0
  const notified = waitlist?.notified ?? 0
  const expired = waitlist?.expired ?? 0
  const conversionRate = waitlist?.conversion_rate_percentage ?? 0

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header line */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Waitlist Health & Funnel</h2>
              <p className="text-xs text-muted-foreground">Queue throughput & conversion metrics</p>
            </div>
          </div>

          <button
            onClick={onOpenPromote}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            Promote Batch
          </button>
        </div>

        {/* Breakdown Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          {/* Total Waitlist Entries */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Total Joined</span>
              <FiUsers className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-foreground">{total.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">all-time entries</div>
          </div>

          {/* Pending in Queue */}
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 mb-1">
              <span>Waiting (Pending)</span>
              <FiClock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {pending.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">FIFO queue</div>
          </div>

          {/* Converted to Trial */}
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
              <span>Converted</span>
              <FiCheckCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {converted.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">granted trial</div>
          </div>

          {/* Conversion Rate */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Success Rate</span>
              <FiTrendingUp className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {conversionRate.toFixed(1)}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">conversion rate</div>
          </div>
        </div>

        {/* Secondary status chips */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px]">
            <FiBell className="w-3 h-3 text-blue-500" />
            Notified: <strong className="text-foreground">{notified}</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted border border-border text-[11px]">
            <FiAlertCircle className="w-3 h-3 text-slate-400" />
            Expired: <strong className="text-foreground">{expired}</strong>
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
        <span>Oldest pending users are granted trial first (FIFO order).</span>
        <button
          onClick={onOpenPromote}
          className="text-xs font-medium text-primary hover:underline"
        >
          Promote {pending > 0 ? `${Math.min(pending, 25)} users` : 'Next'} &rarr;
        </button>
      </div>
    </div>
  )
}
