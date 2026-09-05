// import React from "react";
// export default function MultiSelect({ allGenre, formData, setFormData }) {
//   const [open, setOpen] = React.useState(false);

//   const toggleGenre = (id: string) => {
//     setFormData((prev) => {
//       const exists = prev.genres.includes(id);
//       return {
//         ...prev,
//         genres: exists
//           ? prev.genres.filter((g: string) => g !== id)
//           : [...prev.genres, id],
//       };
//     });
//   };

//   return (
//     <div className="relative">
//       <label className="block text-sm font-medium text-gray-300 mb-2">
//         Genre
//       </label>

//       {/* Dropdown Button */}
//       <div
//         onClick={() => setOpen(!open)}
//         className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-pointer border border-gray-600"
//       >
//         {formData.genres.length === 0 ? (
//           <span className="text-gray-400">Select genres...</span>
//         ) : (
//           formData.genres.map((id) => {
//             const g = allGenre.find((x) => x.id === id);
//             return (
//               <span
//                 key={id}
//                 className="bg-blue-600 px-2 py-1 text-xs rounded-md"
//               >
//                 {g?.name}
//               </span>
//             );
//           })
//         )}
//       </div>

//       {/* Dropdown Panel */}
//       {open && (
//         <div className="absolute z-20 w-full mt-2 bg-neutral-950 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto">
//           {allGenre.map((type: { id: string; name: string }) => {
//             const isSelected = formData.genres.includes(type.id);

//             return (
//               <div
//                 key={type.id}
//                 onClick={() => toggleGenre(type.id)}
//                 className="flex items-center px-4 py-2 text-white cursor-pointer hover:bg-gray-700"
//               >
//                 <input
//                   type="checkbox"
//                   checked={isSelected}
//                   readOnly
//                   className="mr-3"
//                 />
//                 {type.name}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function MultiSelect({ allGenre, formData, setFormData }) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const toggleOpen = () => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect())
    }
    setOpen((o) => !o)
  }

  const toggleGenre = (id: string) => {
    setFormData((prev) => {
      const exists = prev.genres.includes(id)
      return {
        ...prev,
        genres: exists ? prev.genres.filter((g: string) => g !== id) : [...prev.genres, id],
      }
    })
  }

  // ✅ Close on outside click
  useEffect(() => {
    if (!open) return

    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <>
      <div className="relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>

        {/* Button */}
        {allGenre.length > 0 ? (
          <div
            ref={buttonRef}
            onClick={toggleOpen}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-pointer border border-gray-600"
          >
            {formData.genres.length === 0 ? (
              <span className="text-gray-400">Select genres...</span>
            ) : (
              formData.genres.map((id) => {
                const g = allGenre.find((x) => x.id === id)
                return (
                  <span key={id} className="bg-blue-600 px-2 py-1 text-xs rounded-md">
                    {g?.name}
                  </span>
                )
              })
            )}
          </div>
        ) : (
          <div className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg flex flex-wrap gap-2 cursor-not-allowed border border-gray-600">
            <span className="text-gray-400">No genres available</span>
          </div>
        )}
      </div>

      {/* Dropdown (PORTAL) */}
      {open &&
        rect &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-neutral-950 rounded-lg shadow-lg border border-gray-700 max-h-48 overflow-y-auto minimal-scrollbar"
            style={{
              bottom: 8,
              left: rect.left,
              width: rect.width,
            }}
          >
            {allGenre.map((type) => {
              const isSelected = formData.genres.includes(type.id)

              return (
                <div
                  key={type.id}
                  onClick={() => toggleGenre(type.id)}
                  className="flex items-center px-4 py-2 text-white cursor-pointer hover:bg-gray-700"
                >
                  <input type="checkbox" checked={isSelected} readOnly className="mr-3" />
                  {type.name}
                </div>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}
