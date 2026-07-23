// components/FullScreenLoader.tsx
import React from 'react'
type FullScreenLoaderProps = {
  msg?: string
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ msg = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="h-12 w-12 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>

        <p className="text-white text-sm tracking-wide">{msg}</p>
      </div>
    </div>
  )
}

export default FullScreenLoader
