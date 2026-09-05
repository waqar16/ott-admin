import axios from 'axios'
import { API_BASE } from './config'
import Cookies from 'js-cookie'

export type User = {
  id?: number
  email: string
  name: string
  status: 'active' | 'banned' | 'suspended'
  role: string
  is_active: boolean
  created_at: Date
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}api/v1/users`, {
    // IMPORTANT for server components
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access_token')}`,
    },
  })
  console.log(res)
  if (!res.ok) {
    throw new Error('Failed to fetch users')
  }

  const data = await res.json()

  // adjust mapping if API shape differs
  return data?.users ?? data
}

export async function updateUser(userData: User) {
  const res = await axios.patch(`${API_BASE}api/v1/users/${userData.id}/update`, userData, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access_token')}`,
    },
  })
  if (res.status != 200) {
    throw new Error('Failed to update user')
  }
  const data = await res.data
  console.log(data)
  return data
}

export async function deleteUser(userData: User) {
  const res = await axios.delete(`${API_BASE}api/v1/users/${userData.id}/delete`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Cookies.get('access_token')}`,
    },
  })
  if (res.status != 200) {
    throw new Error('Failed to delete user')
  }
  const data = await res.data
  console.log(data)
  return res.status
}
