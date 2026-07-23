'use client'

import React from 'react'
import { PaymentPlan } from '@/lib/types/content'
import { PaymentPlanCard } from './PaymentPlanCard'

interface PaymentPlanGridProps {
  plans: PaymentPlan[]
  onEditClick: (plan: PaymentPlan) => void
  onDeleteClick: (plan: PaymentPlan) => void
  redirectingPlanId?: string | null
}

export const PaymentPlanGrid: React.FC<PaymentPlanGridProps> = ({
  plans,
  onEditClick,
  onDeleteClick,
  redirectingPlanId,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {plans.map((plan) => (
        <PaymentPlanCard
          key={plan.id}
          plan={plan}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          redirectingPlanId={redirectingPlanId}
        />
      ))}
    </div>
  )
}

export default PaymentPlanGrid
