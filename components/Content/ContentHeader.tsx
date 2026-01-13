import { titan_one } from '@/app/layout';
import { usePathname } from 'next/navigation'
import React from 'react'
interface ContentHeaderProps {
  handleCreateNew: () => void;
}

const ContentHeaderComponent: React.FC<ContentHeaderProps> = ({ handleCreateNew }) => {
  const pathname = usePathname()

  return (
    <div className="bg-black border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className='m-4'>
              <h1 className={`text-3xl font-bold ${titan_one.className}`}>
            {pathname.includes("movie-management") ? "Movie" : pathname.includes("show-management") ? "Show" : pathname.includes("trailer-management") ? "Trailer" : pathname.includes("documentary-management") ? "Documentary" :pathname.includes("series-management") ? "Series" : "Content"}  Management</h1>
              <p className="text-gray-400 mt-1">
                Create, upload, and manage video content  
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold"
            >
              + Add New {pathname.includes("movie-management") ? "Movie" : pathname.includes("show-management") ? "Show" : pathname.includes("trailer-management") ? "Trailer" : pathname.includes("documentary-management") ? "Documentary" :pathname.includes("series-management") ? "Series" : "Content"}
            </button>
          </div>
        </div>
      </div>
  )
}

export default ContentHeaderComponent
