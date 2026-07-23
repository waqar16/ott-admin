'use client'

import { useState, FormEvent } from 'react'
import {
  Profile,
  ApiError,
  createProfile,
  updateProfile,
  CreateProfilePayload,
} from '@/lib/profilesApi'

interface ProfileEditorProps {
  profile: Profile | null
  onClose: () => void
  onSuccess: () => void
}

const MATURITY_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17']
const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh']

export default function ProfileEditor({ profile, onClose, onSuccess }: ProfileEditorProps) {
  const isEditing = !!profile

  const [formData, setFormData] = useState<CreateProfilePayload>({
    display_name: profile?.display_name || '',
    avatar_url: profile?.avatar_url || '',
    is_profile_locked: profile?.is_profile_locked || false,
    pin: '',
    is_kids_profile: profile?.is_kids_profile || false,
    preferred_language: profile?.preferred_language || 'en',
    maturity_rating: profile?.maturity_rating || 'PG-13',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(field: keyof CreateProfilePayload, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    // Validation
    if (!formData.display_name.trim()) {
      setError('Display name is required')
      return
    }

    if (formData.is_profile_locked && (!formData.pin || formData.pin.length !== 4)) {
      setError('PIN must be exactly 4 digits when profile is locked')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Prepare payload (exclude PIN if not locked or if editing and PIN is empty)
      const payload: CreateProfilePayload = {
        display_name: formData.display_name.trim(),
        avatar_url: formData.avatar_url?.trim() || undefined,
        is_profile_locked: formData.is_profile_locked,
        is_kids_profile: formData.is_kids_profile,
        preferred_language: formData.preferred_language,
        maturity_rating: formData.maturity_rating,
      }

      // Only include PIN if locked and provided
      if (formData.is_profile_locked && formData.pin) {
        payload.pin = formData.pin
      }

      if (isEditing && profile) {
        await updateProfile(profile.id, payload)
      } else {
        await createProfile(payload)
      }

      onSuccess()
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to save profile')
      console.error('Error saving profile:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Edit Profile' : 'Create Profile'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleChange('display_name', e.target.value)}
              maxLength={50}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter profile name"
              required
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-300 mb-2">
              Avatar URL (optional)
            </label>
            <input
              type="url"
              id="avatar_url"
              value={formData.avatar_url}
              onChange={(e) => handleChange('avatar_url', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank for auto-generated avatar</p>
          </div>

          {/* Kids Profile Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_kids_profile"
              checked={formData.is_kids_profile}
              onChange={(e) => handleChange('is_kids_profile', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_kids_profile" className="ml-2 text-sm text-gray-300">
              Kids Profile (age-appropriate content only)
            </label>
          </div>

          {/* Profile Lock Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_profile_locked"
              checked={formData.is_profile_locked}
              onChange={(e) => handleChange('is_profile_locked', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_profile_locked" className="ml-2 text-sm text-gray-300">
              Lock Profile (require PIN to access)
            </label>
          </div>

          {/* PIN Input (conditional) */}
          {formData.is_profile_locked && (
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
                PIN (4 digits) *
              </label>
              <input
                type="password"
                id="pin"
                value={formData.pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                  handleChange('pin', value)
                }}
                maxLength={4}
                pattern="\d{4}"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter 4-digit PIN"
                required={formData.is_profile_locked}
              />
              <p className="text-xs text-gray-400 mt-1">
                {isEditing ? 'Leave blank to keep existing PIN' : 'Required for locked profiles'}
              </p>
            </div>
          )}

          {/* Preferred Language */}
          <div>
            <label
              htmlFor="preferred_language"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Preferred Language
            </label>
            <select
              id="preferred_language"
              value={formData.preferred_language}
              onChange={(e) => handleChange('preferred_language', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Maturity Rating */}
          <div>
            <label
              htmlFor="maturity_rating"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Maturity Rating
            </label>
            <select
              id="maturity_rating"
              value={formData.maturity_rating}
              onChange={(e) => handleChange('maturity_rating', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MATURITY_RATINGS.map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Content above this rating will be hidden</p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
