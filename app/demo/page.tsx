'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CatalogTitle, CatalogResponse } from '@/app/api/catalog/route';

export default function DemoCatalogPage() {
  const [titles, setTitles] = useState<CatalogTitle[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/catalog?pageSize=100');
      const data: CatalogResponse = await res.json();
      const demo = data.titles.filter((t) => t.isDemoContent || t.visibleWithoutSignup);
      setTitles(demo);
    })();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Banner */}
      <div className="relative py-16 md:py-24 bg-[url('https://picsum.photos/seed/demobanner/1600/800')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Explore Free VR & Video Demos</h1>
          <p className="max-w-2xl text-lg text-gray-300 mb-6">
            Explore a taste of immersive VR before you sign up. These sample experiences are
            hand-picked to showcase projection types, resolution classes and storytelling depth.
          </p>
          <Link href="/signup?plan=free" className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 font-semibold shadow hover:scale-[1.02] transition">
            Create Free Account
          </Link>
        </div>
      </div>
      {/* Grid */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {titles.map((t) => (
            <Link key={t.id} href={`/watch/${t.id}`} className="group">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-[10px] font-bold">FREE</div>
                {t.projection && <div className="absolute bottom-2 left-2 bg-black/60 text-[10px] px-2 py-1 rounded">{t.projection}</div>}
              </div>
              <div className="mt-2 text-xs text-gray-300 line-clamp-2 group-hover:text-white">{t.title}</div>
            </Link>
          ))}
        </div>
      </div>
      {/* Sticky CTA */}
      <div className="fixed bottom-4 right-4 z-40">
        <Link href="/signup?plan=free" className="px-5 py-3 rounded-full bg-white text-purple-700 font-semibold shadow-lg hover:shadow-xl transition">
          Create Free Account →
        </Link>
      </div>
    </div>
  );
}
