'use client'

import React, { useState } from 'react'
import {
  FiX,
  FiUser,
  FiMail,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiTrash2,
  FiTag,
  FiSave,
} from 'react-icons/fi'
import { WaitlistEntry, WaitlistStatus } from '@/lib/preSignupApi'
import { WaitlistStatusBadge } from './WaitlistStatusBadge'
import { toast } from 'sonner'

interface WaitlistDetailDrawerProps {
  isOpen: boolean
  entry: WaitlistEntry | null
  onClose: () => void
  onUpdateStatus: (entry: WaitlistEntry, newStatus: WaitlistStatus) => Promise<void>
  onDeleteEntry: (entry: WaitlistEntry) => void
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return 'Not recorded'
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return dateString
  }
}

export const WaitlistDetailDrawer: React.FC<WaitlistDetailDrawerProps> = ({
  isOpen,
  entry,
  onClose,
  onUpdateStatus,
  onDeleteEntry,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<WaitlistStatus>(entry?.status || 'pending')
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    if (entry) {
      setSelectedStatus(entry.status)
    }
  }, [entry])

  if (!isOpen || !entry) return null

  const handleSaveStatus = async () => {
    if (selectedStatus === entry.status) return
    try {
      setSaving(true)
      await onUpdateStatus(entry, selectedStatus)
      toast.success(`Updated status to ${selectedStatus}`)
    } catch (err: any) {
      toast.error('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl p-6 flex flex-col justify-between overflow-y-auto minimal-scrollbar">
          {/* Top Section */}
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">Waitlist Record</h3>
                  <span className="text-xs font-mono text-muted-foreground font-semibold">
                    #{entry.id}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Participant profile & trial tracking</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Primary Info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/40 border border-border/80">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg uppercase flex-shrink-0">
                {entry.name ? entry.name.charAt(0) : entry.email.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground text-sm truncate">
                  {entry.name || 'Unnamed Participant'}
                </h4>
                <p className="text-xs text-muted-foreground font-mono truncate">{entry.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <WaitlistStatusBadge status={entry.status} />
                  {entry.user && (
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                      User ID: #{entry.user}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Modification */}
            <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/70">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground block">
                Manage Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['pending', 'converted', 'notified', 'expired'] as WaitlistStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium capitalize border transition-all cursor-pointer ${
                      selectedStatus === st
                        ? 'bg-primary text-primary-foreground border-primary font-bold shadow-sm'
                        : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {selectedStatus !== entry.status && (
                <button
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <FiSave className="w-3.5 h-3.5" />
                  <span>{saving ? 'Updating...' : 'Save New Status'}</span>
                </button>
              )}
            </div>

            {/* Detailed Timeline & Metadata */}
            <div className="space-y-3">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Audit Timeline & Metadata
              </h5>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FiTag className="w-3.5 h-3.5" /> Acquisition Source
                  </span>
                  <span className="font-semibold text-foreground">{entry.source || 'signup_waitlist'}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5" /> Joined Waitlist
                  </span>
                  <span className="text-foreground">{formatDate(entry.created_at)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Converted to Trial
                  </span>
                  <span className="text-foreground">{formatDate(entry.converted_at)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5 text-blue-500" /> Notified Timestamp
                  </span>
                  <span className="text-foreground">{formatDate(entry.notified_at)}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-foreground">{formatDate(entry.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-6 border-t border-border/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose()
                onDeleteEntry(entry)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Delete Entry</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
