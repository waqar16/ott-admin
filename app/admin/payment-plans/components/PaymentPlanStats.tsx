'use client'

import React from 'react'
import { PaymentPlan } from '@/lib/types/content'
import { FiCreditCard, FiCheckCircle, FiTv } from 'react-icons/fi'
import { LuBadgePoundSterling } from 'react-icons/lu'
interface PaymentPlanStatsProps {
  plans?: PaymentPlan[]
  totalCount?: number
}

export const PaymentPlanStats: React.FC<PaymentPlanStatsProps> = ({
  plans = [],
  totalCount = 0,
}) => {
  const safePlans = Array.isArray(plans) ? plans : []
  const activeCount = safePlans.filter((p) => p?.is_active).length
  const premiumCount = safePlans.filter((p) => p?.can_access_premium).length
  const adSupportedCount = safePlans.filter((p) => p?.ad_supported).length

  const statConfig = [
    {
      title: 'Total Plans',
      value: totalCount || safePlans.length,
      subtext: 'Configured pricing tiers',
      icon: FiCreditCard,
      color: 'blue',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40',
    },
    {
      title: 'Active Plans',
      value: activeCount,
      subtext: 'Available for purchase',
      icon: FiCheckCircle,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      title: 'Premium Tier',
      value: premiumCount,
      subtext: 'Includes VIP access',
      icon: LuBadgePoundSterling,
      color: 'purple',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-500/40',
    },
    {
      title: 'Ad Supported',
      value: adSupportedCount,
      subtext: 'Monetized with video ads',
      icon: FiTv,
      color: 'amber',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-500/40',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl border border-border/80 bg-card bg-gradient-to-br ${stat.bgGradient} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${stat.borderHover}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {(stat.value || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtext}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PaymentPlanStats
