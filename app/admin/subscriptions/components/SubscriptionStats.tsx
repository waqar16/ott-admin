'use client'

import React from 'react'
import { FiLayers, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi'

interface Subscription {
  id: string
  user: string
  status: string
  start_date: string
  end_date: string
  created_at: string
  plan: {
    id: string
    name: string
    price: number
  }
}

interface SubscriptionStatsProps {
  subscriptions?: Subscription[]
  totalCount?: number
}

export const SubscriptionStats: React.FC<SubscriptionStatsProps> = ({
  subscriptions = [],
  totalCount = 0,
}) => {
  const safeSubs = Array.isArray(subscriptions) ? subscriptions : []

  const activeCount = safeSubs.filter((s) => s?.status?.toLowerCase() === 'active').length
  const expiredCount = safeSubs.filter((s) => s?.status?.toLowerCase() === 'expired').length
  const cancelledCount = safeSubs.filter((s) =>
    ['cancelled', 'canceled'].includes(s?.status?.toLowerCase() || '')
  ).length

  const statConfig = [
    {
      title: 'Total Subscriptions',
      value: totalCount || safeSubs.length,
      subtext: 'All recorded customer plans',
      icon: FiLayers,
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40',
    },
    {
      title: 'Active Subscriptions',
      value: activeCount,
      subtext: 'Currently valid & billing',
      icon: FiCheckCircle,
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      title: 'Expired Subscriptions',
      value: expiredCount,
      subtext: 'Past billing cycle end date',
      icon: FiClock,
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-500/40',
    },
    {
      title: 'Cancelled Subscriptions',
      value: cancelledCount,
      subtext: 'Terminated or opted out',
      icon: FiXCircle,
      bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
      borderHover: 'hover:border-rose-500/40',
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

export default SubscriptionStats
