'use client'

import React from 'react'
import { FiPieChart, FiUsers, FiCheckCircle, FiClock, FiLayers } from 'react-icons/fi'
import { PreSignupAnalytics } from '@/lib/preSignupApi'

interface PreSignupQuotaCardProps {
  analytics: PreSignupAnalytics | null
  onOpenSettings: () => void
}

export const PreSignupQuotaCard: React.FC<PreSignupQuotaCardProps> = ({
  analytics,
  onOpenSettings,
}) => {
  const quota = analytics?.quota

  const capacity = quota?.capacity ?? 0
  const currentCohort = quota?.current_cohort_size ?? 0
  const remaining = quota?.remaining_capacity ?? 0
  const fillPercentage = quota?.capacity_fill_percentage ?? 0
  const trialDays = quota?.trial_days ?? 0
  const trialPlanName = quota?.trial_plan_name ?? 'Pre-registration Trial'

  // Determine gauge color based on fill level
  const getFillColor = () => {
    if (fillPercentage >= 95) return 'bg-rose-500 text-rose-500'
    if (fillPercentage >= 80) return 'bg-amber-500 text-amber-500'
    return 'bg-blue-600 text-blue-600'
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
      {/* Background soft glow accent */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        {/* Header line */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <FiPieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Cohort Capacity & Fill Gauge</h2>
              <p className="text-xs text-muted-foreground">Current pre-signup trial allocation</p>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="text-xs font-semibold text-primary hover:underline hover:text-primary/90 transition-colors"
          >
            Edit Quota
          </button>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
          {/* Current Active Cohort */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Trialing Users</span>
              <FiUsers className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">
              {currentCohort.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              of {capacity.toLocaleString()} max
            </div>
          </div>

          {/* Remaining Capacity */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Available Slots</span>
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {remaining.toLocaleString()}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">unallocated slots</div>
          </div>

          {/* Fill Percentage */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Fill Percentage</span>
              <FiLayers className="w-3.5 h-3.5" />
            </div>
            <div className={`text-2xl font-extrabold ${getFillColor().split(' ')[1]}`}>
              {fillPercentage.toFixed(1)}%
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">capacity filled</div>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="space-y-1.5 mt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-foreground">Quota Utilization</span>
            <span className="text-muted-foreground font-mono">
              {currentCohort} / {capacity}
            </span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                getFillColor().split(' ')[0]
              }`}
              style={{ width: `${Math.min(100, Math.max(0, fillPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <FiClock className="w-3.5 h-3.5 text-primary" />
          <span>
            {trialPlanName}: <strong className="text-foreground">{trialDays} Days Duration</strong>
          </span>
        </div>
        <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
          Auto-Promote on capacity increase
        </span>
      </div>
    </div>
  )
}
