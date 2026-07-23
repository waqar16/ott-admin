'use client'

import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

interface SidebarTooltipProps {
  content: string
  disabled: boolean // only active when sidebar is collapsed
  children: React.ReactElement
}

export default function SidebarTooltip({ content, disabled, children }: SidebarTooltipProps) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({
      top: rect.top + rect.height / 2, // vertically centered
      left: rect.right + 10, // 10px spacing from the right edge
    })
    setVisible(true)
  }

  const handleMouseLeave = () => {
    setVisible(false)
  }

  // Attach event handlers to the children element clone
  const triggerElement = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter(e)
      if (children.props.onMouseEnter) children.props.onMouseEnter(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave()
      if (children.props.onMouseLeave) children.props.onMouseLeave(e)
    },
    ref: triggerRef,
  })

  return (
    <>
      {triggerElement}
      {mounted &&
        visible &&
        coords &&
        !disabled &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            className="bg-slate-900 dark:bg-neutral-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg border border-slate-800 dark:border-neutral-800 animate-fade-in flex items-center select-none"
          >
            {/* Arrow */}
            <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-neutral-900 rotate-45 border-l border-b border-slate-800 dark:border-neutral-800" />
            <span className="relative z-10 font-semibold tracking-wide whitespace-nowrap">
              {content}
            </span>
          </div>,
          document.body
        )}
    </>
  )
}
