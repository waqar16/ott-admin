'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/**
 * LandingHero Component
 *
 * A responsive hero section for landing pages featuring a headline, subheadline,
 * call-to-action button, email lead capture form, and an auto-rotating demo carousel.
 *
 * @component
 * @example
 * ```tsx
 * <LandingHero />
 * ```
 *
 * @example
 * ```tsx
 * // With custom demo images
 * <LandingHero
 *   demoImages={[
 *     { src: '/demo1.jpg', alt: 'Demo 1', title: 'Feature One' },
 *     { src: '/demo2.jpg', alt: 'Demo 2', title: 'Feature Two' },
 *     { src: '/demo3.jpg', alt: 'Demo 3', title: 'Feature Three' }
 *   ]}
 * />
 * ```
 *
 * Features:
 * - Responsive layout (mobile-first design)
 * - Email lead capture with validation
 * - Auto-rotating carousel (5-second intervals)
 * - Manual carousel navigation with indicators
 * - Loading states for form submission
 * - Success/error feedback
 * - Gradient background effects
 * - Accessibility features (ARIA labels, keyboard navigation)
 */

export interface DemoImage {
  /** Image source URL or path */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Optional title displayed below thumbnail */
  title?: string
}

export interface LandingHeroProps {
  /** Custom headline text (default: "Stream Your Favorite Content Anywhere") */
  headline?: string
  /** Custom subheadline text */
  subheadline?: string
  /** CTA button text (default: "Start Watching") */
  ctaText?: string
  /** CTA button link (default: "/catalog") */
  ctaLink?: string
  /** Email input placeholder (default: "Enter your email") */
  emailPlaceholder?: string
  /** Array of demo images for carousel */
  demoImages?: DemoImage[]
  /** Carousel auto-rotate interval in milliseconds (default: 5000) */
  carouselInterval?: number
}

/**
 * Default demo images for the carousel
 */
const DEFAULT_DEMO_IMAGES: DemoImage[] = [
  {
    src: '/api/placeholder/400/225',
    alt: 'Demo thumbnail 1',
    title: '4K Streaming',
  },
  {
    src: '/api/placeholder/400/225',
    alt: 'Demo thumbnail 2',
    title: 'Offline Downloads',
  },
  {
    src: '/api/placeholder/400/225',
    alt: 'Demo thumbnail 3',
    title: 'Multi-Device',
  },
]

export default function LandingHero({
  headline = 'Stream Your Favorite Content Anywhere',
  subheadline = 'Unlimited movies, TV shows, and more. Watch anywhere. Cancel anytime.',
  ctaText = 'Start Watching',
  ctaLink = '/catalog',
  emailPlaceholder = 'Enter your email',
  demoImages = DEFAULT_DEMO_IMAGES,
  carouselInterval = 5000,
}: LandingHeroProps) {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  // Email form state
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Auto-rotate carousel
  useEffect(() => {
    if (isCarouselPaused || demoImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % demoImages.length)
    }, carouselInterval)

    return () => clearInterval(interval)
  }, [isCarouselPaused, demoImages.length, carouselInterval])

  /**
   * Navigate to specific slide
   */
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  /**
   * Navigate to next slide
   */
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % demoImages.length)
  }

  /**
   * Navigate to previous slide
   */
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + demoImages.length) % demoImages.length)
  }

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Handle email form submission
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset status
    setSubmitStatus('idle')
    setErrorMessage('')

    // Validate email
    if (!email) {
      setErrorMessage('Please enter your email')
      setSubmitStatus('error')
      return
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address')
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit email')
      }

      setSubmitStatus('success')
      setEmail('')

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Email submission error:', error)
      setErrorMessage('Something went wrong. Please try again.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {headline}
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0">
              {subheadline}
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label={ctaText}
              >
                {ctaText}
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>

            {/* Email Lead Capture */}
            <div className="max-w-md mx-auto lg:mx-0">
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={emailPlaceholder}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    aria-label="Email address"
                    aria-describedby={submitStatus === 'error' ? 'email-error' : undefined}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Get started with email"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
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
                        Submitting...
                      </span>
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <p className="text-sm text-green-400 flex items-center gap-2" role="alert">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thank you! We'll be in touch soon.
                  </p>
                )}

                {submitStatus === 'error' && (
                  <p
                    id="email-error"
                    className="text-sm text-red-400 flex items-center gap-2"
                    role="alert"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errorMessage}
                  </p>
                )}
              </form>

              <p className="text-xs text-gray-400 mt-2">
                No credit card required. Start watching instantly.
              </p>
            </div>
          </div>

          {/* Right Column - Demo Carousel */}
          <div className="relative">
            <div
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
            >
              {/* Main Carousel Display */}
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                {demoImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                    aria-hidden={index !== currentSlide}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    {image.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                      </div>
                    )}
                  </div>
                ))}

                {/* Navigation Arrows */}
                {demoImages.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      aria-label="Previous slide"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      aria-label="Next slide"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Carousel Indicators */}
              {demoImages.length > 1 && (
                <div
                  className="flex justify-center gap-2 mt-4"
                  role="tablist"
                  aria-label="Carousel navigation"
                >
                  {demoImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-purple-500 w-8'
                          : 'bg-white/30 w-2 hover:bg-white/50'
                      }`}
                      role="tab"
                      aria-selected={index === currentSlide}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Feature Badges */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-1">🎬</div>
                  <div className="text-xs text-gray-300 font-medium">10K+ Titles</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-xs text-gray-300 font-medium">Any Device</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl mb-1">🌐</div>
                  <div className="text-xs text-gray-300 font-medium">Worldwide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="currentColor"
            className="text-gray-900"
          />
        </svg>
      </div>
    </section>
  )
}
