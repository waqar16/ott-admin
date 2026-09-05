'use client'

import React from 'react'
import { FiSearch, FiRefreshCw, FiPlus, FiFilter } from 'react-icons/fi'

type CreatorToolbarProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefreshClick: () => void
  isRefreshing: boolean
  onAddClick: () => void
  filterRole: string
  onFilterRoleChange: (role: string) => void
}

export default function CreatorToolbar({
  searchQuery,
  onSearchChange,
  onRefreshClick,
  isRefreshing,
  onAddClick,
  filterRole,
  onFilterRoleChange,
}: CreatorToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-205/80 dark:border-neutral-850/80 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
          <FiSearch className="w-4 h-4" />
        </div>
        <input
          type="text"
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white text-xs rounded-xl outline-none border border-slate-200 dark:border-neutral-800 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition duration-150"
          placeholder="Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter and Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Role Filter Selector */}
        <div className="relative flex items-center">
          <div className="absolute left-3 text-slate-400 dark:text-neutral-505 pointer-events-none">
            <FiFilter className="w-3.5 h-3.5" />
          </div>
          <select
            value={filterRole}
            onChange={(e) => onFilterRoleChange(e.target.value)}
            className="pl-8 pr-8 py-2 bg-slate-50 dark:bg-neutral-950 text-slate-700 dark:text-neutral-300 text-xs rounded-xl outline-none border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 cursor-pointer appearance-none transition duration-150"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="creator">Creator</option>
            <option value="subscriber">Subscriber</option>
          </select>
          <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-neutral-500">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/205/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>

        {/* Refresh Trigger */}
        <button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          className="p-2 bg-slate-50 dark:bg-neutral-950 text-slate-650 dark:text-neutral-450 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-205 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition duration-150 disabled:opacity-50"
          title="Refresh List"
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        </button>

        {/* Add Creator Shortcut */}
        <button
          onClick={onAddClick}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-550 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition duration-150 active:scale-95"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  )
}
