'use client'

import React, { useState, useEffect } from 'react'
import { PaymentPlan } from '@/lib/types/content'
import axios from 'axios'
import Cookies from 'js-cookie'
import { API_BASE } from '@/lib/config'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { FiRefreshCw } from 'react-icons/fi'

const PlanForm = ({
  initial,
  onSuccess,
  onClose,
}: {
  initial?: PaymentPlan | null
  onSuccess?: () => void
  onClose?: () => void
}) => {
  const navigate = useRouter()
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    price: initial?.price || '',
    currency: 'GBP',
    can_access_premium: initial?.can_access_premium || false,
    duration_days: initial?.duration_days || '',
    max_devices: initial?.max_devices || '',
    ad_supported: initial?.ad_supported || false,
    is_active: initial?.is_active ?? true,
  })

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: '',
    max_devices: '',
    can_access_premium: '',
  })

  const [touched, setTouched] = useState({
    name: false,
    description: false,
    price: false,
    duration_days: false,
    max_devices: false,
    can_access_premium: false,
  })

  const [loading, setLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }))

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  // Validation logic
  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      price: '',
      duration_days: '',
      max_devices: '',
      can_access_premium: '',
    }

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = 'Plan name is required'
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Plan name must be at least 3 characters'
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'Plan name must be less than 50 characters'
    }

    // Description validation
    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (form.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    // Price validation
    if (!form.price || form.price === '') {
      newErrors.price = 'Price is required'
    } else if (isNaN(Number(form.price))) {
      newErrors.price = 'Price must be a valid number'
    } else if (Number(form.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    } else if (Number(form.price) > 992222222) {
      newErrors.price = 'Price must be less than 99 GBP'
    }

    // Duration validation
    if (!form.duration_days || form.duration_days === '') {
      newErrors.duration_days = 'Duration is required'
    } else if (isNaN(Number(form.duration_days))) {
      newErrors.duration_days = 'Duration must be a valid number'
    } else if (Number(form.duration_days) < 1) {
      newErrors.duration_days = 'Duration must be at least 1 day'
    } else if (Number(form.duration_days) > 365) {
      newErrors.duration_days = 'Duration must be less than 365 days'
    }

    // Max devices validation
    if (!form.max_devices || form.max_devices === '') {
      newErrors.max_devices = 'Max devices is required'
    } else if (isNaN(Number(form.max_devices))) {
      newErrors.max_devices = 'Max devices must be a valid number'
    } else if (Number(form.max_devices) < 1) {
      newErrors.max_devices = 'Must allow at least 1 device'
    } else if (Number(form.max_devices) > 100) {
      newErrors.max_devices = 'Max devices cannot exceed 100'
    }

    setErrors(newErrors)

    const formIsValid = Object.values(newErrors).every((error) => error === '')
    setIsValid(formIsValid)

    return formIsValid
  }

  useEffect(() => {
    validateForm()
  }, [form])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setTouched({
      name: true,
      description: true,
      price: true,
      duration_days: true,
      max_devices: true,
      can_access_premium: true,
    })

    if (!validateForm()) {
      toast.error('Please fix all validation errors before submitting')
      return
    }

    try {
      setLoading(true)

      if (initial?.id) {
        await axios.put(`${API_BASE}api/v1/payments/plans/${initial.id}`, form, {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
        })
        toast.success('Plan updated successfully!')
      } else {
        await axios.post(`${API_BASE}api/v1/payments/plans`, form, {
          headers: {
            Authorization: `Bearer ${Cookies.get('access_token')}`,
          },
        })
        toast.success('Plan created successfully!')
      }

      onSuccess?.()
      onClose?.()
    } catch (error: any) {
      console.error(error)

      const apiErrors = error?.response?.data

      if (apiErrors && typeof apiErrors === 'object' && !apiErrors.detail && !apiErrors.message) {
        const newErrors: any = { ...errors }

        Object.keys(apiErrors).forEach((fieldName) => {
          const fieldErrors = apiErrors[fieldName]
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            newErrors[fieldName] = fieldErrors[0]
          }
        })

        setErrors(newErrors)

        const newTouched: any = { ...touched }
        Object.keys(apiErrors).forEach((fieldName) => {
          newTouched[fieldName] = true
        })
        setTouched(newTouched)

        toast.error('Validation error occurred')
      } else {
        const message =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Something went wrong. Please try again.'

        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    } else {
      navigate.back()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col bg-background text-foreground">
      {/* 1. Scrollable Form Content Body */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Plan Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Plan Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Premium, Basic, Family"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={() => markTouched('name')}
            className={`w-full px-3.5 py-2.5 bg-background border ${
              touched.name && errors.name ? 'border-rose-500' : 'border-input'
            } text-foreground rounded-lg text-sm outline-none focus:ring-2 ${
              touched.name && errors.name ? 'focus:ring-rose-500/40' : 'focus:ring-primary/40'
            } focus:border-primary transition-all placeholder:text-muted-foreground`}
          />
          {touched.name && errors.name && (
            <p className="text-xs text-rose-500 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            placeholder="Describe what this plan includes and its key benefits..."
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            onBlur={() => markTouched('description')}
            rows={4}
            className={`w-full px-3.5 py-2.5 bg-background border ${
              touched.description && errors.description ? 'border-rose-500' : 'border-input'
            } text-foreground rounded-lg text-sm outline-none focus:ring-2 ${
              touched.description && errors.description
                ? 'focus:ring-rose-500/40'
                : 'focus:ring-primary/40'
            } focus:border-primary transition-all placeholder:text-muted-foreground resize-y`}
          />
          {touched.description && errors.description && (
            <p className="text-xs text-rose-500 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Price and Duration Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Price (USD) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                $
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="9.99"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                onBlur={() => markTouched('price')}
                className={`w-full pl-8 pr-3.5 py-2.5 bg-background border ${
                  touched.price && errors.price ? 'border-rose-500' : 'border-input'
                } text-foreground rounded-lg text-sm outline-none focus:ring-2 ${
                  touched.price && errors.price ? 'focus:ring-rose-500/40' : 'focus:ring-primary/40'
                } focus:border-primary transition-all placeholder:text-muted-foreground`}
              />
            </div>
            {touched.price && errors.price && (
              <p className="text-xs text-rose-500 font-medium">{errors.price}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Duration (Days) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="30"
              value={form.duration_days}
              onChange={(e) => update('duration_days', e.target.value)}
              onBlur={() => markTouched('duration_days')}
              className={`w-full px-3.5 py-2.5 bg-background border ${
                touched.duration_days && errors.duration_days ? 'border-rose-500' : 'border-input'
              } text-foreground rounded-lg text-sm outline-none focus:ring-2 ${
                touched.duration_days && errors.duration_days
                  ? 'focus:ring-rose-500/40'
                  : 'focus:ring-primary/40'
              } focus:border-primary transition-all placeholder:text-muted-foreground`}
            />
            {touched.duration_days && errors.duration_days && (
              <p className="text-xs text-rose-500 font-medium">{errors.duration_days}</p>
            )}
          </div>
        </div>

        {/* Devices and Ads Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Max Devices <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              placeholder="5"
              value={form.max_devices}
              onChange={(e) => update('max_devices', e.target.value)}
              onBlur={() => markTouched('max_devices')}
              className={`w-full px-3.5 py-2.5 bg-background border ${
                touched.max_devices && errors.max_devices ? 'border-rose-500' : 'border-input'
              } text-foreground rounded-lg text-sm outline-none focus:ring-2 ${
                touched.max_devices && errors.max_devices
                  ? 'focus:ring-rose-500/40'
                  : 'focus:ring-primary/40'
              } focus:border-primary transition-all placeholder:text-muted-foreground`}
            />
            {touched.max_devices && errors.max_devices && (
              <p className="text-xs text-rose-500 font-medium">{errors.max_devices}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ad Experience
            </label>
            <select
              value={form.ad_supported ? 'true' : 'false'}
              onChange={(e) => update('ad_supported', e.target.value === 'true')}
              className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
            >
              <option value="false">No Ads (Ad-Free)</option>
              <option value="true">Ad-Supported</option>
            </select>
          </div>
        </div>

        {/* Plan Status & Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Plan Availability
            </label>
            <select
              value={form.is_active ? 'true' : 'false'}
              onChange={(e) => update('is_active', e.target.value === 'true')}
              className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
            >
              <option value="true">Active (Visible)</option>
              <option value="false">Inactive (Hidden)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Premium Content Access
            </label>
            <select
              value={form.can_access_premium ? 'true' : 'false'}
              onChange={(e) => update('can_access_premium', e.target.value === 'true')}
              className="w-full px-3.5 py-2.5 bg-background border border-input text-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
            >
              <option value="true">Enabled (Includes Premium)</option>
              <option value="false">Disabled (Standard Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Fixed Sticky Footer Actions */}
      <div className="shrink-0 border-t border-border bg-background px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_3px_rgba(255,255,255,0.03)] z-10">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-lg text-foreground bg-accent hover:bg-accent/80 border border-border transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <FiRefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{initial ? 'Update Plan' : 'Create Plan'}</span>
          )}
        </button>
      </div>
    </form>
  )
}

export default PlanForm
