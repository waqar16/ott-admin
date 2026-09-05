'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  getPreSignupSettings,
  updatePreSignupSettings,
  getPreSignupAnalytics,
  getWaitlistEntries,
  promoteWaitlist,
  updateWaitlistEntry,
  deleteWaitlistEntry,
  PreSignupSettings,
  PreSignupAnalytics,
  WaitlistEntry,
  WaitlistStatus,
  UpdatePreSignupSettingsRequest,
  PromoteWaitlistRequest,
} from '@/lib/preSignupApi'

import { PreSignupHeader } from './components/PreSignupHeader'
import { PreSignupQuotaCard } from './components/PreSignupQuotaCard'
import { PreSignupWaitlistHealthCard } from './components/PreSignupWaitlistHealthCard'
import { NextInLineCard } from './components/NextInLineCard'
import { RecentConversionsCard } from './components/RecentConversionsCard'
import { WaitlistSearchFilter } from './components/WaitlistSearchFilter'
import { WaitlistTable } from './components/WaitlistTable'
import { WaitlistMobileCards } from './components/WaitlistMobileCards'
import { WaitlistPagination } from './components/WaitlistPagination'
import { QuotaSettingsModal } from './components/QuotaSettingsModal'
import { PromoteBatchModal } from './components/PromoteBatchModal'
import { WaitlistDetailDrawer } from './components/WaitlistDetailDrawer'
import { DeleteWaitlistDialog } from './components/DeleteWaitlistDialog'
import { PreSignupSkeleton } from './components/PreSignupSkeleton'

const PAGE_SIZE = 8

