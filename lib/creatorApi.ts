import axios from 'axios'
import Cookies from 'js-cookie'
import { API_BASE } from './config'

export type Creator = {
  id?: string
  name: string
  bio?: string | null
  email?: string | null
  phone?: string | null
}

const BASE_URL = `${API_BASE}api/v1/content/creators`
/* =========================
   GET ALL CREATORS
========================= */
export async function getCreators(): Promise<Creator[]> {
  try {
    const res = await fetch(BASE_URL, {
      // IMPORTANT for server components
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        // If auth is needed, uncomment:
        Authorization: `Bearer ${Cookies.get('access_token')}`,
      },
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data?.error || 'Failed to fetch creators')

    return data
  } catch (err) {
    console.error('getCreators error:', err)
    return []
  }
}

/* =========================
   CREATE CREATOR
========================= */
export async function createCreator(payload: Creator) {
  try {
    const res = await axios.post(`${BASE_URL}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('access_token')}`,
      },
    })

    return {
      success: true,
      data: res.data,
    }
  } catch (err: any) {
    // Handle axios error response
    if (err.response) {
      // Server responded with error
      return {
        success: false,
        status: err.response.status,
        error: err.response.data?.error || err.response.data?.message || 'Failed to create creator',
      }
    } else if (err.request) {
      // Request made but no response
      return {
        success: false,
        status: 500,
        error: 'No response from server',
      }
    } else {
      // Something else happened
      return {
        success: false,
        status: 500,
        error: err.message || 'An unexpected error occurred',
      }
    }
  }
}

export async function updateCreator(payload: Creator & { id: string }) {
  try {
    const res = await axios.patch(`${BASE_URL}/${payload.id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('access_token')}`,
      },
    })

    return {
      success: true,
      data: res.data,
    }
  } catch (err: any) {
    // Handle axios error response
    if (err.response) {
      return {
        success: false,
        status: err.response.status,
        error: err.response.data?.error || err.response.data?.message || 'Failed to update creator',
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
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access_token')}`,
    },
  })
  const data = await res.status
  return res.status
}
