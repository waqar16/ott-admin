'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import SkeletonLoader from '@/components/Loader/SkeletonLoader'
import { API_BASE } from '@/lib/config'

interface UserProfile {
  id: string
  username: string
  email: string
  full_name: string
  is_active: boolean
  profile_type: string
  created_at: string
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: UserProfile[]
}

interface Filters {
  search?: string
  is_active?: string
  profile_type?: string
}

const UserProfilesPage = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null)

  const fetchProfiles = async () => {
    try {
      setLoading(true)

      const response = await axios.get<ApiResponse>(
        `${API_BASE}api/v1/accounts/profiles/?page=${page}&search=${filters.search || ''}&is_active=${filters.is_active || ''}&profile_type=${filters.profile_type || ''}`
      )

      setProfiles(response.data.results)
      setCount(response.data.count)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [page, filters])

  return (
    <div className="p-2 md:p-6  md:mt-0 mt-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 ">
        <h1 className="text-3xl font-bold text-white">User Profiles</h1>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 bg-[var(--main-color)] hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          + Add Profile
        </button>
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3 text-neutral-200">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by username / email..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 bg-neutral-700 text-white rounded-lg"
          />

          <select
            value={filters.is_active || ''}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
            className="px-4 py-2 bg-neutral-700 text-white rounded-lg"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <select
            value={filters.profile_type || ''}
            onChange={(e) => setFilters({ ...filters, profile_type: e.target.value })}
            className="px-4 py-2 bg-neutral-700 text-white rounded-lg"
          >
            <option value="">All Profile Types</option>
            <option value="owner">Owner</option>
            <option value="kid">Kid</option>
            <option value="adult">Adult</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-800 p-4 rounded-lg shadow border border-neutral-700 overflow-x-auto">
        <table className="w-full text-left text-white">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="p-3">Username</th>
              <th className="p-3">Email</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="p-3">
                    <SkeletonLoader className="h-6 w-full bg-neutral-700" />
                  </td>
                </tr>
              ))
            ) : profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-neutral-400">
                  No profiles found.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-neutral-700">
                  <td className="p-3">{profile.username}</td>
                  <td className="p-3">{profile.email}</td>
                  <td className="p-3">{profile.profile_type}</td>
                  <td className="p-3">
                    {profile.is_active ? (
                      <span className="text-green-400">Active</span>
                    ) : (
                      <span className="text-red-400">Inactive</span>
                    )}
                  </td>
                  <td className="p-3">{profile.created_at}</td>

                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => {
                        setEditProfile(profile)
                        setModalOpen(true)
                      }}
                      className="px-3 py-1 bg-green-600 rounded"
                    >
                      Edit
                    </button>

                    <DeleteButton profileId={profile.id} onDeleted={fetchProfiles} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className={`px-4 py-2 rounded-lg ${
            page === 1 ? 'bg-neutral-700' : 'bg-neutral-600 hover:bg-neutral-700'
          } text-white`}
        >
          Previous
        </button>

        <span className="text-white">Page {page}</span>

        <button
          disabled={page * 10 >= count}
          onClick={() => setPage((p) => p + 1)}
          className={`px-4 py-2 rounded-lg ${
            page * 10 >= count ? 'bg-neutral-700' : 'bg-neutral-600 hover:bg-neutral-700'
          } text-white`}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <ProfileModal
          initial={editProfile}
          onClose={() => {
            setModalOpen(false)
            setEditProfile(null)
          }}
          onSuccess={() => {
            setModalOpen(false)
            setEditProfile(null)
            fetchProfiles()
          }}
        />
      )}
    </div>
  )
}

const ProfileModal = ({
  initial,
  onClose,
  onSuccess,
}: {
  initial?: UserProfile | null
  onClose: () => void
  onSuccess: () => void
}) => {
  const [form, setForm] = useState({
    username: initial?.username || '',
    email: initial?.email || '',
    full_name: initial?.full_name || '',
    profile_type: initial?.profile_type || 'adult',
    is_active: initial?.is_active ?? true,
  })

  const [loading, setLoading] = useState(false)

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    try {
      setLoading(true)

      if (initial) {
        await axios.put(`${API_BASE}api/v1/accounts/profiles/${initial.id}/`, form)
      } else {
        await axios.post(`${API_BASE}api/v1/accounts/profiles/`, form)
      }

      onSuccess()
    } catch (err) {
      alert('Error saving profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{initial ? 'Edit Profile' : 'Add New Profile'}</h2>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg"
            placeholder="Username"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
          />

          <input
            className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />

          <input
            className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg"
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
          />

          <select
            className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg"
            value={form.profile_type}
            onChange={(e) => update('profile_type', e.target.value)}
          >
            <option value="adult">Adult</option>
            <option value="kid">Kid</option>
            <option value="owner">Owner</option>
          </select>

          <select
            className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg"
            value={form.is_active ? 'true' : 'false'}
            onChange={(e) => update('is_active', e.target.value === 'true')}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 bg-neutral-600 rounded" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 rounded"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : initial ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
const DeleteButton = ({ profileId, onDeleted }: { profileId: string; onDeleted: () => void }) => {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this profile?')) return

    try {
      setLoading(true)
      await axios.delete(`${API_BASE}api/v1/accounts/profiles/${profileId}/`)
      onDeleted()
    } catch (error) {
      console.error(error)
      alert('Failed to delete profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="px-3 py-1 bg-red-600 rounded">
      {loading ? '...' : 'Delete'}
    </button>
  )
}

export default UserProfilesPage
