'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

type DeleteConfirmationDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  creatorName: string
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  creatorName,
}: DeleteConfirmationDialogProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-slate-200 dark:border-neutral-800 z-10"
          >
            {/* Close button top right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-neutral-500 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-600 dark:hover:text-slate-350 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* Warning Header */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <div className="mt-1 space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-6">
                  Delete Creator Account
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 font-light leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {creatorName}
                  </span>
                  ? This will permanently remove their profile and access. This action cannot be
                  undone.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600  hover:bg-red-500 text-white shadow-md shadow-red-500/10 transition"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
