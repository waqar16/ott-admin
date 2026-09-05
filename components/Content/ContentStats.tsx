'use client'

import React from 'react'
import { Content } from '@/lib/types/content'
import { FiFilm, FiCheckCircle, FiRefreshCw, FiFileText } from 'react-icons/fi'

interface ContentStatsProps {
  items?: Content[]
  totalCount?: number
}

export const ContentStats: React.FC<ContentStatsProps> = ({ items = [], totalCount = 0 }) => {
  const safeItems = Array.isArray(items) ? items : []

  const publishedCount = safeItems.filter(
    (i) => i?.status?.toLowerCase() === 'published'
  ).length

  const processingCount = safeItems.filter((i) => {
    const st = i?.status?.toLowerCase() || ''
    const ingest = i?.ingest_status?.toLowerCase() || ''
    return st === 'processing' || st === 'uploading' || ingest === 'processing' || ingest === 'uploading'
  }).length

  const draftReadyCount = safeItems.filter((i) => {
    const st = i?.status?.toLowerCase() || ''
    const ingest = i?.ingest_status?.toLowerCase() || ''
    return st === 'draft' || st === 'ready' || ingest === 'ready'
  }).length

  const statConfig = [
    {
      title: 'Total Assets',
      value: totalCount || safeItems.length,
      subtext: 'Catalog video content',
      icon: FiFilm,
      bgGradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-500/40',
    },
    {
      title: 'Published',
      value: publishedCount,
      subtext: 'Live for end users',
      icon: FiCheckCircle,
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      borderHover: 'hover:border-emerald-500/40',
    },
    {
      title: 'Transcoding',
      value: processingCount,
      subtext: 'In encoding queue',
      icon: FiRefreshCw,
      bgGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      borderHover: 'hover:border-purple-500/40',
      spinIcon: processingCount > 0,
    },
    {
      title: 'Draft & Ready',
      value: draftReadyCount,
      subtext: 'Awaiting publish',
      icon: FiFileText,
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      borderHover: 'hover:border-amber-500/40',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl border border-border/80 bg-card bg-gradient-to-br ${stat.bgGradient} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${stat.borderHover}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <Icon className={`w-5 h-5 ${stat.spinIcon ? 'animate-spin' : ''}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {(stat.value || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.subtext}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ContentStats
