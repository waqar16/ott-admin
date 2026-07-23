import React from 'react'
import { cookies } from 'next/headers'
import { API_BASE } from '@/lib/config'
import PlanForm from '@/components/PlanForm/PlanForm'
import { PaymentPlan } from '@/lib/types/content'
import { redirect } from 'next/navigation'

async function fetchPlan(id: string): Promise<PaymentPlan | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('access_token')?.value

    if (!accessToken) {
      redirect('/login') // or your login route
    }

    const response = await fetch(`${API_BASE}api/v1/payments/plans/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      if (response.status === 401) {
        redirect('/login')
      }
      throw new Error('Failed to fetch plan')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching plan:', error)
    return null
  }
}

const Page = async ({ params }: { params: { id: string } }) => {
  const plan = await fetchPlan(params.id)

  if (!plan) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">⚠️ Plan Not Found</h2>
          <p className="text-neutral-400">
            The payment plan you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PlanForm initial={plan} />
    </div>
  )
}

export default Page
