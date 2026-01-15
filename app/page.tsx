'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm.client';
import Link from 'next/link';
import {  leagueSpartan } from '@/fonts/fonts';
import FullScreenRedirectLoader from '@/components/Loader/FullScreenRedirectLoader';

export default function LoginPage() {   
 
  return (
     <div className="relative min-h-screen flex items-center justify-center bg-neutral-300 py-12 px-4">
      <div className='absolute bg-[var(--main-color)] w-full h-[50vh] z-1 top-0'></div>
      <h1 className={`absolute top-4 left-4 text-left w-auto text-lg ${leagueSpartan.className} font-normal text-white`}>{`Home `} <span className='text-neutral-400'>{`> Login`}</span></h1>
          <div className="w-full max-w-md z-50">
            
    
            <div className="bg-neutral-300   shadow-2xl p-8">
              <h1 className={`font-bold text-4xl ${leagueSpartan.className}`}>Login</h1>
              <LoginForm />
              
              
            </div>
          </div>
        </div>
  );
}
