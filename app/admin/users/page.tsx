'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import CreatorDrawer from '@/components/Creator/CreatorDrawer'
import EditUser from '@/components/User/UpdateUser'
import { deleteUser, getUsers, User } from '@/lib/userApi'

import { UsersPageHeader } from './components/UsersPageHeader'
import { UserStatsCards } from './components/UserStatsCards'
import { UserSearchFilter } from './components/UserSearchFilter'
import { UsersTable } from './components/UsersTable'
import { UserCardMobile } from './components/UserCardMobile'
import { DeleteUserDialog } from './components/DeleteUserDialog'
import { EmptyUsersState } from './components/EmptyUsersState'
import { UsersTableSkeleton } from './components/UsersTableSkeleton'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [seriesToDelete, setSeriesToDelete] = useState<User | null>(null)
  const [usersFetchLoading, setUsersFetchLoading] = useState<boolean>(true)

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  async function fetch() {
    try {
      setUsersFetchLoading(true)
      const usersToFetch = await getUsers()
      if (Array.isArray(usersToFetch)) {
        setUsers(usersToFetch)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      toast.error('Failed to load user accounts')
    } finally {
      setUsersFetchLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  const handleAddUser = () => {
    setDrawerMode('create')
    setSelectedUser({
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      is_active: true,
      created_at: new Date(),
    })
    setDrawerOpen(true)
  }

  const handleEditUser = (user: User) => {
    setDrawerMode('edit')
    setSelectedUser(user)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteConfirm = async (userToDelete: User) => {
    try {
      const contentDeletion = await deleteUser(userToDelete)
      if (contentDeletion === 200) {
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
        toast.success(`${userToDelete.name || userToDelete.email} was deleted successfully`)
      } else {
        toast.error(`Error deleting ${userToDelete.name || userToDelete.email}`)
      }
    } catch (err) {
      console.error('Error in deletion:', err)
      toast.error(`Error deleting ${userToDelete.name || userToDelete.email}`)
    } finally {
      setSeriesToDelete(null)
    }
  }

  // Filter & Search logic
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim()
    const matchesSearch =
      query === '' ||
      (user.name && user.name.toLowerCase().includes(query)) ||
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.role && user.role.toLowerCase().includes(query))

    if (!matchesSearch) return false

    if (selectedFilter === 'all') return true
    if (selectedFilter === 'admin') return user.role?.toLowerCase() === 'admin'
    if (selectedFilter === 'user') return user.role?.toLowerCase() === 'user'
    if (selectedFilter === 'active') return user.is_active === true
    if (selectedFilter === 'inactive')
      return user.is_active === false || user.status === 'banned' || user.status === 'suspended'
    if (selectedFilter === 'beta_tester') return user.role?.toLowerCase() === 'beta_tester'

    return true
  })

  if (usersFetchLoading && users.length === 0) {
    return <UsersTableSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <UsersPageHeader
        onRefresh={fetch}
        onAddUser={handleAddUser}
        loading={usersFetchLoading}
        totalUsersCount={users.length}
      />

      {/* Analytics KPI Stat Cards */}
      <UserStatsCards users={users} />

      {/* Client-side Search & Filter Controls */}
      <UserSearchFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        totalResults={filteredUsers.length}
        totalUsers={users.length}
      />

      {/* Main Users List (Desktop Table + Mobile Cards) */}
      {filteredUsers.length > 0 ? (
        <>
          <UsersTable
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={(user) => setSeriesToDelete(user)}
          />
          <UserCardMobile
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={(user) => setSeriesToDelete(user)}
          />
        </>
      ) : (
        <EmptyUsersState
          onRefresh={fetch}
          hasQuery={Boolean(searchQuery || selectedFilter !== 'all')}
          onClearQuery={() => {
            setSearchQuery('')
            setSelectedFilter('all')
          }}
        />
      )}

      {/* Delete User Confirmation Modal */}
      <DeleteUserDialog
        user={seriesToDelete}
        onClose={() => setSeriesToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Right Slide Drawer for Create & Edit User */}
      <CreatorDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        title={drawerMode === 'create' ? 'Create User' : 'Edit User'}
        description={
          drawerMode === 'create'
            ? 'Create a new user account and assign permissions.'
            : 'Update account information, role and access permissions.'
        }
      >
        {selectedUser && (
          <EditUser
            user={selectedUser}
            setEditUser={() => handleCloseDrawer()}
            setUsers={setUsers}
          />
        )}
      </CreatorDrawer>
    </motion.div>
  )
}
