
"use client"
import React from 'react' 

import { ContentFilters } from '@/lib/types/content'
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
interface ContentFilterProps { filters: ContentFilters; setFilters: React.Dispatch<React.SetStateAction<ContentFilters>> }

const ContentFilter: React.FC<ContentFilterProps> = ({ filters, setFilters }) => {
  return (
    <div className="  bg-neutral-900 rounded-xl p-5 border border-neutral-800">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            { label: 'All', value: undefined },
            { label: 'Kid Safe', value: true },
            { label: 'Not Kid Safe', value: false },
          ]}
          onChange={is_kid_safe =>
            setFilters(prev => ({ ...prev, is_kid_safe }))
          }
        />

        <FilterSelect
          label="PPV"
          value={filters.is_ppv}
          options={[
            { label: 'All', value: undefined },
            { label: 'PPV', value: true },
            { label: 'Non-PPV', value: false },
          ]}
          onChange={is_ppv =>
            setFilters(prev => ({ ...prev, is_ppv }))
          }
        />
      </div>
    </div>
  )
}

export default ContentFilter
