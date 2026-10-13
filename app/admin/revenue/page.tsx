'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

import { CreatorReportData, FilterState, Performer } from './types'
import { getCreatorRevenueReport, exportCreatorReportExcel } from '@/lib/creatorApi'

import { CreatorReportHeader } from './components/CreatorReportHeader'
import { CreatorFilters } from './components/CreatorFilters'
import { PlatformInflowSection } from './components/PlatformInflowSection'
import { PerformerCard } from './components/PerformerCard'
import { CreatorTable } from './components/CreatorTable'
import { CreatorStatementModal } from './components/CreatorStatementModal'
import { EmptyState } from './components/EmptyState'
import { RevenueSkeleton } from './components/RevenueSkeleton'

export default function CreatorReportPage() {
  const [data, setData] = useState<CreatorReportData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Creator Statement Modal state
  const [statementCreatorId, setStatementCreatorId] = useState<string | null>(null)
  const [statementCreatorName, setStatementCreatorName] = useState<string>('')
  const [isStatementModalOpen, setIsStatementModalOpen] = useState<boolean>(false)

  const [filters, setFilters] = useState<FilterState>({
    start_date: '',
    end_date: '',
    revenue: '',
    creator_share_percentage: '',
    currency: 'GBP',
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await getCreatorRevenueReport({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        revenue: filters.revenue ? parseFloat(filters.revenue) : undefined,
        creator_share_percentage: filters.creator_share_percentage
          ? parseFloat(filters.creator_share_percentage)
          : undefined,
        currency: filters.currency || undefined,
      })

      if (res?.results) {
        setData(res.results)
      } else if (res?.summary || res?.creators) {
        // Fallback in case of flat root structure
        setData(res)
      } else {
        setData(null)
      }
    } catch (err: any) {
      console.error('Error fetching creator revenue report:', err)
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to fetch creator revenue report from server.'
      setError(message)
      toast.error('Unable to fetch creator revenue data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Master Excel Report Download
  const handleDownloadMasterExcel = async () => {
    try {
      setDownloadLoading(true)
      const result = await exportCreatorReportExcel({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        revenue: filters.revenue ? parseFloat(filters.revenue) : undefined,
        creator_share_percentage: filters.creator_share_percentage
          ? parseFloat(filters.creator_share_percentage)
          : undefined,
        currency: filters.currency || undefined,
      })
      toast.success(`Report downloaded: ${result.filename}`)
    } catch (err: any) {
      console.error('Error downloading report:', err)
      toast.error('Failed to download Excel report')
    } finally {
      setDownloadLoading(false)
    }
  }

  // Single-Creator Royalty Statement Excel Export
  const handleExportCreatorStatement = async (creatorId: string, creatorName: string) => {
    try {
      const result = await exportCreatorReportExcel({
        creator_id: creatorId,
        creator_name: creatorName,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        revenue: filters.revenue ? parseFloat(filters.revenue) : undefined,
        currency: filters.currency || undefined,
      })
      toast.success(`Royalty statement downloaded: ${result.filename}`)
    } catch (err: any) {
      console.error('Error downloading creator statement:', err)
      toast.error(`Failed to export statement for ${creatorName}`)
    }
  }

  // Open Creator Statement Modal
  const handleViewStatement = (creatorId: string, creatorName: string) => {
    setStatementCreatorId(creatorId)
    setStatementCreatorName(creatorName)
    setIsStatementModalOpen(true)
  }

  const handleCloseStatementModal = () => {
    setIsStatementModalOpen(false)
    setStatementCreatorId(null)
    setStatementCreatorName('')
  }

  const handleResetFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      revenue: '',
      creator_share_percentage: '',
      currency: 'GBP',
    })
  }

  if (loading && !data && !error) {
    return <RevenueSkeleton />
  }

  // Determine creators list from section_2 or root
  const creatorsList: Performer[] =
    data?.section_2_creator_revenue?.creators || data?.creators || []

  // Performers highlights
  const topPerformer = data?.section_2_creator_revenue?.top_performer || data?.top_performer || null
  const lowestPerformer =
    data?.section_2_creator_revenue?.lowest_performer || data?.lowest_performer || null

  const activeCurrency =
    data?.section_1_total_in?.currency ||
    data?.summary?.currency ||
    filters.currency ||
    'GBP'

  const hasCreators = creatorsList.length > 0
  const isFiltered = Boolean(
    filters.start_date ||
      filters.end_date ||
      filters.revenue ||
      filters.creator_share_percentage
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground"
    >
      {/* 1. Header */}
      <CreatorReportHeader
        onDownload={handleDownloadMasterExcel}
        downloadLoading={downloadLoading}
        onRefresh={fetchData}
        refreshLoading={loading}
      />

      {/* 2. Filter Bar */}
      <CreatorFilters
        filters={filters}
        setFilters={setFilters}
        onApply={fetchData}
        onReset={handleResetFilters}
        loading={loading}
      />

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Failed to Load Creator Report</p>
              <p className="text-xs text-destructive/90 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Section 1 (Gross Inflow & Margins) & Section 2 (Creator Distributable Pool) */}
      <PlatformInflowSection
        section1={data?.section_1_total_in}
        section2={data?.section_2_creator_revenue}
        summary={data?.summary}
      />

      {/* 4. Performers Highlights Grid */}
      {(topPerformer != null || lowestPerformer != null) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {topPerformer != null && (
            <PerformerCard type="top" performer={topPerformer} currency={activeCurrency} />
          )}
          {lowestPerformer != null && (
            <PerformerCard type="lowest" performer={lowestPerformer} currency={activeCurrency} />
          )}
        </div>
      )}

      {/* 5. Section 2: Creators Table / Empty State */}
      {hasCreators ? (
        <CreatorTable
          creators={creatorsList}
          currency={activeCurrency}
          onViewStatement={handleViewStatement}
          onExportStatement={handleExportCreatorStatement}
        />
      ) : (
        <EmptyState onReset={handleResetFilters} hasFilters={isFiltered} />
      )}

      {/* 6. Creator-Specific Royalty Statement Modal (Isolated Section 2 only) */}
      <CreatorStatementModal
        isOpen={isStatementModalOpen}
        onClose={handleCloseStatementModal}
        creatorId={statementCreatorId}
        creatorName={statementCreatorName}
        filters={filters}
      />
    </motion.div>
  )
}
