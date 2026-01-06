'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { CatalogTitle, CatalogResponse } from '../api/catalog/route';

export default function CatalogPage() {
  const [titles, setTitles] = useState<CatalogTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [immersiveOnly, setImmersiveOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'series'>('all');
  const [selectedFormat, setSelectedFormat] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const availableFormats = ['2D', '3D', '4K HDR', 'IMAX', 'Immersive VR', '360°'];

  useEffect(() => {
    fetchCatalog();
  }, [search, immersiveOnly, selectedType, selectedFormat, page]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
      });

      if (search) params.append('search', search);
      if (immersiveOnly) params.append('immersiveOnly', 'true');
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedFormat.length > 0) params.append('formats', selectedFormat.join(','));

      // Mock mode active — replace with real API later
      const response = await fetch(`/api/catalog?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch catalog');
      }
      
      const data: CatalogResponse = await response.json();

      setTitles(data.titles);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
      // Fallback to empty state on error
      setTitles([]);
      setHasMore(false);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleFormat = (format: string) => {
    setSelectedFormat((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setImmersiveOnly(false);
    setSelectedType('all');
    setSelectedFormat([]);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Catalog</h1>
          <p className="text-gray-600">
            {total} titles available
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search titles, genres, cast..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Immersive Only Toggle */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={immersiveOnly}
                  onChange={(e) => {
                    setImmersiveOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">
                  Immersive VR Only
                </span>
              </label>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as 'all' | 'movie' | 'series');
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All</option>
                <option value="movie">Movies</option>
                <option value="series">Series</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Format Filters */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Formats
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFormats.map((format) => (
                <button
                  key={format}
                  onClick={() => toggleFormat(format)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedFormat.includes(format)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : titles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No titles found matching your criteria.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
              {titles.map((title) => (
                <Link
                  key={title.id}
                  href={`/title/${title.id}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                    <img
                      src={title.thumbnail}
                      alt={title.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {title.isImmersive && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                        VR
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-semibold text-sm line-clamp-2">
                          {title.title}
                        </p>
                        <p className="text-gray-300 text-xs mt-1">
                          {title.year} • {title.type === 'movie' ? `${title.duration}min` : `${title.seasons} seasons`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
