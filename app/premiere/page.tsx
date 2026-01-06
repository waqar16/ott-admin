'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PremiereTitle } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useAuthMock } from '@/lib/useAuthMock';
import { getPremiereCheckoutPath } from '@/lib/navigation';

// Mock premiere titles data
// In production, fetch from database or CMS
const PREMIERE_TITLES: PremiereTitle[] = [
  {
    id: 'premiere-1',
    title: 'Quantum Horizon',
    description: 'A mind-bending sci-fi thriller about parallel universes',
    longDescription: 'When a scientist discovers a way to communicate with parallel universes, she must race against time to prevent a catastrophic collision of realities. Featuring stunning visual effects and a gripping storyline.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
    trailerUrl: '/trailers/quantum-horizon.mp4',
    price: 19.99,
    originalPrice: 24.99,
    stripePriceId: 'price_premiere_quantum_horizon',
    duration: 142,
    releaseDate: '2025-11-15',
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    rating: 'PG-13',
    director: 'Sarah Chen',
    cast: ['John Anderson', 'Emily Roberts', 'Michael Zhang'],
    featured: true,
    available: true,
  },
  {
    id: 'premiere-2',
    title: 'The Last Expedition',
    description: 'An epic adventure through uncharted territories',
    longDescription: 'Join a team of explorers as they venture into the world\'s most dangerous jungle in search of a lost civilization. Based on true events.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200',
    price: 14.99,
    stripePriceId: 'price_premiere_last_expedition',
    duration: 128,
    releaseDate: '2025-11-20',
    genres: ['Adventure', 'Documentary', 'Action'],
    rating: 'PG',
    director: 'Marcus Johnson',
    cast: ['David Park', 'Lisa Thompson', 'Carlos Rivera'],
    featured: true,
    available: true,
  },
  {
    id: 'premiere-3',
    title: 'Midnight Symphony',
    description: 'A romantic drama set in the world of classical music',
    longDescription: 'Two musicians from different backgrounds find love and inspiration as they compete for the lead position in a prestigious orchestra.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800',
    posterUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200',
    price: 12.99,
    stripePriceId: 'price_premiere_midnight_symphony',
    duration: 115,
    releaseDate: '2025-11-25',
    genres: ['Romance', 'Drama', 'Music'],
    rating: 'PG-13',
    director: 'Anna Kowalski',
    cast: ['Sophie Martin', 'James Liu', 'Patricia Brown'],
    available: true,
  },
  {
    id: 'premiere-4',
    title: 'Code Red Protocol',
    description: 'High-stakes cybersecurity thriller',
    longDescription: 'A cybersecurity expert must stop a global hack that threatens to collapse the world\'s financial systems. Time is running out.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
    price: 16.99,
    originalPrice: 19.99,
    stripePriceId: 'price_premiere_code_red',
    duration: 135,
    releaseDate: '2025-12-01',
    genres: ['Thriller', 'Action', 'Technology'],
    rating: 'R',
    director: 'Kevin Zhang',
    cast: ['Alex Turner', 'Rachel Kim', 'Omar Hassan'],
    available: true,
  },
  {
    id: 'premiere-5',
    title: 'Echoes of Tomorrow',
    description: 'A time-travel mystery that will keep you guessing',
    longDescription: 'A detective discovers clues from the future that could prevent a series of crimes. But changing the timeline has unexpected consequences.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200',
    price: 15.99,
    stripePriceId: 'price_premiere_echoes',
    duration: 145,
    releaseDate: '2025-12-05',
    genres: ['Mystery', 'Sci-Fi', 'Thriller'],
    rating: 'PG-13',
    director: 'Rebecca Smith',
    cast: ['Tom Bradley', 'Nina Patel', 'Chris Evans'],
    available: true,
  },
  {
    id: 'premiere-6',
    title: 'Desert Kings',
    description: 'An action-packed story of survival in the desert',
    longDescription: 'Stranded in the Sahara after a plane crash, a group of strangers must work together to survive the harsh environment and find their way home.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
    posterUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200',
    price: 13.99,
    stripePriceId: 'price_premiere_desert_kings',
    duration: 118,
    releaseDate: '2025-12-10',
    genres: ['Action', 'Adventure', 'Drama'],
    rating: 'PG-13',
    director: 'Hassan Al-Farsi',
    cast: ['Ryan Cooper', 'Aisha Mohammed', 'Jack Wilson'],
    available: true,
  },
];

