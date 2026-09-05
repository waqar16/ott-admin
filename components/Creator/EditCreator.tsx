'use client'

import { updateCreator, createCreator, Creator } from '@/lib/creatorApi'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { FiUser, FiMail, FiPhone, FiInfo } from 'react-icons/fi'
import SkeletonLoader from '@/components/Loader/SkeletonLoader'

type CreatorEditorProps = {
  creator?: Creator | null
  setEditUser: React.Dispatch<React.SetStateAction<Creator | null>>
  setUsers: React.Dispatch<React.SetStateAction<Creator[]>>
  onClose?: () => void
  isLoading?: boolean
}

export default function CreatorEditor({
  setEditUser,
  creator,
  setUsers,
  onClose,
  isLoading = false,
}: CreatorEditorProps) {
  const isEditMode = !!creator

  const [form, setForm] = useState<Omit<Creator, 'id'>>({
    name: creator?.name || '',
    email: creator?.email || '',
    phone: creator?.phone || '',
    bio: creator?.bio || '',
  })

  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)

  // Sync state if creator prop changes (when key changes or component updates)
  useEffect(() => {
    setForm({
      name: creator?.name || '',
      email: creator?.email || '',
      phone: creator?.phone || '',
      bio: creator?.bio || '',
    })
    setErrors({})
  }, [creator])

  const validate = () => {
    let temp: any = {}
    if (!form.name.trim()) temp.name = 'Full name is required.'
    if (!form.email?.trim()) {
      temp.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      temp.email = 'Invalid email format.'
    }
    setErrors(temp)
    return Object.keys(temp).length === 0
  }

  const handleCancel = () => {
    setEditUser(null)
    if (onClose) onClose()
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (isEditMode && creator?.id) {
        // Update existing creator
        let userUpdate = await updateCreator({ id: creator.id, ...form })
        if (userUpdate.success && userUpdate.data?.id) {
          toast.success('Creator updated successfully')
          setUsers((prev) =>
            prev.map((u) => (u.id === creator.id ? { id: creator.id, ...form } : u))
          )
          setEditUser(null)
          if (onClose) onClose()
        } else {
          toast.error(userUpdate.error || 'Error occurred while updating')
        }
      } else {
        // Create new creator
        let userCreation = await createCreator(form)
        if (userCreation.success && userCreation.data?.id) {
          toast.success('Creator created successfully')
          setUsers((prev) => [...prev, userCreation.data])
          setEditUser(null)
          if (onClose) onClose()
        } else {
          toast.error(userCreation.error || 'Error occurred while creating')
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // If loading, display the professional enterprise input skeleton inside the drawer
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-neutral-900 animate-pulse select-none justify-between">
        {/* Scrollable inputs skeleton (Scrollbar hidden) */}
        <div
          className="flex-grow overflow-y-auto px-8 py-6 space-y-6 no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .no-scrollbar::-webkit-scrollbar {
              display: none !important;
            }
          `,
            }}
          />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <SkeletonLoader className="h-3.5 w-24 bg-slate-205 dark:bg-neutral-800 rounded" />
              <SkeletonLoader className="h-10 w-full bg-slate-105 dark:bg-neutral-950 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Sticky footer skeleton */}
        <div className="flex-shrink-0 px-8 py-4 border-t border-slate-200/60 dark:border-neutral-800/60 bg-slate-50/80 dark:bg-neutral-950/40 flex justify-end gap-3 items-center">
          <SkeletonLoader className="h-9 w-20 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
          <SkeletonLoader className="h-9 w-28 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submitForm} className="flex flex-col h-full bg-white dark:bg-neutral-900">
      {/* 1. Scrollable Content Area (Scrollbar hidden) */}
      <div
        className="flex-grow overflow-y-auto px-8 py-2 space-y-6 bg-white dark:bg-neutral-900 no-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .no-scrollbar::-webkit-scrollbar {
            display: none !important;
          }
          @keyframes errorSlideIn {
            from { opacity: 0; transform: translateY(-3px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-error {
            animation: errorSlideIn 0.15s ease-out forwards;
          }
        `,
          }}
        />

        {/* Name Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-650 dark:text-neutral-350 tracking-wide">
            Full Name <span className="text-red-500/80">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
              <FiUser className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              className={`w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-neutral-950/30 text-slate-900 dark:text-white text-sm rounded-xl outline-none border transition-all duration-150 shadow-2xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500 ${errors.name
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                : 'border-slate-200 dark:border-neutral-800/80'
                }`}
              placeholder="e.g. Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 animate-error">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-650 dark:text-neutral-350 tracking-wide">
            Email Address <span className="text-red-500/80">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
              <FiMail className="w-3.5 h-3.5" />
            </div>
            <input
              type="email"
              className={`w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-neutral-950/30 text-slate-900 dark:text-white text-sm rounded-xl outline-none border transition-all duration-150 shadow-2xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-neutral-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500 ${errors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                : 'border-slate-200 dark:border-neutral-800/80'
                }`}
              placeholder="e.g. jane.doe@example.com"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 animate-error">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-650 dark:text-neutral-350 tracking-wide">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
              <FiPhone className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-neutral-950/30 text-slate-900 dark:text-white text-sm rounded-xl outline-none border border-slate-200 dark:border-neutral-800/80 focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-150 shadow-2xs placeholder:text-slate-400 dark:placeholder:text-neutral-500"
              placeholder="e.g. +1 (555) 019-2834"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        {/* Bio Text Area */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-650 dark:text-neutral-350 tracking-wide">
            Biography
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-neutral-500">
              <FiInfo className="w-3.5 h-3.5" />
            </div>
            <textarea
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-neutral-950/30 text-slate-900 dark:text-white text-sm rounded-xl outline-none border border-slate-200 dark:border-neutral-800/80 focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-150 shadow-2xs placeholder:text-slate-400 dark:placeholder:text-neutral-500 min-h-[160px] resize-y"
              placeholder="Write a brief bio about the creator..."
              value={form.bio || ''}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* 2. Sticky Footer Container */}
      <div className="  flex-shrink-0 px-8 py-5 border-t border-slate-200/60 dark:border-neutral-850 bg-slate-50/90 dark:bg-neutral-950/80 backdrop-blur-md flex items-center justify-end space-x-3">
        <button
          type="button"
          disabled={loading}
          onClick={handleCancel}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-850 hover:border-slate-300 dark:hover:border-neutral-700 disabled:opacity-55 active:scale-[0.98] transition-all duration-150 shadow-2xs"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-550 hover:to-indigo-550 text-white shadow-sm hover:shadow-md hover:shadow-blue-500/10 disabled:opacity-55 active:scale-[0.98] transition-all duration-150 flex items-center space-x-1.5"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEditMode ? 'Save Changes' : 'Create Creator'}</span>
          )}
        </button>
      </div>
    </form>
  )
}
