import { titan_one } from '@/app/layout';
import { leagueSpartan } from '@/fonts/fonts';
import { usePathname } from 'next/navigation'
import React from 'react'
interface ContentHeaderProps {
  handleCreateNew: () => void;
}

const ContentHeaderComponent: React.FC<ContentHeaderProps> = ({ handleCreateNew }) => {
  const pathname = usePathname()

  return (
    <div
  className={`
    sticky top-0 z-50
    bg-black/40 backdrop-blur-md border-b   border-gray-700
    ${leagueSpartan.className}
  `}
>
        <div className="max-w-7xl mx-auto px-4  ">
          <div className="flex flex-col md:flex-row items-center justify-between mt-12 md:mt-0 md:mb-0 mb-4">
            <div className='m-2 md:m-[6px]'>
              <h1 className={`text-2xl font-extrabold `}>
            {pathname.includes("movie-management") ? "Movie" : pathname.includes("show-management") ? "Show" : pathname.includes("trailer-management") ? "Trailer" : pathname.includes("documentary-management") ? "Documentary" :pathname.includes("series-management") ? "Series" : "Content"}  Management</h1>
              <p className="text-gray-400 ">
                Create, upload, and manage video content  
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 font-semibold"
            >
              + Add New {pathname.includes("movie-management") ? "Movie" : pathname.includes("show-management") ? "Show" : pathname.includes("trailer-management") ? "Trailer" : pathname.includes("documentary-management") ? "Documentary" :pathname.includes("series-management") ? "Series" : "Content"}
            </button>
          </div>
        </div>
      </div>
  )
}

export default ContentHeaderComponent
