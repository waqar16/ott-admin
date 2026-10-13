'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiDownload,
  FiEye,
  FiPercent,
  FiDollarSign,
  FiFilm,
  FiCalendar,
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from 'react-icons/fi'
import { CreatorStatement, FilterState } from '../types'
import { getCreatorStatement, exportCreatorReportExcel } from '@/lib/creatorApi'

interface CreatorStatementModalProps {
  isOpen: boolean
  onClose: () => void
  creatorId: string | null
  creatorName?: string
  filters: FilterState
}

export const CreatorStatementModal: React.FC<CreatorStatementModalProps> = ({
  isOpen,
  onClose,
  creatorId,
  creatorName,
  filters,
}) => {
  const [statement, setStatement] = useState<CreatorStatement | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !creatorId) {
      setStatement(null)
      setError(null)
      return
    }

    const fetchStatement = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await getCreatorStatement({
          creator_id: creatorId,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
          revenue: filters.revenue ? parseFloat(filters.revenue) : undefined,
          currency: filters.currency || undefined,
        })

        if (res?.results) {
          setStatement(res.results)
        } else {
          setError('Statement data format not recognized')
        }
      } catch (err: any) {
        console.error('Error fetching creator statement:', err)
        const msg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          err.message ||
          'Failed to load creator royalty statement'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    fetchStatement()
  }, [isOpen, creatorId, filters.start_date, filters.end_date, filters.revenue, filters.currency])

  const handleDownload = async () => {
    if (!creatorId) return
    try {
      setDownloadLoading(true)
      await exportCreatorReportExcel({
        creator_id: creatorId,
        creator_name: statement?.creator_name || creatorName || 'Creator',
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        revenue: filters.revenue || undefined,
        currency: filters.currency || undefined,
      })
    } catch (err) {
      console.error('Failed to download creator statement excel:', err)
    } finally {
      setDownloadLoading(false)
    }
  }

  const formatCurrency = (val: number | string, curr: string = 'GBP') => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return `0.00 ${curr}`
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: curr || 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num)
    } catch {
      return `${num.toFixed(2)} ${curr}`
    }
  }

  const formatNumber = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return '0'
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (!isOpen) return null

  const currencyCode = statement?.currency || filters.currency || 'GBP'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Royalty Statement
                </span>
                <span className="text-xs text-muted-foreground">Creator-Confidential</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {statement?.creator_name || creatorName || 'Creator Royalty Statement'}
              </h2>
              {statement?.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FiMail className="w-3.5 h-3.5" />
                  {statement.email}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Close statement modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <FiRefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading royalty statement...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Failed to Load Statement</h4>
                <p className="text-xs mt-1 text-destructive/90">{error}</p>
              </div>
            </div>
          )}

          {/* Statement Content */}
          {!loading && !error && statement && (
            <div className="space-y-6">
              {/* Period Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-accent/50 border border-border/80 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-primary" />
                  <span>
                    Statement Period:{' '}
                    <strong className="text-foreground">
                      {statement.statement_period?.start_date || 'N/A'}
                    </strong>{' '}
                    to{' '}
                    <strong className="text-foreground">
                      {statement.statement_period?.end_date || 'N/A'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Currency: {currencyCode}
                </div>
              </div>

              {/* Creator Statement KPI Cards (Exclusively Section 2 metrics) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card/60 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                    <span>Unique Views</span>
                    <FiEye className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatNumber(statement.unique_views)}
                  </div>
                  <p className="text-[11px] text-muted-foreground">Unique content plays</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/60 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase">
                    <span>Platform View Share</span>
                    <FiPercent className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {Number(statement.percentage_of_views).toFixed(2)}%
                  </div>
                  <p className="text-[11px] text-muted-foreground">Of platform audience</p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                    <span>Payout Due</span>
                    <FiDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(statement.payout_due, currencyCode)}
                  </div>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">
                    Calculated creator royalties
                  </p>
                </div>
              </div>

              {/* Content-Level View Breakdown Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FiFilm className="w-4 h-4 text-primary" />
                    Content View Breakdown
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {statement.contents?.length || 0} Titles
                  </span>
                </div>

                {statement.contents && statement.contents.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">Content ID</th>
                          <th className="py-2.5 px-3 text-right">Attributed Views</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {statement.contents.map((item, idx) => (
                          <tr key={item.content_id || idx} className="hover:bg-accent/40">
                            <td className="py-2.5 px-3 font-medium text-foreground">
                              {item.title}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                              {String(item.content_id).slice(0, 8)}...
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                              {formatNumber(item.views)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20">
                    <p className="text-xs text-muted-foreground">
                      No individual titles recorded for this statement period.
                    </p>
                  </div>
                )}
              </div>

              {/* Safe Disclosure Notice */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <FiCheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  This statement complies with confidentiality requirements: platform operating
                  costs, gross inflows, and third-party creator figures are completely withheld.
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleDownload}
              disabled={downloadLoading || loading || !statement}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              {downloadLoading ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  <span>Downloading Statement...</span>
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  <span>Download Royalty Statement (.xlsx)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
