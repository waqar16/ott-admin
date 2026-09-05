'use client'

import React, { useState } from 'react'
import { FiX, FiUserCheck, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { PromoteWaitlistRequest } from '@/lib/preSignupApi'
import { toast } from 'sonner'

interface PromoteBatchModalProps {
  isOpen: boolean
  remainingCapacity: number
  pendingCount: number
  onClose: () => void
  onPromote: (payload: PromoteWaitlistRequest) => Promise<void>
}

export const PromoteBatchModal: React.FC<PromoteBatchModalProps> = ({
  isOpen,
  remainingCapacity,
  pendingCount,
  onClose,
  onPromote,
}) => {
  const [promoteAll, setPromoteAll] = useState<boolean>(true)
  const [batchCount, setBatchCount] = useState<number>(Math.min(pendingCount || 25, 25))
  const [promoting, setPromoting] = useState<boolean>(false)

  if (!isOpen) return null

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setPromoting(true)
      const count = promoteAll ? undefined : Number(batchCount)
      await onPromote(count ? { count } : {})
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to promote waitlist batch')
    } finally {
      setPromoting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <FiUserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Promote Waitlist Batch</h2>
              <p className="text-xs text-muted-foreground">Grant immediate free trial access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePromote} className="space-y-4 pt-4">
          {/* Capacity Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[11px] text-muted-foreground block">Waiting in Queue</span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {pendingCount.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
              <span className="text-[11px] text-muted-foreground block">Available Quota</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {remainingCapacity.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Promotion Option Choice */}
          <div className="space-y-2">
            <label
              onClick={() => setPromoteAll(true)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                promoteAll
                  ? 'bg-primary/5 border-primary/40 text-foreground'
                  : 'bg-muted/20 border-border/70 text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <input
                type="radio"
                name="promoteChoice"
                checked={promoteAll}
                onChange={() => setPromoteAll(true)}
                className="mt-0.5"
              />
              <div className="text-xs">
                <span className="font-semibold block text-foreground">
                  Promote Up to Remaining Capacity
                </span>
                <span className="text-muted-foreground">
                  Promotes up to {Math.min(remainingCapacity, pendingCount)} oldest pending users.
                </span>
              </div>
            </label>

            <label
              onClick={() => setPromoteAll(false)}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                !promoteAll
                  ? 'bg-primary/5 border-primary/40 text-foreground'
                  : 'bg-muted/20 border-border/70 text-muted-foreground hover:bg-muted/40'
              }`}
            >
              <input
                type="radio"
                name="promoteChoice"
                checked={!promoteAll}
                onChange={() => setPromoteAll(false)}
                className="mt-0.5"
              />
              <div className="text-xs w-full">
                <span className="font-semibold block text-foreground">Custom Batch Size</span>
                <span className="text-muted-foreground block mb-2">
                  Promote a specific number of users in FIFO order.
                </span>
                {!promoteAll && (
                  <div className="relative mt-2">
                    <input
                      type="number"
                      min="1"
                      max={Math.max(pendingCount, 500)}
                      value={batchCount}
                      onChange={(e) => setBatchCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-muted/60 border border-border focus:border-primary outline-none text-foreground font-mono"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                      users
                    </span>
                  </div>
                )}
              </div>
            </label>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-start gap-2">
            <FiAlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              Promoted users immediately receive an automated activation email and an active trialing
              subscription.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={promoting || pendingCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {promoting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Promoting...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Execute Promotion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
