'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiX } from 'react-icons/fi'

type CreatorDrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  children: React.ReactNode
}

export default function CreatorDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
}: CreatorDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Restore focus to the trigger button when the drawer is closed
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [isOpen])

  // Trap focus inside the drawer and lock background scrolling
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'

    // Selectable focusable targets
    const focusableTargets = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    )

    if (focusableTargets && focusableTargets.length > 0) {
      const firstTarget = focusableTargets[0] as HTMLElement
      const lastTarget = focusableTargets[focusableTargets.length - 1] as HTMLElement

      const focusTimer = setTimeout(() => {
        firstTarget.focus()
      }, 80)

      const handleTabNavigation = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstTarget) {
            lastTarget.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastTarget) {
            firstTarget.focus()
            e.preventDefault()
          }
        }
      }

      window.addEventListener('keydown', handleTabNavigation)

      return () => {
        clearTimeout(focusTimer)
        window.removeEventListener('keydown', handleTabNavigation)
        document.body.style.overflow = originalOverflow
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Escape Key support to close
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscapeKey)
    return () => window.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen, onClose])

  return (
    <div
      className={`  fixed inset-0 z-50 flex justify-end transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
    >
      {/* 1. Backdrop layer with premium dark overlay and blur fade */}
      <motion.div
        onClick={onClose}
        animate={{ opacity: isOpen ? 1 : 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[3px] cursor-pointer"
      />

      {/* 2. Premium Slide-over panel (100dvh height, flush on right/top/bottom edges) */}
      <motion.div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-describedby="drawer-description"
        animate={{ x: isOpen ? 0 : '100%' }}
        initial={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 260 }}
        className="top-[-32px] relative h-screen h-dvh max-h-screen max-h-dvh w-full sm:w-[80%] md:w-[680px] lg:w-[740px] bg-white dark:bg-neutral-900 shadow-2xl  border-l border-slate-200 dark:border-neutral-800/80 flex flex-col z-10 overflow-hidden"
      >
        {/* Fixed Sticky Header */}
        <div className="flex-shrink-0 px-8 py-6 border-b border-slate-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 z-10 flex items-center justify-between">
          <div className="space-y-1">
            <h2
              id="drawer-title"
              className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight"
            >
              {title}
            </h2>
            <p
              id="drawer-description"
              className="text-xs text-slate-500 dark:text-neutral-400 font-light"
            >
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 dark:text-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-100 dark:border-neutral-800 hover:border-slate-200 dark:hover:border-neutral-700 transition duration-150 focus:outline-hidden"
            aria-label="Close drawer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Viewport Wrapper (Non-scrollable container) */}
        <div className="flex-grow overflow-hidden bg-white dark:bg-neutral-900">{children}</div>
      </motion.div>
    </div>
  )
}
