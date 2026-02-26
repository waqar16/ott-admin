/**
 * Payments & Subscriptions API Module
 * 
 * API client for payment, subscription, and pay-per-view operations.
 * Reference: API_DOCUMENTATION_PART2.pdf - Payments & Subscriptions endpoints
 * Base URL: Uses NEXT_PUBLIC_API_BASE from environment variables
 * 
 * Implements:
 * - List subscription plans (paginated)
 * - Create Stripe checkout session for subscription
 * - List user subscriptions
 * - Change subscription plan
 * - Cancel subscription
 * - Reactivate subscription
 * - List payment history
 * - Check stream access (PPV or subscription)
 * - Create PPV checkout session
 * 
 * Security Notes:
 * - All endpoints require authentication (Authorization header with JWT)
 * - Stripe checkout sessions are created server-side
 * - Payment confirmations handled via webhooks (server-side)
 * 
 * TODO: security - Confirm httpOnly cookie implementation for production
 * TODO: security - Verify Stripe webhook signature validation on backend
 * TODO: Implement unified API error handler with token refresh logic
 */

import { API_BASE, USE_MOCK_DATA, logMockDataUsage } from './config';
import { getAccessToken } from './tokenStore';

// ============================================================================
// TYPES
// ============================================================================

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration_days: number;
  max_devices: number;
  max_profiles: number;
  stripe_price_id: string;
  features?: string[];
  is_active: boolean;
  created_at: string;
}

export interface PlansListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Plan[];
}

export interface CheckoutSessionResponse {
  id: string;
  url: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  stripe_subscription_id: string;
  stripe_customer_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionsListResponse {
  count: number;
  results: Subscription[];
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  payment_type: 'subscription' | 'ppv' | 'other';
  stripe_payment_intent_id?: string;
  content_id?: string;
  created_at: string;
}

export interface PaymentsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
}

export interface StreamAccessResponse {
  access: boolean;
  stream_url?: string;
  drm_key?: string;
  expires_in_seconds?: number;
  is_ppv?: boolean;
  price_dollars?: number;
  checkout_url?: string;
}

