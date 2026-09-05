// 'use client';

// import { createPortal } from "react-dom";
// import { motion } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import styles from './styles.module.css';

// export default function FullScreenRedirectLoader({
//   message = "Redirecting",
// }: {
//   message?: string;
// }) {
//   const [mounted, setMounted] = useState(false);
//   const [dots, setDots] = useState(".");

//   useEffect(() => {
//     setMounted(true);

//     const interval = setInterval(() => {
//       setDots((prev) => (prev.length < 3 ? prev + "." : "."));
//     }, 400);

//     return () => clearInterval(interval);
//   }, []);

//   // 🚫 Prevent SSR / prerender crash
//   if (!mounted) return null;

//   return createPortal(
//     <div className="bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center fixed inset-0 z-50 pointer-events-auto">
//       <motion.div className="relative m-2 h-10 w-auto overflow-hidden z-[9999999999999]">
//         <img src="/mainLogo.webp" className="h-10 w-auto" />

//         <motion.div
//           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
//           initial={{ x: "-120%", y: "-120%" }}
//           animate={{ x: "120%", y: "120%" }}
//           transition={{
//             duration: 1.2,
//             repeat: Infinity,
//             repeatDelay: 1.5,
//             ease: "easeInOut",
//           }}
//           style={{
//             transform: "skew(-20deg)",
//             mixBlendMode: "screen",
//           }}
//         />
//       </motion.div>

//       <div className="flex flex-row items-center w-full justify-center z-[9999]">
//         <p className="text-neutral-300 text-sm tracking-wide mr-2">
//           {message}{dots}
//         </p>
//         <div className={styles.loader}></div>
//       </div>
//     </div>,
//     document.body
//   );
// }

'use client'

import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import styles from './styles.module.css'
import SkeletonLoader from './SkeletonLoader'
import {
  FiChevronDown,
  FiFileText,
  FiHome,
  FiList,
  FiMessageSquare,
  FiSettings,
  FiUsers,
} from 'react-icons/fi'
import { BsCash, BsFileBarGraph, BsQuestionDiamondFill, BsSubscript } from 'react-icons/bs'
import { BiDollar, BiMovie, BiTv } from 'react-icons/bi'
import { GrPlan } from 'react-icons/gr'

