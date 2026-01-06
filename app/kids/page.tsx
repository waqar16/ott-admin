'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CatalogTitle, CatalogResponse } from '@/app/api/catalog/route';
import { Profile, ApiError, listProfiles, verifyPin } from '@/lib/profilesApi';

export default function KidsPage() {
  const [titles, setTitles] = useState<CatalogTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinVerifying, setPinVerifying] = useState(false);

  useEffect(() => {
    loadProfilesAndContent();
  }, []);

  async function loadProfilesAndContent() {
    try {
      // Load profiles
      const profilesResponse = await listProfiles({ page: 1, pageSize: 20 });
      setProfiles(profilesResponse.results);

      // Select first kids profile or first profile as active
      const kidsProfile = profilesResponse.results.find(p => p.is_kids_profile);
      const defaultProfile = kidsProfile || profilesResponse.results[0] || null;
      
      if (defaultProfile) {
        // Check if profile is locked
        if (defaultProfile.is_profile_locked) {
          setActiveProfile(defaultProfile);
          setShowPinPrompt(true);
          setLoading(false);
          return;
        } else {
          setActiveProfile(defaultProfile);
        }
      }

      // Load content
      await loadContent();
    } catch (err) {
      console.error('Error loading profiles:', err);
      // Continue loading content even if profiles fail
      await loadContent();
    }
  }

  async function loadContent() {
    try {
      setLoading(true);
      const res = await fetch('/api/catalog?contentType=kids&pageSize=60');
      const data: CatalogResponse = await res.json();
      setTitles(data.titles);
    } finally {
      setLoading(false);
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProfile || pin.length !== 4) {
      setPinError('Please enter a 4-digit PIN');
      return;
    }

    try {
      setPinVerifying(true);
      setPinError(null);
      await verifyPin(activeProfile.id, pin);
      
      // PIN verified - hide prompt and load content
      setShowPinPrompt(false);
      await loadContent();
    } catch (err) {
      const apiError = err as ApiError;
      setPinError(apiError.message || 'Incorrect PIN');
    } finally {
      setPinVerifying(false);
    }
  }

  // Show PIN prompt if profile is locked
  if (showPinPrompt && activeProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            {activeProfile.avatar_url ? (
              <img
                src={activeProfile.avatar_url}
                alt={activeProfile.display_name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                {activeProfile.display_name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeProfile.display_name}'s Profile
            </h2>
            <p className="text-gray-600">This profile is locked. Enter PIN to continue.</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPin(value);
                  setPinError(null);
                }}
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-purple-600"
                autoFocus
              />
              {pinError && (
                <p className="mt-2 text-sm text-red-600">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={pinVerifying || pin.length !== 4}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pinVerifying ? 'Verifying...' : 'Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPinPrompt(false);
                setActiveProfile(null);
                loadContent();
              }}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Use Different Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-purple-700 drop-shadow">Kids</h1>
            {activeProfile && (
              <p className="text-sm text-purple-600 mt-1">
                Watching as: <span className="font-semibold">{activeProfile.display_name}</span>
              </p>
            )}
          </div>
          <Link href="/kids-zone" className="px-5 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold shadow hover:shadow-lg transition">
            Enter Kids Zone →
          </Link>
        </div>
        <p className="text-sm text-purple-700 mb-6 max-w-xl">
          Curated safe titles{activeProfile?.is_kids_profile ? ' for kids' : ''}.
          {activeProfile?.maturity_rating && (
            <span className="block mt-1">
              Showing content rated <span className="font-semibold">{activeProfile.maturity_rating}</span> and below.
            </span>
          )}
        </p>
        {loading && (
          <div className="py-20 text-center text-purple-600 font-semibold">Loading…</div>
        )}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {titles.map(t => (
              <Link key={t.id} href={`/title/${t.id}`} className="group relative">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-white shadow group-hover:shadow-xl transition">
                  <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition">
                    <div className="scale-0 group-hover:scale-100 transition-transform bg-white rounded-full p-3 shadow">
                      <svg className="w-6 h-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                    </div>
                  </div>
                  {t.visibleWithoutSignup && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold shadow">FREE</span>
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-purple-800 line-clamp-2 group-hover:text-purple-900">{t.title}</div>
                <div className="flex flex-wrap gap-1 mt-1 text-[9px]">
                  {t.projection && <span className="px-1.5 py-0.5 rounded bg-purple-200 text-purple-700">{t.projection}</span>}
                  {t.dimension && <span className="px-1.5 py-0.5 rounded bg-pink-200 text-pink-700">{t.dimension}</span>}
                  {t.resolutionClass && <span className="px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-700">{t.resolutionClass}</span>}
                </div>
              </Link>
            ))}
            {titles.length === 0 && <div className="col-span-full text-center text-purple-600 font-semibold py-16">No kids titles found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
