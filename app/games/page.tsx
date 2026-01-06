'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GamesPage() {
  const router = useRouter();
  useEffect(() => {
    // Simple redirect placeholder
    const t = setTimeout(() => router.replace('/home'), 1200);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Games</h1>
        <p className="text-gray-600">Coming soon… Redirecting to Home.</p>
      </div>
    </div>
  );
}