export default function FullScreenRedirectLoader({
  message = 'Redirecting',
  showSidebar,
}: {
  message?: string
  showSidebar?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const [dots, setDots] = useState('.')

  useEffect(() => {
    setMounted(true)

    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '.'))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  // 🚫 Prevent SSR / prerender crash
  if (!mounted) return null

  return createPortal(
    <div className=" flex flex-row items-center justify-end   fixed inset-0 z-50 ">
      {/* <div className={`w-[260px] bg-black h-screen text-gray-200 fixed left-0 top-0 shadow-xl overflow-y-auto pointer-events-none`}>
  
  <div className="py-5 text-center border-b border-gray-700">
    <div className="flex flex-row items-center gap-2 w-full justify-center">
      <img src="/mainLogo.webp" className="w-8 h-auto mr-2"/>
      <h1 className="text-xl font-bold text-white">Admin Panel</h1>
    </div>
  </div>
 
  <div className="mt-4 flex flex-col items-center space-y-2">
   
    <div className="w-11/12 flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
      <FiHome size={18} />
      <span>Overview</span>
    </div>

 
    <div className="w-11/12 h-12 bg-neutral-800/50 rounded-lg flex items-center gap-3 px-4 text-gray-400">
      <BsFileBarGraph size={18} />
      <span>Analytics</span>
    </div>

 
    <div className="w-11/12 h-12 bg-neutral-800/50 rounded-lg flex items-center gap-3 px-4 text-gray-400">
      <FiUsers size={18} />
      <span>Creators</span>
    </div>

 
    <div className="w-11/12 h-12 bg-neutral-800/50 rounded-lg flex items-center gap-3 px-4 text-gray-400">
      <BiDollar size={18} />
      <span>Creators Revenue</span>
    </div>

     
    <div className="w-11/12">
      <div className="w-full h-12 bg-neutral-800/50 rounded-lg flex items-center justify-between px-4 text-gray-400">
        <span className="flex items-center gap-3">
          <FiUsers size={18} />
          <span>Users</span>
        </span>
        <FiChevronDown />
      </div>
      <div className="ml-4 mt-1 flex flex-col space-y-1">
        <div className="h-10 bg-neutral-700/50 rounded-lg flex items-center gap-3 px-4 text-gray-400 text-xs">
          <FiList size={16} />
          <span>Manage Users</span>
        </div>
      </div>
    </div>
 
    <div className="w-11/12">
      <div className="w-full h-12 bg-neutral-800/50 rounded-lg flex items-center justify-between px-4 text-gray-400">
        <span className="flex items-center gap-3">
          <BsQuestionDiamondFill size={18} />
          <span>Faqs</span>
        </span>
        <FiChevronDown />
      </div>
      <div className="ml-4 mt-1 flex flex-col space-y-1">
        <div className="h-10 bg-neutral-700/50 rounded-lg flex items-center gap-3 px-4 text-gray-400 text-xs">
          <FiMessageSquare size={16} />
          <span>Manage FAQS</span>
        </div>
      </div>
    </div>
 
    <div className="w-11/12">
      <div className="w-full h-12 bg-neutral-800/50 rounded-lg flex items-center justify-between px-4 text-gray-400">
        <span className="flex items-center gap-3">
          <FiFileText size={18} />
          <span>Content</span>
        </span>
        <FiChevronDown />
      </div>
      <div className="ml-4 mt-1 flex flex-col space-y-1">
        <div className="h-10 bg-neutral-700/50 rounded-lg flex items-center gap-3 px-4 text-gray-400 text-xs">
          <BiMovie size={16} />
          <span>Movies</span>
        </div>
        <div className="h-10 bg-neutral-700/50 rounded-lg flex items-center gap-3 px-4 text-gray-400 text-xs">
          <BiTv size={16} />
          <span>Series</span>
        </div>
        <div className="h-10 bg-neutral-700/50 rounded-lg flex items-center gap-3 px-4 text-gray-400 text-xs">
          <BiTv size={16} />
          <span>Trailers</span>
        </div>
      </div>
    </div>
 
    <div className="w-11/12">
      <div className="w-full h-12 bg-neutral-800/50 rounded-lg flex items-center justify-between px-4 text-gray-400">
        <span className="flex items-center gap-3">
          <BsCash size={18} />
          <span>Payment</span>
        </span>
        <FiChevronDown />
      </div>
      <div className="ml-4 mt-1 flex flex-col space-y-1">
        <div className="h-10 bg-neutral-700/50 rounded-lg flex items-center gap-3 px-4 text-gray-400 text-xs">
          <BsSubscript size={16} />
          <span>Payment Plans</span>
        </div>
        <div className="h-10 bg-neutral-700/50 rounded-lg flex items-center gap-3 px-4 text-gray-400 text-xs">
          <GrPlan size={16} />
          <span>Subscriptions</span>
        </div>
      </div>
    </div>
 
    <div className="w-11/12 h-12 bg-neutral-800/50 rounded-lg flex items-center gap-3 px-4 text-gray-400">
      <FiSettings size={18} />
      <span>Settings</span>
    </div>
  </div>
</div> */}
      <div
        className={`backdrop-blur-lg h-full bg-black/80 flex flex-col items-center justify-center ${showSidebar ? 'w-[calc(100%-260px)]' : 'w-full'}  pointer-events-auto`}
      >
        <motion.div className="relative m-2 h-10 w-auto overflow-hidden z-[9999999999999]">
          <img src="/mainLogo.webp" className="h-10 w-auto" />

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            initial={{ x: '-120%', y: '-120%' }}
            animate={{ x: '120%', y: '120%' }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeInOut',
            }}
            style={{
              transform: 'skew(-20deg)',
              mixBlendMode: 'screen',
            }}
          />
        </motion.div>

        <div className="flex flex-row items-center w-full justify-center z-[9999]">
          <p className="text-neutral-300 text-sm tracking-wide mr-2">
            {message}
            {dots}
          </p>
          {/* <div className={styles.loader}></div> */}
        </div>
      </div>
    </div>,
    document.body
  )
}

//  return createPortal(
//   <div className="flex flex-row items-center justify-end fixed inset-0 z-50">
//     {/* Sidebar - NOW CLICKABLE */}
//     {showSidebar && (
//       <div className={`w-[260px] bg-black h-screen text-gray-200 fixed left-0 top-0 shadow-xl   ${varela_round.className}`}>
//         <div className="py-5 text-center border-b border-gray-700">
//           <div className="flex flex-row items-center gap-2 w-full justify-center">
//             <img src="/mainLogo.webp" className="w-8 h-auto mr-2"/>
//             <h1 className={`text-xl font-bold text-white ${leagueSpartan.className}`}>Admin Panel</h1>
//           </div>
//         </div>

//         <div className="mt-4 flex flex-col items-center space-y-2">
//           <Link href="/admin" className="w-11/12 flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//             <FiHome size={18} />
//             <span>Overview</span>
//           </Link>

