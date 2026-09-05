'use client'

import React from 'react'
import { FiEye, FiTrash2, FiCheck, FiCalendar } from 'react-icons/fi'
import { WaitlistEntry, WaitlistStatus } from '@/lib/preSignupApi'
import { WaitlistStatusBadge } from './WaitlistStatusBadge'

interface WaitlistMobileCardsProps {
  entries: WaitlistEntry[]
  onSelectEntry: (entry: WaitlistEntry) => void
  onUpdateStatus: (entry: WaitlistEntry, newStatus: WaitlistStatus) => void
  onDeleteEntry: (entry: WaitlistEntry) => void
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export const WaitlistMobileCards: React.FC<WaitlistMobileCardsProps> = ({
  entries,
  onSelectEntry,
  onUpdateStatus,
  onDeleteEntry,
}) => {
  return (
    <div className="md:hidden space-y-3">
      {entries.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3"
        >
          {/* Top Line: User & Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {item.name ? item.name.charAt(0) : item.email.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-sm text-foreground block truncate">
                  {item.name || 'Unnamed Participant'}
                </span>
                <span className="text-xs text-muted-foreground font-mono block truncate">
                  {item.email}
                </span>
              </div>
            </div>

            <WaitlistStatusBadge status={item.status} />
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
            <div>
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">
                Source
              </span>
              <span className="font-medium text-foreground">{item.source || 'signup_waitlist'}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground/80">
                Joined
              </span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <FiCalendar className="w-3 h-3 text-muted-foreground" />
                {formatDate(item.created_at)}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
            <span className="text-[11px] font-mono text-muted-foreground">ID: #{item.id}</span>

            <div className="flex items-center gap-1.5">
              {item.status === 'pending' && (
                <button
                  onClick={() => onUpdateStatus(item, 'converted')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>Convert</span>
                </button>
              )}

              <button
                onClick={() => onSelectEntry(item)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="View"
              >
                <FiEye className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDeleteEntry(item)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
