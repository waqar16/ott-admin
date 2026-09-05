/**
 * Login Form Component
 *
 * Client-side login form with email/password authentication and 2FA support.
 * Uses useAuth hook for authentication state management.
 */

'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { USE_MOCK_DATA } from '@/lib/config'
import { useRouter } from 'next/navigation'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { toast } from 'sonner'
import { leagueSpartan } from '@/fonts/fonts'

interface LoginFormProps {}

export function LoginForm({}: LoginFormProps) {
  const { login } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token2fa, setToken2fa] = useState('')
  const [show2FA, setShow2FA] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginLoading, setLoginLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showRedirectLoader, setShowRedirectLoader] = React.useState<{
    show: boolean
    message: string
  }>({ show: false, message: '' })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render the auth form only on the client to avoid SSR hydration
  // mismatches from browser/password-manager DOM mutations on inputs.
  if (!mounted) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    setLoginLoading(true)
    try {
      const result = await login(email, password, token2fa || undefined)

      if (result.twoFactorRequired) {
        setShow2FA(true)
        setIsSubmitting(false)
        return
      }
      if (result.role == 'user') {
        toast.error('You do not have access to this platform.')
        router.push('/')
      } else if (result.role == 'admin') {
        setShowRedirectLoader({ show: true, message: 'Redirecting to Admin Dashboard' })
        router.push('/admin')
      }

      setIsSubmitting(false)
    } catch (err: any) {
      console.log(err)

      // Default fallback
      let message = 'Unable to login'

      // ApiError or normal Error
      if (err?.message) {
        message = err.message
      }

      setError(message)
      setIsSubmitting(false)
    }
    setLoginLoading(false)
  }

  return (
    <div className="w-full max-w-md mt-4">
      <style jsx global>{`
        @keyframes shimmer-progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        .animate-shimmer-progress {
          animation: shimmer-progress 1.5s infinite linear;
        }
        @keyframes success-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        .animate-success-pulse {
          animation: success-pulse 2s infinite ease-in-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Modern Shimmer Progress Bar along the top boundary of the card */}
      {(isSubmitting || loginLoading || showRedirectLoader.show) && (
        <div className="absolute top-[-20px] left-[-20px] right-[-20px] lg:top-[-24px] lg:left-[-24px] lg:right-[-24px] h-1.5 overflow-hidden rounded-t-[2.5rem] bg-blue-50 z-50">
          <div className="h-full w-1/3 bg-[var(--main-color)] rounded-full animate-shimmer-progress" />
        </div>
      )}

      {/* Elegant Redirect success overlay inside the login card */}
      {showRedirectLoader.show && (
        <div className="absolute top-[-20px] left-[-20px] right-[-20px] bottom-[-20px] lg:top-[-24px] lg:left-[-24px] lg:right-[-24px] lg:bottom-[-24px] bg-white/90 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center p-8 z-40 animate-fade-in">
          <div className="flex flex-col items-center space-y-5 text-center">
            {/* Pulsing Success Badge */}
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-green-500 shadow-sm animate-success-pulse">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className={`text-2xl font-extrabold text-slate-900 ${leagueSpartan.className}`}>
                Authenticated
              </h3>
              <p className="text-sm text-slate-500 max-w-[280px] leading-relaxed font-light">
                {showRedirectLoader.message || 'Redirecting to your dashboard...'}
              </p>
            </div>
            {/* Loader indicator dots */}
            <div className="flex space-x-1.5 pt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 transition-all duration-300 ${
          isSubmitting || loginLoading || showRedirectLoader.show
            ? 'opacity-50 pointer-events-none blur-[1px]'
            : ''
        }`}
      >
        <div className="relative flex-1 md:w-auto w-full">
          <input
            type="email"
            id="email"
            value={email}
            required
            disabled={Boolean(isSubmitting || showRedirectLoader.show)}
            onChange={(e) => setEmail(e.target.value)}
            className=" peer w-full   px-4 pt-6  pb-2   placeholder-transparent outline-none ring-1 ring-white  bg-transparent text-neutral-800 text-sm min-h-[60px]  "
            placeholder="Email address"
          />
          <label
            htmlFor="email"
            className="pointer-events-none absolute left-4 top-2 text-xs text-neutral-800 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-neutral-800 peer-placeholder-shown:text-neutral-950 peer-focus:top-2 peer-focus:text-[10px] "
          >
            Email address
          </label>
        </div>

        <div className="relative flex-1 md:w-auto w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className=" peer w-full   px-4 pt-6  pb-2   placeholder-transparent outline-none ring-1 ring-white  bg-transparent text-neutral-800 text-sm min-h-[60px]  "
            placeholder="Password"
            disabled={Boolean(isSubmitting || showRedirectLoader.show)}
            autoComplete="current-password"
          />
          <label
            htmlFor="password"
            className="pointer-events-none absolute left-4 top-2 text-xs text-neutral-800 transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-neutral-800 peer-placeholder-shown:text-neutral-950 peer-focus:top-2 peer-focus:text-[10px] "
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={Boolean(isSubmitting || showRedirectLoader.show)}
            className="
      absolute right-4 top-1/2 -translate-y-1/2
      text-neutral-600 focus:outline-none disabled:opacity-50
    "
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
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
              disabled={Boolean(isSubmitting || showRedirectLoader.show)}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter 6-digit code"
              maxLength={6}
              autoComplete="one-time-code"
            />
            <p className="text-xs text-blue-700 mt-2">Enter the code from your authenticator app</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={Boolean(isSubmitting || showRedirectLoader.show)}
          className="w-full py-3 px-4 bg-[var(--main-color)]  text-white font-semibold rounded-lg hover:bg-[var(--main-color)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
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
          <a href="#" className="text-[var(--main-color)]  font-medium">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  )
}
