'use client'

import React from 'react'
import { FAQ } from '@/lib/faq'
import { FiHelpCircle, FiCheckCircle, FiXCircle, FiPieChart } from 'react-icons/fi'

interface FaqStatsCardsProps {
  faqs: FAQ[]
}

export const FaqStatsCards: React.FC<FaqStatsCardsProps> = ({ faqs }) => {
  const total = faqs.length
  const active = faqs.filter((f) => f.is_active).length
  const inactive = faqs.filter((f) => !f.is_active).length
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0

  const statConfig = [
    {
      title: 'Total FAQs',
      value: total,
      subtext: 'Questions in knowledge base',
      icon: FiHelpCircle,
      color: 'blue',
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40',
    },
    {
      title: 'Active FAQs',
      value: active,
      subtext: 'Visible to public audience',
      icon: FiCheckCircle,
      color: 'emerald',
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      title: 'Inactive FAQs',
      value: inactive,
      subtext: 'Hidden / draft status',
      icon: FiXCircle,
      color: 'amber',
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-500/40',
    },
    {
      title: 'Active Rate',
      value: `${activeRate}%`,
      subtext: 'Percentage currently published',
      icon: FiPieChart,
      color: 'purple',
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-500/40',
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
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtext}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
