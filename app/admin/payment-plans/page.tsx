'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import CreatorDrawer from '@/components/Creator/CreatorDrawer'
import PlanForm from '@/components/PlanForm/PlanForm'
import { API_BASE } from '@/lib/config'
import { PaymentPlan } from '@/lib/types/content'

import { PaymentPlansHeader } from './components/PaymentPlansHeader'
import { PaymentPlanStats } from './components/PaymentPlanStats'
import { PaymentPlanFilters } from './components/PaymentPlanFilters'
import { PaymentPlanGrid } from './components/PaymentPlanGrid'
import { DeletePlanDialog } from './components/DeletePlanDialog'
import { PaginationControls } from './components/PaginationControls'
import { EmptyPlansState } from './components/EmptyPlansState'
import { PaymentPlansSkeleton } from './components/PaymentPlansSkeleton'

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: PaymentPlan[]
}

interface Filters {
  search?: string
  is_active?: string
  ad_supported?: string
}

export default function PaymentPlansPage() {
  const [plans, setPlans] = useState<PaymentPlan[]>([])
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState<number>(1)
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null)

  const [planToDelete, setPlanToDelete] = useState<PaymentPlan | null>(null)

  const fetchPlans = async () => {
    try {
      setLoading(true)

      const response = await axios.get<ApiResponse>(
        `${API_BASE}api/v1/payments/plans?page=${page}&search=${filters.search || ''}&is_active=${filters.is_active ?? ''}&ad_supported=${filters.ad_supported ?? ''}`
      )

      if (response.data && Array.isArray(response.data.results)) {
        setPlans(response.data.results)
        setCount(response.data.count || 0)
      } else {
        setPlans([])
        setCount(0)
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error)
      toast.error('Failed to load payment plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [page, filters])

  const deletePlan = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}api/v1/payments/plans/${id}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      })

      toast.success('Plan deleted successfully.')
      fetchPlans()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete plan.')
    } finally {
      setPlanToDelete(null)
    }
  }

  const handleAddPlan = () => {
    setDrawerMode('create')
    setSelectedPlan(null)
    setDrawerOpen(true)
  }

  const handleEditPlan = (plan: PaymentPlan) => {
    setDrawerMode('edit')
    setSelectedPlan(plan)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedPlan(null)
  }

  const handleFormSuccess = () => {
    handleCloseDrawer()
    fetchPlans()
  }

  if (loading && plans.length === 0) {
    return <PaymentPlansSkeleton />
  }

  const isFiltered = Boolean(filters.search || filters.is_active || filters.ad_supported)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <PaymentPlansHeader
        onRefresh={fetchPlans}
        onAddPlan={handleAddPlan}
        loading={loading}
        totalPlansCount={count || plans.length}
      />

      {/* KPI Stats Section */}
      <PaymentPlanStats plans={plans} totalCount={count || plans.length} />

      {/* Filter Controls */}
      <PaymentPlanFilters filters={filters} setFilters={setFilters} setPage={setPage} />

      {/* Plans Pricing Grid / Empty State */}
      {plans.length > 0 ? (
        <>
          <PaymentPlanGrid
            plans={plans}
            onEditClick={handleEditPlan}
            onDeleteClick={(plan) => setPlanToDelete(plan)}
          />

          {/* Pagination */}
          <PaginationControls page={page} count={count} setPage={setPage} />
        </>
      ) : (
        <EmptyPlansState
          hasFilters={isFiltered}
          onClearFilters={() => {
            setFilters({})
            setPage(1)
          }}
        />
      )}

      {/* Reusable Backdrop-Blur Delete Dialog */}
      <DeletePlanDialog
        plan={planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={deletePlan}
      />

      {/* Slide-over Drawer for Create & Edit Payment Plan */}
      <CreatorDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        title={drawerMode === 'create' ? 'Create Payment Plan' : 'Edit Payment Plan'}
        description={
          drawerMode === 'create'
            ? 'Create a new subscription plan with pricing, access permissions and billing options.'
            : 'Update pricing, features, duration and availability of this subscription plan.'
        }
      >
        {drawerOpen && (
          <PlanForm
            initial={selectedPlan}
            onClose={handleCloseDrawer}
            onSuccess={handleFormSuccess}
          />
        )}
      </CreatorDrawer>
    </motion.div>
  )
}
