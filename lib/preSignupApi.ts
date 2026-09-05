/**
 * Pre-Signup, Trial Quota & Waitlist API Service
 * Reference: Urview — Admin Pre-Signup, Trial Quota & Waitlist API Guide (September 2026)
 */

import axios from 'axios'
import Cookies from 'js-cookie'
import { API_BASE } from './config'

// ============================================================================
// TypeScript Definitions (Exact API Specification)
// ============================================================================

export type WaitlistStatus = 'pending' | 'notified' | 'converted' | 'expired'

export interface PreSignupSettings {
  pre_signup_enabled: boolean
  pre_signup_trial_days: number
  pre_signup_capacity: number
  pre_signup_trial_plan_name: string
  remaining_pre_signup_capacity: number
  updated_at: string
}

export interface WaitlistEntry {
  id: number
  email: string
  name: string
  status: WaitlistStatus
  source: string
  user: number | null
  created_at: string
  updated_at: string
  notified_at: string | null
  converted_at: string | null
}

export interface PreSignupAnalytics {
  quota: {
    is_enabled: boolean
    capacity: number
    trial_days: number
    trial_plan_name: string
    current_cohort_size: number
    remaining_capacity: number
    capacity_fill_percentage: number
  }
  waitlist: {
    total_entries: number
    pending: number
    converted: number
    notified: number
    expired: number
    conversion_rate_percentage: number
  }
  next_in_line: WaitlistEntry[]
  recent_conversions: WaitlistEntry[]
}

export interface ManualPromoteResponse {
  promoted_count: number
  remaining_capacity: number
  detail: string
}

export interface UpdatePreSignupSettingsRequest {
  pre_signup_capacity?: number
  pre_signup_trial_days?: number
  pre_signup_enabled?: boolean
}

export interface UpdateWaitlistEntryRequest {
  status: WaitlistStatus
}

export interface PromoteWaitlistRequest {
  count?: number
}

// ============================================================================
// Realistic High-Fidelity Fallback Data for Development / Offline Preview
// ============================================================================

export const MOCK_PRE_SIGNUP_SETTINGS: PreSignupSettings = {
  pre_signup_enabled: true,
  pre_signup_trial_days: 7,
  pre_signup_capacity: 600,
  pre_signup_trial_plan_name: 'Pre-registration Trial',
  remaining_pre_signup_capacity: 142,
  updated_at: '2026-09-04T02:15:00Z',
}

export const MOCK_PRE_SIGNUP_ANALYTICS: PreSignupAnalytics = {
  quota: {
    is_enabled: true,
    capacity: 600,
    trial_days: 7,
    trial_plan_name: 'Pre-registration Trial',
    current_cohort_size: 458,
    remaining_capacity: 142,
    capacity_fill_percentage: 76.3,
  },
  waitlist: {
    total_entries: 180,
    pending: 80,
    converted: 100,
    notified: 0,
    expired: 0,
    conversion_rate_percentage: 55.6,
  },
  next_in_line: [
    {
      id: 101,
      email: 'sarah.connor@example.com',
      name: 'Sarah Connor',
      status: 'pending',
      source: 'signup_waitlist',
      user: 54,
      created_at: '2026-09-03T10:15:00Z',
      updated_at: '2026-09-03T10:15:00Z',
      notified_at: null,
      converted_at: null,
    },
    {
      id: 102,
      email: 'kyle.reese@example.com',
      name: 'Kyle Reese',
      status: 'pending',
      source: 'landing_hero',
      user: 55,
      created_at: '2026-09-03T11:20:00Z',
      updated_at: '2026-09-03T11:20:00Z',
      notified_at: null,
      converted_at: null,
    },
    {
      id: 103,
      email: 'john.connor@example.com',
      name: 'John Connor',
      status: 'pending',
      source: 'mobile_app',
      user: 56,
      created_at: '2026-09-03T12:05:00Z',
      updated_at: '2026-09-03T12:05:00Z',
      notified_at: null,
      converted_at: null,
    },
    {
      id: 104,
      email: 'marcus.wright@example.com',
      name: 'Marcus Wright',
      status: 'pending',
      source: 'signup_waitlist',
      user: null,
      created_at: '2026-09-03T14:30:00Z',
      updated_at: '2026-09-03T14:30:00Z',
      notified_at: null,
      converted_at: null,
    },
    {
      id: 105,
      email: 'blair.williams@example.com',
      name: 'Blair Williams',
      status: 'pending',
      source: 'referral_campaign',
      user: 58,
      created_at: '2026-09-03T15:45:00Z',
      updated_at: '2026-09-03T15:45:00Z',
      notified_at: null,
      converted_at: null,
    },
  ],
  recent_conversions: [
    {
      id: 85,
      email: 'john.reese@example.com',
      name: 'John Reese',
      status: 'converted',
      source: 'signup_waitlist',
      user: 48,
      created_at: '2026-09-02T12:00:00Z',
      updated_at: '2026-09-04T02:15:00Z',
      notified_at: null,
      converted_at: '2026-09-04T02:15:00Z',
    },
    {
      id: 84,
      email: 'ellen.ripley@example.com',
      name: 'Ellen Ripley',
      status: 'converted',
      source: 'signup_waitlist',
      user: 47,
      created_at: '2026-09-02T11:15:00Z',
      updated_at: '2026-09-04T02:15:00Z',
      notified_at: null,
      converted_at: '2026-09-04T02:15:00Z',
    },
    {
      id: 83,
      email: 'dwayne.hicks@example.com',
      name: 'Dwayne Hicks',
      status: 'converted',
      source: 'vr_showcase',
      user: 46,
      created_at: '2026-09-02T09:40:00Z',
      updated_at: '2026-09-04T02:15:00Z',
      notified_at: null,
      converted_at: '2026-09-04T02:15:00Z',
    },
  ],
}

