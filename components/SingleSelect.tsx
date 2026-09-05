import { API_BASE } from '@/lib/config'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Option = {
  id: string
  name: string
}

type SingleSelectProps = {
  label: string
  options: Option[]
  value: string | null
  onChange: (id: string) => void
}
export default function SingleSelect({ label, options, value, onChange }: SingleSelectProps) {
  const [open, setOpen] = useState(false)

  const selected = options.find((o) => o.id === value)

  const selectOption = (id: string) => {
    onChange(id)
    setOpen(false) // close after select
  }

  const buttonRef = useRef<HTMLDivElement>(null)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)

  const toggle = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
    setOpen((o) => !o)
  }
  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>

      {/* Dropdown Button */}
      <div
        ref={buttonRef}
        onClick={toggle}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer border border-gray-600 flex justify-between items-center"
      >
        <span className={selected ? '' : 'text-gray-400'}>
          {selected ? selected.name : 'Select option...'}
        </span>
        <span className="text-gray-400">▾</span>
      </div>

      {/* Dropdown Panel */}
      {open &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="bottom-0 fixed z-[9999] bg-neutral-950 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto minimal-scrollbar"
            style={{
              top: buttonRect?.bottom,
              left: buttonRect?.left,
              width: buttonRect?.width,
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => selectOption(opt.id)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-700 text-neutral-200"
              >
                {opt.name}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  )
}
