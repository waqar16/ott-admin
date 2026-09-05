'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { motion } from 'framer-motion'
import { API_BASE } from '@/lib/config'

import { SubscriptionHeader } from './components/SubscriptionHeader'
import { SubscriptionStats } from './components/SubscriptionStats'
import { SubscriptionFilters } from './components/SubscriptionFilters'
import { SubscriptionGrid } from './components/SubscriptionGrid'
import { EmptySubscriptionsState } from './components/EmptySubscriptionsState'
import { SubscriptionCardSkeleton } from './components/SubscriptionCardSkeleton'
import { SubscriptionPagination } from './components/SubscriptionPagination'

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

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: Subscription[]
}

interface Filters {
  user: string
  plan: string
  status: string
}

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [count, setCount] = useState<number>(0)

  const [filters, setFilters] = useState<Filters>({
    user: '',
    plan: '',
    status: '',
  })

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)

      const res = await axios.get<ApiResponse>(
        `${API_BASE}api/v1/payments/subscriptions?page=${page}&user=${filters.user || ''}&plan=${filters.plan || ''}&status=${filters.status || ''}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
        }
      )

      if (res.data && Array.isArray(res.data.results)) {
        setSubscriptions(res.data.results)
        setCount(res.data.count || 0)
      } else {
        setSubscriptions([])
        setCount(0)
      }
    } catch (err) {
      console.error('Error fetching user subscriptions:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [page, filters])

  // Filter subscriptions client-side as fallback for instant feedback
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesUser =
      !filters.user || (sub.user || '').toLowerCase().includes(filters.user.toLowerCase())
    const matchesPlan =
      !filters.plan ||
      (sub.plan?.name || '').toLowerCase().includes(filters.plan.toLowerCase()) ||
      (sub.plan?.id || '').toLowerCase().includes(filters.plan.toLowerCase())
    const matchesStatus =
      !filters.status || (sub.status || '').toLowerCase() === filters.status.toLowerCase()

    return matchesUser && matchesPlan && matchesStatus
  })

  const isFiltered = Boolean(filters.user || filters.plan || filters.status)

  if (loading && subscriptions.length === 0) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-background text-foreground">
        <SubscriptionCardSkeleton />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <SubscriptionHeader
        onRefresh={fetchSubscriptions}
        loading={loading}
        totalSubscriptionsCount={count || subscriptions.length}
      />

      {/* KPI Stats */}
      <SubscriptionStats subscriptions={subscriptions} totalCount={count || subscriptions.length} />

      {/* Filters Panel */}
      <SubscriptionFilters filters={filters} setFilters={setFilters} setPage={setPage} />

      {/* Subscriptions Grid / Empty State */}
      {filteredSubscriptions.length > 0 ? (
        <>
          <SubscriptionGrid subscriptions={filteredSubscriptions} />

          {/* Pagination */}
          <SubscriptionPagination page={page} count={count} setPage={setPage} />
        </>
      ) : (
        <EmptySubscriptionsState
          hasFilters={isFiltered}
          onClearFilters={() => {
            setFilters({ user: '', plan: '', status: '' })
            setPage(1)
          }}
        />
      )}
    </motion.div>
  )
}

export default SubscriptionPage
