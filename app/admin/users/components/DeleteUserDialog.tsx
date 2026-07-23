'use client'

import React, { useEffect, useState } from 'react'
import { User } from '@/lib/userApi'
import { FiAlertTriangle, FiRefreshCw, FiX } from 'react-icons/fi'

interface DeleteUserDialogProps {
  user: User | null
  onClose: () => void
  onConfirm: (user: User) => Promise<void>
}

export const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({
  user,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState<boolean>(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, deleting])

  if (!user) return null

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await onConfirm(user)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          disabled={deleting}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
            <FiAlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight text-foreground">Delete User Account</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-foreground font-semibold px-1 py-0.5 rounded bg-accent">
                {user.name || user.email}
              </strong>
              ? This operation cannot be reversed.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {deleting ? (
              <>
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
