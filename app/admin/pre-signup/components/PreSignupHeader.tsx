'use client'

import React from 'react'
import { FiRefreshCw, FiSliders, FiUserCheck, FiUsers } from 'react-icons/fi'
import { leagueSpartan } from '@/fonts/fonts'
import { PreSignupSettings } from '@/lib/preSignupApi'

interface PreSignupHeaderProps {
  settings: PreSignupSettings | null
  loading: boolean
  onRefresh: () => void
  onOpenSettings: () => void
  onOpenPromote: () => void
}

export const PreSignupHeader: React.FC<PreSignupHeaderProps> = ({
  settings,
  loading,
  onRefresh,
  onOpenSettings,
  onOpenPromote,
}) => {
  const isEnabled = settings?.pre_signup_enabled ?? false

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/70 pb-5">
      {/* Title and Status Information */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight text-foreground ${leagueSpartan.className}`}
          >
            Pre-Signup & Waitlist
          </h1>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                isEnabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isEnabled ? 'Launch Trial Active' : 'Pre-Signup Paused'}
            </span>

            {settings?.pre_signup_trial_plan_name && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                {settings.pre_signup_trial_plan_name} ({settings.pre_signup_trial_days} days)
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Manage launch pre-registration cohorts, trial capacity quotas, and automatic FIFO waitlist
          conversion pipelines.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-accent text-foreground border border-border transition-all duration-200 disabled:opacity-60 cursor-pointer shadow-sm"
          title="Refresh live metrics"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <button
          onClick={onOpenPromote}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        >
          <FiUserCheck className="w-3.5 h-3.5" />
          <span>Promote Batch</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        >
          <FiSliders className="w-3.5 h-3.5" />
          <span>Adjust Quota</span>
        </button>
      </div>
    </div>
  )
}
