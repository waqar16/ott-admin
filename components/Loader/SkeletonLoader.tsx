import React from 'react'
type SkeletonLoaderProps = {
  className?: string;
  children?: React.ReactNode;
};
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = "", children }) => {
  return ( 
      <div
      className={`animate-pulse text-transparent rounded ${className}`}
    >{children}</div> 
  )
}

 

export default SkeletonLoader;
