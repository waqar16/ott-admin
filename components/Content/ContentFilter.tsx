
"use client"
import React, { useState } from 'react' 

import { ContentFilters } from '@/lib/types/content'
import { AnimatePresence,motion } from 'framer-motion'
const STATUS_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Processing', value: 'processing' },
  { label: 'Published', value: 'published' },
  { label: 'Inactive', value: 'inactive' },
]

const MEDIA_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Flat', value: 'flat' },
  { label: 'VR 360 Mono', value: 'vr_360_mono' },
  { label: 'VR 360 SBS', value: 'vr_360_sbs' },
  { label: 'VR 360 TB', value: 'vr_360_tb' },
  { label: 'VR 180 Mono', value: 'vr_180_mono' },
  { label: 'VR 180 SBS', value: 'vr_180_sbs' },
  { label: 'VR 180 TB', value: 'vr_180_tb' },
]

const BOOLEAN_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]
 
interface SelectProps<T> {
  label: string
  value: T | undefined
  options: { label: string; value: T | undefined }[]
  onChange: (val: T | undefined) => void
}

function FilterSelect<T>({
  label,
  value,
  options,
  onChange,
}: SelectProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <select
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        value={value === undefined ? '' : String(value)}
        onChange={e => {
          const v = e.target.value
          onChange(v === '' ? undefined : (v as any))
        }}
      >
        {options.map(opt => (
          <option
            key={String(opt.value)}
            value={opt.value === undefined ? '' : String(opt.value)}
          >
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
  const [localValue, setLocalValue] = React.useState(value ?? '')
  React.useEffect(() => {
    if ((value ?? '') !== localValue) {
      setLocalValue(value ?? '')
    }
  }, [value])
 React.useEffect(() => {
    const timer = setTimeout(() => {
      const next = localValue.trim() || undefined

      // 🔥 prevent infinite loop
      if (next !== value) {
        onChange(next)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange])
  return (
    <div className=" flex flex-col gap-1 col-span-4 md:col-span-4">
      <label className="text-xs text-gray-400">Search</label>
      <input
        type="text"
        placeholder="Search by title or description..."
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  )
}

interface ContentFilterProps { filters: ContentFilters; setFilters: React.Dispatch<React.SetStateAction<ContentFilters>> }

const ContentFilter: React.FC<ContentFilterProps> = ({ filters, setFilters }) => {
  const [openFilters, setOpenFilters] = useState(false);
  return (
   <AnimatePresence initial={false}>
    <button
  onClick={() => setOpenFilters(prev => !prev)}
  className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition"
>
  Filters
  <span className={`transition-transform ${openFilters ? "rotate-180" : ""}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="#c7c7c7" width="10" height="10" viewBox="-6.5 0 32 32" version="1.1">
 
<path d="M18.813 11.406l-7.906 9.906c-0.75 0.906-1.906 0.906-2.625 0l-7.906-9.906c-0.75-0.938-0.375-1.656 0.781-1.656h16.875c1.188 0 1.531 0.719 0.781 1.656z"/>
</svg>
  </span>
</button>

  {openFilters && (
    <motion.div
      key="filters"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="overflow-hidden"
       
    >
      <div className="bg-neutral-900 rounded-xl p-5 border border-neutral-800 mt-1">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchInput
            value={filters.search}
            onChange={search =>
              setFilters(prev => ({ ...prev, search }))
            }
          />

          <FilterSelect
            label="Status"
            value={filters.status}
            options={STATUS_OPTIONS}
            onChange={status =>
              setFilters(prev => ({ ...prev, status }))
            }
          />

          <FilterSelect
            label="Media Type"
            value={filters.media_type}
            options={MEDIA_OPTIONS}
            onChange={media_type =>
              setFilters(prev => ({ ...prev, media_type }))
            }
          />

          <FilterSelect
            label="Kid Safe"
            value={filters.is_kid_safe}
            options={[
              { label: "All", value: undefined },
              { label: "Kid Safe", value: true },
              { label: "Not Kid Safe", value: false },
            ]}
            onChange={is_kid_safe =>
              setFilters(prev => ({ ...prev, is_kid_safe }))
            }
          />

          <FilterSelect
            label="PPV"
            value={filters.is_ppv}
            options={[
              { label: "All", value: undefined },
              { label: "PPV", value: true },
              { label: "Non-PPV", value: false },
            ]}
            onChange={is_ppv =>
              setFilters(prev => ({ ...prev, is_ppv }))
            }
          />
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

  )
}

export default ContentFilter
