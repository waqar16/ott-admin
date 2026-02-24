/**
 * Application Configuration
 * 
 * Central configuration file for the OTT platform.
 * Set USE_MOCK_DATA to true to run the app without backend dependencies.
 */
// API Base URL for backend authentication and content APIs
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE 
export const FRONTEND_BASE = process.env.NEXT_PUBLIC_FRONTEND_BASE
// export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/';

// Mock mode flag - set to true to use dummy data instead of real APIs
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// API Configuration
export const API_CONFIG = {
  baseUrl: USE_MOCK_DATA ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_API_BASE ),
  timeout: 30000,
};

// NextAuth Configuration
export const AUTH_CONFIG = {
  // TODO: Uncomment when NextAuth ready
  // nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  // nextAuthSecret: process.env.NEXTAUTH_SECRET,
  useMockAuth: USE_MOCK_DATA,
  mockSessionDuration: 30 * 24 * 60 * 60, // 30 days in seconds
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  // TODO: Uncomment when Stripe integration ready
  // publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  // secretKey: process.env.STRIPE_SECRET_KEY || '',
  // webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  useMockPayments: USE_MOCK_DATA,
  mockPublishableKey: 'pk_test_mock_key_for_development',
};

// WordPress Configuration
export const WORDPRESS_CONFIG = {
  // TODO: Uncomment when WordPress integration ready
  // apiBaseUrl: process.env.WORDPRESS_API_URL || '',
  // apiToken: process.env.WORDPRESS_API_TOKEN || '',
  useMockBlog: USE_MOCK_DATA,
  mockApiUrl: 'https://demo.wp-api.org/wp-json/wp/v2',
};

// AWS Configuration
export const AWS_CONFIG = {
  // TODO: Uncomment when AWS integration ready
  // region: process.env.AWS_REGION || 'us-east-1',
  // bucketName: process.env.AWS_S3_BUCKET || '',
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  useMockStorage: USE_MOCK_DATA,
  mockBucketUrl: 'https://demo-bucket.s3.amazonaws.com',
};

// Feature Flags
export const FEATURES = {
  enableVRPlayer: true,
  enableKidsZone: true,
  enablePremiere: true,
  enableBlog: true,
  enableUpload: true,
  enablePayments: !USE_MOCK_DATA, // Disable real payments in mock mode
};

// Development Settings
export const DEV_CONFIG = {
  enableDebugLogs: process.env.NODE_ENV === 'development',
  enableMockDataLogs: USE_MOCK_DATA && process.env.NODE_ENV === 'development',
};

// Helper function to log mock data usage
export function logMockDataUsage(context: string): void {
  if (DEV_CONFIG.enableMockDataLogs) {
    console.log(`[MOCK MODE] ${context} - Using dummy data`);
  }
}
