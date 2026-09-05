'use client'

import React, { useState } from 'react'
import { updateUser, User } from '@/lib/userApi'
import { toast } from 'sonner'

type EditUserProps = {
  user: User
  setEditUser: React.Dispatch<React.SetStateAction<User | null>>
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

export default function EditUser({ setEditUser, user, setUsers }: EditUserProps) {
  const [form, setForm] = useState<User>({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'user',
    status: user.status || 'active',
    is_active: user.is_active ?? true,
  })
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Validation function
  const validate = () => {
    let temp: any = {}

    if (!form.name || !form.name.trim()) temp.name = 'Full name is required.'
    if (!form.email || !form.email.trim()) temp.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) temp.email = 'Invalid email format.'

    if (!form.role) temp.role = 'Please select a role.'

    setErrors(temp)
    return Object.keys(temp).length === 0
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setIsSubmitting(true)
      let userCreation = await updateUser({ id: user.id, ...form })
      console.log('userCreation', userCreation)

      if (userCreation && (userCreation.msg === 'User updated successfully' || userCreation.status === 200 || userCreation.id)) {
        setEditUser(null)
        toast.success(userCreation.msg || 'User saved successfully')
        setUsers((prev) => {
          const exists = prev.some((u) => u.id === user.id)
          if (exists) {
            return prev.map((u) => (u.id === user.id ? { ...u, ...form } : u))
          }
          return [{ id: userCreation.id || Date.now(), ...form, created_at: new Date() }, ...prev]
        })
      } else {
        toast.error(userCreation?.msg || 'Error occurred while updating user')
      }
    } catch (err: any) {
      console.error('Error saving user:', err)
      toast.error('Error occurred while updating user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto p-6 sm:p-8 bg-background text-foreground space-y-6">
      <form onSubmit={submitForm} className="space-y-6 flex-1">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground"
            placeholder="example@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* Grid for Active Status & Status enum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Status boolean */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account State
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              value={String(form.is_active)}
              onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Detailed Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status Tag
            </label>
            <select
              className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'active' | 'banned' | 'suspended' })
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            User Role <span className="text-rose-500">*</span>
          </label>
          <select
            className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Select role</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="beta_tester">Tester</option>
            <option value="creator">Creator</option>
          </select>
          {errors.role && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.role}</p>}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-border/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setEditUser(null)}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting
              ? 'Saving...'
              : user.id
                ? 'Update User'
                : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}
