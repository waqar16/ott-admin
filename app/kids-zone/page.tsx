'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ParentalPIN } from '@/components/ParentalPIN';
import type { CatalogTitle } from '../api/catalog/route';

export default function KidsZonePage() {
  const router = useRouter();
  const [titles, setTitles] = useState<CatalogTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKidsContent();
  }, []);

  const fetchKidsContent = async () => {
    try {
      const response = await fetch('/api/catalog?contentType=kids&pageSize=50');
      if (response.ok) {
        const data = await response.json();
        setTitles(data.titles);
      }
    } catch (error) {
      console.error('Failed to fetch kids content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitKidsZone = () => {
    setShowExitModal(true);
  };

  const handlePINSuccess = () => {
    setShowExitModal(false);
    router.push('/catalog');
  };

  const filteredTitles = titles.filter((title) =>
    title.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-bounce mb-4">
            <div className="text-6xl">🎈</div>
          </div>
          <p className="text-2xl font-bold text-purple-600">Loading Kids Zone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100">
      {/* Kids Zone Header */}
      <header className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-5xl">🎨</div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">Kids Zone</h1>
                <p className="text-white text-sm opacity-90">Safe & Fun Content for Kids!</p>
              </div>
            </div>

            {/* Exit Button */}
            <button
              onClick={handleExitKidsZone}
              className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:bg-purple-100 transition shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Exit Kids Zone</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search for your favorite shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 text-xl rounded-full border-4 border-purple-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 pb-12">
        {filteredTitles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎪</div>
            <h2 className="text-3xl font-bold text-purple-600 mb-2">No Shows Found</h2>
            <p className="text-purple-500 text-lg">Try a different search!</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-purple-600">
                {searchQuery ? (
                  <>
                    Found {filteredTitles.length} show{filteredTitles.length !== 1 ? 's' : ''} for
                    "{searchQuery}"
                  </>
                ) : (
                  <>All Kids Shows ({filteredTitles.length})</>
                )}
              </h2>
            </div>

            {/* Simplified Grid with Large Thumbnails */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredTitles.map((title) => (
                <Link
                  key={title.id}
                  href={`/title/${title.id}`}
                  className="group transform hover:scale-105 transition-all duration-300"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow">
                    {/* Large Thumbnail */}
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img
                        src={title.thumbnail}
                        alt={title.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                        <div className="transform scale-0 group-hover:scale-100 transition-transform bg-white rounded-full p-4 shadow-lg">
                          <svg
                            className="w-8 h-8 text-purple-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {title.rating}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-2">
                        {title.title}
                      </h3>

                      {/* Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 text-yellow-400 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {title.imdbRating}
                        </span>
                        <span className="capitalize text-purple-600 font-medium">
                          {title.type}
                        </span>
                      </div>

                      {/* Genre Pills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {title.genre.slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fun Footer */}
      <footer className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-4 mb-4 text-5xl">
            <span>🌟</span>
            <span>🎈</span>
            <span>🎨</span>
            <span>🎪</span>
            <span>🎭</span>
          </div>
          <p className="text-white text-lg font-bold mb-2">
            Have fun watching your favorite shows!
          </p>
          <p className="text-white text-sm opacity-90">
            All content in Kids Zone is safe and age-appropriate
          </p>
        </div>
      </footer>

      {/* Parental PIN Modal */}
      <ParentalPIN
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onSuccess={handlePINSuccess}
        title="Exit Kids Zone"
        description="Enter the parental PIN to return to the main catalog"
      />

      {/* Feature Restrictions - Hidden in Kids Zone */}
      {/* Comments, user uploads, and other advanced features are disabled */}
      <style jsx global>{`
        /* Simplified UI - no complex navigation */
        body {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}
