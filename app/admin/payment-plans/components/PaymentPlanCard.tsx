'use client'

import React from 'react'
import { PaymentPlan } from '@/lib/types/content'
import {
  FiCalendar,
  FiEdit2,
  FiRefreshCw,
  FiSmartphone,
  FiTrash2,
  FiTv,
  FiUsers,
  FiCheckCircle,
} from 'react-icons/fi'
import { LuPoundSterling } from 'react-icons/lu'

interface PaymentPlanCardProps {
  plan: PaymentPlan
  onEditClick: (plan: PaymentPlan) => void
  onDeleteClick: (plan: PaymentPlan) => void
  redirectingPlanId?: string | null
}

export const PaymentPlanCard: React.FC<PaymentPlanCardProps> = ({
  plan,
  onEditClick,
  onDeleteClick,
  redirectingPlanId,
}) => {
  const isRedirecting = redirectingPlanId === plan.id

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 group">
      {/* Top Bar Badges & Actions */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Chip */}
            {plan.is_active ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                Inactive
              </span>
            )}

            {/* Premium Badge */}
            {plan.can_access_premium && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <LuPoundSterling className="w-3 h-3" /> Premium
              </span>
            )}

            {/* Ad Model Badge */}
            {plan.ad_supported ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <FiTv className="w-3 h-3" /> Ads
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                <FiCheckCircle className="w-3 h-3" /> Ad-Free
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEditClick(plan)}
              disabled={isRedirecting}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
              title="Edit Plan"
            >
              {isRedirecting ? (
                <FiRefreshCw className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <FiEdit2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onDeleteClick(plan)}
              className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete Plan"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Plan Header & Description */}
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {plan.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
            {plan.description || 'Comprehensive streaming plan with custom features.'}
          </p>
        </div>

        {/* Price Tag */}
        <div className="pt-2 pb-1 border-y border-border/40 flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-foreground">
            {formatPrice(plan.price)}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">
            / {plan.duration_days} days
          </span>
        </div>

        {/* Structured Feature Rows */}
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <FiCalendar className="w-3.5 h-3.5 text-primary" /> Duration
            </span>
            <span className="font-semibold text-foreground">{plan.duration_days} Days</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <FiSmartphone className="w-3.5 h-3.5 text-primary" /> Max Devices
            </span>
            <span className="font-semibold text-foreground">{plan.max_devices} Screens</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <FiUsers className="w-3.5 h-3.5 text-primary" /> Profiles Limit
            </span>
            <span className="font-semibold text-foreground">{plan.max_profiles || 1} Profiles</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <LuPoundSterling className="w-3.5 h-3.5 text-primary" /> Premium Access
            </span>
            <span
              className={`font-semibold ${plan.can_access_premium
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
                }`}
            >
              {plan.can_access_premium ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <FiTv className="w-3.5 h-3.5 text-primary" /> Ad Experience
            </span>
            <span className="font-semibold text-foreground">
              {plan.ad_supported ? 'Ad-Supported' : 'Ad-Free'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPlanCard
