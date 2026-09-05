'use client'

import React from 'react'
import { FiSearch, FiX, FiFilter, FiUser, FiCreditCard } from 'react-icons/fi'

interface Filters {
  user: string
  plan: string
  status: string
}

interface SubscriptionFiltersProps {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({
  filters,
  setFilters,
  setPage,
}) => {
  const isFiltered = Boolean(filters.user || filters.plan || filters.status)

  const handleReset = () => {
    setFilters({ user: '', plan: '', status: '' })
    setPage(1)
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FiFilter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Filter Subscriptions</h3>
            <p className="text-xs text-muted-foreground">
              Search by customer ID, subscription plan name, or status
            </p>
          </div>
        </div>
        {isFiltered && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border">
            Filters Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* User Search Input */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FiUser className="w-3.5 h-3.5 text-primary" /> Filter by User ID / Name
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by User ID..."
              value={filters.user}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, user: e.target.value }))
                setPage(1)
              }}
              className="w-full bg-background border border-input text-foreground rounded-xl pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
            {filters.user && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, user: '' }))
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Plan Search Input */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FiCreditCard className="w-3.5 h-3.5 text-primary" /> Filter by Plan ID / Name
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Plan ID..."
              value={filters.plan}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, plan: e.target.value }))
                setPage(1)
              }}
              className="w-full bg-background border border-input text-foreground rounded-xl pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
            {filters.plan && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, plan: '' }))
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="lg:col-span-3 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Subscription Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }))
              setPage(1)
            }}
            className="w-full bg-background border border-input text-foreground rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="lg:col-span-1 flex items-end">
          {isFiltered && (
            <button
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl text-muted-foreground bg-accent hover:bg-accent/80 hover:text-foreground active:scale-[0.98] border border-border transition-all cursor-pointer"
              title="Reset All Filters"
            >
              <FiX className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only lg:sr-only">Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionFilters
