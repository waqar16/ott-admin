"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CatalogTitle, CatalogResponse } from '@/app/api/catalog/route';
import { get } from '@/lib/api';
import { USE_MOCK_DATA } from '@/lib/config';
import type { FrontendMovie, FrontendMoviesResponse } from '@/lib/types';
import SkeletonLoader from '@/components/Loader/SkeletonLoader';

export default function HomePage() {
  // We'll support two sources for home tiles:
  // - local catalog mock (/api/catalog) used in development/mock mode
  // - remote backend movies endpoint (/api/v1/content/frontend/movies/) when not mocking
  const [titles, setTitles] = useState<CatalogTitle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
         if (USE_MOCK_DATA) {
          // Keep existing mock catalog route for local development
          const res = await fetch('/api/catalog?page=1&pageSize=12');
          const data: CatalogResponse = await res.json();
          setTitles(data.titles);
          return;
        }
         // 
        const movies = await get<FrontendMoviesResponse>('/api/v1/content/frontend/movies/?page=1&page_size=12');
        setLoading(false)
        // Map backend response to the local CatalogTitle-lite shape (only fields used by the home UI)
        const mapped = movies.results.map((m: FrontendMovie) => ({
          id: m.id,
          title: m.title,
          thumbnail: m.poster_url || '',
          banner: m.banner_url || '',
          genre: m.genres.map(g => g.name),
          year: m.release_year || 0,
          rating: 'NR',
          imdbRating: 0,


        } as CatalogTitle));

        setTitles(mapped);
      } catch (err) {
        console.error('Failed to load home titles', err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome</h1>
        <p className="text-gray-600 mb-8">Jump back in or discover something new.</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ?
            <> {Array.from({ length: 12 }).map(() => (
              <SkeletonLoader className='h-[200px] w-full'/>
         ))}</> :
            <>{titles.map((t) => (
              <Link key={t.id} href={`/title/${t.id}`} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow">
                  <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="mt-2 text-sm text-gray-800 line-clamp-2">{t.title}</div>
              </Link>
            ))}</>}
        </div>

        <div className="mt-10">
          <Link href="/movies" className="text-purple-600 hover:text-purple-700 font-medium">Browse Movies →</Link>
        </div>
      </div>
    </div>
  );
}
