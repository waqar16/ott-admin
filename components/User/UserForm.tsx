'use client'

import React, { useState } from 'react'
import { updateUser, User } from '@/lib/userApi'
import { toast } from 'sonner'

type UserFormProps = {
  user?: User | null
  setEditUser: (user: User | null) => void
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

type UserFormData = Omit<User, 'id' | 'created_at'>

export default function UserForm({
  setEditUser,
  user,
  setUsers,
}: UserFormProps) {
  const [form, setForm] = useState<UserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    status: user?.status || 'active',
    is_active: user?.is_active ?? true,
    email_verified: user?.email_verified ?? false,
    receive_notifications: user?.receive_notifications ?? true,
    kid_mode: user?.kid_mode ?? false,
    educational_mode: user?.educational_mode ?? false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = <K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear field error when user starts fixing it
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const temp: Record<string, string> = {}

    if (!form.name.trim()) {
      temp.name = 'Full name is required.'
    }

    if (!form.email.trim()) {
      temp.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      temp.email = 'Invalid email format.'
    }

    if (!form.role) {
      temp.role = 'Please select a role.'
    }

    setErrors(temp)
    return Object.keys(temp).length === 0
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (!user?.id) {
      toast.error('User ID is missing for update operation')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await updateUser({
        id: user.id,
        ...form,
      })

      console.log('updateUser response', response)

      if (
        response &&
        (
          response.msg === 'User updated successfully' ||
          response.status === 200 ||
          response.id ||
          response.user
        )
      ) {
        setEditUser(null)

        toast.success(
          response.msg || 'User updated successfully'
        )

        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? {
                ...u,
                ...form,
                ...response.user,
              }
              : u
          )
        )
      } else {
        toast.error(
          response?.msg || 'Error occurred while updating user'
        )
      }
    } catch (err: any) {
      console.error('Error updating user:', err)

      toast.error(
        err?.response?.data?.msg ||
        'Error occurred while updating user'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background text-foreground">
      <form
        onSubmit={submitForm}
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
      >
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Full Name <span className="text-rose-500">*</span>
          </label>

          <input
            type="text"
            className="w-full px-3 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) =>
              updateField('name', e.target.value)
            }
          />

          {errors.name && (
            <p className="text-rose-500 text-xs font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address <span className="text-rose-500">*</span>
          </label>

          <input
            type="email"
            className="w-full px-3 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) =>
              updateField('email', e.target.value)
            }
          />

          {errors.email && (
            <p className="text-rose-500 text-xs font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Account State + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </label>

            <select
              className="w-full px-3 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              value={String(form.is_active)}
              onChange={(e) =>
                updateField(
                  'is_active',
                  e.target.value === 'true'
                )
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </label>

            <select
              className="w-full px-3 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              value={form.status}
              onChange={(e) =>
                updateField(
                  'status',
                  e.target.value as
                  | 'active'
                  | 'banned'
                  | 'suspended'
                )
              }
            >
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* User Role */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            User Role <span className="text-rose-500">*</span>
          </label>

          <select
            className="w-full px-3 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            value={form.role}
            onChange={(e) =>
              updateField('role', e.target.value)
            }
          >
            <option value="">Select role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="beta_tester">Tester</option>
            <option value="creator">Creator</option>
          </select>

          {errors.role && (
            <p className="text-rose-500 text-xs font-medium">
              {errors.role}
            </p>
          )}
        </div>

        {/* Compact User Settings */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-3.5 py-2.5 bg-muted/30 border-b border-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              User Settings
            </p>
          </div>

          <div className="divide-y divide-border">
            {/* Email Verified */}
            <CompactToggle
              label="Email Verified"
              description="User's email is verified"
              checked={form.email_verified}
              onChange={(value) =>
                updateField('email_verified', value)
              }
            />

            {/* Notifications */}
            <CompactToggle
              label="Notifications"
              description="Allow user notifications"
              checked={form.receive_notifications}
              onChange={(value) =>
                updateField(
                  'receive_notifications',
                  value
                )
              }
            />

            {/* Kid Mode */}
            <CompactToggle
              label="Kid Mode"
              description="Enable child-friendly experience"
              checked={form.kid_mode}
              onChange={(value) =>
                updateField('kid_mode', value)
              }
            />

            {/* Educational Mode */}
            <CompactToggle
              label="Educational Mode"
              description="Enable educational experience"
              checked={form.educational_mode}
              onChange={(value) =>
                updateField(
                  'educational_mode',
                  value
                )
              }
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-3 bg-background/95 backdrop-blur border-t border-border flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditUser(null)}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Compact Toggle                               */
/* -------------------------------------------------------------------------- */

type CompactToggleProps = {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function CompactToggle({
  label,
  description,
  checked,
  onChange,
}: CompactToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-9 h-5 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'
            }`}
        />
      </button>
    </div>
  )
}