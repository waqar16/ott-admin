'use client'

import React, { useState } from 'react'
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi'
import { WaitlistEntry } from '@/lib/preSignupApi'

interface DeleteWaitlistDialogProps {
  entry: WaitlistEntry | null
  onClose: () => void
  onConfirm: (entry: WaitlistEntry) => Promise<void>
}

export const DeleteWaitlistDialog: React.FC<DeleteWaitlistDialogProps> = ({
  entry,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false)

  if (!entry) return null

  const handleConfirm = async () => {
    try {
      setDeleting(true)
      await onConfirm(entry)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex-shrink-0">
            <FiAlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2 flex-1">
            <h3 className="text-base font-bold text-foreground">Remove Waitlist Entry</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove{' '}
              <strong className="text-foreground">{entry.name || entry.email}</strong> (#{entry.id})
              from the waitlist? This action cannot be undone.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-6 mt-4 border-t border-border/80">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Removing...' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
