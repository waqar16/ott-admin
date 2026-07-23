'use client'

import { useState } from 'react'
import { ApiError, checkStreamAccess, createPpvCheckout } from '@/lib/paymentsApi'

interface CheckoutButtonProps {
  contentId: string
  priceCents?: number
  onAccess?: (streamUrl: string) => void
  className?: string
  children?: React.ReactNode
}

export default function CheckoutButton({
  contentId,
  priceCents,
  onAccess,
  className = '',
  children,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    try {
      setLoading(true)
      setError(null)

      // Check stream access
      const accessResponse = await checkStreamAccess(contentId)

      if (accessResponse.access) {
        // User has access - either subscribed or already purchased
        if (accessResponse.stream_url) {
          if (onAccess) {
            onAccess(accessResponse.stream_url)
          } else {
            // Default behavior: navigate to watch page
            window.location.href = `/watch/${contentId}`
          }
        }
      } else if (accessResponse.is_ppv) {
        // PPV content - needs purchase
        if (accessResponse.checkout_url) {
          // Backend provided checkout URL directly
          window.location.href = accessResponse.checkout_url
        } else {
          // Create checkout session
          const checkoutUrl = await createPpvCheckout(contentId)
          window.location.href = checkoutUrl
        }
      } else {
        setError('Unable to access content. Please check your subscription status.')
        setLoading(false)
      }
    } catch (err) {
      const apiError = err as ApiError

      if (apiError.needAuth) {
        setError('Please login to access this content')
      } else if (apiError.status === 404) {
        setError('Content not found')
      } else {
        setError(apiError.message || 'Failed to process request')
      }

      console.error('Error in checkout:', err)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          relative inline-flex items-center justify-center
          px-6 py-3 rounded-lg font-semibold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className || 'bg-blue-600 text-white hover:bg-blue-700'}
        `}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          <>
            {children || (
              <>
                {priceCents ? (
                  <>
                    <span className="mr-2">Buy Now</span>
                    <span className="text-sm opacity-90">${(priceCents / 100).toFixed(2)}</span>
                  </>
                ) : (
                  'Watch Now'
                )}
              </>
            )}
          </>
        )}
      </button>

      {/* Error Message */}
      {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
    </div>
  )
}
