

// import React, { useEffect, useRef, useState } from 'react'
// import { createPortal } from 'react-dom'

// export default function MultiSelect({ allGenre, formData, setFormData }) {
//   const [open, setOpen] = useState(false)
//   const buttonRef = useRef<HTMLDivElement>(null)
//   const dropdownRef = useRef<HTMLDivElement>(null)
//   const [rect, setRect] = useState<DOMRect | null>(null)

//   const toggleOpen = () => {
//     if (buttonRef.current) {
//       setRect(buttonRef.current.getBoundingClientRect())
//     }
//     setOpen((o) => !o)
//   }

//   const toggleGenre = (id: string) => {
//     setFormData((prev) => {
//       const exists = prev.genres.includes(id)
//       return {
//         ...prev,
//         genres: exists ? prev.genres.filter((g: string) => g !== id) : [...prev.genres, id],
//       }
//     })
//   }

//   // ✅ Close on outside click
//   useEffect(() => {
//     if (!open) return

//     const handler = (e: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target as Node) &&
//         buttonRef.current &&
//         !buttonRef.current.contains(e.target as Node)
//       ) {
//         setOpen(false)
//       }
//     }

//     document.addEventListener('mousedown', handler)
//     return () => document.removeEventListener('mousedown', handler)
//   }, [open])

//   return (
//     <>
//       <div className="relative">
//         <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>

//         {/* Button */}
//         {allGenre.length > 0 ? (
//           <div
//             ref={buttonRef}
//             onClick={toggleOpen}
//             className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-pointer border border-gray-600"
//           >
//             {formData.genres.length === 0 ? (
//               <span className="text-gray-400">Select genres...</span>
//             ) : (
//               formData.genres.map((id) => {
//                 const g = allGenre.find((x) => x.id === id)
//                 return (
//                   <span key={id} className="bg-blue-600 px-2 py-1 text-xs rounded-md">
//                     {g?.name}
//                   </span>
//                 )
//               })
//             )}
//           </div>
//         ) : (
//           <div className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-not-allowed border border-gray-600">
//             <span className="text-gray-400">No genres available</span>
//           </div>
//         )}
//       </div>

//       {/* Dropdown (PORTAL) */}
//       {open &&
//         rect &&
//         createPortal(
//           <div
//             ref={dropdownRef}
//             className="fixed z-[9999] bg-neutral-950 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto minimal-scrollbar"
//             style={{
//               bottom: 8,
//               left: rect.left,
//               width: rect.width,
//             }}
//           >
//             {allGenre.map((type) => {
//               const isSelected = formData.genres.includes(type.id)

//               return (
//                 <div
//                   key={type.id}
//                   onClick={() => toggleGenre(type.id)}
//                   className="flex items-center px-4 py-2 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
//                 >
//                   <input type="checkbox" checked={isSelected} readOnly className="mr-3" />
//                   {type.name}
//                 </div>
//               )
//             })}
//           </div>,
//           document.body
//         )}
//     </>
//   )
// }

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Genre {
  id: string
  name: string
}

interface MultiSelectProps {
  allGenre: Genre[]
  formData: {
    genres?: string[]
    [key: string]: any
  }
  setFormData: React.Dispatch<React.SetStateAction<any>>
}

export default function MultiSelect({
  allGenre = [],
  formData,
  setFormData,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  })

  const selectedGenres: string[] = Array.isArray(formData.genres)
    ? formData.genres.map(String)
    : []

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = () => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const dropdownHeight = 192
    const gap = 6
    const spaceBelow = window.innerHeight - rect.bottom
    const openAbove = spaceBelow < dropdownHeight + gap && rect.top > dropdownHeight

    setPosition({
      top: openAbove
        ? Math.max(8, rect.top - dropdownHeight - gap)
        : rect.bottom + gap,
      left: Math.max(
        8,
        Math.min(rect.left, window.innerWidth - Math.max(rect.width, 200) - 8)
      ),
      width: rect.width,
    })
  }

  const toggleOpen = () => {
    if (!open) updatePosition()
    setOpen((prev) => !prev)
  }

  const toggleGenre = (id: string) => {
    setFormData((prev: any) => {
      const genres: string[] = Array.isArray(prev.genres)
        ? prev.genres.map(String)
        : []

      return {
        ...prev,
        genres: genres.includes(String(id))
          ? genres.filter((genreId) => genreId !== String(id))
          : [...genres, String(id)],
      }
    })
  }

  useEffect(() => {
    if (!open) return

    updatePosition()

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        !dropdownRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }

    const handleScrollOrResize = () => updatePosition()

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
    <>
      <div className="relative w-full min-w-0">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Genre
        </label>

        <div
          ref={buttonRef}
          onClick={toggleOpen}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              toggleOpen()
            }

            if (event.key === 'Escape') setOpen(false)
          }}
          tabIndex={0}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="w-full min-h-[42px] px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg flex flex-wrap gap-2 cursor-pointer border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {selectedGenres.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400">
              Select genres...
            </span>
          ) : (
            selectedGenres.map((id) => {
              const genre = allGenre.find(
                (item) => String(item.id) === id
              )

              return (
                <span
                  key={id}
                  className="bg-blue-600 text-white px-2 py-1 text-xs rounded-md"
                >
                  {genre?.name || `Genre (${id})`}
                </span>
              )
            })
          )}
        </div>
      </div>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            aria-multiselectable="true"
            className="fixed z-[99999] bg-white dark:bg-neutral-950 text-gray-900 dark:text-white rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-y-auto minimal-scrollbar"
            style={{
              top: position.top,
              left: position.left,
              width: Math.max(position.width, 200),
              maxHeight: '192px',
            }}
          >
            {allGenre.length > 0 ? (
              allGenre.map((genre) => {
                const id = String(genre.id)
                const isSelected = selectedGenres.includes(id)

                return (
                  <div
                    key={id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleGenre(id)}
                    className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      tabIndex={-1}
                      className="mr-3 accent-blue-600"
                    />
                    {genre.name}
                  </div>
                )
              })
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No genres available
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  )
}
