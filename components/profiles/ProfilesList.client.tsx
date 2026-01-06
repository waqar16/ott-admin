'use client';

import { useState, useEffect } from 'react';
import { Profile, ApiError, listProfiles, deleteProfile } from '@/lib/profilesApi';
import ProfileEditor from './ProfileEditor.client';

export default function ProfilesList() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setLoading(true);
      setError(null);
      const response = await listProfiles({ page: 1, pageSize: 20 });
      setProfiles(response.results);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load profiles');
      console.error('Error loading profiles:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(profileId: string) {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(profileId);
      setError(null);
      await deleteProfile(profileId);
      await loadProfiles(); // Refresh list
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete profile');
      console.error('Error deleting profile:', err);
    } finally {
      setDeletingId(null);
    }
  }

  function handleCreate() {
    setEditingProfile(null);
    setShowEditor(true);
  }

  function handleEdit(profile: Profile) {
    setEditingProfile(profile);
    setShowEditor(true);
  }

  function handleEditorClose() {
    setShowEditor(false);
    setEditingProfile(null);
  }

  async function handleEditorSuccess() {
    setShowEditor(false);
    setEditingProfile(null);
    await loadProfiles(); // Refresh list
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Profiles</h2>
          <p className="text-gray-400 mt-1">
            Manage who's watching. Create up to 4 profiles.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={profiles.length >= 4}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Profile
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Profiles Grid */}
      {profiles.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-4">No profiles yet. Create your first profile to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              {/* Avatar */}
              <div className="flex items-center space-x-4 mb-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {profile.display_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {profile.is_kids_profile && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-200">
                        Kids
                      </span>
                    )}
                    {profile.is_profile_locked && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900 text-yellow-200">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                {profile.preferred_language && (
                  <p>Language: {profile.preferred_language.toUpperCase()}</p>
                )}
                {profile.maturity_rating && (
                  <p>Maturity: {profile.maturity_rating}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(profile)}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  disabled={deletingId === profile.id}
                  className="flex-1 px-3 py-2 bg-red-900/50 text-red-200 rounded hover:bg-red-900 transition-colors text-sm disabled:opacity-50"
                >
                  {deletingId === profile.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Limit Notice */}
      {profiles.length >= 4 && (
        <div className="bg-yellow-900/30 border border-yellow-600/50 text-yellow-200 px-4 py-3 rounded-lg">
          You've reached the maximum number of profiles (4). Delete a profile to create a new one.
        </div>
      )}

      {/* Profile Editor Modal */}
      {showEditor && (
        <ProfileEditor
          profile={editingProfile}
          onClose={handleEditorClose}
          onSuccess={handleEditorSuccess}
        />
      )}
    </div>
  );
}
