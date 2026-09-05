'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { motion } from 'framer-motion'

import { API_BASE } from '@/lib/config'
import { CreatorReportData, FilterState } from './types'

import { CreatorReportHeader } from './components/CreatorReportHeader'
import { CreatorFilters } from './components/CreatorFilters'
import { SummaryStatCards } from './components/SummaryStatCards'
import { PerformerCard } from './components/PerformerCard'
import { CreatorTable } from './components/CreatorTable'
import { EmptyState } from './components/EmptyState'
import { RevenueSkeleton } from './components/RevenueSkeleton'

export default function CreatorReportPage() {
  const [data, setData] = useState<CreatorReportData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false)

  const [filters, setFilters] = useState<FilterState>({
    start_date: '',
    end_date: '',
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const query =
        filters.start_date && filters.end_date
          ? `?start_date=${filters.start_date}&end_date=${filters.end_date}`
          : ''

      const res = await axios.get(`${API_BASE}api/v1/admin-dashboard/creator-report${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      })

      setData(res.data.results)
    } catch (err) {
      console.error('Error fetching creator revenue report:', err)
    } finally {
      setLoading(false)
    }
  }

  const downloadExcelReport = async () => {
    try {
      setDownloadLoading(true)
      const query =
        filters.start_date && filters.end_date
          ? `?start_date=${filters.start_date}&end_date=${filters.end_date}`
          : ''

      const res = await axios.get(
        `${API_BASE}api/v1/admin-dashboard/creator-report/excel${query}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
          responseType: 'blob',
        }
      )

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const filename =
        filters.start_date && filters.end_date
          ? `creator-report_${filters.start_date}_${filters.end_date}.xlsx`
          : `creator-report_${new Date().toISOString().split('T')[0]}.xlsx`

      link.setAttribute('download', filename)

      document.body.appendChild(link)
      link.click()

      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading report:', err)
    } finally {
      setDownloadLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFilter = () => {
    fetchData()
  }

  const handleResetFilters = () => {
    setFilters({ start_date: '', end_date: '' })
    // Fetch reset data cleanly
    setLoading(true)
    axios
      .get(`${API_BASE}api/v1/admin-dashboard/creator-report`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('access_token')}`,
        },
      })
      .then((res) => setData(res.data.results))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }

  if (loading && !data) {
    return <RevenueSkeleton />
  }

  const hasCreators = Boolean(data && data.creators && data.creators.length > 0)
  const isFiltered = Boolean(filters.start_date || filters.end_date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground"
    >
      {/* Header */}
      <CreatorReportHeader
        onDownload={downloadExcelReport}
        downloadLoading={downloadLoading}
      />

      {/* Date Filter Card */}
      <CreatorFilters
        filters={filters}
        setFilters={setFilters}
        onApply={handleFilter}
        onReset={handleResetFilters}
        loading={loading}
      />

      {/* Summary KPI Cards */}
      {data?.summary && <SummaryStatCards summary={data.summary} />}

      {/* Performers Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.top_performer != null && (
          <PerformerCard type="top" performer={data.top_performer} />
        )}
        {data?.lowest_performer != null && (
          <PerformerCard type="lowest" performer={data.lowest_performer} />
        )}
      </div>

      {/* Creators Table / Empty State */}
      {hasCreators && data?.creators ? (
        <CreatorTable creators={data.creators} />
      ) : (
        <EmptyState onReset={handleResetFilters} hasFilters={isFiltered} />
      )}
    </motion.div>
  )
}