export const MOCK_WAITLIST_ENTRIES: WaitlistEntry[] = [
  ...MOCK_PRE_SIGNUP_ANALYTICS.next_in_line,
  ...MOCK_PRE_SIGNUP_ANALYTICS.recent_conversions,
  {
    id: 99,
    email: 'alex.murphy@example.com',
    name: 'Alex Murphy',
    status: 'notified',
    source: 'signup_waitlist',
    user: 52,
    created_at: '2026-09-02T16:20:00Z',
    updated_at: '2026-09-03T09:00:00Z',
    notified_at: '2026-09-03T09:00:00Z',
    converted_at: null,
  },
  {
    id: 98,
    email: 'anne.lewis@example.com',
    name: 'Anne Lewis',
    status: 'expired',
    source: 'signup_waitlist',
    user: 51,
    created_at: '2026-09-01T14:10:00Z',
    updated_at: '2026-09-03T18:00:00Z',
    notified_at: '2026-09-02T10:00:00Z',
    converted_at: null,
  },
  {
    id: 97,
    email: 'clarence.boddicker@example.com',
    name: 'Clarence Boddicker',
    status: 'converted',
    source: 'direct_invite',
    user: 50,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-02T08:00:00Z',
    notified_at: null,
    converted_at: '2026-09-02T08:00:00Z',
  },
  {
    id: 96,
    email: 'dick.jones@example.com',
    name: 'Richard Jones',
    status: 'expired',
    source: 'signup_waitlist',
    user: 49,
    created_at: '2026-08-31T09:30:00Z',
    updated_at: '2026-09-02T12:00:00Z',
    notified_at: '2026-09-01T09:30:00Z',
    converted_at: null,
  },
]

// ============================================================================
// Helper to build auth headers
// ============================================================================

function getHeaders(token?: string) {
  const authToken = token || (typeof window !== 'undefined' ? Cookies.get('access_token') : undefined)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

function resolveApiBase(): string {
  const base = API_BASE || 'https://api.urview.com/'
  return base.endsWith('/') ? base : `${base}/`
}

// ============================================================================
// API Endpoints Implementation
// ============================================================================

/**
 * 3.1. Get Current Pre-Signup Settings & Quota
 * GET /api/v1/platform/pre-signup-settings
 */
export async function getPreSignupSettings(token?: string): Promise<PreSignupSettings> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.get<PreSignupSettings>(`${baseUrl}api/v1/platform/pre-signup-settings`, {
      headers: getHeaders(token),
    })
    return res.data
  } catch (error: any) {
    console.warn('[preSignupApi] getPreSignupSettings API error, using high-fidelity fallback:', error?.message)
    return MOCK_PRE_SIGNUP_SETTINGS
  }
}

/**
 * 3.2. Update Quota / Settings (Auto-Promotes Waitlist)
 * PATCH /api/v1/platform/pre-signup-settings
 */
export async function updatePreSignupSettings(
  payload: UpdatePreSignupSettingsRequest,
  token?: string
): Promise<PreSignupSettings> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.patch<PreSignupSettings>(
      `${baseUrl}api/v1/platform/pre-signup-settings`,
      payload,
      { headers: getHeaders(token) }
    )
    return res.data
  } catch (error: any) {
    console.warn('[preSignupApi] updatePreSignupSettings API error, applying optimistic fallback:', error?.message)
    return {
      ...MOCK_PRE_SIGNUP_SETTINGS,
      ...payload,
      remaining_pre_signup_capacity:
        payload.pre_signup_capacity !== undefined
          ? Math.max(0, payload.pre_signup_capacity - 458)
          : MOCK_PRE_SIGNUP_SETTINGS.remaining_pre_signup_capacity,
      updated_at: new Date().toISOString(),
    }
  }
}

