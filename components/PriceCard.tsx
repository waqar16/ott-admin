'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface PriceCardFeature {
  text: string
  included: boolean
  highlight?: boolean
}

export interface PriceCardProps {
  title: string
  description?: string
  price: number
  currency?: string
  period?: string // e.g., "month", "one-time", "year"
  features?: PriceCardFeature[]
  badge?: string
  badgeColor?: 'purple' | 'blue' | 'green' | 'red' | 'yellow'
  buttonText?: string
  buttonVariant?: 'primary' | 'secondary' | 'outline'
  onPurchase?: () => void
  purchaseUrl?: string
  isLoading?: boolean
  isPopular?: boolean
  originalPrice?: number // For showing discounts
  className?: string
}

export function PriceCard({
  title,
  description,
  price,
  currency = 'USD',
  period,
  features = [],
  badge,
  badgeColor = 'purple',
  buttonText = 'Get Started',
  buttonVariant = 'primary',
  onPurchase,
  purchaseUrl,
  isLoading = false,
  isPopular = false,
  originalPrice,
  className = '',
}: PriceCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)

  const handlePurchaseClick = async () => {
    if (isLoading || isPurchasing) return

    if (purchaseUrl) {
      window.location.href = purchaseUrl
      return
    }

    if (onPurchase) {
      setIsPurchasing(true)
      try {
        await onPurchase()
      } finally {
        setIsPurchasing(false)
      }
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  }

  const getBadgeColors = () => {
    const colors = {
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }
    return colors[badgeColor]
  }

  const getButtonClasses = () => {
    const baseClasses =
      'w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary:
        'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-900 text-white hover:bg-gray-800',
      outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
    }

    return `${baseClasses} ${variants[buttonVariant]}`
  }

  const hasDiscount = originalPrice && originalPrice > price
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl ${
        isPopular ? 'border-purple-500 scale-105' : 'border-gray-200'
      } ${className}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
            ⭐ Most Popular
          </div>
        </div>
      )}

      {/* Custom Badge */}
      {badge && !isPopular && (
        <div className="absolute -top-3 right-4">
          <div className={`${getBadgeColors()} px-3 py-1 rounded-full text-xs font-bold border`}>
            {badge}
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            {hasDiscount && (
              <span className="text-2xl text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-5xl font-bold text-gray-900">{formatPrice(price)}</span>
          </div>

          {period && (
            <p className="text-gray-600 mt-1">
              {period === 'one-time' ? 'One-time payment' : `per ${period}`}
            </p>
          )}

          {hasDiscount && (
            <div className="mt-2 inline-block">
              <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                Save {discountPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li
                key={index}
                className={`flex items-start gap-3 ${feature.highlight ? 'font-semibold' : ''}`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {feature.included ? '✓' : '✕'}
                </span>
                <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA Button */}
        <button
          onClick={handlePurchaseClick}
          disabled={isLoading || isPurchasing}
          className={getButtonClasses()}
        >
          {isPurchasing ? (
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
              Processing...
            </span>
          ) : (
            buttonText
          )}
        </button>

        {/* Terms or Additional Info */}
        {period === 'one-time' && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Lifetime access • No recurring charges
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Price Comparison Component - Shows multiple price cards side by side
 */
interface PriceComparisonProps {
  cards: PriceCardProps[]
  title?: string
  subtitle?: string
}

export function PriceComparison({ cards, title, subtitle }: PriceComparisonProps) {
  return (
    <div className="py-12">
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>}
          {subtitle && <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {cards.map((card, index) => (
          <PriceCard key={index} {...card} />
        ))}
      </div>
    </div>
  )
}
