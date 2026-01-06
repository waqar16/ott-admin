/**
 * Login Form Component
 * 
 * Client-side login form with email/password authentication and 2FA support.
 * Uses useAuth hook for authentication state management.
 */

'use client';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { USE_MOCK_DATA } from '@/lib/config';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
 
}

export function LoginForm({   }: LoginFormProps) {
  const { login, loading } = useAuth();
  const router  = useRouter()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token2fa, setToken2fa] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password, token2fa || undefined);
       
      if (result.twoFactorRequired) {
        setShow2FA(true);
        setIsSubmitting(false);
        return;
      }
      if(result.role =='user'){
        router.push('/')
      }
      else if( result.role == 'admin'){
        router.push('/admin')

      }

      setIsSubmitting(false);

 
      
    } catch (err: any) {
      console.error('[LoginForm] Login error:', err);
      
     setError("Unable to login")
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {USE_MOCK_DATA && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>🧪 Mock Mode Active</strong>
            <br />
            Any email and password will work in development mode.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={(isSubmitting || loading) && (Cookies.get('access_token'))}
            className="text-gray-800 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={(isSubmitting || loading) && (Cookies.get('access_token'))}
            className="text-gray-800 w-full   px-4 py-2 border  border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        {show2FA && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label htmlFor="token2fa" className="block text-sm font-medium text-blue-900 mb-2">
              Two-Factor Authentication Code
            </label>
            <input
              id="token2fa"
              type="text"
              value={token2fa}
              onChange={(e) => setToken2fa(e.target.value)}
              required
              disabled={isSubmitting || loading}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter 6-digit code"
              maxLength={6}
              autoComplete="one-time-code"
            />
            <p className="text-xs text-blue-700 mt-2">
              Enter the code from your authenticator app
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={(isSubmitting || loading) && (Cookies.get('access_token'))}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {(isSubmitting || loading) && Cookies.get('access_token') ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing in...
            </span>
          ) : show2FA ? (
            'Verify Code'
          ) : (
            'Sign In'
          )}
        </button>

        <div className="text-center text-sm text-gray-600">
          <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
