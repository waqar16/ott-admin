"use client";
import { useEffect, useState } from 'react';
import type { CatalogTitle, CatalogResponse } from '@/app/api/catalog/route';
import Link from 'next/link';

interface Filters {
  q: string;
  immersiveOnly: boolean;
  projection: string;
  dimension: string;
  resolutionClass: string;
  kind: string;
}

export default function AdvancedSearchPage() {
  const [filters, setFilters] = useState<Filters>({ q: '', immersiveOnly: false, projection: '', dimension: '', resolutionClass: '', kind: '' });
  const [results, setResults] = useState<CatalogTitle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.q) params.set('search', filters.q);
    if (filters.immersiveOnly) params.set('immersiveOnly', 'true');
    if (filters.projection) params.set('projection', filters.projection);
    if (filters.dimension) params.set('dimension', filters.dimension);
    if (filters.resolutionClass) params.set('resolutionClass', filters.resolutionClass);
    if (filters.kind) params.set('kind', filters.kind);
    params.set('pageSize', '200');
    try {
      const res = await fetch(`/api/catalog?${params.toString()}`);
      if (res.ok) {
        const data: CatalogResponse = await res.json();
        setResults(data.titles);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); /* initial */ }, []);

  const update = (patch: Partial<Filters>) => setFilters(prev => ({ ...prev, ...patch }));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Advanced Search</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-1 space-y-6 bg-black/40 rounded-lg p-5 border border-white/10">
            <div>
              <label className="text-sm font-semibold mb-2 block">Text</label>
              <input value={filters.q} onChange={e => update({ q: e.target.value })} placeholder="Title, genre, cast" className="w-full px-3 py-2 rounded bg-gray-800 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={filters.immersiveOnly} onChange={e => update({ immersiveOnly: e.target.checked })} id="immersiveOnly" />
              <label htmlFor="immersiveOnly" className="text-sm">Immersive only</label>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Projection</label>
              <select value={filters.projection} onChange={e => update({ projection: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-sm">
                <option value="">Any</option>
                <option value="360">360</option>
                <option value="180">180</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Dimension</label>
              <select value={filters.dimension} onChange={e => update({ dimension: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-sm">
                <option value="">Any</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Resolution Class</label>
              <select value={filters.resolutionClass} onChange={e => update({ resolutionClass: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-sm">
                <option value="">Any</option>
                <option value="8K">8K</option>
                <option value="11K">11K</option>
                <option value="13K">13K</option>
                <option value="14K">14K</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Kind</label>
              <select value={filters.kind} onChange={e => update({ kind: e.target.value })} className="w-full px-3 py-2 rounded bg-gray-800 text-sm">
                <option value="">Any</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>
            <button onClick={fetchResults} className="w-full py-2 rounded bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">Search</button>
            <button onClick={() => { setFilters({ q:'', immersiveOnly:false, projection:'', dimension:'', resolutionClass:'', kind:'' }); fetchResults(); }} className="w-full py-2 rounded bg-gray-800 font-semibold text-sm mt-1">Reset</button>
          </aside>
          {/* Results */}
          <main className="lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-300">{loading ? 'Loading…' : `${results.length} result${results.length!==1?'s':''}`}</div>
              <Link href="/catalog" className="text-xs text-pink-400 hover:underline">Catalog →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
              {results.map(t => (
                <Link key={t.id} href={`/title/${t.id}`} className="group relative">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                    <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    {t.visibleWithoutSignup && <span className="absolute top-2 left-2 bg-green-600 text-[10px] px-2 py-1 rounded font-bold">FREE</span>}
                  </div>
                  <div className="mt-1 text-[11px] font-medium line-clamp-2 text-gray-200 group-hover:text-white">{t.title}</div>
                  <div className="flex flex-wrap gap-1 mt-1 text-[9px]">
                    {t.isImmersive && <span className="px-1.5 py-0.5 bg-pink-600 rounded">Immersive</span>}
                    {t.projection && <span className="px-1.5 py-0.5 bg-white/10 rounded">{t.projection}</span>}
                    {t.dimension && <span className="px-1.5 py-0.5 bg-white/10 rounded">{t.dimension}</span>}
                    {t.resolutionClass && <span className="px-1.5 py-0.5 bg-white/10 rounded">{t.resolutionClass}</span>}
                  </div>
                </Link>
              ))}
              {results.length === 0 && !loading && (
                <div className="col-span-full text-center py-16 text-gray-400">No results match your filters.</div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
