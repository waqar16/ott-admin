'use client';
import Link from 'next/link';

export default function MyListPage() {
  // TODO: Load from user profile when backend is ready
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">My List</h1>
        <p className="text-gray-600 mb-6">Your saved titles will appear here.</p>
        <Link href="/home" className="text-purple-600 hover:text-purple-700 font-medium">Discover titles →</Link>
      </div>
    </div>
  );
}
