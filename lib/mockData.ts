/**
 * Mock Data for Development
 * 
 * This file contains dummy data to run the app without backend dependencies.
 * Used when USE_MOCK_DATA is set to true in lib/config.ts
 */

import { MembershipType } from './types';
import type { User, Video, Device, Subscription, PremiereTitle, Purchase } from './types';
import catalogData from './data/catalog.json';

// Mock mode active — replace with real API later
console.log('[MOCK DATA] Loading dummy data for development');

// ===========================
// MOCK USERS
// ===========================

export const mockUsers: any[] = [
  {
    id: 'mock-user-1',
    email: 'demo@example.com',
    name: 'Demo User',
    membershipType: MembershipType.FREE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'mock-user-2',
    email: 'full@example.com',
    name: 'Full Access User',
    membershipType: MembershipType.FULL,
    stripeCustomerId: 'cus_mock_full',
    stripeSubscriptionId: 'sub_mock_full',
    subscriptionStatus: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'mock-user-3',
    email: 'kids@example.com',
    name: 'Kids Account',
    membershipType: MembershipType.KIDS,
    stripeCustomerId: 'cus_mock_kids',
    stripeSubscriptionId: 'sub_mock_kids',
    subscriptionStatus: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Default mock user for sessions
export const mockCurrentUser: any = mockUsers[0];

// ===========================
// MOCK CATALOG / VIDEOS
// ===========================

export const mockCatalog: any[] = catalogData.titles.map((title: any) => ({
  id: title.id,
  title: title.title,
  description: title.description,
  thumbnail: title.thumbnail,
  banner: title.banner,
  videoUrl: `https://demo-cdn.example.com/videos/${title.id}/playlist.m3u8`,
  vrVideoUrl: title.isImmersive ? `https://demo-cdn.example.com/vr/${title.id}/360.mp4` : undefined,
  duration: title.duration || (title.episodes ? title.episodes * 45 : 90),
  releaseDate: new Date(`${title.year}-01-01`),
  genre: title.genre,
  rating: title.rating,
  imdbRating: title.imdbRating,
  director: title.director || title.creator,
  cast: title.cast,
  trailer: title.trailer,
  isImmersive: title.isImmersive,
  formats: title.formats,
  contentType: title.contentType as 'kids' | 'adult' | 'all',
  requiredMembership: title.requiredMembership as MembershipType,
  type: title.type as 'movie' | 'series',
  seasons: title.seasons,
  episodes: title.episodes,
  previewImages: title.previewImages,
  views: Math.floor(Math.random() * 1000000),
  likes: Math.floor(Math.random() * 50000),
  createdAt: new Date(`${title.year}-01-01`),
  updatedAt: new Date(`${title.year}-01-01`),
}));

// ===========================
// MOCK DEVICES
// ===========================

export const mockDevices: Device[] = [
  {
    id: 'device-1',
    userId: 'mock-user-1',
    deviceName: 'Chrome Browser - Windows',
    deviceType: 'web',
    lastActive: new Date(),
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'device-2',
    userId: 'mock-user-1',
    deviceName: 'iPhone 15 Pro',
    deviceType: 'mobile',
    lastActive: new Date(Date.now() - 86400000), // 1 day ago
    createdAt: new Date('2024-01-10'),
  },
];

// ===========================
// MOCK SUBSCRIPTIONS
// ===========================

export const mockSubscriptions: any[] = [
  {
    id: 'sub_mock_full',
    userId: 'mock-user-2',
    stripeSubscriptionId: 'sub_mock_full',
    stripeCustomerId: 'cus_mock_full',
    stripePriceId: 'price_mock_full',
    membershipType: MembershipType.FULL,
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 15 * 86400000), // 15 days ago
    currentPeriodEnd: new Date(Date.now() + 15 * 86400000), // 15 days from now
    cancelAtPeriodEnd: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'sub_mock_kids',
    userId: 'mock-user-3',
    stripeSubscriptionId: 'sub_mock_kids',
    stripeCustomerId: 'cus_mock_kids',
    stripePriceId: 'price_mock_kids',
    membershipType: MembershipType.KIDS,
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 10 * 86400000),
    currentPeriodEnd: new Date(Date.now() + 20 * 86400000),
    cancelAtPeriodEnd: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
];

// ===========================
// MOCK PREMIERE TITLES
// ===========================

export const mockPremiereTitle: any = {
  id: 'premiere-1',
  title: 'Galactic Empires: The Final Chapter',
  description: 'The epic conclusion to the beloved sci-fi saga arrives exclusively on our platform. Watch the highly anticipated finale before anyone else.',
  thumbnail: 'https://picsum.photos/seed/premiere/400/600',
  banner: 'https://picsum.photos/seed/premiere-banner/1920/1080',
  trailer: 'https://example.com/trailers/galactic-empires-finale.mp4',
  videoUrl: 'https://demo-cdn.example.com/premiere/galactic-empires/playlist.m3u8',
  vrVideoUrl: 'https://demo-cdn.example.com/premiere/galactic-empires/360.mp4',
  duration: 165,
  releaseDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
  genre: ['Sci-Fi', 'Action', 'Drama'],
  rating: 'PG-13',
  imdbRating: 9.1,
  director: 'Christopher Nolan',
  cast: ['Leonardo DiCaprio', 'Anne Hathaway', 'Tom Hardy'],
  price: 19.99,
  currency: 'USD',
  availableUntil: new Date(Date.now() + 30 * 86400000), // 30 days from now
  isPremiere: true,
  isImmersive: true,
  formats: ['2D', 'IMAX', 'Immersive VR'],
  previewImages: [
    'https://picsum.photos/seed/premiere1/800/450',
    'https://picsum.photos/seed/premiere2/800/450',
    'https://picsum.photos/seed/premiere3/800/450',
    'https://picsum.photos/seed/premiere4/800/450',
  ],
  createdAt: new Date('2024-10-01'),
  updatedAt: new Date(),
};

// ===========================
// MOCK PURCHASES
// ===========================

export const mockPurchases: any[] = [
  {
    id: 'purchase-1',
    userId: 'mock-user-2',
    titleId: 'premiere-1',
    premiereId: 'premiere-1',
    amount: 19.99,
    currency: 'USD',
    status: 'completed',
    stripePaymentIntentId: 'pi_mock_123456',
    purchaseDate: new Date(Date.now() - 2 * 86400000), // 2 days ago
    purchasedAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
    expiresAt: new Date(Date.now() + 28 * 86400000), // 28 days from now
    accessGranted: true,
    createdAt: new Date(Date.now() - 2 * 86400000),
    updatedAt: new Date(Date.now() - 2 * 86400000),
  },
];

// ===========================
// MOCK BLOG POSTS
// ===========================

export const mockBlogPosts = [
  {
    id: 1,
    slug: 'welcome-to-immersive-streaming',
    title: { rendered: 'Welcome to the Future of Immersive Streaming' },
    excerpt: { rendered: '<p>Discover how VR and 360° video are transforming the way we experience entertainment...</p>' },
    content: { rendered: '<p>Welcome to our cutting-edge OTT platform! We are excited to bring you the latest in immersive streaming technology...</p>' },
    date: '2024-01-15T10:00:00',
    modified: '2024-01-15T10:00:00',
    author: 1,
    featured_media: 101,
    categories: [1, 5],
    tags: [10, 15, 20],
    // Teaser media (mock)
    videoTeaserUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // TODO: Load from WordPress custom field
    vrTeaserUrl: undefined,
    _embedded: {
      author: [{
        id: 1,
        name: 'Editorial Team',
        avatar_urls: { '96': 'https://i.pravatar.cc/96?img=1' },
      }],
      'wp:featuredmedia': [{
        id: 101,
        source_url: 'https://picsum.photos/seed/blog1/1200/630',
        alt_text: 'VR Streaming',
        media_details: { width: 1200, height: 630 },
      }],
      'wp:term': [
        [{ id: 1, name: 'Technology' }, { id: 5, name: 'VR' }],
        [{ id: 10, name: 'streaming' }, { id: 15, name: 'innovation' }],
      ],
    },
  },
  {
    id: 2,
    slug: 'top-10-vr-experiences',
    title: { rendered: 'Top 10 Must-Watch VR Experiences This Month' },
    excerpt: { rendered: '<p>Check out our curated list of the best immersive content available now...</p>' },
    content: { rendered: '<p>Virtual reality has opened up new dimensions in storytelling. Here are the top 10 VR experiences you should not miss...</p>' },
    date: '2024-01-20T14:30:00',
    modified: '2024-01-20T14:30:00',
    author: 2,
    featured_media: 102,
    categories: [2, 5],
    tags: [10, 25, 30],
    videoTeaserUrl: undefined,
    vrTeaserUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // TODO: Load stereoscopic teaser
    _embedded: {
      author: [{
        id: 2,
        name: 'Sarah Mitchell',
        avatar_urls: { '96': 'https://i.pravatar.cc/96?img=5' },
      }],
      'wp:featuredmedia': [{
        id: 102,
        source_url: 'https://picsum.photos/seed/blog2/1200/630',
        alt_text: 'VR Headset',
        media_details: { width: 1200, height: 630 },
      }],
      'wp:term': [
        [{ id: 2, name: 'Reviews' }, { id: 5, name: 'VR' }],
        [{ id: 10, name: 'streaming' }, { id: 25, name: 'top 10' }],
      ],
    },
  },
  {
    id: 3,
    slug: 'kids-zone-safe-streaming',
    title: { rendered: 'Kids Zone: Safe and Educational Content for Your Family' },
    excerpt: { rendered: '<p>Learn how our Kids Zone ensures a safe viewing environment for children...</p>' },
    content: { rendered: '<p>Parents can rest easy knowing that our Kids Zone offers carefully curated, age-appropriate content with parental controls...</p>' },
    date: '2024-01-25T09:00:00',
    modified: '2024-01-25T09:00:00',
    author: 3,
    featured_media: 103,
    categories: [3, 6],
    tags: [35, 40],
    _embedded: {
      author: [{
        id: 3,
        name: 'Lisa Anderson',
        avatar_urls: { '96': 'https://i.pravatar.cc/96?img=9' },
      }],
      'wp:featuredmedia': [{
        id: 103,
        source_url: 'https://picsum.photos/seed/blog3/1200/630',
        alt_text: 'Kids Watching',
        media_details: { width: 1200, height: 630 },
      }],
      'wp:term': [
        [{ id: 3, name: 'Family' }, { id: 6, name: 'Kids' }],
        [{ id: 35, name: 'parental controls' }, { id: 40, name: 'education' }],
      ],
    },
  },
];

// ===========================
// MOCK UPLOAD DATA
// ===========================

export const mockUploadResponse = {
  uploadUrl: 'https://mock-upload-url.s3.amazonaws.com/uploads/mock-file-id',
  fileId: 'mock-file-' + Date.now(),
  bucket: 'mock-upload-bucket',
  key: `uploads/mock-file-${Date.now()}.mp4`,
};

export const mockUploadStatus = {
  fileId: 'mock-file-123',
  status: 'processing',
  progress: 65,
  message: 'Transcoding video to HLS format...',
  estimatedCompletion: new Date(Date.now() + 5 * 60000), // 5 minutes from now
};

// ===========================
// MOCK ADMIN CONTENT
// ===========================

export const mockAdminContent = {
  videos: mockCatalog.slice(0, 5).map(video => ({
    ...video,
    uploadDate: video.createdAt,
    status: 'published' as const,
    analytics: {
      views: video.views || 0,
      likes: video.likes || 0,
      completionRate: Math.random() * 100,
      averageWatchTime: Math.floor(Math.random() * video.duration),
    },
  })),
  totalVideos: mockCatalog.length,
  totalViews: mockCatalog.reduce((sum, v) => sum + (v.views || 0), 0),
  totalUsers: mockUsers.length,
};

// ===========================
// MOCK AUTH SESSION
// ===========================

export const mockSession = {
  user: {
    id: mockCurrentUser.id,
    email: mockCurrentUser.email,
    name: mockCurrentUser.name,
    membershipType: mockCurrentUser.membershipType,
    stripeCustomerId: mockCurrentUser.stripeCustomerId,
    stripeSubscriptionId: mockCurrentUser.stripeSubscriptionId,
    subscriptionStatus: mockCurrentUser.subscriptionStatus,
    deviceLimit: mockCurrentUser.membershipType === MembershipType.FREE ? 1 : mockCurrentUser.membershipType === MembershipType.KIDS ? 2 : 5,
    isKidsRingfenced: mockCurrentUser.membershipType === MembershipType.KIDS,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
};

// ===========================
// MOCK CHECKOUT SESSION
// ===========================

export const mockCheckoutSession = {
  id: 'cs_mock_' + Date.now(),
  url: 'https://checkout.stripe.com/mock-session-url',
  success_url: 'http://localhost:3000/purchase/success?session_id=cs_mock_' + Date.now(),
  cancel_url: 'http://localhost:3000/premiere',
};

// ===========================
// MOCK STRIPE PRICES
// ===========================

export const mockStripePrices = {
  FREE: { id: 'price_free', amount: 0, currency: 'usd', interval: 'month' },
  KIDS: { id: 'price_kids', amount: 999, currency: 'usd', interval: 'month' },
  FULL: { id: 'price_full', amount: 1999, currency: 'usd', interval: 'month' },
};

// ===========================
// HELPER FUNCTIONS
// ===========================

export function getMockUserByEmail(email: string): User | undefined {
  return mockUsers.find(user => user.email === email);
}

export function getMockVideoById(id: string): Video | undefined {
  return mockCatalog.find(video => video.id === id);
}

export function getMockDevicesByUserId(userId: string): Device[] {
  return mockDevices.filter(device => device.userId === userId);
}

export function getMockSubscriptionByUserId(userId: string): Subscription | undefined {
  return mockSubscriptions.find(sub => sub.userId === userId);
}

// Export mock data logger
export function logMockData(context: string, data?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MOCK DATA] ${context}`, data || '');
  }
}
