'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { HeroCarousel } from '@/components/HeroCarousel';
import { RowCarousel } from '@/components/RowCarousel';
import type { CatalogTitle } from './api/catalog/route';

/**
 * Home Page
 * 
 * NOTE: You can replace the hero section below with the new LandingHero component:
 * 
 * ```tsx
 * import { LandingHero } from '@/components';
 * 
 * export default function HomePage() {
 *   return (
 *     <div className="min-h-screen">
 *       <LandingHero
 *         headline="Stream Your Favorite Content Anywhere"
 *         subheadline="Unlimited movies, TV shows, and more. Watch anywhere. Cancel anytime."
 *         ctaText="Start Watching"
 *         ctaLink="/catalog"
 *         demoImages={[
 *           { src: '/demo1.jpg', alt: 'Demo 1', title: '4K Streaming' },
 *           { src: '/demo2.jpg', alt: 'Demo 2', title: 'VR Content' },
 *           { src: '/demo3.jpg', alt: 'Demo 3', title: 'Multi-Device' }
 *         ]}
 *       />
 *       
 *       {/* Rest of your page content *\/}
 *     </div>
 *   );
 * }
 * ```
 */

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call an API to save the lead
    console.log('Lead captured:', email);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Netflix-style hero carousel */}
      <HeroCarousel />

      {/* Lead capture overlay below hero */}
      <section className="bg-gradient-to-b from-black via-gray-900 to-black py-10">
        <div className="container mx-auto px-6">
          <div className="max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Start Free Today</h2>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-3 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <Button type="submit" variant="primary" className="px-6 py-3 whitespace-nowrap">
                  Get Started Free
                </Button>
              </form>
            ) : (
              <div className="bg-green-600 text-white px-4 py-3 rounded">Thanks! We'll be in touch soon.</div>
            )}
            <p className="text-xs text-gray-400 mt-2">No credit card required. Watch demo content instantly.</p>
          </div>
        </div>
      </section>

      {/* Content Rows */}
      <div className="space-y-8 -mt-4 pb-16">
        <RowCarousel
          title="Immersive Highlights"
          filter={(t: CatalogTitle) => t.isImmersive}
        />
        <RowCarousel
          title="Family & Kids"
          filter={(t: CatalogTitle) => t.contentType === 'kids'}
        />
        <RowCarousel
          title="Watch in 360°"
          filter={(t: CatalogTitle) => t.formats.some(f => /360|Immersive VR/i.test(f))}
        />
        <RowCarousel
          title="Try Before You Join"
          filter={(t: CatalogTitle) => !!t.visibleWithoutSignup || !!t.isDemoContent}
        />
      </div>

      {/* Features Section (retained) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Why Choose OTT Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The ultimate streaming experience with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Immersive VR</h3>
              <p className="text-gray-600">
                Experience content in stunning virtual reality with 360° immersive viewing
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Multi-Device</h3>
              <p className="text-gray-600">
                Watch on TV, mobile, tablet, or VR headset. Seamless across all devices
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">4K HDR Quality</h3>
              <p className="text-gray-600">
                Crystal-clear picture quality with HDR support for the best viewing experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Removed old generic preview grid in favor of curated carousels */}

      {/* Pricing Teaser */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Plans for Every Family
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              From free content for kids to full access with immersive VR experiences
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/billing">
                <Button variant="primary" size="lg">
                  View Plans
                </Button>
              </Link>
              <Link href="/catalog">
                <Button variant="secondary" size="lg">
                  Start Watching Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white mt-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Watching?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of viewers experiencing entertainment in a whole new way
          </p>
          <Link href="/signup?plan=free">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
