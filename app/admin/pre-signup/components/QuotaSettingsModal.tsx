'use client'

import React, { useState, useEffect } from 'react'
import { FiX, FiSliders, FiAlertTriangle, FiInfo, FiCheck } from 'react-icons/fi'
import { PreSignupSettings, UpdatePreSignupSettingsRequest } from '@/lib/preSignupApi'
import { toast } from 'sonner'

interface QuotaSettingsModalProps {
  isOpen: boolean
  settings: PreSignupSettings | null
  onClose: () => void
  onSave: (payload: UpdatePreSignupSettingsRequest) => Promise<void>
}

export const QuotaSettingsModal: React.FC<QuotaSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [capacity, setCapacity] = useState<number>(600)
  const [trialDays, setTrialDays] = useState<number>(7)
  const [enabled, setEnabled] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    if (settings) {
      setCapacity(settings.pre_signup_capacity ?? 600)
      setTrialDays(settings.pre_signup_trial_days ?? 7)
      setEnabled(settings.pre_signup_enabled ?? true)
    }
  }, [settings, isOpen])

  if (!isOpen) return null

  const isCapacityIncreased = settings ? capacity > settings.pre_signup_capacity : false
  const addedSlots = settings && isCapacityIncreased ? capacity - settings.pre_signup_capacity : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (capacity < 0) {
      toast.error('Capacity quota must be greater than or equal to 0')
      return
    }
    if (trialDays < 1) {
      toast.error('Trial duration must be at least 1 day')
      return
    }

    try {
      setSaving(true)
      await onSave({
        pre_signup_capacity: Number(capacity),
        pre_signup_trial_days: Number(trialDays),
        pre_signup_enabled: enabled,
      })
      toast.success('Pre-signup settings and quota successfully updated')
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl bg-card border border-border/80 shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FiSliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Adjust Pre-Signup Quota</h2>
              <p className="text-xs text-muted-foreground">Manage launch capacity and trial length</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Pre-signup status toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/70">
            <div>
              <label className="text-sm font-semibold text-foreground block">
                Pre-Registration Program
              </label>
              <p className="text-xs text-muted-foreground">
                Enable or temporarily pause public pre-registration
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Quota capacity input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Cohort Capacity Limit (Total Slots)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-muted/50 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground font-mono"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                users
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Current quota: <strong>{settings?.pre_signup_capacity ?? 500}</strong> (Remaining:{' '}
              {settings?.remaining_pre_signup_capacity ?? 0})
            </p>
          </div>

          {/* Auto-promotion Banner when capacity is increased */}
          {isCapacityIncreased && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <FiInfo className="w-4 h-4 flex-shrink-0" />
                <span>Automatic FIFO Waitlist Promotion Trigger</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-600/90 dark:text-blue-300/90">
                Increasing capacity by <strong>+{addedSlots} slots</strong> will automatically promote
                the <strong>{addedSlots} oldest pending waitlist entries</strong> in FIFO queue order.
                Activation emails will be dispatched via background workers.
              </p>
            </div>
          )}

          {/* Trial Days input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Trial Duration (Days)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="90"
                value={trialDays}
                onChange={(e) => setTrialDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-muted/50 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-foreground font-mono"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                days
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Granted plan: <strong>{settings?.pre_signup_trial_plan_name || 'Pre-registration Trial'}</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-accent text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
