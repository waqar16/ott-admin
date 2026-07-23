'use client'

import React from 'react'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'

interface Filters {
  search?: string
  is_active?: string
  ad_supported?: string
}

interface PaymentPlanFiltersProps {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export const PaymentPlanFilters: React.FC<PaymentPlanFiltersProps> = ({
  filters,
  setFilters,
  setPage,
}) => {
  const isFiltered = Boolean(filters.search || filters.is_active || filters.ad_supported)

  const handleReset = () => {
    setFilters({})
    setPage(1)
  }

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FiFilter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Filter Payment Plans</h3>
            <p className="text-xs text-muted-foreground">Search by tier name, active status, or ad options</p>
          </div>
        </div>
        {isFiltered && (
          <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-accent text-accent-foreground border border-border">
            Filters Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Search Plan Name
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search || ''}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }))
                setPage(1)
              }}
              className="w-full bg-background border border-input text-foreground rounded-lg pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            />
            {filters.search && (
              <button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: '' }))
                  setPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Dropdown */}
        <div className="lg:col-span-3 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Status Filter
          </label>
          <select
            value={filters.is_active ?? ''}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, is_active: e.target.value }))
              setPage(1)
            }}
            className="w-full bg-background border border-input text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        {/* Ad Supported Filter Dropdown */}
        <div className="lg:col-span-3 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ad Model
          </label>
          <select
            value={filters.ad_supported ?? ''}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, ad_supported: e.target.value }))
              setPage(1)
            }}
            className="w-full bg-background border border-input text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          >
            <option value="">All Ad Options</option>
            <option value="true">Ad Supported</option>
            <option value="false">No Ads (Ad-Free)</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="lg:col-span-2 flex items-end">
          {isFiltered && (
            <button
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground bg-accent hover:bg-accent/80 hover:text-foreground active:scale-[0.98] border border-border transition-all cursor-pointer"
            >
              <FiX className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentPlanFilters
