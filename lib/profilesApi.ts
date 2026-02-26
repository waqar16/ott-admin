/**
 * Profiles API Module
 * 
 * API client for user profile management operations.
 * Reference: API_DOCUMENTATION_PART2.pdf - Profiles endpoints
 * Base URL: Uses NEXT_PUBLIC_API_BASE from environment variables
 * 
 * Implements:
 * - List user profiles (paginated)
 * - Create new profile
 * - Get single profile details
 * - Update profile (partial)
 * - Delete profile
 * - Verify profile PIN
 * 
 * Security Notes:
 * - All endpoints require authentication (Authorization header with JWT)
 * - PINs are validated server-side
 * - Profile limits enforced by backend
 * 
 * TODO: security - Confirm httpOnly cookie implementation for production
 * TODO: Implement unified API error handler with token refresh logic
 */

import { API_BASE, USE_MOCK_DATA, logMockDataUsage } from './config';
import { getAccessToken } from './tokenStore';

// ============================================================================
// TYPES
// ============================================================================

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  is_profile_locked: boolean;
  is_kids_profile: boolean;
  preferred_language?: string;
  maturity_rating?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfilePayload {
  display_name: string;
  avatar_url?: string;
  is_profile_locked?: boolean;
  pin?: string;
  is_kids_profile?: boolean;
  preferred_language?: string;
  maturity_rating?: string;
}

export interface UpdateProfilePayload {
  display_name?: string;
  avatar_url?: string;
  is_profile_locked?: boolean;
  pin?: string;
  is_kids_profile?: boolean;
  preferred_language?: string;
  maturity_rating?: string;
}

export interface ProfilesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Profile[];
}

export interface VerifyPinResponse {
  msg: string;
}

export interface ApiError {
  status: number;
  message: string;
  body?: any;
  needAuth?: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_PROFILES: Profile[] = [
  {
    id: 'profile-1',
    user_id: 'user-123',
    display_name: 'John Doe',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    is_profile_locked: false,
    is_kids_profile: false,
    preferred_language: 'en',
    maturity_rating: 'R',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'profile-2',
    user_id: 'user-123',
    display_name: 'Kids',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kids',
    is_profile_locked: true,
    is_kids_profile: true,
    preferred_language: 'en',
    maturity_rating: 'G',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let mockProfilesStore = [...MOCK_PROFILES];

// ============================================================================
// API HELPERS
// ============================================================================

/**
 * Build authorization headers for authenticated requests
 */
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Handle API errors and create structured error object
 */
async function handleApiError(response: Response): Promise<ApiError> {
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  
  const error: ApiError = {
    status: response.status,
    message: body?.message || body?.detail || response.statusText || 'An error occurred',
    body,
  };
  
  // Mark 401 errors for auth handling
  if (response.status === 401) {
    error.needAuth = true;
  }
  
  return error;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * List all profiles for the authenticated user
 * GET /api/v1/profiles
 */
export async function listProfiles({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<ProfilesListResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('listProfiles');
    
    // Simulate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedProfiles = mockProfilesStore.slice(start, end);
    
    return {
      count: mockProfilesStore.length,
      next: end < mockProfilesStore.length ? `page=${page + 1}` : null,
      previous: page > 1 ? `page=${page - 1}` : null,
      results: paginatedProfiles,
    };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/profiles?page=${page}&page_size=${pageSize}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Create a new profile
 * POST /api/v1/profiles
 */
export async function createProfile(payload: CreateProfilePayload): Promise<Profile> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('createProfile');
    
    // Check profile limit (mock: max 4 profiles)
    if (mockProfilesStore.length >= 4) {
      throw {
        status: 400,
        message: 'Profile limit reached. Maximum 4 profiles allowed.',
      } as ApiError;
    }
    
    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      user_id: 'user-123',
      display_name: payload.display_name,
      avatar_url: payload.avatar_url || null,
      is_profile_locked: payload.is_profile_locked || false,
      is_kids_profile: payload.is_kids_profile || false,
      preferred_language: payload.preferred_language || 'en',
      maturity_rating: payload.maturity_rating || 'PG-13',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockProfilesStore.push(newProfile);
    return newProfile;
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/profiles`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Get a single profile by ID
 * GET /api/v1/profiles/{profileId}
 */
export async function getProfile(profileId: string): Promise<Profile> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('getProfile');
    
    const profile = mockProfilesStore.find(p => p.id === profileId);
    if (!profile) {
      throw {
        status: 404,
        message: 'Profile not found',
      } as ApiError;
    }
    
    return profile;
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/profiles/${profileId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Update a profile (partial update)
 * PATCH /api/v1/profiles/{profileId}
 */
export async function updateProfile(
  profileId: string,
  payload: UpdateProfilePayload
): Promise<Profile> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('updateProfile');
    
    const index = mockProfilesStore.findIndex(p => p.id === profileId);
    if (index === -1) {
      throw {
        status: 404,
        message: 'Profile not found',
      } as ApiError;
    }
    
    mockProfilesStore[index] = {
      ...mockProfilesStore[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    
    return mockProfilesStore[index];
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/profiles/${profileId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Delete a profile
 * DELETE /api/v1/profiles/{profileId}
 */
export async function deleteProfile(profileId: string): Promise<boolean> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('deleteProfile');
    
    const index = mockProfilesStore.findIndex(p => p.id === profileId);
    if (index === -1) {
      throw {
        status: 404,
        message: 'Profile not found',
      } as ApiError;
    }
    
    mockProfilesStore.splice(index, 1);
    return true;
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/profiles/${profileId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return true;
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}

/**
 * Verify profile PIN
 * POST /api/v1/profiles/{profileId}/verify-pin
 */
export async function verifyPin(profileId: string, pin: string): Promise<VerifyPinResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('verifyPin');
    
    const profile = mockProfilesStore.find(p => p.id === profileId);
    if (!profile) {
      throw {
        status: 404,
        message: 'Profile not found',
      } as ApiError;
    }
    
    if (!profile.is_profile_locked) {
      return { msg: 'Profile is not locked' };
    }
    
    // Mock: accept PIN "1234" for all locked profiles
    if (pin !== '1234') {
      throw {
        status: 403,
        message: 'Incorrect PIN',
      } as ApiError;
    }
    
    return { msg: 'PIN verified successfully' };
  }
  
  const token = getAccessToken();
  if (!token) {
    throw {
      status: 401,
      message: 'Not authenticated — please login',
      needAuth: true,
    } as ApiError;
  }
  
  try {
    const url = `${API_BASE}api/v1/profiles/${profileId}/verify-pin`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ pin }),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    return await response.json();
  } catch (error) {
    if ((error as ApiError).status) {
      throw error;
    }
    throw {
      status: 0,
      message: 'Network error - please check your connection',
      body: error,
    } as ApiError;
  }
}
