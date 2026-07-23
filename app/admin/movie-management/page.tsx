'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { FiRefreshCw, FiAlertCircle, FiPlus } from 'react-icons/fi'

import { Content, ContentFilters, ApiError } from '@/lib/types/content'
import {
  listContent,
  getContent,
  publishContent,
} from '@/lib/contentApi'

import ContentStats from '@/components/Content/ContentStats'
import AdminContentHelpPanel from '@/components/admin/content/AdminContentHelpPanel'
import ContentFilter from '@/components/Content/ContentFilter'
import ContentCard from '@/components/Content/ContentCard'
import ContentLoading from '@/components/Content/ContentLoading'
import EmptyContentState from '@/components/Content/EmptyContentState'
import ContentPagination from '@/components/Content/ContentPagination'
import ContentEditor from '@/components/admin/content/ContentEditor.client'
import ContentDetailsModal from '@/components/Content/ContentDetailsModal'

export interface TranscodingProgress {
  progress: number
  phase: string
  status: string
  error?: boolean
}

export default function ContentManagementPage() {
  const [transcodingMap, setTranscodingMap] = useState<Record<string, TranscodingProgress>>({})
  const pathname = usePathname()
  const router = useRouter()

  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [detailContent, setDetailContent] = useState<Content | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<ContentFilters>({
    status: undefined,
    search: undefined,
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
    is_kid_safe: undefined,
    is_ppv: undefined,
    media_type: pathname.includes('movie-management')
      ? 'movies'
      : pathname.includes('trailer-management')
        ? 'trailers'
        : pathname.includes('documentary-management')
          ? 'documentaries'
          : pathname.includes('demo-content-management')
            ? 'democontents'
            : '',
  })

  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)

  const sseConnections = useRef<Record<string, EventSource>>({})

  const startTranscodingListener = (contentId: string) => {
    if (sseConnections.current[contentId]) {
      return
    }

    const es = new EventSource(
      `https://api.urview.com/api/v1/content/transcoding-progress/${contentId}`
    )

    sseConnections.current[contentId] = es

    es.onopen = () => {
      console.log('SSE Connected:', contentId)
    }

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

        if (data.status === 'COMPLETE' || data.status === 'FAILED') {
          if (data.status === 'COMPLETE') {
            setContent((prev) =>
              prev.map((item) =>
                item.id === contentId
                  ? {
                    ...item,
                    status: 'ready',
                    ingest_status: 'ready',
                  }
                  : item
              )
            )

            toast.success('Transcoding completed')
          } else if (data.status === 'FAILED') {
            setContent((prev) =>
              prev.map((item) =>
                item.id === contentId
                  ? {
                    ...item,
                    ingest_status: 'failed',
                  }
                  : item
              )
            )

            toast.error('Transcoding failed')
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
        console.error('SSE Parse Error', err)
      }
    }

    es.onerror = (err) => {
      console.warn('SSE Connection issue (auto-reconnecting):', err)
    }
  }

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result: any = await listContent({ ...filters, page })
      const items = Array.isArray(result) ? result : (result?.results ?? result?.content ?? [])
      setContent(items as Content[])

      setTotalCount(result?.count ?? 0)
      setHasNext(Boolean(result?.next))
      setHasPrev(Boolean(result?.previous))
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to load content')
      console.error('Error fetching content:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  useEffect(() => {
    content.forEach((item) => {
      const ingestStatus = item.ingest_status?.toLowerCase()
      const status = item.status?.toLowerCase()
      const isTranscoding =
        ingestStatus === 'processing' ||
        ingestStatus === 'uploading' ||
        status === 'processing' ||
        status === 'uploading'

      if (isTranscoding && !sseConnections.current[item.id]) {
        startTranscodingListener(item.id)
      }
    })
  }, [content])

  function handleCreateNew() {
    setSelectedContent(null)
    setShowEditor(true)
  }

  function handleEdit(item: Content) {
    setSelectedContent(item)
    setShowEditor(true)
  }

  async function handleViewDetails(item: Content) {
    try {
      const details = await getContent(item.id)
      setDetailContent(details)
      setShowDetails(true)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to load content details')
    }
  }

  function handleEditorClose() {
    setShowEditor(false)
    setSelectedContent(null)
    fetchContent()
  }

  function handleEditorSuccess(updatedContent: Content) {
    fetchContent()
    setTimeout(() => {
      handleEditorClose()
    }, 2000)
  }

  useEffect(() => {
    return () => {
      Object.values(sseConnections.current).forEach((es) => {
        es.close()
      })
    }
  }, [])

  const isFiltered = Boolean(
    filters.search ||
    filters.status ||
    filters.media_type ||
    filters.is_kid_safe !== undefined ||
    filters.is_ppv !== undefined
  )

  const contentTypeTitle = pathname.includes('movie')
    ? 'Movie'
    : pathname.includes('document')
      ? 'Documentary'
      : pathname.includes('trailer')
        ? 'Trailer'
        : pathname.includes('series')
          ? 'Series'
          : pathname.includes('episode')
            ? 'Episode'
            : 'Content'

  const contentTypeSubtitle = pathname.includes('movie')
    ? 'Manage your movie catalog, publishing status, metadata and transcoding.'
    : pathname.includes('document')
      ? 'Manage documentary films, genres, and metadata.'
      : pathname.includes('trailer')
        ? 'Manage trailer assets, visibility and publishing.'
        : pathname.includes('series')
          ? 'Manage series, episodes and streaming availability.'
          : pathname.includes('episode')
            ? 'Manage episode video assets and publishing statuses.'
            : 'Manage video assets, metadata, publishing, and transcoding.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background text-foreground"
    >
      {/* Inline Page Header - Non-sticky, full-width, clean border bottom */}
      <div className="bg-card border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {contentTypeTitle} Management
            </h1>
            <p className="text-sm text-muted-foreground">
              {contentTypeSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm hover:shadow cursor-pointer"
            >

              <span>+ Add {contentTypeTitle}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
        {/* Help Panel */}
        <AdminContentHelpPanel />

        {/* Dynamic KPI Stats Cards */}
        <ContentStats items={content} totalCount={totalCount || content.length} />

        {/* Error Alert Card */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Filter Toolbar & Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <ContentFilter filters={filters} setFilters={setFilters} />
          </div>

          <button
            onClick={fetchContent}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl text-foreground bg-card hover:bg-accent border border-border/80 shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0 self-end sm:self-auto"
            title="Refresh Content"
          >
            <FiRefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? 'animate-spin text-primary' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Content List / Skeleton / Empty State */}
        {loading && content.length === 0 ? (
          <ContentLoading />
        ) : content.length === 0 ? (
          <EmptyContentState
            onCreateNew={handleCreateNew}
            hasFilters={isFiltered}
            onClearFilters={() => {
              setFilters((prev) => ({
                ...prev,
                search: undefined,
                status: undefined,
                media_type: undefined,
                is_kid_safe: undefined,
                is_ppv: undefined,
              }))
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {content.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  transcodingProgress={transcodingMap[item.id]}
                  handleViewDetails={handleViewDetails}
                  handleEdit={handleEdit}
                  publishContent={publishContent}
                  fetchContent={fetchContent}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <ContentPagination
              page={page}
              hasPrev={hasPrev}
              hasNext={hasNext}
              totalCount={totalCount}
              setPage={setPage}
            />
          </>
        )}
      </div>

      {/* Content Editor Modal */}
      {showEditor && (
        <ContentEditor
          content={selectedContent}
          setContent={setContent}
          onClose={handleEditorClose}
          onSuccess={handleEditorSuccess}
          startTranscodingListener={startTranscodingListener}
          contentType={
            pathname.includes('movie')
              ? 'movie'
              : pathname.includes('document')
                ? 'documentary'
                : pathname.includes('trailer')
                  ? 'trailer'
                  : pathname.includes('series')
                    ? 'series'
                    : pathname.includes('episode')
                      ? 'episode'
                      : 'movie'
          }
        />
      )}

      {/* Content Details Modal */}
      {showDetails && detailContent && (
        <ContentDetailsModal
          open={showDetails}
          detailContent={detailContent}
          onClose={() => {
            setShowDetails(false)
            setDetailContent(null)
            fetchContent()
          }}
          publishContent={publishContent}
        />
      )}
    </motion.div>
  )
}
