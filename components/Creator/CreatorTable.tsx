'use client'

import React from 'react'
import { FiEdit2, FiTrash2, FiUsers, FiPlus } from 'react-icons/fi'
import { Creator } from '@/lib/creatorApi'

type CreatorTableProps = {
  creators: Creator[]
  onEditClick: (creator: Creator) => void
  onDeleteClick: (creator: Creator) => void
  onAddClick: () => void
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/10',
    'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/10',
    'bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/10',
    'bg-purple-500/10 text-purple-650 dark:text-purple-400 border border-purple-500/10',
    'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-500/10',
    'bg-pink-500/10 text-pink-655 dark:text-pink-400 border border-pink-500/10',
    'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/10',
  ]
  if (!name) return colors[0]
  const charCode = name.charCodeAt(0)
  return colors[charCode % colors.length]
}

function getInitials(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name[0].toUpperCase()
}

function getRoleBadge(role: string = 'creator') {
  const lower = role.toLowerCase()
  if (lower === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Admin
      </span>
    )
  }
  if (lower === 'subscriber') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Subscriber
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      Creator
    </span>
  )
}

export default function CreatorTable({
  creators,
  onEditClick,
  onDeleteClick,
  onAddClick,
}: CreatorTableProps) {
  if (creators.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-neutral-900 border border-slate-205/85 dark:border-neutral-850 rounded-2xl text-center space-y-4">
        <div className="p-4 rounded-full bg-slate-50 dark:bg-neutral-950 text-slate-400 dark:text-neutral-500 border border-slate-100 dark:border-neutral-800">
          <FiUsers className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No creators found</h3>
          <p className="text-sm text-slate-500 dark:text-neutral-450 font-light max-w-sm">
            Try adjusting your search terms or add a new content creator to the platform.
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-550 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/10 transition duration-150"
        >
          <FiPlus className="w-3.5 h-3.5" />
          <span>Add Creator</span>
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-850 shadow-xs dark:shadow-md overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-neutral-900/80 border-b border-slate-200/80 dark:border-neutral-850/80 text-xs font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
              <th className="px-6 py-4 sticky top-0 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur-xs">
                Creator
              </th>
              <th className="px-6 py-4 sticky top-0 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur-xs">
                Phone
              </th>
              <th className="px-6 py-4 sticky top-0 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur-xs">
                Bio
              </th>
              <th className="px-6 py-4 sticky top-0 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur-xs">
                Role
              </th>
              <th className="px-6 py-4 sticky top-0 bg-slate-50/90 dark:bg-neutral-900/90 backdrop-blur-xs text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-850/70 text-sm">
            {creators.map((u: Creator, index: number) => {
              const isEven = index % 2 === 0
              const rowBgClass = isEven
                ? 'bg-white dark:bg-neutral-900'
                : 'bg-slate-50/30 dark:bg-neutral-900/20'
              const avatarBg = getAvatarColor(u.name)
              const initials = getInitials(u.name)

              return (
                <tr
                  key={u.id}
                  className={`${rowBgClass} hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors duration-150`}
                >
                  {/* Creator Info column (Avatar + Name + Email) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarBg}`}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {u.name}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-neutral-450 truncate">
                          {u.email || '-'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Phone column */}
                  <td className="px-6 py-4 text-slate-500 dark:text-neutral-450 text-xs font-normal">
                    {u.phone || '—'}
                  </td>

                  {/* Bio column */}
                  <td className="px-6 py-4 max-w-xs">
                    <div className="group relative" title={u.bio || 'No biography details'}>
                      <p className="line-clamp-2 text-slate-600 dark:text-neutral-350 text-xs leading-relaxed font-light">
                        {u.bio || '—'}
                      </p>
                      {u.bio && (
                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 w-64 p-3 rounded-xl bg-slate-900 dark:bg-neutral-950 text-xs text-slate-200 border border-slate-800 dark:border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 shadow-xl leading-relaxed">
                          {u.bio}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Role column */}
                  <td className="px-6 py-4">{getRoleBadge((u as any).role || 'creator')}</td>

                  {/* Actions column */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => onEditClick(u)}
                        className="p-2 rounded-xl text-slate-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-500/5 transition duration-150"
                        title="Edit Profile"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      {(u as any).role !== 'admin' && (
                        <button
                          onClick={() => onDeleteClick(u)}
                          className="p-2 rounded-xl text-slate-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-red-500/30 hover:bg-red-50/10 dark:hover:bg-red-500/5 transition duration-150"
                          title="Delete Account"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
