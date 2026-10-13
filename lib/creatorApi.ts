import axios from 'axios'
import Cookies from 'js-cookie'
import { API_BASE } from './config'

export type Creator = {
  id?: string
  name: string
  bio?: string | null
  email?: string | null
  phone?: string | null
  role?: string
}

const getApiBase = () => {
  if (API_BASE) {
    return API_BASE.replace(/\/+$/, '')
  }
  return 'https://api.urview.com'
}

const BASE_URL = `${getApiBase()}/api/v1/content/creators`
const DASHBOARD_URL = `${getApiBase()}/api/v1/admin-dashboard`

const getAuthHeaders = () => {
  const token = Cookies.get('access_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

/* =========================
   GET ALL CREATORS
========================= */
export async function getCreators(): Promise<Creator[]> {
  try {
    const res = await fetch(BASE_URL, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data?.error || data?.detail || 'Failed to fetch creators')

    if (Array.isArray(data)) return data
    if (Array.isArray(data?.results)) return data.results
    if (Array.isArray(data?.data)) return data.data
    return []
  } catch (err) {
    console.error('getCreators error:', err)
    return []
  }
}

/* =========================
   GET CREATOR BY ID
========================= */
export async function getCreatorById(id: string): Promise<Creator | null> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      cache: 'no-store',
      headers: getAuthHeaders(),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data?.error || data?.detail || 'Failed to fetch creator')

    return data?.results || data
  } catch (err) {
    console.error('getCreatorById error:', err)
    return null
  }
}

/* =========================
   CREATE CREATOR
========================= */
export async function createCreator(payload: Creator) {
  try {
    const res = await axios.post(`${BASE_URL}`, payload, {
      headers: getAuthHeaders(),
    })

    return {
      success: true,
      data: res.data,
    }
  } catch (err: any) {
    if (err.response) {
      return {
        success: false,
        status: err.response.status,
        error:
          err.response.data?.error ||
          err.response.data?.message ||
          err.response.data?.detail ||
          'Failed to create creator',
      }
    } else if (err.request) {
      return {
        success: false,
        status: 500,
        error: 'No response from server',
      }
    } else {
      return {
        success: false,
        status: 500,
        error: err.message || 'An unexpected error occurred',
      }
    }
  }
}

/* =========================
   UPDATE CREATOR
========================= */
export async function updateCreator(payload: Creator & { id: string }) {
  try {
    const res = await axios.patch(`${BASE_URL}/${payload.id}`, payload, {
      headers: getAuthHeaders(),
    })

    return {
      success: true,
      data: res.data,
    }
  } catch (err: any) {
    if (err.response) {
      return {
        success: false,
        status: err.response.status,
        error:
          err.response.data?.error ||
          err.response.data?.message ||
          err.response.data?.detail ||
          'Failed to update creator',
      }
    } else if (err.request) {
      return {
        success: false,
        status: 500,
        error: 'No response from server',
      }
    } else {
      return {
        success: false,
        status: 500,
        error: err.message || 'An unexpected error occurred',
      }
    }
  }
}

/* =========================
   DELETE CREATOR
========================= */
export async function deleteCreator(id: string) {
  const res = await axios.delete(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  })
  return res.status
}

/* =========================
   REVENUE & PAYOUT APIS
========================= */

export interface CreatorReportQueryParams {
  start_date?: string
  end_date?: string
  revenue?: string | number
  creator_share_percentage?: string | number
  currency?: string
}

export interface CreatorStatementQueryParams {
  creator_id: string
  start_date?: string
  end_date?: string
  revenue?: string | number
  currency?: string
}

/**
 * Builds URLSearchParams from report parameters omitting empty/undefined values
 */
function buildReportSearchParams(params?: Record<string, any>): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      searchParams.append(key, String(val))
    }
  })
  const str = searchParams.toString()
  return str ? `?${str}` : ''
}

/**
 * GET Master Revenue Report: /api/v1/admin-dashboard/creator-report
 */
export async function getCreatorRevenueReport(params?: CreatorReportQueryParams) {
  const query = buildReportSearchParams(params)
  const res = await axios.get(`${DASHBOARD_URL}/creator-report${query}`, {
    headers: getAuthHeaders(),
  })
  return res.data
}

/**
 * GET Creator-Specific Statement: /api/v1/admin-dashboard/creator-report/statement
 * Isolated Section 2 metrics for single creator. Strips gross revenue & margins.
 */
export async function getCreatorStatement(params: CreatorStatementQueryParams) {
  if (!params.creator_id) {
    throw new Error('creator_id is required to fetch a creator statement')
  }
  const query = buildReportSearchParams(params)
  const res = await axios.get(`${DASHBOARD_URL}/creator-report/statement${query}`, {
    headers: getAuthHeaders(),
  })
  return res.data
}

/**
 * GET Master or Single-Creator Excel Export: /api/v1/admin-dashboard/creator-report/excel
 * Preserves binary blob and triggers browser download with verified cleanup.
 */
export async function exportCreatorReportExcel(
  params?: CreatorReportQueryParams & { creator_id?: string; creator_name?: string }
): Promise<{ success: boolean; filename: string }> {
  const query = buildReportSearchParams(params)
  const res = await axios.get(`${DASHBOARD_URL}/creator-report/excel${query}`, {
    headers: getAuthHeaders(),
    responseType: 'blob',
  })

  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url

  const periodStr =
    params?.start_date && params?.end_date
      ? `${params.start_date}_${params.end_date}`
      : new Date().toISOString().slice(0, 7).replace('-', '')

  let filename = ''
  if (params?.creator_id) {
    const cleanName = (params.creator_name || 'Creator').replace(/[^a-zA-Z0-9_-]/g, '_')
    filename = `Royalty_Statement_${cleanName}_${periodStr}.xlsx`
  } else {
    filename = `URview_Creator_Report_${periodStr}.xlsx`
  }

  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()

  if (link.parentNode) {
    link.parentNode.removeChild(link)
  }
  window.URL.revokeObjectURL(url)

  return { success: true, filename }
}