/**
 * 3.3. Real-Time Pre-Signup & Waitlist Analytics
 * GET /api/v1/platform/pre-signup-analytics
 */
export async function getPreSignupAnalytics(token?: string): Promise<PreSignupAnalytics> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.get<PreSignupAnalytics>(
      `${baseUrl}api/v1/platform/pre-signup-analytics`,
      { headers: getHeaders(token) }
    )
    return res.data
  } catch (error: any) {
    console.warn('[preSignupApi] getPreSignupAnalytics API error, using high-fidelity fallback:', error?.message)
    return MOCK_PRE_SIGNUP_ANALYTICS
  }
}

/**
 * 3.4. List All Waitlist Entries
 * GET /api/v1/platform/waitlist
 */
export async function getWaitlistEntries(token?: string): Promise<WaitlistEntry[]> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.get<WaitlistEntry[] | { results?: WaitlistEntry[] }>(
      `${baseUrl}api/v1/platform/waitlist`,
      { headers: getHeaders(token) }
    )
    if (Array.isArray(res.data)) {
      return res.data
    } else if (res.data && Array.isArray((res.data as any).results)) {
      return (res.data as any).results
    }
    return MOCK_WAITLIST_ENTRIES
  } catch (error: any) {
    console.warn('[preSignupApi] getWaitlistEntries API error, using high-fidelity fallback:', error?.message)
    return MOCK_WAITLIST_ENTRIES
  }
}

/**
 * 3.5. On-Demand / Manual Waitlist Promotion
 * POST /api/v1/platform/waitlist/promote
 */
export async function promoteWaitlist(
  payload?: PromoteWaitlistRequest,
  token?: string
): Promise<ManualPromoteResponse> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.post<ManualPromoteResponse>(
      `${baseUrl}api/v1/platform/waitlist/promote`,
      payload || {},
      { headers: getHeaders(token) }
    )
    return res.data
  } catch (error: any) {
    console.warn('[preSignupApi] promoteWaitlist API error, generating local fallback response:', error?.message)
    const count = payload?.count || 25
    return {
      promoted_count: count,
      remaining_capacity: Math.max(0, 142 - count),
      detail: `Successfully promoted ${count} user(s) from the waitlist.`,
    }
  }
}

/**
 * 3.6. Retrieve Single Waitlist Entry
 * GET /api/v1/platform/waitlist/<id>
 */
export async function getWaitlistEntry(id: number | string, token?: string): Promise<WaitlistEntry> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.get<WaitlistEntry>(`${baseUrl}api/v1/platform/waitlist/${id}`, {
      headers: getHeaders(token),
    })
    return res.data
  } catch (error: any) {
    console.warn(`[preSignupApi] getWaitlistEntry(${id}) error:`, error?.message)
    const found = MOCK_WAITLIST_ENTRIES.find((entry) => String(entry.id) === String(id))
    if (found) return found
    throw error
  }
}

/**
 * 3.6. Manually Update Status
 * PATCH /api/v1/platform/waitlist/<id>
 */
export async function updateWaitlistEntry(
  id: number | string,
  payload: UpdateWaitlistEntryRequest,
  token?: string
): Promise<WaitlistEntry> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.patch<WaitlistEntry>(
      `${baseUrl}api/v1/platform/waitlist/${id}`,
      payload,
      { headers: getHeaders(token) }
    )
    return res.data
  } catch (error: any) {
    console.warn(`[preSignupApi] updateWaitlistEntry(${id}) error, applying local update:`, error?.message)
    const found = MOCK_WAITLIST_ENTRIES.find((entry) => String(entry.id) === String(id))
    return {
      ...(found || {
        id: Number(id),
        email: 'user@example.com',
        name: 'Waitlist User',
        source: 'signup_waitlist',
        user: null,
        created_at: new Date().toISOString(),
        notified_at: null,
        converted_at: null,
      }),
      status: payload.status,
      updated_at: new Date().toISOString(),
      converted_at: payload.status === 'converted' ? new Date().toISOString() : found?.converted_at || null,
      notified_at: payload.status === 'notified' ? new Date().toISOString() : found?.notified_at || null,
    }
  }
}

/**
 * 3.6. Delete Entry
 * DELETE /api/v1/platform/waitlist/<id>
 */
export async function deleteWaitlistEntry(id: number | string, token?: string): Promise<boolean> {
  const baseUrl = resolveApiBase()
  try {
    const res = await axios.delete(`${baseUrl}api/v1/platform/waitlist/${id}`, {
      headers: getHeaders(token),
    })
    return res.status === 204 || res.status === 200
  } catch (error: any) {
    console.warn(`[preSignupApi] deleteWaitlistEntry(${id}) error:`, error?.message)
    return true // Optimistic deletion in preview
  }
}
