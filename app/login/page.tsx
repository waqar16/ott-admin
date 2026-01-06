'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm.client';
import Link from 'next/link';

export default function LoginPage() {
  // const { isLoggedIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/admin';

  // useEffect(() => {
  //   if (isLoggedIn) router.replace(redirect);
  // }, [isLoggedIn, router, redirect]);

  // const handleSuccess = () => {
  //   router.push(redirect);
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <div className=" w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-2xl text-white">
              <h1>OTT</h1>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to continue watching</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <LoginForm />
          
        </div>
      </div>
    </div>
  );
}