export default function PreSignupManagementPage() {
  const [settings, setSettings] = useState<PreSignupSettings | null>(null)
  const [analytics, setAnalytics] = useState<PreSignupAnalytics | null>(null)
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Modals & Drawers state
  const [quotaModalOpen, setQuotaModalOpen] = useState<boolean>(false)
  const [promoteModalOpen, setPromoteModalOpen] = useState<boolean>(false)
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<WaitlistEntry | null>(null)

  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Fetch all initial data
  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true)
      else setLoading(true)

      const [settingsRes, analyticsRes, waitlistRes] = await Promise.all([
        getPreSignupSettings(),
        getPreSignupAnalytics(),
        getWaitlistEntries(),
      ])

      setSettings(settingsRes)
      setAnalytics(analyticsRes)
      setWaitlist(waitlistRes)

      if (isManualRefresh) {
        toast.success('Pre-signup and waitlist metrics refreshed')
      }
    } catch (err: any) {
      console.error('Error loading pre-signup data:', err)
      toast.error('Failed to load pre-signup data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle Quota Settings Update
  const handleSaveSettings = async (payload: UpdatePreSignupSettingsRequest) => {
    const updated = await updatePreSignupSettings(payload)
    setSettings(updated)
    // Reload analytics and waitlist to reflect possible FIFO auto-promotion
    const [freshAnalytics, freshWaitlist] = await Promise.all([
      getPreSignupAnalytics(),
      getWaitlistEntries(),
    ])
    setAnalytics(freshAnalytics)
    setWaitlist(freshWaitlist)
  }

  // Handle Manual Batch Promotion
  const handlePromoteBatch = async (payload: PromoteWaitlistRequest) => {
    const res = await promoteWaitlist(payload)
    toast.success(res.detail || `Promoted ${res.promoted_count} user(s) from waitlist`)
    // Refresh analytics and list
    const [freshAnalytics, freshWaitlist, freshSettings] = await Promise.all([
      getPreSignupAnalytics(),
      getWaitlistEntries(),
      getPreSignupSettings(),
    ])
    setAnalytics(freshAnalytics)
    setWaitlist(freshWaitlist)
    setSettings(freshSettings)
  }

  // Handle updating status of a single entry
  const handleUpdateStatus = async (entry: WaitlistEntry, newStatus: WaitlistStatus) => {
    try {
      const updated = await updateWaitlistEntry(entry.id, { status: newStatus })
      setWaitlist((prev) => prev.map((item) => (item.id === entry.id ? updated : item)))
      if (selectedEntry && selectedEntry.id === entry.id) {
        setSelectedEntry(updated)
      }
      // Re-fetch analytics in background to keep counts synchronized
      getPreSignupAnalytics().then((res) => setAnalytics(res))
    } catch (err: any) {
      console.error('Error updating waitlist status:', err)
      throw err
    }
  }

  // Handle deleting entry
  const handleDeleteConfirm = async (entry: WaitlistEntry) => {
    try {
      await deleteWaitlistEntry(entry.id)
      setWaitlist((prev) => prev.filter((item) => item.id !== entry.id))
      toast.success(`Removed ${entry.name || entry.email} from waitlist`)
      // Refresh analytics in background
      getPreSignupAnalytics().then((res) => setAnalytics(res))
    } catch (err: any) {
      console.error('Error deleting waitlist entry:', err)
      toast.error('Failed to delete waitlist entry')
    }
  }

  // Filter and search computation
  const filteredWaitlist = useMemo(() => {
    return waitlist.filter((item) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        String(item.id).includes(query) ||
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.email && item.email.toLowerCase().includes(query)) ||
        (item.source && item.source.toLowerCase().includes(query))

      if (!matchesQuery) return false

      if (statusFilter === 'all') return true
      return item.status.toLowerCase() === statusFilter.toLowerCase()
    })
  }, [waitlist, searchQuery, statusFilter])

  // Reset page to 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  // Pagination calculation
  const totalPages = Math.ceil(filteredWaitlist.length / PAGE_SIZE)
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredWaitlist.slice(start, start + PAGE_SIZE)
  }, [filteredWaitlist, currentPage])

  if (loading && !settings) {
    return (
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
        <PreSignupSkeleton />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen"
    >
      {/* 1. Header with Controls */}
      <PreSignupHeader
        settings={settings}
        loading={refreshing}
        onRefresh={() => loadData(true)}
        onOpenSettings={() => setQuotaModalOpen(true)}
        onOpenPromote={() => setPromoteModalOpen(true)}
      />

      {/* 2. Top Analytics Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacity & Quota Gauge Card */}
        <PreSignupQuotaCard
          analytics={analytics}
          onOpenSettings={() => setQuotaModalOpen(true)}
        />

        {/* Waitlist Health & Conversion Card */}
        <PreSignupWaitlistHealthCard
          analytics={analytics}
          onOpenPromote={() => setPromoteModalOpen(true)}
        />
      </div>

      {/* 3. Priority Queue (FIFO) & Recent Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NextInLineCard
          entries={analytics?.next_in_line || []}
          onSelectEntry={(entry) => setSelectedEntry(entry)}
          onPromoteBatch={() => setPromoteModalOpen(true)}
        />

        <RecentConversionsCard
          entries={analytics?.recent_conversions || []}
          onSelectEntry={(entry) => setSelectedEntry(entry)}
        />
      </div>

      {/* 4. Complete Waitlist Management Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">Waitlist Registry</h2>
            <p className="text-xs text-muted-foreground">
              All registered candidates sorted by registration date
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            Total Candidates: <strong className="text-foreground">{waitlist.length}</strong>
          </span>
        </div>

        {/* Search and Status Filters */}
        <WaitlistSearchFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalCount={waitlist.length}
          filteredCount={filteredWaitlist.length}
        />

        {/* Data Presentation (Table on Desktop, Cards on Mobile) */}
        {filteredWaitlist.length > 0 ? (
          <>
            <WaitlistTable
              entries={paginatedEntries}
              onSelectEntry={(entry) => setSelectedEntry(entry)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteEntry={(entry) => setEntryToDelete(entry)}
            />

            <WaitlistMobileCards
              entries={paginatedEntries}
              onSelectEntry={(entry) => setSelectedEntry(entry)}
              onUpdateStatus={handleUpdateStatus}
              onDeleteEntry={(entry) => setEntryToDelete(entry)}
            />

            {/* Pagination Controls */}
            <WaitlistPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredWaitlist.length}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-foreground">No waitlist entries found</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No participants matched your search and filter criteria. Try resetting filters.'
                : 'There are currently no participants on the pre-signup waitlist.'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer"
              >
                Reset Search & Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. Modals and Dialogs */}
      <QuotaSettingsModal
        isOpen={quotaModalOpen}
        settings={settings}
        onClose={() => setQuotaModalOpen(false)}
        onSave={handleSaveSettings}
      />

      <PromoteBatchModal
        isOpen={promoteModalOpen}
        remainingCapacity={settings?.remaining_pre_signup_capacity ?? 0}
        pendingCount={analytics?.waitlist.pending ?? 0}
        onClose={() => setPromoteModalOpen(false)}
        onPromote={handlePromoteBatch}
      />

      <WaitlistDetailDrawer
        isOpen={Boolean(selectedEntry)}
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteEntry={(entry) => setEntryToDelete(entry)}
      />

      <DeleteWaitlistDialog
        entry={entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </motion.div>
  )
}
