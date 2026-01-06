import React from 'react'
import SkeletonLoader from '../Loader/SkeletonLoader'

const ContentLoading = () => {
  return (
    <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 rounded-lg  w-full flex flex-col items-start gap-4 ">
      
            {Array.from({ length: 2 }).map((_, index) => (

              <div className='  p-4 py-6 bg-neutral-900 w-full h-auto rounded-md mt-2 flex flex-col items-start w-full'>
                <div className='flex flex-row items-center justify-between w-full'>
                  <div className='flex flex-row items-center w-6/12'>
                    <SkeletonLoader key={index} className='w-[300px] mx-1 h-[25px] bg-neutral-800 ' />
                    <SkeletonLoader key={index} className='w-[50px] mx-1 h-[20px] bg-neutral-800 rounded-full ' />
                  </div>
                  <div className='flex flex-row items-center justify-end w-6/12'>
                    <SkeletonLoader key={index} className='w-[100px] mx-1 h-[35px] bg-neutral-800 ' />
                    <SkeletonLoader key={index} className='w-[100px] mx-1 h-[35px] bg-neutral-800 ' />
                  </div>
                </div>
                <div className='flex flex-row items-center w-full justify-start'>
                  <SkeletonLoader key={index} className='ml-1 w-3/12 mt-2 h-[20px] bg-neutral-800 ' />

                </div>
                <div className='flex flex-row items-center w-full justify-start mt-4'>
                  <SkeletonLoader key={index} className='ml-1 w-2/12 h-[15px] bg-neutral-800 ' />
                  <SkeletonLoader key={index} className='ml-4 w-2/12 h-[15px] bg-neutral-800 ' />
                  <SkeletonLoader key={index} className='ml-4 w-3/12 h-[15px] bg-neutral-800 ' />

                </div>
              </div>

            ))}
          </div>
  )
}

export default ContentLoading
