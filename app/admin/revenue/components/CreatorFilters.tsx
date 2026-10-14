'use client'

import React, { useState } from 'react'
import { FilterState } from '../types'
import {
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiPercent,
  FiGlobe,
} from 'react-icons/fi'

interface CreatorFiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  onApply: () => void
  onReset: () => void
  loading: boolean
}

export const CreatorFilters: React.FC<CreatorFiltersProps> = ({
  filters,
  setFilters,
  onApply,
  onReset,
  loading,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const isFiltered = Boolean(
    filters.start_date ||
    filters.end_date ||
    filters.revenue ||
    filters.creator_share_percentage ||
    filters.currency
  )

  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FiFilter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Revenue Report Filters</h3>
            <p className="text-xs text-muted-foreground">
              Filter by timeline, gross revenue override, and revenue share allocation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground border border-border">
              Filters Active
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvanced ? 'Hide Advanced' : 'Advanced Parameters'}</span>
            {showAdvanced ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
        {/* Start Date */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5 text-primary" /> Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))}
            className="w-full bg-background border border-input text-foreground rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* End Date */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FiCalendar className="w-3.5 h-3.5 text-primary" /> End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))}
            className="w-full bg-background border border-input text-foreground rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row gap-2 pt-2 sm:pt-0">
          <button
            onClick={onApply}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <FiRefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FiFilter className="w-4 h-4" />
            )}
            <span>Apply Filters</span>
          </button>

          {isFiltered && (
            <button
              onClick={onReset}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground bg-accent hover:bg-accent/80 hover:text-foreground active:scale-[0.98] border border-border transition-all cursor-pointer"
              title="Reset Filters"
            >
              <FiX className="w-4 h-4" />
              <span className="sm:hidden lg:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Parameters Section */}
      {showAdvanced && (
        <div className="pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {/* Revenue Amount Override */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FiDollarSign className="w-3.5 h-3.5 text-emerald-500" /> Revenue Override
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 10.00 (auto from DB if blank)"
              value={filters.revenue || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, revenue: e.target.value }))}
              className="w-full bg-background border border-input text-foreground rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Creator Share Percentage */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FiPercent className="w-3.5 h-3.5 text-purple-500" /> Creator Share %
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="Default: 30.0%"
              value={filters.creator_share_percentage || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, creator_share_percentage: e.target.value }))
              }
              className="w-full bg-background border border-input text-foreground rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Currency Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FiGlobe className="w-3.5 h-3.5 text-blue-500" /> Currency Code
            </label>
            <select
              value={filters.currency || 'GBP'}
              onChange={(e) => setFilters((prev) => ({ ...prev, currency: e.target.value }))}
              className="w-full bg-background border border-input text-foreground rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            >
              <option value="GBP">GBP (£)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
