'use client';

import { useState } from 'react';
import {
  listProfiles,
  createProfile,
  verifyPin,
  deleteProfile,
  Profile,
  ApiError,
} from '@/lib/profilesApi';

export default function ProfilesCheckPage() {
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileId, setProfileId] = useState('');
  const [pin, setPin] = useState('');

  async function executeApi(fn: () => Promise<any>, operation: string) {
    try {
      setLoading(true);
      setResult(null);
      setStatus(null);
      const data = await fn();
      setResult(data);
      setStatus(200);
      console.log(`[${operation}] Success:`, data);
    } catch (err) {
      const error = err as ApiError;
      setResult(error);
      setStatus(error.status || 0);
      console.error(`[${operation}] Error:`, error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Profiles API - Dev Smoke Test</h1>
        <p className="text-gray-400 mb-8">
          Test profile operations (list, create, verify, delete)
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => executeApi(() => listProfiles({ page: 1, pageSize: 20 }), 'List Profiles')}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            List Profiles
          </button>

          <button
            onClick={() =>
              executeApi(
                () =>
                  createProfile({
                    display_name: `Test Profile ${Date.now()}`,
                    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
                    is_profile_locked: false,
                    is_kids_profile: false,
                    preferred_language: 'en',
                    maturity_rating: 'PG-13',
                  }),
                'Create Profile'
              )
            }
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            Create Sample Profile
          </button>

          <button
            onClick={() =>
              executeApi(
                () =>
                  createProfile({
                    display_name: `Locked Profile ${Date.now()}`,
                    is_profile_locked: true,
                    pin: '1234',
                    is_kids_profile: true,
                    preferred_language: 'en',
                    maturity_rating: 'G',
                  }),
                'Create Locked Profile'
              )
            }
            disabled={loading}
            className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
          >
            Create Locked Kids Profile
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Profile ID"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={() => executeApi(() => deleteProfile(profileId), 'Delete Profile')}
              disabled={loading || !profileId}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Verify PIN Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Verify Profile PIN</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Profile ID"
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="password"
              placeholder="PIN (e.g., 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              className="w-32 px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={() => executeApi(() => verifyPin(profileId, pin), 'Verify PIN')}
              disabled={loading || !profileId || !pin}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              Verify
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Mock mode: Use PIN "1234" for locked profiles
          </p>
        </div>

        {/* Result Display */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Response</h3>
            {status !== null && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  status >= 200 && status < 300
                    ? 'bg-green-900 text-green-200'
                    : 'bg-red-900 text-red-200'
                }`}
              >
                HTTP {status}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {!loading && result && (
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          {!loading && !result && (
            <p className="text-gray-500 text-center py-8">
              Click a button above to test API operations
            </p>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-900/30 border border-blue-600/50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-200 mb-2">Quick Tips:</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• List Profiles: Shows all profiles for the logged-in user</li>
            <li>• Create Profile: Creates a new profile (max 4 profiles)</li>
            <li>• Verify PIN: Test locked profile access (use PIN "1234" in mock mode)</li>
            <li>• Delete Profile: Remove a profile by ID (get ID from List Profiles)</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
