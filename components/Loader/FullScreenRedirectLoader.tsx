 
'use client';
import { createPortal } from "react-dom";

// export default function FullScreenRedirectLoader({ message = "Redirecting" }) {
//   if (typeof window === "undefined") return null;

//   return createPortal(
//     <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center">
//       {message}...
//     </div>,
//     document.body
//   );
// }

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './styles.module.css'
export default function FullScreenRedirectLoader({
  message = "Redirecting",
}: {
  message?: string;
}) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) =>
        prev.length < 3 ? prev + "." : "."
      );
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return createPortal(
    <div className="  bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center fixed inset-0 z-50 pointer-events-auto"
    
  >
      
     

<motion.div
  className="relative m-2 h-10 w-auto overflow-hidden z-[9999999999999]"
>
  {/* Your logo */}
  <img 
    src="/mainLogo.webp" 
    className="h-10 w-auto"
  />

  {/* Diagonal light shimmer */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
    initial={{ x: "-120%", y: "-120%" }}
    animate={{ x: "120%", y: "120%" }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
      repeatDelay: 1.5,
      ease: "easeInOut",
    }}
    style={{
      transform: "skew(-20deg)",
      mixBlendMode: "screen",
    }}
  />
</motion.div>

      
      <div className='flex flex-row items-center w-full justify-center z-[9999]'>
<p className="text-neutral-300 text-sm tracking-wide mr-2">
        {message}
      </p>
<div className={styles.loader}></div>
      </div>
      
    </div>
    ,
    document.body)
   
}
