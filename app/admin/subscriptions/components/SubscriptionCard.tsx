'use client'

import React from 'react'
import { StatusBadge } from './StatusBadge'
import { FiUser, FiCalendar, FiClock, FiCreditCard } from 'react-icons/fi'

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

interface SubscriptionCardProps {
  subscription: Subscription
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription }) => {
  const formatPrice = (price?: number | string) => {
    const num = typeof price === 'string' ? parseFloat(price) : price
    if (num === undefined || isNaN(num)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30 group">
      <div className="space-y-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
              <FiCreditCard className="w-3 h-3 text-primary" /> Plan Tier
            </span>
            <h3 className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {subscription.plan?.name || 'Subscription Plan'}
            </h3>
          </div>

          <StatusBadge status={subscription.status} />
        </div>

        {/* Price Tag */}
        <div className="pt-2 pb-1 border-y border-border/40 flex items-baseline gap-1.5">
          <span className="text-3xl font-black tracking-tight text-foreground">
            {formatPrice(subscription.plan?.price)}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">/ billing period</span>
        </div>

        {/* Detail Rows */}
        <div className="space-y-2.5 pt-1 text-xs">
          {/* User Row */}
          <div className="flex items-center justify-between py-1.5 border-b border-border/30">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <FiUser className="w-3.5 h-3.5 text-primary" /> Subscriber User
            </span>
            <span
              className="font-mono font-semibold text-foreground truncate max-w-[150px] sm:max-w-[180px]"
              title={subscription.user}
            >
              {subscription.user || 'Unknown User'}
            </span>
          </div>

          {/* Start Date */}
          <div className="flex items-center justify-between py-1.5 border-b border-border/30">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <FiCalendar className="w-3.5 h-3.5 text-primary" /> Start Date
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(subscription.start_date)}
            </span>
          </div>

          {/* End Date */}
          <div className="flex items-center justify-between py-1.5">
            <span className="flex items-center gap-2 text-muted-foreground font-medium">
              <FiClock className="w-3.5 h-3.5 text-primary" /> End Date
            </span>
            <span className="font-semibold text-foreground">
              {formatDate(subscription.end_date)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionCard
