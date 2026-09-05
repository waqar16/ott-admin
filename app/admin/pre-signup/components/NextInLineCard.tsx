'use client'

import React from 'react'
import { FiClock, FiUser, FiArrowRight } from 'react-icons/fi'
import { WaitlistEntry } from '@/lib/preSignupApi'

interface NextInLineCardProps {
  entries: WaitlistEntry[]
  onSelectEntry: (entry: WaitlistEntry) => void
  onPromoteBatch: () => void
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${Math.max(1, diffMins)}m ago`
  } catch {
    return 'Recently'
  }
}

export const NextInLineCard: React.FC<NextInLineCardProps> = ({
  entries,
  onSelectEntry,
  onPromoteBatch,
}) => {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <FiClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Priority Queue (Next in Line)</h3>
              <p className="text-xs text-muted-foreground">FIFO order for trial activation</p>
            </div>
          </div>

          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
            {entries.length} in queue
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            No pending users currently in the waitlist queue.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {entries.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                onClick={() => onSelectEntry(item)}
                className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-accent/40 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name || item.email}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate font-mono">
                      {item.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {formatRelativeTime(item.created_at)}
                  </span>
                  <FiArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">Top priority for next promotion</span>
        <button
          onClick={onPromoteBatch}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          Promote from Queue &rarr;
        </button>
      </div>
    </div>
  )
}
