'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import SkeletonLoader from '@/components/Loader/SkeletonLoader'

import { deleteCreator, getCreators, Creator } from '@/lib/creatorApi'
import CreatorPageHeader from '@/components/Creator/CreatorPageHeader'
import CreatorStatsCards from '@/components/Creator/CreatorStatsCards'
import CreatorToolbar from '@/components/Creator/CreatorToolbar'
import CreatorTable from '@/components/Creator/CreatorTable'
import CreatorDrawer from '@/components/Creator/CreatorDrawer'
import DeleteConfirmationDialog from '@/components/Creator/DeleteConfirmationDialog'
import CreatorEditor from '@/components/Creator/EditCreator'

export default function AdminCreatorsPage() {
  const [users, setUsers] = useState<Creator[]>([])
  const [seriesToDelete, setSeriesToDelete] = useState<Creator | null>(null)

  // Drawer visibility controls
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editUser, setEditUser] = useState<Creator | null>(null)

  // Loading and search/filter states
  const [usersFetchLoading, setUsersFetchLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  async function fetchUsers(quiet = false) {
    if (!quiet) setUsersFetchLoading(true)
    else setIsRefreshing(true)

    try {
      const fetched = await getCreators()
      if (Array.isArray(fetched)) {
        setUsers(fetched)
      } else {
        toast.error('Invalid response format received from server')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch creator accounts')
    } finally {
      setUsersFetchLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Sync drawer visibility whenever form targets change
  useEffect(() => {
    if (showCreateForm || editUser) {
      setIsDrawerOpen(true)
    }
  }, [showCreateForm, editUser])

  // Open Add Creator Form
  const handleAddClick = () => {
    setEditUser(null)
    setShowCreateForm(true)
    setIsDrawerOpen(true)
  }

  // Open Edit Creator Form
  const handleEditClick = (creator: Creator) => {
    setShowCreateForm(false)
    setEditUser(creator)
    setIsDrawerOpen(true)
  }

  // Close Drawer visually (Preserve unsaved changes state)
  const handleCloseDrawerVisually = () => {
    setIsDrawerOpen(false)
  }

  // Explicit Close (Cancel/Submit from inside Form) - Reset State
  const handleCloseDrawerExplicitly = () => {
    setIsDrawerOpen(false)
    // Timeout gives animation room to complete before component is reset
    setTimeout(() => {
      setShowCreateForm(false)
      setEditUser(null)
    }, 300)
  }

  // Perform Destructive Deletion
  const handleDeleteConfirm = async () => {
    if (!seriesToDelete) return
    try {
      const status = await deleteCreator(seriesToDelete.id ?? '')
      if (status === 204) {
        setUsers((prev) => prev.filter((u) => u.id !== seriesToDelete.id))
        toast.success(`${seriesToDelete.name} deleted successfully`)
      } else {
        toast.error(`Error deleting ${seriesToDelete.name}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete creator account')
    } finally {
      setSeriesToDelete(null)
    }
  }

  // Client-side search and role logic
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !query ||
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.phone?.toLowerCase().includes(query)

    const uRole = (u as any).role || 'creator'
    const matchesRole = filterRole === 'all' || uRole.toLowerCase() === filterRole.toLowerCase()

    return matchesSearch && matchesRole
  })

  // Gorgeous Dashboard Loading State
  if (usersFetchLoading) {
    return (
      <div className="space-y-8 animate-pulse select-none max-w-7xl mx-auto">
        {/* Page Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-neutral-850 pb-6">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <SkeletonLoader className="w-10 h-10 bg-slate-205 dark:bg-neutral-800 rounded-xl" />
              <SkeletonLoader className="w-20 h-5.5 bg-slate-205 dark:bg-neutral-800 rounded-full" />
            </div>
            <SkeletonLoader className="w-64 h-9 bg-slate-205 dark:bg-neutral-800 rounded-xl mt-1" />
            <SkeletonLoader className="w-96 h-4 bg-slate-100 dark:bg-neutral-900 rounded-md" />
          </div>
          <div className="flex items-center space-x-3">
            <SkeletonLoader className="w-24 h-9.5 bg-slate-205 dark:bg-neutral-800 rounded-xl" />
            <SkeletonLoader className="w-32 h-9.5 bg-slate-205 dark:bg-neutral-800 rounded-xl" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-850/80 bg-white dark:bg-neutral-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <SkeletonLoader className="h-3 w-24 bg-slate-200 dark:bg-neutral-800 rounded" />
                <SkeletonLoader className="h-9 w-9 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
              </div>
              <SkeletonLoader className="h-8 w-16 bg-slate-200 dark:bg-neutral-800 rounded-lg mt-1" />
              <SkeletonLoader className="h-3 w-32 bg-slate-100 dark:bg-neutral-900 rounded mt-2" />
            </div>
          ))}
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200/85 dark:border-neutral-850/85">
          <SkeletonLoader className="h-8.5 w-full sm:max-w-md bg-slate-100 dark:bg-neutral-950 rounded-xl" />
          <div className="flex items-center gap-2">
            <SkeletonLoader className="h-8.5 w-24 bg-slate-105 dark:bg-neutral-950 rounded-xl" />
            <SkeletonLoader className="h-8.5 w-8.5 bg-slate-105 dark:bg-neutral-950 rounded-xl" />
            <SkeletonLoader className="h-8.5 w-16 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200/80 dark:border-neutral-850 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-neutral-900/80 border-b border-slate-200/80 dark:border-neutral-850/80">
                  <th className="px-6 py-4">
                    <SkeletonLoader className="h-3.5 w-16 bg-slate-200 dark:bg-neutral-850 rounded" />
                  </th>
                  <th className="px-6 py-4">
                    <SkeletonLoader className="h-3.5 w-16 bg-slate-200 dark:bg-neutral-855 rounded" />
                  </th>
                  <th className="px-6 py-4">
                    <SkeletonLoader className="h-3.5 w-16 bg-slate-200 dark:bg-neutral-855 rounded" />
                  </th>
                  <th className="px-6 py-4">
                    <SkeletonLoader className="h-3.5 w-10 bg-slate-200 dark:bg-neutral-855 rounded" />
                  </th>
                  <th className="px-6 py-4 text-right">
                    <SkeletonLoader className="h-3.5 w-16 bg-slate-200 dark:bg-neutral-855 rounded ml-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <tr key={idx} className="bg-white dark:bg-neutral-900">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <SkeletonLoader className="w-9 h-9 bg-slate-200 dark:bg-neutral-800 rounded-full" />
                        <div className="space-y-1.5">
                          <SkeletonLoader className="h-4.5 w-24 bg-slate-200 dark:bg-neutral-800 rounded" />
                          <SkeletonLoader className="h-3 w-32 bg-slate-150 dark:bg-neutral-850 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <SkeletonLoader className="h-3.5 w-24 bg-slate-150 dark:bg-neutral-850 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <SkeletonLoader className="h-3.5 w-48 bg-slate-150 dark:bg-neutral-850 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <SkeletonLoader className="h-5 w-16 bg-slate-200 dark:bg-neutral-800 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <SkeletonLoader className="h-8.5 w-8.5 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
                        <SkeletonLoader className="h-8.5 w-8.5 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto animate-fade-in pb-12">
      {/* 1. Page Header */}
      <CreatorPageHeader
        totalCount={users.length}
        onAddClick={handleAddClick}
        onRefreshClick={() => fetchUsers(true)}
        isRefreshing={isRefreshing}
      />

      {/* 2. KPI Summary Cards */}
      <CreatorStatsCards creators={users} />

      {/* 3. Modern Toolbar */}
      <CreatorToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefreshClick={() => fetchUsers(true)}
        isRefreshing={isRefreshing}
        onAddClick={handleAddClick}
        filterRole={filterRole}
        onFilterRoleChange={setFilterRole}
      />

      {/* 4. Creator Table / Workspace */}
      <CreatorTable
        creators={filteredUsers}
        onEditClick={handleEditClick}
        onDeleteClick={setSeriesToDelete}
        onAddClick={handleAddClick}
      />

      {/* 5. Creator Form Drawer (Slide-Over Panel) */}
      <CreatorDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawerVisually}
        title={editUser ? 'Edit Creator' : 'Add Creator'}
        description={
          editUser
            ? 'Update creator information and account settings.'
            : 'Create a new creator profile and configure partner settings.'
        }
      >
        <CreatorEditor
          key={editUser ? editUser.id : 'new'}
          creator={editUser}
          setEditUser={setEditUser}
          setUsers={setUsers}
          onClose={handleCloseDrawerExplicitly}
        />
      </CreatorDrawer>

      {/* 6. Destructive Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!seriesToDelete}
        onClose={() => setSeriesToDelete(null)}
        onConfirm={handleDeleteConfirm}
        creatorName={seriesToDelete?.name || ''}
      />
    </div>
  )
}
