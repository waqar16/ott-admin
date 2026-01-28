import axios from 'axios';
import { USE_MOCK_DATA, API_CONFIG, logMockDataUsage, API_BASE } from './config';

// Mock mode active — replace with real API later
if (USE_MOCK_DATA) {
  logMockDataUsage('API Client - Using mock API endpoints');
}

const API_URL = API_CONFIG.baseUrl;

export interface FetchOptions extends RequestInit {
  token?: string
}

/**
 * Generic API fetch wrapper with error handling
 */
export const apiClient = axios.create({
	baseURL: API_BASE,
	headers: {
		'Content-Type': 'application/json',
	},
})
export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * GET request
 */
export function get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return fetchAPI<T>(endpoint, { ...options, method: 'GET' })
}

/**
 * POST request
 */
export function post<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT request
 */
export function put<T>(
  endpoint: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request
 */
export function del<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return fetchAPI<T>(endpoint, { ...options, method: 'DELETE' })
}
