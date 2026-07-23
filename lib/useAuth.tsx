/**
 * Authentication Hook
 *
 * React context and hook for authentication state management.
 * Provides login, signup, logout, and automatic token refresh.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { user, isLoggedIn, loading, login, logout } = useAuth();
 *   // ...
 * }
 * ```
 *
 * Wrap your app with <AuthProvider>:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */

'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  User,
  login as apiLogin,
  signup as apiSignup,
  me as apiMe,
  refreshToken as apiRefreshToken,
  logout as apiLogout,
} from './authApi'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStore'
import { USE_MOCK_DATA } from './config'

interface AuthContextValue {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  login: (
    email: string,
    password: string,
    token2fa?: string
  ) => Promise<{ twoFactorRequired?: boolean; role?: string }>
  signup: (payload: {
    email: string
    password: string
    name: string
  }) => Promise<{ status?: number; access_token?: string; refresh_token?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * Fetch user profile with automatic token refresh on 401
   */
  const fetchUser = useCallback(
    async (accessToken: string, retry = true): Promise<boolean> => {
      try {
        const userData = await apiMe(accessToken)
        setUser(userData)
        return true
      } catch (error: any) {
        // If 401 and we have a refresh token, try refreshing
        if (error.status === 401 && retry && !isRefreshing) {
          const refreshToken = getRefreshToken()
          if (refreshToken) {
            return await attemptTokenRefresh(refreshToken)
          }
        }

        console.error('[useAuth] Failed to fetch user:', error)
        clearTokens()
        setUser(null)
        return false
      }
    },
    [isRefreshing]
  )

  /**
   * Attempt to refresh the access token and retry fetching user
   */
  const attemptTokenRefresh = useCallback(
    async (refreshToken: string): Promise<boolean> => {
      if (isRefreshing) return false

      setIsRefreshing(true)
      try {
        console.log('[useAuth] Attempting token refresh...')
        const tokens = await apiRefreshToken(refreshToken)
        setTokens({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        })

        // Retry fetching user with new token
        const success = await fetchUser(tokens.access_token, false)
        setIsRefreshing(false)
        return success
      } catch (error) {
        console.error('[useAuth] Token refresh failed:', error)
        clearTokens()
        setUser(null)
        setIsRefreshing(false)
        return false
      }
    },
    [isRefreshing, fetchUser]
  )

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken()

      if (accessToken) {
        await fetchUser(accessToken)
      }

      setLoading(false)
    }

    initAuth()
  }, [fetchUser])

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string, token2fa?: string) => {
      setLoading(true)
      try {
        const response = await apiLogin({
          email,
          password,
          token_2fa: token2fa,
        })

        // If 2FA is required, don't set tokens yet
        if (response.two_factor_required) {
          setLoading(false)
          return { twoFactorRequired: true }
        }

        // Store tokens
        setTokens({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        })

        setLoading(false)
        return {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          status: response.status,
          role: response.role,
          twoFactorRequired: response.two_factor_required,
        }
      } catch (error) {
        setLoading(false)
        throw error
      }
    },
    [fetchUser]
  )

  /**
   * Sign up new user
   */
  const signup = useCallback(async (payload: { email: string; password: string; name: string }) => {
    setLoading(true)
    try {
      const response = await apiSignup(payload)

      // Store tokens
      // setTokens({
      //   accessToken: response.access_token,
      //   refreshToken: response.refresh_token,
      // });
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        status: response.status,
      } // Fetch user profile
      // await fetchUser(response.access_token, false);

      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [])

  /**
   * Logout and clear tokens
   */
  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()

    // Call logout API to invalidate tokens on backend
    if (refreshToken) {
      await apiLogout(refreshToken)
    }

    // Clear local tokens
    clearTokens()
    setUser(null)
  }, [])

  /**
   * Manually refresh user data
   */
  const refreshUser = useCallback(async () => {
    const accessToken = getAccessToken()
    if (accessToken) {
      await fetchUser(accessToken)
    }
  }, [fetchUser])

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * Export types for convenience
 */
export type { User }
