'use client'

import React from 'react'
import { SummaryData } from '../types'
import { FiBarChart2, FiDollarSign, FiEye, FiUsers } from 'react-icons/fi'

interface SummaryStatCardsProps {
  summary: SummaryData
}

export const SummaryStatCards: React.FC<SummaryStatCardsProps> = ({ summary }) => {
  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const formatNumber = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '0'
    return new Intl.NumberFormat('en-US').format(Math.round(num))
  }

  const statConfig = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary?.total_revenue ?? 0),
      subtitle: 'Earnings across all creators',
      icon: FiDollarSign,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      title: 'Total Unique Views',
      value: formatNumber(summary?.total_unique_views ?? 0),
      subtitle: 'Aggregate content audience reach',
      icon: FiEye,
      color: 'blue',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40',
    },
    {
      title: 'Active Creators',
      value: formatNumber(summary?.total_creators ?? 0),
      subtitle: 'Monetized creators in network',
      icon: FiUsers,
      color: 'purple',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-500/40',
    },
    {
      title: 'Average Views / Creator',
      value: formatNumber(summary?.avg_views_per_creator ?? 0),
      subtitle: 'Mean performance ratio',
      icon: FiBarChart2,
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
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtitle}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
