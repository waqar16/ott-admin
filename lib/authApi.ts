/**
 * Authentication API Module
 * 
 * API layer for authentication endpoints.
 * Implements login, signup, token refresh, and profile fetching.
 * 
 * Reference: API_DOCS/API_DOCUMENTATION_PART1.pdf
  
 * 
 * Endpoints:
 * - POST /api/v1/login - User login
 * - POST /api/v1/signup - User registration
 * - POST /api/v1/token/refresh - Refresh access token
 * - GET /api/v1/me - Get current user profile (protected)
 * Note: Logout is handled client-side by clearing tokens
 */

import { API_BASE, USE_MOCK_DATA } from './config';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, message: string, body?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * User profile interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  profile_picture?: string;
  subscription_tier?: 'free' | 'premium' | 'vip';
  is_verified?: boolean;
  created_at?: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  status?: number;
  two_factor_required?: boolean;
  role?:string
}

/**
 * Login with email and password
 * @param credentials Login credentials
 * @returns Access and refresh tokens
 */
export async function login(credentials: {
  email: string;
  password: string;
  device_id?: string;
  device_type?: string;
  token_2fa?: string;
}): Promise<LoginResponse> {
  // Mock mode fallback
   
  try {
    const response = await fetch(`${API_BASE}api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        device_id: credentials.device_id || generateDeviceId(),
        device_type: credentials.device_type || 'web',
        ...(credentials.token_2fa && { token_2fa: credentials.token_2fa }),
      }),
    });
console.log('response',response)
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || data.detail || data.non_field_errors || 'Login failed',
        data
      );
    }

    return {
      access_token: data.access_token || data.access,
      refresh_token: data.refresh_token || data.refresh,
      two_factor_required: data.two_factor_required || false,
      role:data.user.role || 'none',
      status:response.status
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    console.log('error')
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error during login'
    );
  }
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns Access and refresh tokens (if auto-login enabled)
 */
export async function signup(userData: {
  email: string;
  password: string;
  name: string;
}): Promise<LoginResponse> {
  // Mock mode fallback
  if (USE_MOCK_DATA) {
    console.log('[authApi] Mock mode: signup successful');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      access_token: 'mock_access_token_' + Date.now(),
      refresh_token: 'mock_refresh_token_' + Date.now(),
    };
  }

  try {
    const response = await fetch(`${API_BASE}api/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        device_id: generateDeviceId(),
        device_type: 'web',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || data.detail || data.email || data.password || 'Signup failed',
        data
      );
    }

    // If backend doesn't return tokens, might need to call login
    if ( !data.access) {
      console.log('object')
      return login({
        email: userData.email,
        password: userData.password,
      });
    }
      console.log('object1')

    return {
      access_token: data.access_token || data.access,
      refresh_token: data.refresh_token || data.refresh,
      status: response.status,
     
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    console.error('[authApi] Signup error:', error);
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error during signup'
    );
  }
}

/**
 * Refresh the access token using a refresh token
 * @param refreshToken Current refresh token
 * @returns New access and refresh tokens
 */
export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  // Mock mode fallback
  if (USE_MOCK_DATA) {
    console.log('[authApi] Mock mode: token refresh successful');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      access_token: 'mock_access_token_refreshed_' + Date.now(),
      refresh_token: 'mock_refresh_token_refreshed_' + Date.now(),
    };
  }

  try {
    const response = await fetch(`${API_BASE}api/v1/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || data.detail || 'Token refresh failed',
        data
      );
    }

    return {
      access_token: data.access_token || data.access,
      refresh_token: data.refresh_token || data.refresh || refreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    console.error('[authApi] Token refresh error:', error);
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error during token refresh'
    );
  }
}

/**
 * Fetch current user profile
 * @param accessToken JWT access token
 * @returns User profile data
 */
export async function me(accessToken: string): Promise<User> {
  // Mock mode fallback
  if (USE_MOCK_DATA) {
    console.log('[authApi] Mock mode: returning mock user profile');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      id: 'mock_user_1',
      email: 'demo@example.com',
      name: 'Demo User',
      profile_picture: 'https://i.pravatar.cc/150?img=5',
      subscription_tier: 'premium',
      is_verified: true,
      created_at: new Date().toISOString(),
    };
  }

  try {
    const response = await fetch(`${API_BASE}api/v1/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        // 'ngrok-skip-browser-warning': 'true'

      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || data.detail || 'Failed to fetch user profile',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    console.error('[authApi] Fetch profile error:', error);
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error fetching profile'
    );
  }
}

/**
 * Logout (client-side only - clear tokens)
 * Note: Backend doesn't have a logout endpoint, tokens are invalidated by expiry
 * @param refreshToken Refresh token (unused, kept for API compatibility)
 */
export async function logout(refreshToken: string): Promise<void> {
  console.log('[authApi] Logout - clearing client-side tokens');
  // No backend endpoint for logout - tokens are cleared client-side
  // and will expire naturally on the backend
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Generate a unique device ID for this browser
 * TODO: Implement proper device fingerprinting or UUID generation
 */
function generateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  
  // Check if we already have a device ID
  const stored = localStorage.getItem('urv_device_id');
  if (stored) return stored;
  
  // Generate new device ID
  const deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('urv_device_id', deviceId);
  
  return deviceId;
}
