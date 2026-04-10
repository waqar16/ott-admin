/**
 * Shared Types and Enums
 * 
 * Core type definitions used across the application.
 * MembershipType is defined here to avoid circular dependencies
 * between auth.ts and db/adapter.ts.
 */

// Membership types enum
export enum MembershipType {
  FREE = 'FREE',
  KIDS = 'KIDS',
  FULL = 'FULL',
}

// Device tier limits
export const DEVICE_LIMITS = {
  [MembershipType.FREE]: 1,
  [MembershipType.KIDS]: 2,
  [MembershipType.FULL]: 5,
} as const;

export interface Video {
  id: string
  title: string
  description: string
  url: string
  thumbnailUrl: string
  duration: number
  contentType: 'kids' | 'adult' | 'all'
  requiredMembership: MembershipType
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscription?: 'free' | 'basic' | 'premium'
  membershipType?: MembershipType
}

export interface Device {
  id: string
  userId: string
  deviceName: string
  deviceType: 'web' | 'mobile' | 'tv' | 'tablet'
  lastActive: Date
  createdAt: Date
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface StripeCheckoutSession {
  sessionId: string
  url: string | null
}

export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  membershipType: MembershipType
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export interface PremiereTitle {
  id: string
  title: string
  description: string
  longDescription?: string
  thumbnailUrl: string
  posterUrl?: string
  trailerUrl?: string
  price: number
  originalPrice?: number
  stripePriceId: string
  duration: number
  releaseDate: string
  genres: string[]
  rating?: string
  director?: string
  cast?: string[]
  featured?: boolean
  available: boolean
}

// Frontend Movies API types
export interface FrontendMovieGenre {
  id: string
  name: string
}

export interface FrontendMovie {
  id: string
  title: string
  poster_url: string | null
  banner_url?: string | null
  genres: FrontendMovieGenre[]
  is_ppv: boolean
  price?: number | null
  duration?: number | null
  release_year?: number | null
}

export interface FrontendMoviesResponse {
  count: number
  next: string | null
  previous: string | null
  results: FrontendMovie[]
}

export interface Purchase {
  id: string
  userId: string
  premiereId: string
  stripePaymentIntentId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  purchasedAt: Date
  expiresAt?: Date
  accessGranted: boolean
}
