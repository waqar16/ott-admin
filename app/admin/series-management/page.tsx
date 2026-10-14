'use client'

import { useCallback, useEffect, useState } from 'react'
import { listContent } from '@/lib/contentApi'
import SeriesTree from '@/components/SeriesTree'
import SeriesSkeleton from '@/components/SeriesSkeleton'
import Cookies from 'js-cookie'
import { API_BASE } from '@/lib/config'
import ContentEditor from '@/components/admin/content/ContentEditor.client'
import { Content } from '@/lib/types/content'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { toast } from 'sonner'
import { BiRefresh } from 'react-icons/bi'
import UploadTrailerClient from '@/components/admin/content/UploadTrailerClient'
import AdminContentHelpPanel from '@/components/admin/content/AdminContentHelpPanel'
export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddSeries, setShowAddSeries] = useState(false)
  const [transcodingMap, setTranscodingMap] = useState<
    Record<
      string,
      {
        progress: number
        phase: string
        status: string
        error?: boolean
      }
    >
  >({})
  const [creatingSeries, setCreatingSeries] = useState(false)
  const [seriesTitle, setSeriesTitle] = useState('')
  const sseConnections = useRef<Record<string, EventSource>>({})
  const [seriesDescription, setSeriesDescription] = useState('')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [open, setOpen] = useState(false)
  function openAddSeriesModal() {
    setShowAddSeries(true)
  }
  async function createSeries() {
    try {
      setCreatingSeries(true)
      const token = Cookies.get('access_token')

      const res = await fetch(`${API_BASE}api/v1/content/contents/series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: seriesTitle,
          description: seriesDescription,
        }),
      })

      if (!res.ok) throw new Error('Failed to create series')

      let newS = await res.json()
      setShowAddSeries(false)
      setSeriesList((prev) => [...prev, newS])
      setSeriesDescription('')

      // fetchContent(); // refresh list
    } catch (error) {
      console.error(error)
      alert('Error creating series.')
    } finally {
      setCreatingSeries(false)
    }
  }
  let pathname = usePathname()
  async function fetchSeries() {
    setLoading(true)
    try {
      const data = await listContent({
        media_type: 'series',
        content_type: pathname.includes('movie')
          ? 'movie'
          : pathname.includes('document')
            ? 'documentary'
            : pathname.includes('trailer')
              ? 'trailer'
              : pathname.includes('series')
                ? 'series'
                : pathname.includes('episode')
                  ? 'episode'
                  : 'movie',
      })
      setSeriesList(data.results ?? data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSeries()
  }, [])

  const filtered = seriesList.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
  const startTranscodingListener = (contentId: string) => {
    if (sseConnections.current[contentId]) return

    const es = new EventSource(
      `http://3.236.253.230/api/v1/content/transcoding-progress/${contentId}`
    )

    sseConnections.current[contentId] = es

    es.onmessage = (event) => {
      if (event.data === 'ping') return

      try {
        const data = JSON.parse(event.data)

        setTranscodingMap((prev) => ({
          ...prev,
          [contentId]: {
            progress: data.progress ?? 0,
            phase: data.phase,
            status: data.status,
          },
        }))

        // UPDATE EPISODE LIVE
        setSeriesList((prev) =>
          prev.map((series) => ({
            ...series,
            children: series.children?.map((season: any) => ({
              ...season,
              children: season.children?.map((ep: any) =>
                ep.id === contentId
                  ? {
                    ...ep,
                    ingest_status:
                      data.status === 'COMPLETE'
                        ? 'ready'
                        : data.status === 'FAILED'
                          ? 'failed'
                          : 'processing',
                  }
                  : ep
              ),
            })),
          }))
        )

        if (data.status === 'COMPLETE' || data.status === 'FAILED') {
          if (data.status === 'COMPLETE') {
            toast.success('Episode transcoding completed')
          } else if (data.status === 'FAILED') {
            toast.error('Episode transcoding failed')
          }

          es.close()

          delete sseConnections.current[contentId]

          setTimeout(() => {
            setTranscodingMap((prev) => {
              const updated = { ...prev }
              delete updated[contentId]
              return updated
            })
          }, 3000)
        }
      } catch (err) {
        console.error(err)
      }
    }

    es.onerror = (err) => {
      console.warn('SSE Connection issue (auto-reconnecting):', err)
    }
  }

  useEffect(() => {
    seriesList.forEach((series) => {
      series.children?.forEach((season: any) => {
        season.children?.forEach((ep: any) => {
          const ingestStatus = ep.ingest_status?.toLowerCase()
          const status = ep.status?.toLowerCase()
          const isTranscoding =
            ingestStatus === 'processing' ||
            ingestStatus === 'uploading' ||
            status === 'processing' ||
            status === 'uploading'

          if (isTranscoding && !sseConnections.current[ep.id]) {
            startTranscodingListener(ep.id)
          }
        })
      })
    })
  }, [seriesList])
  useEffect(() => {
    return () => {
      Object.values(sseConnections.current).forEach((es) => {
        es.close()
      })
    }
  }, [])
  return (
    <div className="relative min-h-screen mt-16 md:mt-0 p-3 md:p-6
  bg-gradient-to-br from-slate-50 via-white to-slate-100
  dark:from-[#09090b] dark:via-[#111318] dark:to-[#171923]
  text-slate-900 dark:text-white transition-colors duration-300">

      {/* Subtle background accents */}
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-72
    bg-[var(--main-color)]/10 dark:bg-[var(--main-color)]/15
    blur-3xl rounded-full opacity-70" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center
    justify-between gap-4 mb-6">

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight
        bg-gradient-to-r from-slate-900 to-slate-500
        dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Series Library
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage, organize, and discover your series collection.
          </p>
        </div>

        <button
          onClick={openAddSeriesModal}
          className="group relative inline-flex items-center justify-center gap-2
        overflow-hidden rounded-xl px-5 py-3 font-semibold text-white
        bg-[var(--main-color)]
        shadow-lg shadow-[var(--main-color)]/20
        transition-all duration-300
        hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--main-color)]/30
        active:translate-y-0 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[var(--main-color)] focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-[#111318]">

          <span className="absolute inset-0 translate-x-[-120%] bg-white/15
        skew-x-[-20deg] transition-transform duration-700
        group-hover:translate-x-[120%]" />

          <span className="relative text-xl transition-transform duration-300
        group-hover:rotate-90">
            +
          </span>
          <span className="relative">Add New Series</span>
        </button>
      </div>

      {/* Search and actions */}
      <div className="mb-4 relative flex flex-col sm:flex-row gap-3
    sm:items-center sm:justify-between">

        {/* Search */}
        <div className="group relative w-full sm:max-w-md">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2
          h-5 w-5 text-slate-400 transition-colors
          group-focus-within:text-[var(--main-color)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
            <path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            placeholder="Search series by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search series"
            className="w-full rounded-xl border border-slate-200
          bg-white/80 py-3 pl-12 pr-4 text-sm md:text-base
          text-slate-900 placeholder:text-slate-400
          shadow-sm backdrop-blur-md outline-none
          transition-all duration-300
          hover:border-slate-300
          focus:border-[var(--main-color)]
          focus:ring-0 focus:ring-none
          dark:border-white/10 dark:bg-white/[0.04]
          dark:text-white dark:placeholder:text-slate-500
          dark:hover:border-white/20"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={() => fetchSeries()}
          className="group inline-flex items-center justify-center gap-2
        rounded-xl border border-slate-200 bg-white/80
        px-4 py-3 text-sm font-medium text-slate-700
        shadow-sm backdrop-blur-md transition-all duration-300
        hover:-translate-y-0.5 hover:border-[var(--main-color)]/40
        hover:bg-slate-50 hover:shadow-md
        active:translate-y-0 active:scale-[0.98]
        dark:border-white/10 dark:bg-white/[0.04]
        dark:text-slate-200 dark:hover:bg-white/[0.08]
        dark:hover:border-white/20"
        >
          <BiRefresh
            className="text-lg transition-transform duration-500
          group-hover:rotate-180"
          />
          Refresh
        </button>
      </div>

      <AdminContentHelpPanel />
      {/* Loading Skeleton */}
      {loading ? (
        <SeriesSkeleton />
      ) : (
        <SeriesTree
          setSeriesList={setSeriesList}
          seriesList={filtered}
          refresh={fetchSeries}
          setSelectedContent={setSelectedContent}
          editSeriesHandler={() => {
            setShowAddSeries(true)
          }}
          transcodingMap={transcodingMap}
          startTranscodingListener={startTranscodingListener}
        />
      )}
      {showAddSeries && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add New Series</h2>
              <button
                onClick={() => setShowAddSeries(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-neutral-300 mb-1 block">Series Title</label>
                <input
                  type="text"
                  value={seriesTitle}
                  onChange={(e) => setSeriesTitle(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 outline-none"
                  placeholder="Enter series title"
                />
              </div>

              <div>
                <label className="text-neutral-300 mb-1 block">Description</label>
                <textarea
                  value={seriesDescription}
                  onChange={(e) => setSeriesDescription(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded px-3 py-2 outline-none h-24"
                  placeholder="Enter series description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddSeries(false)}
                className="px-4 py-2 bg-neutral-600 rounded-lg hover:bg-neutral-500"
              >
                Cancel
              </button>
              <button
                disabled={creatingSeries}
                onClick={createSeries}
                className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingSeries ? 'Creating...' : 'Create Series'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddSeries && (
        <ContentEditor
          setContent={setSeriesList}
          content={selectedContent}
          onClose={() => {
            setShowAddSeries(false)
            fetchSeries()
          }}
          startTranscodingListener={startTranscodingListener}
          onSuccess={() => setShowAddSeries(false)}
          contentType={'series'}
        />
      )}{' '}
    </div>
  )
}
