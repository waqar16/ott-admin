'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export type Membership = 'free' | 'full' | 'kids'

export interface MockUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  membership: Membership
  deviceTier: '1' | '5'
}

interface UseAuth {
  isLoggedIn: boolean
  user: MockUser | null
  login: (overrides?: Partial<MockUser>) => void
  logout: () => void
}

const STORAGE_KEY = 'ott_mock_auth_v1'

const DEFAULT_USER: MockUser = {
  id: 'user_mock_1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatarUrl: 'https://i.pravatar.cc/100?img=5',
  membership: 'full',
  deviceTier: '5',
}

export function useAuthMock(): UseAuth {
  const [user, setUser] = useState<MockUser | null>(null)

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        setUser(JSON.parse(raw))
      }
    } catch {
      // ignore
    }
  }, [])

  const persist = useCallback((u: MockUser | null) => {
    try {
      if (u) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore
    }
  }, [])

  const login = useCallback(
    (overrides?: Partial<MockUser>) => {
      const newUser: MockUser = { ...DEFAULT_USER, ...overrides } as MockUser
      setUser(newUser)
      persist(newUser)
    },
    [persist]
  )

  const logout = useCallback(() => {
    setUser(null)
    persist(null)
  }, [persist])

  const isLoggedIn = useMemo(() => !!user, [user])

  return { isLoggedIn, user, login, logout }
}

// TODO: Replace with real auth provider integration and membership/entitlement checks.
