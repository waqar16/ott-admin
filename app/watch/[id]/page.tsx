'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { CatalogTitle } from '@/app/api/catalog/route';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { useAuthMock } from '@/lib/useAuthMock';

export default function WatchPage() {
  const params = useParams();
  const id = params.id as string;
  const [title, setTitle] = useState<CatalogTitle | null>(null);
  const { isLoggedIn, user } = useAuthMock();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        if (res.ok) setTitle(await res.json());
      } catch {}
    })();
  }, [id]);

  const canWatch = title && (title.visibleWithoutSignup || title.isDemoContent || isLoggedIn);
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        {!title && <div>Loading...</div>}
        {title && (
          <>
            <h1 className="text-2xl font-bold mb-4">{title.title}</h1>
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              {title.projection && <span className="px-2 py-1 bg-white/10 rounded">{title.projection}</span>}
              {title.dimension && <span className="px-2 py-1 bg-white/10 rounded">{title.dimension}</span>}
              {title.resolutionClass && <span className="px-2 py-1 bg-white/10 rounded">{title.resolutionClass}</span>}
              {title.isImmersive && <span className="px-2 py-1 bg-pink-600 rounded">Immersive</span>}
              {title.visibleWithoutSignup && <span className="px-2 py-1 bg-green-600 rounded">Free Demo</span>}
            </div>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-6">
              {canWatch ? (
                <div className="text-center">
                  <div className="text-sm text-gray-300 mb-2">Mock Player</div>
                  <div className="text-xl font-semibold">{title.title}</div>
                  <div className="mt-2 text-xs text-gray-400">TODO: integrate VideoPlayer / VRPlayer based on projection & kind.</div>
                </div>
              ) : (
                <div className="text-center px-6">
                  <h2 className="text-xl font-semibold mb-2">Join to Watch</h2>
                  <p className="text-gray-300 mb-4">This title requires membership ( {title.requiredMembership} ). Create a free account or upgrade to continue.</p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/signup?plan=free"><Button variant="secondary">Free Account</Button></Link>
                    <Link href="/signup?plan=full"><Button variant="primary">Go Full</Button></Link>
                  </div>
                </div>
              )}
            </div>
            {!canWatch && title.visibleWithoutSignup && (
              <div className="mb-6 p-4 bg-green-600/20 border border-green-600 rounded text-sm">Marked free but membership check failed — mock auth may not be loaded.</div>
            )}
            <Link href="/demo" className="text-pink-400 hover:underline text-sm">← More free demos</Link>
          </>
        )}
      </div>
    </div>
  );
}
