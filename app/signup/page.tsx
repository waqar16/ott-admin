'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignupForm } from '@/components/auth/SignupForm.client';
import Link from 'next/link';

export default function SignupPage() { 
  const params = useSearchParams();
  const plan = params.get('plan') || 'full';
 
 
 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-2xl text-white">
              OTT
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Join OTT Platform</h1>
          <p className="text-gray-300">Start streaming today</p>
          {plan && plan !== 'full' && (
            <div className="mt-4 inline-block px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg">
              <p className="text-sm text-purple-200">
                Selected plan: <span className="font-semibold uppercase">{plan}</span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <SignupForm   />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={`/login`}
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
