'use client'

import React from 'react'
import { FiEye, FiTrash2, FiClock, FiCheck, FiMoreVertical } from 'react-icons/fi'
import { WaitlistEntry, WaitlistStatus } from '@/lib/preSignupApi'
import { WaitlistStatusBadge } from './WaitlistStatusBadge'

interface WaitlistTableProps {
  entries: WaitlistEntry[]
  onSelectEntry: (entry: WaitlistEntry) => void
  onUpdateStatus: (entry: WaitlistEntry, newStatus: WaitlistStatus) => void
  onDeleteEntry: (entry: WaitlistEntry) => void
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export const WaitlistTable: React.FC<WaitlistTableProps> = ({
  entries,
  onSelectEntry,
  onUpdateStatus,
  onDeleteEntry,
}) => {
  return (
    <div className="hidden md:block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold tracking-wider sticky top-0 backdrop-blur-md">
              <th className="py-3.5 px-4"># ID</th>
              <th className="py-3.5 px-4">User / Contact</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Joined At</th>
              <th className="py-3.5 px-4">Converted At</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {entries.map((item) => {
              return (
                <tr
                  key={item.id}
                  className="hover:bg-accent/40 transition-colors duration-150 group"
                >
                  {/* ID */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-muted-foreground font-semibold">
                      #{item.id}
                    </span>
                  </td>

                  {/* Name and Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                        {item.name ? item.name.charAt(0) : item.email.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground block group-hover:text-primary transition-colors truncate">
                          {item.name || 'Unnamed Participant'}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono truncate block">
                          {item.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <WaitlistStatusBadge status={item.status} />
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                      {item.source || 'signup_waitlist'}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                  </td>

                  {/* Converted Date */}
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.converted_at)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View details */}
                      <button
                        onClick={() => onSelectEntry(item)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* Quick promote / convert if pending */}
                      {item.status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(item, 'converted')}
                          className="p-2 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="Grant Trial (Convert)"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteEntry(item)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Waitlist Entry"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
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
