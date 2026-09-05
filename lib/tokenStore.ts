/**
 * Token Storage Module
 *
 * Handles storage and retrieval of JWT access and refresh tokens.
 *
 * ⚠️ DEV ONLY: localStorage token storage. For production, migrate to server-set httpOnly cookies.
 *
 * Security considerations:
 * - localStorage is vulnerable to XSS attacks
 * - Production should use httpOnly cookies set by the backend
 * - Tokens should never be accessible to client-side JavaScript in production
 *
 * TODO: Before production deployment:
 * 1. Implement httpOnly cookie-based auth flow
 * 2. Move token refresh to server-side API routes
 * 3. Remove all localStorage token operations
 *
 * Reference: API_DOCS/API_DOCUMENTATION_PART1.pdf - Authentication section
 */

const ACCESS_TOKEN_KEY = 'urv_access'
const REFRESH_TOKEN_KEY = 'urv_refresh'

/**
 * Retrieve the stored access token
 * @returns Access token string or null if not found
 */
import Cookies from 'js-cookie'
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return Cookies.get('access_token') || null
  } catch (error) {
    console.error('[tokenStore] Failed to get access token:', error)
    return null
  }
}

/**
 * Retrieve the stored refresh token
 * @returns Refresh token string or null if not found
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('[tokenStore] Failed to get refresh token:', error)
    return null
  }
}

/**
 * Store access and refresh tokens
 * @param tokens Object containing accessToken and refreshToken
 */
export function setTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string
  refreshToken: string
}): void {
  if (typeof window === 'undefined') return
  try {
    Cookies.set('access_token', accessToken)
    Cookies.set('refresh_token', refreshToken)
  } catch (error) {
    console.error('[tokenStore] Failed to set tokens:', error)
  }
}

/**
 * Clear all stored tokens (logout)
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('[tokenStore] Failed to clear tokens:', error)
  }
}
