'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiChevronDown, FiSearch, FiX, FiUser } from 'react-icons/fi'

export interface CreatorItem {
  id?: string
  name: string
  email?: string | null
  bio?: string | null
}

interface MultiSelectCreatorProps {
  allCreators: CreatorItem[]
  formData: {
    creators?: string[]
    [key: string]: any
  }
  setFormData: React.Dispatch<React.SetStateAction<any>>
  label?: string
}

export default function MultiSelectCreator({
  allCreators = [],
  formData,
  setFormData,
  label = 'Assigned Creators',
}: MultiSelectCreatorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  })

  const selectedIds: string[] = formData.creators || []

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }

  const toggleOpen = () => {
    if (!open) {
      updatePosition()
    }
    setOpen((prev) => !prev)
  }

  const toggleCreator = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setFormData((prev: any) => {
      const currentList: string[] = prev.creators || []
      const exists = currentList.includes(id)
      return {
        ...prev,
        creators: exists ? currentList.filter((cId) => cId !== id) : [...currentList, id],
      }
    })
  }

  const removeCreator = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFormData((prev: any) => ({
      ...prev,
      creators: (prev.creators || []).filter((cId: string) => cId !== id),
    }))
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFormData((prev: any) => ({
      ...prev,
      creators: [],
    }))
  }

  // Filter creators based on search query
  const filteredCreators = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allCreators
    return allCreators.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    )
  }, [allCreators, search])

  // Close dropdown on outside click or resize
  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleScrollOrResize = () => {
      if (open) updatePosition()
    }

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('resize', handleScrollOrResize)
    window.addEventListener('scroll', handleScrollOrResize, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize, true)
    }
  }, [open])

  return (
    <div className="relative w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FiUser className="w-3.5 h-3.5 text-primary" />
          {label}
        </label>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            Clear all ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Trigger Control */}
      <div
        ref={buttonRef}
        onClick={toggleOpen}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        className="w-full min-h-[42px] px-3 py-2 bg-background border border-input rounded-lg flex items-center justify-between gap-2 cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedIds.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              {allCreators.length === 0 ? 'No creators available' : 'Assign creators to title...'}
            </span>
          ) : (
            selectedIds.map((id) => {
              const matched = allCreators.find((c) => c.id === id)
              const displayName = matched?.name || `Creator (${id.slice(0, 6)}...)`
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 max-w-[180px]"
                >
                  <span className="truncate">{displayName}</span>
                  <span
                    onClick={(e) => removeCreator(id, e)}
                    className="hover:bg-primary/20 rounded p-0.5 cursor-pointer text-primary"
                    title="Remove creator"
                  >
                    <FiX className="w-3 h-3" />
                  </span>
                </span>
              )
            })
          )}
        </div>

        <FiChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-primary' : ''
          }`}
        />
      </div>

      {/* Multi-Select Portal Dropdown */}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-popover text-popover-foreground border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: position.top,
              left: position.left,
              width: Math.max(position.width, 280),
              maxHeight: '320px',
            }}
          >
            {/* Search Input Bar */}
            <div className="p-2.5 border-b border-border/60 bg-muted/40">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search creators..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60 text-foreground"
                  autoFocus
                />
              </div>
            </div>

            {/* Creators Options List */}
            <div className="max-h-56 overflow-y-auto p-1 divide-y divide-border/20">
              {filteredCreators.length > 0 ? (
                filteredCreators.map((creator) => {
                  const creatorId = creator.id || ''
                  const isSelected = selectedIds.includes(creatorId)

                  return (
                    <div
                      key={creatorId}
                      onClick={(e) => toggleCreator(creatorId, e)}
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground/40 bg-background'
                          }`}
                        >
                          {isSelected && <FiCheck className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{creator.name}</p>
                          {creator.email && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {creator.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/15 shrink-0 ml-2">
                          Assigned
                        </span>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {search ? 'No creators match search' : 'No creators found'}
                </div>
              )}
            </div>

            {/* Multi-Creator Split Explanatory Footer */}
            <div className="p-2 border-t border-border/60 bg-muted/30 text-[10px] text-muted-foreground text-center">
              Multi-creator titles split play view credits equally (1/N per creator).
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
