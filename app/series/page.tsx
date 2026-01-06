'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CatalogTitle, CatalogResponse } from '@/app/api/catalog/route';

export default function SeriesPage() {
  const [titles, setTitles] = useState<CatalogTitle[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/catalog?type=series&pageSize=24');
      const data: CatalogResponse = await res.json();
      setTitles(data.titles);
    })();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Series</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {titles.map((t) => (
            <Link key={t.id} href={`/title/${t.id}`} className="group">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow">
                <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div className="mt-2 text-sm text-gray-800 line-clamp-2">{t.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
