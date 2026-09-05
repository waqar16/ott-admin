'use client'

import React from 'react'
import { FiSearch, FiX, FiFilter } from 'react-icons/fi'

interface UserSearchFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedFilter: string
  setSelectedFilter: (filter: string) => void
  totalResults: number
  totalUsers: number
}

const filterOptions = [
  { id: 'all', label: 'All Users' },
  { id: 'admin', label: 'Admins' },
  { id: 'user', label: 'Users' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'beta_tester', label: 'Testers' },
]

export const UserSearchFilter: React.FC<UserSearchFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  totalResults,
  totalUsers,
}) => {
  return (
    <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email or role..."
            className="w-full bg-background border border-input text-foreground rounded-lg pl-10 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <FiFilter className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-1 hidden md:block" />
          {filterOptions.map((opt) => {
            const isActive = selectedFilter === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 hover:bg-accent text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results summary label */}
      {(searchQuery || selectedFilter !== 'all') && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
          <span>
            Showing <strong className="text-foreground">{totalResults}</strong> of{' '}
            <strong className="text-foreground">{totalUsers}</strong> users
          </span>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedFilter('all')
            }}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
