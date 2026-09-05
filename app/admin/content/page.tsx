'use client'

import { useState, useEffect } from 'react'
// TODO: Uncomment when NextAuth backend ready
// import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { CatalogTitle } from '../../api/catalog/route'
import { USE_MOCK_DATA } from '@/lib/config'
import { mockSession } from '@/lib/mockData'

interface AdminContentResponse {
  titles: CatalogTitle[]
  total: number
  stats: {
    totalTitles: number
    visibleWithoutSignup: number
    demoContent: number
    kidsTitles: number
    immersiveTitles: number
  }
}

export default function AdminContentPage() {
  // Mock mode: Use mock session instead of NextAuth
  // TODO: Uncomment when NextAuth backend ready
  // const { data: session, status } = useSession();
  const session = USE_MOCK_DATA ? mockSession : null
  const status = USE_MOCK_DATA ? 'authenticated' : 'loading'

  const router = useRouter()
  const [titles, setTitles] = useState<CatalogTitle[]>([])
  const [stats, setStats] = useState<AdminContentResponse['stats'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'visible' | 'demo' | 'kids'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/content')
    } else if (status === 'authenticated') {
      fetchTitles()
    }
  }, [status, router])

  const fetchTitles = async () => {
    try {
      const response = await fetch('/api/admin/content')
      if (response.ok) {
        const data: AdminContentResponse = await response.json()
        setTitles(data.titles)
        setStats(data.stats)
      } else if (response.status === 401) {
        router.push('/auth/signin?callbackUrl=/admin/content')
      }
    } catch (error) {
      console.error('Failed to fetch titles:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTitle = async (
    id: string,
    field: 'visibleWithoutSignup' | 'isDemoContent',
    value: boolean
  ) => {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value }),
      })

      if (response.ok) {
        // Update local state
        setTitles((prev) =>
          prev.map((title) => (title.id === id ? { ...title, [field]: value } : title))
        )
        // Recalculate stats
        await fetchTitles()
      }
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }

  const bulkUpdate = async (field: 'visibleWithoutSignup' | 'isDemoContent', value: boolean) => {
    if (selectedIds.size === 0) return

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          [field]: value,
        }),
      })

      if (response.ok) {
        await fetchTitles()
        setSelectedIds(new Set())
      }
    } catch (error) {
      console.error('Failed to bulk update:', error)
    } finally {
      setUpdating(false)
    }
  }

  const resetAll = async () => {
    if (!confirm('Are you sure you want to reset all flags to defaults? This cannot be undone.')) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch('/api/admin/content', {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTitles()
        setSelectedIds(new Set())
      }
    } catch (error) {
      console.error('Failed to reset:', error)
    } finally {
      setUpdating(false)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedIds(newSelection)
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredTitles.map((t) => t.id)))
  }

  const deselectAll = () => {
    setSelectedIds(new Set())
  }

  const filteredTitles = titles.filter((title) => {
    if (filter === 'visible') return title.visibleWithoutSignup
    if (filter === 'demo') return title.isDemoContent
    if (filter === 'kids') return title.contentType === 'kids'
    return true
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600 mt-1">Manage visibility and demo content flags</p>
            </div>
            <Link
              href="/catalog"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Landing Funnel Impact</h3>
              <div className="text-blue-800 space-y-1 text-sm">
                <p>
                  <strong>Visible Without Signup:</strong> Content shows in previews and landing
                  pages for non-authenticated users. Great for showcasing your best content to drive
                  signups.
                </p>
                <p>
                  <strong>Demo Content:</strong> Marked as free sample content that users can watch
                  without a subscription. Use this to give a taste of your platform and convert free
                  users to paid tiers.
                </p>
                <p className="mt-2 text-blue-700">
                  💡 <strong>Tip:</strong> Enable "Visible Without Signup" on 3-5 popular titles and
                  mark 2-3 as "Demo Content" to maximize conversion rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-gray-900">{stats.totalTitles}</div>
              <div className="text-sm text-gray-600">Total Titles</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
              <div className="text-3xl font-bold text-purple-600">{stats.visibleWithoutSignup}</div>
              <div className="text-sm text-purple-700">Visible Publicly</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
              <div className="text-3xl font-bold text-green-600">{stats.demoContent}</div>
              <div className="text-sm text-green-700">Demo Content</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600">{stats.kidsTitles}</div>
              <div className="text-sm text-yellow-700">Kids Titles</div>
            </div>
            <div className="bg-pink-50 rounded-lg p-4 shadow-sm border border-pink-200">
              <div className="text-3xl font-bold text-pink-600">{stats.immersiveTitles}</div>
              <div className="text-sm text-pink-700">Immersive VR</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Titles ({titles.length})</option>
                <option value="visible">
                  Visible Without Signup ({stats?.visibleWithoutSignup})
                </option>
                <option value="demo">Demo Content ({stats?.demoContent})</option>
                <option value="kids">Kids Content ({stats?.kidsTitles})</option>
              </select>
            </div>

            {/* Selection Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-2 text-sm text-purple-600 hover:text-purple-700 transition"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-700 transition"
              >
                Deselect All
              </button>
              <span className="text-sm text-gray-500">({selectedIds.size} selected)</span>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
              <button
                onClick={() => bulkUpdate('visibleWithoutSignup', true)}
                disabled={updating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm font-medium"
              >
                Set Visible
              </button>
              <button
                onClick={() => bulkUpdate('visibleWithoutSignup', false)}
                disabled={updating}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 text-sm font-medium"
              >
                Set Hidden
              </button>
              <button
                onClick={() => bulkUpdate('isDemoContent', true)}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium"
              >
                Mark as Demo
              </button>
              <button
                onClick={() => bulkUpdate('isDemoContent', false)}
                disabled={updating}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 text-sm font-medium"
              >
                Unmark Demo
              </button>
              <button
                onClick={resetAll}
                disabled={updating}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-medium"
              >
                Reset All Flags
              </button>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size === filteredTitles.length && filteredTitles.length > 0
                      }
                      onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Membership
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Visible Without Signup
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Demo Content
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTitles.map((title) => (
                  <tr
                    key={title.id}
                    className={`hover:bg-gray-50 transition ${selectedIds.has(title.id) ? 'bg-purple-50' : ''
                      }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(title.id)}
                        onChange={() => toggleSelection(title.id)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img
                          src={title.thumbnail}
                          alt={title.title}
                          className="w-12 h-16 object-cover rounded mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{title.title}</div>
                          <div className="text-sm text-gray-500">{title.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium capitalize">
                        {title.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${title.contentType === 'kids'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {title.contentType === 'kids' ? 'Kids' : 'All Ages'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${title.requiredMembership === 'FREE'
                          ? 'bg-green-100 text-green-700'
                          : title.requiredMembership === 'KIDS'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-purple-100 text-purple-700'
                          }`}
                      >
                        {title.requiredMembership}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={title.visibleWithoutSignup || false}
                          onChange={(e) =>
                            updateTitle(title.id, 'visibleWithoutSignup', e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={title.isDemoContent || false}
                          onChange={(e) => updateTitle(title.id, 'isDemoContent', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/title/${title.id}`}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTitles.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-500">No titles match the current filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