export interface PpvCheckoutResponse {
  checkout_url: string;
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

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    description: 'Perfect for casual viewers',
    price: 9.99,
    currency: 'USD',
    duration_days: 30,
    max_devices: 1,
    max_profiles: 2,
    stripe_price_id: 'price_mock_basic',
    features: ['HD Streaming', '1 Device', '2 Profiles'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-standard',
    name: 'Standard',
    description: 'Great for families',
    price: 14.99,
    currency: 'USD',
    duration_days: 30,
    max_devices: 3,
    max_profiles: 4,
    stripe_price_id: 'price_mock_standard',
    features: ['Full HD Streaming', '3 Devices', '4 Profiles', 'Offline Downloads'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-premium',
    name: 'Premium',
    description: 'Best experience with 4K',
    price: 19.99,
    currency: 'USD',
    duration_days: 30,
    max_devices: 5,
    max_profiles: 5,
    stripe_price_id: 'price_mock_premium',
    features: ['4K Ultra HD', '5 Devices', '5 Profiles', 'Offline Downloads', 'VR Content'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub-123',
  user_id: 'user-123',
  plan_id: 'plan-standard',
  plan_name: 'Standard',
  status: 'active',
  stripe_subscription_id: 'sub_mock_123',
  stripe_customer_id: 'cus_mock_123',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    user_id: 'user-123',
    amount: 14.99,
    currency: 'USD',
    status: 'succeeded',
    payment_type: 'subscription',
    stripe_payment_intent_id: 'pi_mock_1',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'pay-2',
    user_id: 'user-123',
    amount: 5.99,
    currency: 'USD',
    status: 'succeeded',
    payment_type: 'ppv',
    stripe_payment_intent_id: 'pi_mock_2',
    content_id: 'premiere-1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
// PLANS API
// ============================================================================

/**
 * List all available subscription plans
 * GET /api/v1/payments/plans
 */
export async function listPlans({
  page = 1,
  pageSize = 20,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<PlansListResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('listPlans');
    
    // Simulate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedPlans = MOCK_PLANS.slice(start, end);
    
    return {
      count: MOCK_PLANS.length,
      next: end < MOCK_PLANS.length ? `page=${page + 1}` : null,
      previous: page > 1 ? `page=${page - 1}` : null,
      results: paginatedPlans,
    };
  }
  
  try {
    const url = `${API_BASE}api/v1/payments/plans?page=${page}&page_size=${pageSize}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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

// ============================================================================
// SUBSCRIPTION CHECKOUT API
// ============================================================================

/**
 * Create a Stripe checkout session for a subscription plan
 * POST /api/v1/payments/stripe/create-checkout-session
 */
export async function createSubscriptionCheckout(planId: string): Promise<string> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('createSubscriptionCheckout');
    
    const plan = MOCK_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw {
        status: 404,
        message: 'Plan not found',
      } as ApiError;
    }
    
    // Return mock Stripe checkout URL
    return `https://checkout.stripe.com/pay/mock_${planId}_${Date.now()}`;
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
    const url = `${API_BASE}api/v1/payments/stripe/create-checkout-session`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plan_id: planId }),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    const data: CheckoutSessionResponse = await response.json();
    return data.url;
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

// ============================================================================
// SUBSCRIPTIONS API
// ============================================================================

/**
 * List user's subscriptions
 * GET /api/v1/payments/subscriptions
 */
export async function listSubscriptions(): Promise<SubscriptionsListResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('listSubscriptions');
    
    return {
      count: 1,
      results: [MOCK_SUBSCRIPTION],
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
    const url = `${API_BASE}api/v1/payments/subscriptions`;
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
 * Change subscription plan
 * POST /api/v1/payments/change-plan
 */
export async function changePlan(planId: string): Promise<Subscription> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('changePlan');
    
    const plan = MOCK_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw {
        status: 404,
        message: 'Plan not found',
      } as ApiError;
    }
    
    return {
      ...MOCK_SUBSCRIPTION,
      plan_id: planId,
      plan_name: plan.name,
      updated_at: new Date().toISOString(),
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
    const url = `${API_BASE}api/v1/payments/change-plan`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plan_id: planId }),
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
 * Cancel subscription at end of billing period
 * POST /api/v1/payments/cancel-subscription
 */
export async function cancelSubscription(): Promise<Subscription> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('cancelSubscription');
    
    return {
      ...MOCK_SUBSCRIPTION,
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
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
    const url = `${API_BASE}api/v1/payments/cancel-subscription`;
    const response = await fetch(url, {
      method: 'POST',
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
 * Reactivate a canceled subscription
 * POST /api/v1/payments/reactivate-subscription
 */
export async function reactivateSubscription(): Promise<Subscription> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('reactivateSubscription');
    
    return {
      ...MOCK_SUBSCRIPTION,
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
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
    const url = `${API_BASE}api/v1/payments/reactivate-subscription`;
    const response = await fetch(url, {
      method: 'POST',
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

// ============================================================================
// PAYMENTS HISTORY API
// ============================================================================

/**
 * List payment history
 * GET /api/v1/payments/payments
 */
export async function listPayments({
  page = 1,
  pageSize = 20,
  status,
}: {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
} = {}): Promise<PaymentsListResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('listPayments');
    
    let filteredPayments = [...MOCK_PAYMENTS];
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }
    
    // Simulate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedPayments = filteredPayments.slice(start, end);
    
    return {
      count: filteredPayments.length,
      next: end < filteredPayments.length ? `page=${page + 1}` : null,
      previous: page > 1 ? `page=${page - 1}` : null,
      results: paginatedPayments,
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
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const url = `${API_BASE}api/v1/payments/payments?${params.toString()}`;
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

// ============================================================================
// PAY-PER-VIEW (PPV) API
// ============================================================================

/**
 * Check stream access for content (subscription or PPV)
 * GET /api/v1/content/content/{contentId}/stream
 * 
 * Returns access status and either stream URL or PPV checkout information
 * Status 200: Access granted (subscription or purchased)
 * Status 402: Payment required (PPV content, not purchased)
 */
export async function checkStreamAccess(
  contentId: string,
  quality: string = 'auto'
): Promise<StreamAccessResponse> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('checkStreamAccess');
    
    // Mock: Allow access to content IDs starting with "free-" or if user has subscription
    const hasAccess = contentId.startsWith('free-') || MOCK_SUBSCRIPTION.status === 'active';
    
    if (hasAccess) {
      return {
        access: true,
        stream_url: `https://cdn.example.com/streams/${contentId}/playlist.m3u8`,
        drm_key: 'mock_drm_key_' + contentId,
        expires_in_seconds: 3600,
      };
    }
    
    // Mock PPV response
    return {
      access: false,
      is_ppv: true,
      price_dollars: 599,
      checkout_url: `https://checkout.stripe.com/pay/mock_ppv_${contentId}`,
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
    const url = `${API_BASE}api/v1/content/content/${contentId}/stream?quality=${quality}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (response.ok) {
      // 200: Access granted
      const data = await response.json();
      return {
        access: true,
        ...data,
      };
    } else if (response.status === 402) {
      // 402: Payment required (PPV)
      const data = await response.json();
      return {
        access: false,
        is_ppv: true,
        ...data,
      };
    } else {
      throw await handleApiError(response);
    }
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
 * Create PPV checkout session for content
 * POST /api/v1/content/ppv/checkout
 */
export async function createPpvCheckout(contentId: string): Promise<string> {
  if (USE_MOCK_DATA) {
    logMockDataUsage('createPpvCheckout');
    
    // Return mock checkout URL
    return `https://checkout.stripe.com/pay/mock_ppv_${contentId}_${Date.now()}`;
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
    const url = `${API_BASE}api/v1/content/ppv/checkout`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content_id: contentId }),
    });
    
    if (!response.ok) {
      throw await handleApiError(response);
    }
    
    const data: PpvCheckoutResponse = await response.json();
    return data.checkout_url;
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
