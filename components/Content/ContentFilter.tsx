'use client'

import React, { useState } from 'react'
import { ContentFilters } from '@/lib/types/content'
import { AnimatePresence, motion } from 'framer-motion'
import { FiSearch, FiX, FiFilter, FiChevronDown } from 'react-icons/fi'

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Processing', value: 'processing' },
  { label: 'Published', value: 'published' },
  { label: 'Inactive', value: 'inactive' },
]

const MEDIA_OPTIONS = [
  { label: 'All Media Types', value: undefined },
  { label: 'Flat', value: 'flat' },
  { label: 'VR 360 Mono', value: 'vr_360_mono' },
  { label: 'VR 360 SBS', value: 'vr_360_sbs' },
  { label: 'VR 360 TB', value: 'vr_360_tb' },
  { label: 'VR 180 Mono', value: 'vr_180_mono' },
  { label: 'VR 180 SBS', value: 'vr_180_sbs' },
  { label: 'VR 180 TB', value: 'vr_180_tb' },
]

interface SelectProps<T> {
  label: string
  value: T | undefined
  options: { label: string; value: T | undefined }[]
  onChange: (val: T | undefined) => void
}

function FilterSelect<T>({ label, value, options, onChange }: SelectProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <select
        className="bg-background border border-input rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
        value={value === undefined ? '' : String(value)}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? undefined : (v as any))
        }}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value === undefined ? '' : String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface SearchInputProps {
  value?: string
  onChange: (val: string | undefined) => void
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value ?? '')

  React.useEffect(() => {
    if ((value ?? '') !== localValue) {
      setLocalValue(value ?? '')
    }
  }, [value])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const next = localValue.trim() || undefined
      if (next !== value) {
        onChange(next)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])

  return (
    <div className="flex flex-col gap-1.5 col-span-1 md:col-span-4">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Search Content
      </label>
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by title, description or ID..."
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="w-full bg-background border border-input rounded-xl pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        {localValue && (
          <button
            onClick={() => {
              setLocalValue('')
              onChange(undefined)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

interface ContentFilterProps {
  filters: ContentFilters
  setFilters: React.Dispatch<React.SetStateAction<ContentFilters>>
}

export const ContentFilter: React.FC<ContentFilterProps> = ({ filters, setFilters }) => {
  const [openFilters, setOpenFilters] = useState(false)

  const isFiltered = Boolean(
    filters.search ||
      filters.status ||
      filters.media_type ||
      filters.is_kid_safe !== undefined ||
      filters.is_ppv !== undefined
  )

  const handleReset = () => {
    setFilters((prev) => ({
      ...prev,
      search: undefined,
      status: undefined,
      media_type: undefined,
      is_kid_safe: undefined,
      is_ppv: undefined,
    }))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpenFilters((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent border border-border/80 text-foreground text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <FiFilter className="w-4 h-4 text-primary" />
          <span>Filter Toolbar</span>
          <FiChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              openFilters ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground bg-accent hover:bg-accent/80 hover:text-foreground border border-border transition-all cursor-pointer"
          >
            <FiX className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {openFilters && (
          <motion.div
            key="filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SearchInput
                  value={filters.search}
                  onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
                />

                <FilterSelect
                  label="Status"
                  value={filters.status}
                  options={STATUS_OPTIONS}
                  onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
                />

                <FilterSelect
                  label="Media Format"
                  value={filters.media_type}
                  options={MEDIA_OPTIONS}
                  onChange={(media_type) => setFilters((prev) => ({ ...prev, media_type }))}
                />

                <FilterSelect
                  label="Audience"
                  value={filters.is_kid_safe}
                  options={[
                    { label: 'All Audiences', value: undefined },
                    { label: 'Kid Safe Only', value: true },
                    { label: 'General / Adult', value: false },
                  ]}
                  onChange={(is_kid_safe) => setFilters((prev) => ({ ...prev, is_kid_safe }))}
                />

                <FilterSelect
                  label="Monetization"
                  value={filters.is_ppv}
                  options={[
                    { label: 'All Models', value: undefined },
                    { label: 'PPV (Pay-Per-View)', value: true },
                    { label: 'Subscription / Free', value: false },
                  ]}
                  onChange={(is_ppv) => setFilters((prev) => ({ ...prev, is_ppv }))}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ContentFilter
