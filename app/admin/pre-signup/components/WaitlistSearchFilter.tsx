'use client'

import React from 'react'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'
import { WaitlistStatus } from '@/lib/preSignupApi'

interface WaitlistSearchFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  totalCount: number
  filteredCount: number
}

const STATUS_OPTIONS: { label: string; value: string; color?: string }[] = [
  { label: 'All Entries', value: 'all' },
  { label: 'Pending', value: 'pending', color: 'text-amber-500' },
  { label: 'Converted', value: 'converted', color: 'text-emerald-500' },
  { label: 'Notified', value: 'notified', color: 'text-blue-500' },
  { label: 'Expired', value: 'expired', color: 'text-slate-400' },
]

export const WaitlistSearchFilter: React.FC<WaitlistSearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalCount,
  filteredCount,
}) => {
  const isFiltered = Boolean(searchQuery || statusFilter !== 'all')

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, ID, or source..."
          className="w-full pl-10 pr-9 py-2 rounded-xl text-xs bg-muted/50 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs / Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 minimal-scrollbar">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = statusFilter === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          )
        })}

        {isFiltered && (
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors whitespace-nowrap"
            title="Clear all filters"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