//           <Link href="/admin/analytics" className="w-11/12 flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//             <BsFileBarGraph size={18} />
//             <span>Analytics</span>
//           </Link>

//           <Link href="/admin/creator" className="w-11/12 flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//             <FiUsers size={18} />
//             <span>Creators</span>
//           </Link>

//           <Link href="/admin/revenue" className="w-11/12 flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//             <BiDollar size={18} />
//             <span>Creators Revenue</span>
//           </Link>

//           {/* Users dropdown */}
//           <div className="w-11/12">
//             <div className="w-full flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 justify-between">
//               <span className="flex items-center gap-3">
//                 <FiUsers size={18} />
//                 <span>Users</span>
//               </span>
//               <FiChevronDown />
//             </div>
//             <div className="ml-4 mt-1 flex flex-col space-y-1">
//               <Link href="/admin/users" className="flex items-center text-xs gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//                 <FiList size={16} />
//                 <span>Manage Users</span>
//               </Link>
//             </div>
//           </div>

//           {/* FAQs dropdown */}
//           <div className="w-11/12">
//             <div className="w-full flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 justify-between">
//               <span className="flex items-center gap-3">
//                 <BsQuestionDiamondFill size={18} />
//                 <span>Faqs</span>
//               </span>
//               <FiChevronDown />
//             </div>
//             <div className="ml-4 mt-1 flex flex-col space-y-1">
//               <Link href="/admin/faqs" className="flex items-center text-xs gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//                 <FiMessageSquare size={16} />
//                 <span>Manage FAQS</span>
//               </Link>
//             </div>
//           </div>

//           {/* Content dropdown */}
//           <div className="w-11/12">
//             <div className="w-full flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 justify-between">
//               <span className="flex items-center gap-3">
//                 <FiFileText size={18} />
//                 <span>Content</span>
//               </span>
//               <FiChevronDown />
//             </div>
//             <div className="ml-4 mt-1 flex flex-col space-y-1">
//               <Link href="/admin/movie-management" className="flex items-center text-xs gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//                 <BiMovie size={16} />
//                 <span>Movies</span>
//               </Link>
//               <Link href="/admin/series-management" className="flex items-center text-xs gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//                 <BiTv size={16} />
//                 <span>Series</span>
//               </Link>
//               <Link href="/admin/trailer-management" className="flex items-center text-xs gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//                 <BiTv size={16} />
//                 <span>Trailers</span>
//               </Link>
//             </div>
//           </div>

//           {/* Payment dropdown */}
//           <div className="w-11/12">
//             <div className="w-full flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 justify-between">
//               <span className="flex items-center gap-3">
//                 <BsCash size={18} />
//                 <span>Payment</span>
//               </span>
//               <FiChevronDown />
//             </div>
//             <div className="ml-4 mt-1 flex flex-col space-y-1">
//               <Link href="/admin/payment-plans" className="flex items-center text-xs gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//                 <BsSubscript size={16} />
//                 <span>Payment Plans</span>
//               </Link>
//               <Link href="/admin/subscriptions" className="flex items-center text-xs gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//                 <GrPlan size={16} />
//                 <span>Subscriptions</span>
//               </Link>
//             </div>
//           </div>

//           {/* Settings */}
//           <Link href="/admin/settings" className="w-11/12 flex items-center text-sm gap-3 px-4 py-2 rounded-md text-gray-300 hover:bg-[var(--main-color)] hover:text-white transition">
//             <FiSettings size={18} />
//             <span>Settings</span>
//           </Link>
//         </div>
//       </div>
//     )}

//     {/* Loading overlay - only covers main content area */}
//     <div className={`backdrop-blur-lg h-full bg-black/80 flex flex-col items-center justify-center ${showSidebar?'w-[calc(100%-260px)]':'w-full'} pointer-events-auto`}>
//       <motion.div className="relative m-2 h-10 w-auto overflow-hidden z-[9999999999999]">
//         <img src="/mainLogo.webp" className="h-10 w-auto" />

//         <motion.div
//           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
//           initial={{ x: "-120%", y: "-120%" }}
//           animate={{ x: "120%", y: "120%" }}
//           transition={{
//             duration: 1.2,
//             repeat: Infinity,
//             repeatDelay: 1.5,
//             ease: "easeInOut",
//           }}
//           style={{
//             transform: "skew(-20deg)",
//             mixBlendMode: "screen",
//           }}
//         />
//       </motion.div>

//       <div className="flex flex-row items-center w-full justify-center z-[9999]">
//         <p className="text-neutral-300 text-sm tracking-wide mr-2">
//           {message}{dots}
//         </p>
//       </div>
//     </div>
//   </div>,
//   document.body
// );
