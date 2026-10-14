'use client'

import React from 'react'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 dark:bg-neutral-800/90 motion-reduce:animate-none ${className}`}
      {...props}
    />
  )
}

export default Skeleton
