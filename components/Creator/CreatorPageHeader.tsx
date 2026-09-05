'use client'

import React from 'react'
import { FiUsers, FiRefreshCw, FiPlus } from 'react-icons/fi'

type CreatorPageHeaderProps = {
  totalCount: number
  onAddClick: () => void
  onRefreshClick: () => void
  isRefreshing: boolean
}

export default function CreatorPageHeader({
  totalCount,
  onAddClick,
  onRefreshClick,
  isRefreshing,
}: CreatorPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-neutral-850 pb-6">
      {/* Title & Description & Count Badge */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs border border-blue-500/5">
            <FiUsers className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-neutral-850 text-slate-650 dark:text-neutral-400 border border-slate-250 dark:border-neutral-800">
            {totalCount} {totalCount === 1 ? 'Creator' : 'Creators'}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
          Creator Management
        </h1>
        <p className="text-sm text-slate-550 dark:text-neutral-400 font-light max-w-2xl">
          Manage platform creators, edit profiles and monitor creator accounts.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Refresh Button */}
        <button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          className="flex items-center space-x-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-850 text-slate-700 dark:text-neutral-300 px-4 py-2.5 rounded-xl shadow-xs text-xs font-semibold transition duration-150 disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`}
          />
          <span>Refresh</span>
        </button>

        {/* Add Creator Button */}
        <button
          onClick={onAddClick}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-550 hover:to-indigo-550 text-white px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg text-xs font-bold transition duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Creator</span>
        </button>
      </div>
    </div>
  )
}
