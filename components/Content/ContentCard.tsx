'use client'

import React, { useState } from 'react'
import { deleteContent, retryTranscoding } from '@/lib/contentApi'
import { Content, ContentStatus } from '@/lib/types/content'
import { BiCheck, BiEdit, BiLink, BiTrash } from 'react-icons/bi'
import {
  FiInfo,
  FiRotateCw,
  FiEyeOff,
  FiFilm,
  FiCheckCircle,
  FiDollarSign,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi'
import { toast } from 'sonner'
import { TranscodingProgress } from '@/app/admin/movie-management/page'
import UploadTrailerClient from '../admin/content/UploadTrailerClient'
import StatusBadge from './StatusBadge'

interface ContentCardProps {
  item: Content
  transcodingProgress?: TranscodingProgress
  handleViewDetails: (item: Content) => void
  handleEdit: (item: Content) => void
  publishContent: (id: string, status?: ContentStatus) => Promise<{ status: ContentStatus }>
  fetchContent: () => void
}

const getTranscodingTextColor = (phase?: string, status?: string) => {
  const normStatus = status?.toUpperCase()
  if (normStatus === 'FAILED') return 'text-rose-500'
  if (normStatus === 'COMPLETE' || normStatus === 'READY') return 'text-emerald-500'
  return 'text-primary'
}

const getTranscodingColor = (phase?: string, status?: string) => {
  const normStatus = status?.toUpperCase()
  if (normStatus === 'FAILED') return 'bg-rose-500'
  if (normStatus === 'COMPLETE' || normStatus === 'READY') return 'bg-emerald-500'
  return 'bg-primary'
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  transcodingProgress,
  handleViewDetails,
  handleEdit,
  publishContent,
  fetchContent,
}) => {
  const [confirmText, setConfirmText] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [publishOpen, setPublishOpen] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)

  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)

  const [trailerOpen, setTrailerOpen] = useState(false)

  const bgImage = item.banner_url || item.poster_url

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30">
      {/* Top Banner Image Container */}
      <div className="relative w-full h-44 sm:h-40 overflow-hidden bg-muted">
        {bgImage ? (
          <>
            <img
              src={bgImage}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground gap-1.5 p-4 text-center">
            <FiFilm className="w-8 h-8 opacity-40" />
            <span className="text-xs font-medium">No Banner Media</span>
          </div>
        )}

        {/* Top-Right Badges Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={item.status} />
        </div>

        {/* Bottom Actions Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* View Details */}
            <div className="relative group/btn">
              <button
                onClick={() => handleViewDetails(item)}
                className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors cursor-pointer"
                title="View Details"
              >
                <FiInfo size={16} />
              </button>
            </div>

            {/* Edit */}
            {item.content_type !== 'trailer' && (
              <div className="relative group/btn">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors cursor-pointer"
                  title="Edit Content"
                >
                  <BiEdit size={16} />
                </button>
              </div>
            )}

            {/* Delete */}
            <div className="relative group/btn">
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-2 bg-black/60 hover:bg-rose-600 backdrop-blur-md text-white rounded-lg transition-colors cursor-pointer"
                title="Delete Content"
              >
                <BiTrash size={16} />
              </button>
            </div>

            {/* Attach Trailer */}
            {item.content_type !== 'trailer' && (
              <div className="relative group/btn">
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-lg transition-colors cursor-pointer"
                  title="Attach Trailer"
                >
                  <BiLink size={16} />
                </button>
              </div>
            )}

            {/* Publish Content */}
            {item.ingest_status === 'ready' &&
              (item.status === 'ready' || item.status === 'archived' || item.status === 'draft') && (
                <div className="relative group/btn">
                  <button
                    onClick={() => setPublishOpen(true)}
                    className="p-2 bg-emerald-600/80 hover:bg-emerald-600 backdrop-blur-md text-white rounded-lg transition-colors cursor-pointer"
                    title="Publish Content"
                  >
                    <BiCheck size={16} />
                  </button>
                </div>
              )}

            {/* Archive Content */}
            {item.ingest_status === 'ready' && item.status === 'published' && (
              <div className="relative group/btn">
                <button
                  onClick={() => setArchiveOpen(true)}
                  className="p-2 bg-amber-600/80 hover:bg-amber-600 backdrop-blur-md text-white rounded-lg transition-colors cursor-pointer"
                  title="Archive Content"
                >
                  <FiEyeOff size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
            {item.description || 'No description provided.'}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-border/40">
          {/* REAL-TIME TRANSCODING PROGRESS CARD */}
          {transcodingProgress && (
            <div className="rounded-xl border border-border bg-accent/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Transcoding
                </span>
                <span
                  className={`text-xs font-bold ${getTranscodingTextColor(
                    transcodingProgress.phase,
                    transcodingProgress.status
                  )}`}
                >
                  {transcodingProgress.phase || 'Processing'}
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getTranscodingColor(
                    transcodingProgress.phase,
                    transcodingProgress.status
                  )}`}
                  style={{ width: `${transcodingProgress.progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Encoding Video</span>
                <span className="font-bold text-foreground">{transcodingProgress.progress}%</span>
              </div>
            </div>
          )}

          {/* STATUS PILLS & BADGES */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {item.visibility_mode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent text-accent-foreground border border-border capitalize">
                {item.visibility_mode}
              </span>
            )}

            {item.is_kid_safe && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <FiCheckCircle className="w-3 h-3" /> Kid Safe
              </span>
            )}

            {item.is_ppv && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <FiDollarSign className="w-3 h-3" /> PPV • ${item?.price || 0}
              </span>
            )}
          </div>

          {/* RETRY TRANSCODING ACTION */}
          {item.ingest_status === 'failed' && (
            <button
              onClick={async () => {
                const retry = await retryTranscoding(item.id)
                if (retry) {
                  toast.success('Transcoding Retry Initiated')
                  fetchContent()
                } else {
                  toast.error('Transcoding Retry Failed')
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <FiRotateCw className="w-3.5 h-3.5" />
              <span>Retry Transcoding</span>
            </button>
          )}
        </div>
      </div>

      {/* CONFIRM ARCHIVE MODAL */}
      {archiveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
            <button
              onClick={() => {
                setArchiveOpen(false)
                setConfirmText('')
              }}
              disabled={archiveLoading}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Confirm Archive Action</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Type <strong className="text-foreground font-semibold">"{item.title}"</strong> to confirm archiving this content.
                </p>
              </div>
            </div>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type content title..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-input text-foreground rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setArchiveOpen(false)
                  setConfirmText('')
                }}
                disabled={archiveLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border"
              >
                Cancel
              </button>

              <button
                disabled={confirmText !== item.title || archiveLoading}
                onClick={async () => {
                  setArchiveLoading(true)
                  const res = await publishContent(item.id, 'archived')
                  if (res.status === 'archived') {
                    toast.success(`Archived ${item.title}`)
                    setArchiveOpen(false)
                    fetchContent()
                  } else {
                    toast.error('Archiving failed')
                  }
                  setConfirmText('')
                  setArchiveLoading(false)
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {archiveLoading ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM PUBLISH MODAL */}
      {publishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
            <button
              onClick={() => {
                setPublishOpen(false)
                setConfirmText('')
              }}
              disabled={publishLoading}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <FiCheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Confirm Publish Action</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Type <strong className="text-foreground font-semibold">"{item.title}"</strong> to publish and make live.
                </p>
              </div>
            </div>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type content title..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-input text-foreground rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setPublishOpen(false)
                  setConfirmText('')
                }}
                disabled={publishLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border"
              >
                Cancel
              </button>

              <button
                disabled={confirmText !== item.title || publishLoading}
                onClick={async () => {
                  setPublishLoading(true)
                  const res = await publishContent(item.id)
                  if (res.status === 'published') {
                    toast.success(`Published ${item.title}`)
                    setPublishOpen(false)
                    fetchContent()
                  } else {
                    toast.error('Publishing failed')
                  }
                  setConfirmText('')
                  setPublishLoading(false)
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishLoading ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 relative">
            <button
              onClick={() => {
                setDeleteOpen(false)
                setConfirmText('')
              }}
              disabled={deleteLoading}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <FiAlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Delete Content Asset?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Type <strong className="text-foreground font-semibold">"{item.title}"</strong> to permanently delete this content.
                </p>
              </div>
            </div>

            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type content title..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-input text-foreground rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteOpen(false)
                  setConfirmText('')
                }}
                disabled={deleteLoading}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border"
              >
                Cancel
              </button>

              <button
                disabled={confirmText !== item.title || deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true)
                  const delItem = await deleteContent(item.id)
                  if (delItem === 204) {
                    setDeleteOpen(false)
                    fetchContent()
                    setConfirmText('')
                    toast.success(`${item.title} Deleted ✔`)
                  } else {
                    toast.error('Error Occurred. Try Later :)')
                  }
                  setDeleteLoading(false)
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD TRAILER MODAL */}
      {trailerOpen && (
        <UploadTrailerClient
          trailer_id={item.trailer_id}
          content={item}
          trailer_url={item.trailer_url || ''}
          setOpen={setTrailerOpen}
          refreshContent={fetchContent}
        />
      )}
    </div>
  )
}

export default ContentCard
