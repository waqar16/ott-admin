'use client'

import React from 'react'
import { SubscriptionCard } from './SubscriptionCard'

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

interface SubscriptionGridProps {
  subscriptions: Subscription[]
}

export const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({ subscriptions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {subscriptions.map((sub) => (
        <SubscriptionCard key={sub.id} subscription={sub} />
      ))}
    </div>
  )
}

export default SubscriptionGrid