export default function PremierePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthMock();
  const featuredTitles = PREMIERE_TITLES.filter((title) => title.featured);
  const otherTitles = PREMIERE_TITLES.filter((title) => !title.featured);

  const handlePurchase = (premiereId: string) => {
    const path = getPremiereCheckoutPath(premiereId, isLoggedIn);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-900 via-purple-700 to-pink-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTI2IDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full text-sm font-bold">
                🎬 PREMIERE COLLECTION
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Watch Exclusive Premieres
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8">
              One-time payment. Lifetime access. No subscription required.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">✓</span>
                <span>HD & 4K Quality</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">✓</span>
                <span>Watch Anytime</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-2xl">✓</span>
                <span>Multiple Devices</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Titles */}
      {featuredTitles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Featured Releases
            </h2>
            <p className="text-gray-600 text-center mb-12">
              Don't miss these exclusive premieres
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {featuredTitles.map((title) => (
                <PremiereCard
                  key={title.id}
                  title={title}
                  onPurchase={() => handlePurchase(title.id)}
                  featured
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Titles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            All Premiere Titles
          </h2>
          <p className="text-gray-600 text-center mb-12">
            {PREMIERE_TITLES.length} exclusive titles available
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherTitles.map((title) => (
              <PremiereCard
                key={title.id}
                title={title}
                onPurchase={() => handlePurchase(title.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <FAQItem
              question="How does pay-per-view work?"
              answer="Purchase any premiere title with a one-time payment. Once purchased, you have lifetime access to watch it as many times as you want. No subscription required."
            />
            <FAQItem
              question="Can I watch on multiple devices?"
              answer="Yes! Once you purchase a title, you can watch it on any device by signing in with your account. Stream on your TV, phone, tablet, or computer."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor."
            />
            <FAQItem
              question="Can I get a refund?"
              answer="Refunds are available within 24 hours of purchase if you haven't started watching the content. Please contact our support team for assistance."
            />
            <FAQItem
              question="Is there a difference from subscription content?"
              answer="Premiere titles are exclusive releases available for individual purchase. They're not included in subscription plans and offer early access to premium content."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Premiere Card Component
 */
interface PremiereCardProps {
  title: PremiereTitle;
  onPurchase: () => void;
  featured?: boolean;
}

function PremiereCard({ title, onPurchase, featured = false }: PremiereCardProps) {
  const hasDiscount = title.originalPrice && title.originalPrice > title.price;
  const discountPercent = hasDiscount
    ? Math.round(((title.originalPrice - title.price) / title.originalPrice) * 100)
    : 0;

  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-64 bg-gray-200">
        <Image
          src={title.thumbnailUrl}
          alt={title.title}
          fill
          className="object-cover"
          sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {featured && (
            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
              ⭐ Featured
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Duration & Rating */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
            {Math.floor(title.duration / 60)}h {title.duration % 60}m
          </span>
          {title.rating && (
            <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
              {title.rating}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-3">
          {title.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title.title}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {title.description}
        </p>

        {/* Cast/Director */}
        {(title.director || title.cast) && (
          <div className="text-xs text-gray-500 mb-4">
            {title.director && <p>Director: {title.director}</p>}
            {title.cast && <p>Starring: {title.cast.slice(0, 2).join(', ')}</p>}
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through block">
                ${title.originalPrice?.toFixed(2)}
              </span>
            )}
            <span className="text-3xl font-bold text-gray-900">
              ${title.price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={onPurchase}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * FAQ Item Component
 */
interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span className="text-purple-600 text-xl">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}
