# Complete API Reference & Inventory — URVIEW OTT

This document provides a comprehensive inventory and specification of every API endpoint called or implemented within the URVIEW application.

---

## 1. Quick-Reference Master Summary Table

| Method | Endpoint | Purpose | Admin Module | Auth Req. | Service / Helper | Verification Status |
|---|---|---|---|---|---|---|
| `POST` | `/api/v1/login` | Authenticate user with credentials & optional 2FA | Auth / Login | No | `login()` in `authApi.ts` | **Implemented** |
| `POST` | `/api/v1/signup` | Register new platform account | Auth / Registration | No | `signup()` in `authApi.ts` | **Implemented** |
| `POST` | `/api/v1/token/refresh` | Refresh expired JWT access token | Auth Lifecycle | No | `refreshToken()` in `authApi.ts` | **Implemented** |
| `GET` | `/api/v1/me` | Fetch authenticated user profile & role | Auth / Middleware | Bearer JWT | `me()` in `authApi.ts` | **Implemented** |
| `GET` | `/api/v1/admin-dashboard/overview` | Executive KPI dashboard summary | Admin Overview / Analytics | Bearer JWT | Inline fetch | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/users/growth` | User registration growth trend | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/users/active` | Active users timeline | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/users/roles` | User breakdown by role | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/users/status` | User breakdown by account status | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/subscriptions/plan-breakdown` | Subscribers distribution by plan | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/subscriptions/status` | Active, trialing, canceled counts | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/subscriptions/churn` | Subscription churn rate & lost count | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/subscriptions/new` | New subscriptions velocity trend | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/revenue/summary` | Revenue aggregates (30d, all-time) | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/revenue/timeseries` | Historical daily revenue curve | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/revenue/plan-breakdown` | Revenue generated per plan | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/revenue/top-users` | Highest revenue generating users | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/revenue/payment-status` | Succeeded vs failed payment counts | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/revenue/payment-processor` | Processor market share (Stripe, etc.) | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/content/top-movies` | Most viewed movies leaderboard | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/content/top-series` | Most viewed television series | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/content/top-episodes` | Most viewed individual episodes | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/content/completion-rates` | Percent of videos watched to end | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/content/dropoff` | Video playback dropoff quartile intervals | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/engagement/active-users` | DAU / MAU engagement ratios | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/engagement/watch-time` | Aggregated viewing hours timeseries | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/engagement/devices` | Audience viewing breakdown by device | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/engagement/timeline` | Hourly activity timeline | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/engagement/peak-hours` | Peak viewing hours distribution (0-23h) | Analytics | Bearer JWT | `fetchAPI()` in `analytics/page.tsx` | **Implemented (w/ Fallback)** |
| `GET` | `/api/v1/admin-dashboard/creator-report` | Financial breakdown by creator | Revenue | Bearer JWT | Axios call in `revenue/page.tsx` | **Implemented** |
| `GET` | `/api/v1/admin-dashboard/creator-report/excel` | Download creator report in Excel format | Revenue | Bearer JWT | Axios call in `revenue/page.tsx` | **Implemented** |
| `POST` | `/api/v1/admin-dashboard/content/video-assets/{id}/retry-transcode` | Re-trigger transcoding on failed asset | Content Management | Bearer JWT | `retryTranscoding()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/creators` | List all content creators | Creators | Bearer JWT | `getCreators()` in `creatorApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/creators` | Create new creator record | Creators | Bearer JWT | `createCreator()` in `creatorApi.ts` | **Implemented** |
| `PATCH` | `/api/v1/content/creators/{id}` | Update creator details | Creators | Bearer JWT | `updateCreator()` in `creatorApi.ts` | **Implemented** |
| `DELETE` | `/api/v1/content/creators/{id}` | Delete creator record | Creators | Bearer JWT | `deleteCreator()` in `creatorApi.ts` | **Implemented** |
| `GET` | `/api/v1/users` | List all registered user accounts | Users | Bearer JWT | `getUsers()` in `userApi.ts` | **Implemented** |
| `PATCH` | `/api/v1/users/{id}/update` | Update user role, status, and preferences | Users | Bearer JWT | `updateUser()` in `userApi.ts` | **Implemented** |
| `DELETE` | `/api/v1/users/{id}/delete` | Delete user account | Users | Bearer JWT | `deleteUser()` in `userApi.ts` | **Implemented** |
| `GET` | `/api/v1/platform/pre-signup-settings` | Fetch trial quota and waitlist settings | Pre-Signup | Bearer JWT | `getPreSignupSettings()` in `preSignupApi.ts` | **Implemented** |
| `PATCH` | `/api/v1/platform/pre-signup-settings` | Update quota limits and trial duration | Pre-Signup | Bearer JWT | `updatePreSignupSettings()` in `preSignupApi.ts`| **Implemented** |
| `GET` | `/api/v1/platform/pre-signup-analytics` | Pre-signup conversions and health | Pre-Signup | Bearer JWT | `getPreSignupAnalytics()` in `preSignupApi.ts` | **Implemented** |
| `GET` | `/api/v1/platform/waitlist` | List waitlist submissions | Pre-Signup | Bearer JWT | `getWaitlistEntries()` in `preSignupApi.ts` | **Implemented** |
| `POST` | `/api/v1/platform/waitlist/promote` | Batch promote waitlist cohort | Pre-Signup | Bearer JWT | `promoteWaitlist()` in `preSignupApi.ts` | **Implemented** |
| `GET` | `/api/v1/platform/waitlist/{id}` | Retrieve single waitlist entry | Pre-Signup | Bearer JWT | `getWaitlistEntry()` in `preSignupApi.ts` | **Implemented** |
| `PATCH` | `/api/v1/platform/waitlist/{id}` | Update waitlist entry status | Pre-Signup | Bearer JWT | `updateWaitlistEntry()` in `preSignupApi.ts` | **Implemented** |
| `DELETE` | `/api/v1/platform/waitlist/{id}` | Delete waitlist submission | Pre-Signup | Bearer JWT | `deleteWaitlistEntry()` in `preSignupApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/contents` | List catalog contents with filters | Movies, Series, Trailers | Bearer JWT | `listContent()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/contents` | Create content item (movie, trailer, etc.) | Content Management | Bearer JWT | `createContent()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/contents/{id}` | Retrieve content item details | Content Management | Bearer JWT | `getContent()` in `contentApi.ts` | **Implemented** |
| `PATCH` | `/api/v1/content/contents/{id}` | Update content item metadata | Content Management | Bearer JWT | `updateContent()` in `contentApi.ts` | **Implemented** |
| `DELETE` | `/api/v1/content/contents/{id}` | Delete content record | Content Management | Bearer JWT | `deleteContent()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/contents/{id}/publish` | Toggle published/draft status | Content Management | Bearer JWT | `publishContent()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/contents/series` | Create series container | Series Management | Bearer JWT | Inline fetch in `series-management` | **Implemented** |
| `GET` | `/api/v1/content/frontend/season/full/{id}` | Fetch full season hierarchy with episodes | Series Management | Bearer JWT | `refreshSeason()` in `SeriesTree.tsx` | **Implemented** |
| `POST` | `/api/v1/content/series` | Create series | Series Management | Bearer JWT | `createSeries()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/seasons` | Create season under series | Series Management | Bearer JWT | `createSeason()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/episodes` | Create episode under season | Series Management | Bearer JWT | `createEpisode()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/episodes/{id}/upload-thumbnail` | Upload episode thumbnail image | Series Management | Bearer JWT | `uploadEpisodeThumbnail()` in `contentApi.ts`| **Implemented** |
| `GET` | `/api/v1/content/genres` | List supported media genres | Content Management | Bearer JWT | Axios call in `ContentEditor.client.tsx` | **Implemented** |
| `POST` | `/api/v1/content/content-metadata` | Create extended metadata record | Content Management | Bearer JWT | Axios call in `ContentEditor.client.tsx` | **Implemented** |
| `PATCH` | `/api/v1/content/content-metadata/{id}` | Update extended metadata record | Content Management | Bearer JWT | Axios call in `ContentEditor.client.tsx` | **Implemented** |
| `POST` | `/api/v1/content/content/upload/init` | Presigned single POST upload request | Upload Pipeline | Bearer JWT | `initUpload()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/content/upload/multipart/init` | Initiate S3 multipart upload session | Upload Pipeline | Bearer JWT | `initMultipartUpload()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/content/upload/multipart/presigned-urls` | Get presigned URLs for batch parts | Upload Pipeline | Bearer JWT | `getMultipartPresignedUrls()` | **Implemented** |
| `POST` | `/api/v1/content/content/upload/multipart/complete` | Complete S3 multipart upload | Upload Pipeline | Bearer JWT | `completeMultipartUpload()` | **Implemented** |
| `POST` | `/api/v1/content/uploads/s3-callback` | S3 upload completed notification | Upload Pipeline | `x-api-key` | `postUploadCallback()` in `contentApi.ts` | **Implemented (Dev only)** |
| `POST` | `/api/v1/content/content/{id}/images` | Upload poster, banner, or thumbnail | Content Management | Bearer JWT | `uploadImage()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/content/{id}/subtitles/list` | List existing subtitle tracks | Content Management | Bearer JWT | `fetchSubtitles()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/content/{id}/subtitles/bulk` | Upload multiple WebVTT/SRT subtitles | Content Management | Bearer JWT | `uploadSubtitles()` in `contentApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/content/{id}/audiotracks/bulk` | Upload audio dubbing audio tracks | Content Management | Bearer JWT | `uploadDubbings()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/content/{id}/renditions` | List transcoded video renditions | Content Details | Bearer JWT | `getRenditions()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/content/{id}/stream` | Retrieve HLS/DASH playback streaming URLs | Admin Watch Player | Bearer JWT | `getStreamingUrl()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/content/manifest/{id}` | Get HLS master playlist manifest | Players | Bearer JWT | `getManifest()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/drm/key` | Fetch DRM decryption keys | Players | Bearer JWT | `getDrmKey()` in `contentApi.ts` | **Implemented** |
| `GET` | `/api/v1/content/transcoding-progress/{id}` | Real-time transcoding progress (SSE) | Movie & Series Management | None (SSE) | Native `EventSource` in components | **Implemented** |
| `GET` | `/api/v1/platform/faqs` | List all platform FAQs | FAQs | None | `getFaqs()` in `faq.ts` | **Implemented** |
| `POST` | `/api/v1/platform/faqs` | Create new FAQ | FAQs | Bearer JWT | `createFaq()` in `faq.ts` | **Implemented** |
| `PATCH` | `/api/v1/platform/faqs/{id}` | Update existing FAQ | FAQs | Bearer JWT | `updateFaq()` in `faq.ts` | **Implemented** |
| `DELETE` | `/api/v1/platform/faqs/{id}` | Delete FAQ | FAQs | Bearer JWT | `deleteFaq()` in `faq.ts` | **Implemented** |
| `GET` | `/api/v1/payments/plans` | List subscription payment plans | Payment Plans | Optional | `listPlans()` in `paymentsApi.ts` | **Implemented** |
| `POST` | `/api/v1/payments/plans` | Create subscription payment plan | Payment Plans | Bearer JWT | Axios call in `PlanForm.tsx` | **Implemented** |
| `GET` | `/api/v1/payments/plans/{id}` | Retrieve single payment plan | Payment Plans | Bearer JWT | Fetch call in `payment-plans/[id]` | **Implemented** |
| `PUT` | `/api/v1/payments/plans/{id}` | Update existing payment plan | Payment Plans | Bearer JWT | Axios call in `PlanForm.tsx` | **Implemented** |
| `DELETE` | `/api/v1/payments/plans/{id}` | Delete payment plan | Payment Plans | Bearer JWT | Axios call in `payment-plans/page.tsx` | **Implemented** |
| `GET` | `/api/v1/payments/subscriptions` | List subscriber subscriptions | Subscriptions | Bearer JWT | Axios call in `subscriptions/page.tsx`| **Implemented** |
| `POST` | `/api/v1/payments/stripe/create-checkout-session` | Generate Stripe checkout session URL | Subscriptions | Bearer JWT | `createSubscriptionCheckout()` | **Implemented** |
| `POST` | `/api/v1/payments/change-plan` | Switch active subscription plan | Subscriptions | Bearer JWT | `changePlan()` in `paymentsApi.ts` | **Implemented** |
| `POST` | `/api/v1/payments/cancel-subscription` | Cancel recurring subscription | Subscriptions | Bearer JWT | `cancelSubscription()` in `paymentsApi.ts` | **Implemented** |
| `POST` | `/api/v1/payments/reactivate-subscription` | Reactivate canceled subscription | Subscriptions | Bearer JWT | `reactivateSubscription()` in `paymentsApi.ts`| **Implemented** |
| `GET` | `/api/v1/payments/payments` | List user transaction history | Payments | Bearer JWT | `listPayments()` in `paymentsApi.ts` | **Implemented** |
| `POST` | `/api/v1/content/ppv/checkout` | Create PPV ticket checkout session | Premieres / Content | Bearer JWT | `createPpvCheckout()` in `paymentsApi.ts` | **Implemented** |
| `GET` | `/api/v1/platform/settings` | Retrieve branding & system settings | Admin Settings | Bearer JWT | `getPlatformSettings()` in `platformApi.ts` | **Implemented** |
| `POST` | `/api/v1/platform/settings` | Update branding & system settings | Admin Settings | Bearer JWT | `updatePlatformSettings()` | **Implemented** |
| `POST` | `/api/v1/platform/logo-upload` | Upload platform logo image | Admin Settings | Bearer JWT | `uploadPlatformLogo()` in `platformApi.ts` | **Implemented** |
| `GET` | `/api/v1/platform/footer-content/single/` | Retrieve website footer links & copy | Additional Settings | Bearer JWT | `getFooterContent()` in `additionalSettingsApi.ts` | **Implemented** |
| `POST` | `/api/footer-content/single/` | Create footer content configuration | Additional Settings | Bearer JWT | `createFooterContent()` | **Implemented** |
| `PUT` | `/api/footer-content/single/{id}` | Update footer content configuration | Additional Settings | Bearer JWT | `updateFooterContent()` | **Implemented** |
| `GET` | `/api/landing-page-content/single/` | Retrieve hero landing page copy | Additional Settings | Bearer JWT | `getLandingPageContent()` | **Implemented (Service only)**|
| `GET` | `/api/login-screen-content/single/` | Retrieve login screen advertising copy | Additional Settings | Bearer JWT | `getLoginScreenContent()` | **Implemented (Service only)**|
| `GET` | `/api/v1/accounts/profiles/` | List customer sub-profiles | User Profiles | Bearer JWT | Axios call in `user-profiles/page.tsx` | **Implemented** |
| `POST` | `/api/v1/accounts/profiles/` | Create customer sub-profile | User Profiles | Bearer JWT | Axios call in `user-profiles/page.tsx` | **Implemented** |
| `PUT` | `/api/v1/accounts/profiles/{id}/` | Update customer sub-profile | User Profiles | Bearer JWT | Axios call in `user-profiles/page.tsx` | **Implemented** |
| `DELETE` | `/api/v1/accounts/profiles/{id}/` | Delete customer sub-profile | User Profiles | Bearer JWT | Axios call in `user-profiles/page.tsx` | **Implemented** |
| `GET` | `/api/v1/profiles` | List user profiles (alternate contract) | Profiles | Bearer JWT | `listProfiles()` in `profilesApi.ts` | **Implemented (Service only)**|
| `POST` | `/api/v1/profiles/{id}/verify-pin` | Verify parental control PIN | Parental Controls | Bearer JWT | `verifyPin()` in `profilesApi.ts` | **Implemented** |
| `GET` | `/api/admin/content` | Next.js route: catalog flags & stats | Legacy Content | NextAuth / Mock | `fetch('/api/admin/content')` | **Internal Mock** |
| `PATCH` | `/api/admin/content` | Next.js route: update title flags | Legacy Content | NextAuth / Mock | `fetch('/api/admin/content')` | **Internal Mock** |
| `GET` | `/api/catalog` | Next.js route: search & paginate catalog | Consumer Catalog | None | `fetch('/api/catalog')` | **Internal Handler** |
| `POST` | `/api/checkout` | Next.js route: create Stripe PPV session | Checkout | Optional | `fetch('/api/checkout')` | **Internal Handler (Mock)** |
| `GET` | `/api/health` | Next.js route: system health check | System | None | `fetch('/api/health')` | **Internal Handler** |
| `POST` | `/api/leads` | Next.js route: capture landing email lead | Marketing | None | `fetch('/api/leads')` | **Internal Handler** |
| `GET` | `/api/settings/devices` | Next.js route: list active user devices | Device Settings | NextAuth / Mock | `fetch('/api/settings/devices')` | **Internal Handler (Mock)** |
| `POST` | `/api/stripe/webhook` | Next.js route: process Stripe webhooks | Payments | `stripe-signature` | Stripe Webhook Event | **Internal Handler** |
| `POST` | `/api/upload` | Next.js route: generate S3 upload URL | Uploads | NextAuth / Mock | `fetch('/api/upload')` | **Internal Handler (Mock)** |

---

## 2. Detailed Endpoint Specifications by Module

### A. Authentication & Session Module

#### `POST /api/v1/login`
- **Call Chain:** [LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx) -> [useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx) -> `login()` in [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts) -> HTTP POST `${API_BASE}api/v1/login`
- **Auth Required:** No
- **Headers:** `Content-Type: application/json`
- **Request Payload:**
```json
{
  "email": "admin@urview.com",
  "password": "Password123!",
  "device_id": "web_1712891234_abc123",
  "device_type": "web",
  "token_2fa": "123456" // optional, included if 2FA challenge triggered
}
```
- **Response Structure (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "two_factor_required": false,
  "role": "admin"
}
```

#### `GET /api/v1/me`
- **Call Chain:** [middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts) / [useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx) -> `me()` in [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts)
- **Auth Required:** Bearer JWT (`Authorization: Bearer <access_token>`)
- **Response Structure (200 OK):**
```json
{
  "id": "usr_9410294",
  "email": "admin@urview.com",
  "name": "Platform Administrator",
  "role": "admin",
  "profile_picture": "https://cdn.urview.com/avatars/admin.webp",
  "subscription_tier": "vip",
  "is_verified": true,
  "created_at": "2026-01-15T08:00:00Z"
}
```

---

### B. Content Management Module (Movies, Series, Seasons, Episodes, Trailers)

#### `GET /api/v1/content/contents`
- **Call Chain:** [movie-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/movie-management/page.tsx) / [trailer-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/trailer-management/page.tsx) -> `listContent()` in [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts)
- **Query Parameters:**
  - `content_type`: `'movie' | 'series' | 'episode' | 'trailer' | 'documentary' | 'democontent'`
  - `media_type`: `'movies' | 'series' | 'trailers' | 'documentaries' | 'democontents'`
  - `status`: `'ready' | 'draft' | 'uploaded' | 'published' | 'inactive' | 'failed' | 'archived'`
  - `visibility_mode`: `'public' | 'beta'`
  - `search`: string
  - `is_kid_safe`: boolean
  - `is_ppv`: boolean
  - `page`: number
  - `page_size`: number
- **Response Structure (200 OK):**
```json
{
  "count": 48,
  "next": "https://api.urview.com/api/v1/content/contents?page=2",
  "previous": null,
  "results": [
    {
      "id": "cont_98142",
      "title": "Cosmic Drift 360",
      "description": "An immersive spatial journey through deep nebula clouds.",
      "content_type": "movie",
      "media_type": "vr_360_sbs",
      "status": "published",
      "visibility_mode": "public",
      "is_kid_safe": false,
      "is_ppv": true,
      "price": 4.99,
      "genres": ["Sci-Fi", "VR Experience"],
      "poster_url": "https://cdn.urview.com/posters/cosmic.jpg",
      "banner_url": "https://cdn.urview.com/banners/cosmic.jpg",
      "thumbnail_url": "https://cdn.urview.com/thumbs/cosmic.jpg",
      "duration_seconds": 3600,
      "rating": "PG-13",
      "director": "Elena Rostova",
      "cast": ["Alex Mercer", "Sarah Lin"],
      "transcoding_progress": 100,
      "ingest_status": "ready",
      "created_at": "2026-03-01T12:00:00Z",
      "updated_at": "2026-03-05T14:30:00Z"
    }
  ]
}
```

#### `POST /api/v1/content/contents`
- **Call Chain:** [ContentEditor.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/admin/content/ContentEditor.client.tsx) -> `createContent()` in [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts)
- **Request Payload:**
```json
{
  "title": "Quantum Horizon",
  "description": "Scientific exploration documentary.",
  "content_type": "movie",
  "media_type": "flat",
  "visibility_mode": "public",
  "status": "draft",
  "is_kid_safe": true,
  "is_educational": true,
  "is_ppv": false,
  "genres": ["Science", "Documentary"],
  "duration_seconds": 5400,
  "director": "Dr. Marcus Vance",
  "release_date": "2026-04-01"
}
```

#### `GET /api/v1/content/content/{contentId}/stream`
- **Call Chain:** [watch/[id]/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/watch/%5Bid%5D/page.tsx) -> `getStreamingUrl()` in [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts)
- **Response Structure (200 OK):**
```json
{
  "dash_url": "https://cdn.urview.com/processed/cont_98142/manifest.mpd",
  "hls_url": "https://cdn.urview.com/processed/cont_98142/master.m3u8",
  "drm": {
    "token": "widevine_license_token_jwt",
    "hls_token": "fairplay_license_token_jwt",
    "license_url": "https://license.urview.com/get-key"
  }
}
```

#### `GET /api/v1/content/transcoding-progress/{contentId}` (SSE)
- **Call Chain:** [movie-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/movie-management/page.tsx) -> `new EventSource(...)`
- **Protocol:** Server-Sent Events (SSE)
- **Message Payload:**
```
event: message
data: {"progress": 74, "phase": "Transcoding 1080p rendition", "status": "processing"}
```

---

### C. Direct S3 Upload & Asset Ingestion Pipeline

#### `POST /api/v1/content/content/upload/init`
- **Call Chain:** [ContentEditor.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/admin/content/ContentEditor.client.tsx) -> `initUpload()` in [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts)
- **Request Payload:**
```json
{
  "content_id": "cont_98142",
  "filename": "master_video_raw.mp4",
  "file_size": 4294967296,
  "mime_type": "video/mp4",
  "drive_file_id": "1Gk82...optional",
  "drive_access_token": "ya29...optional"
}
```
- **Response Structure (200 OK):**
```json
{
  "upload_url": {
    "url": "https://ott-platform-uploads.s3.amazonaws.com/",
    "fields": {
      "key": "uploads/video/cont_98142/master_video_raw.mp4",
      "bucket": "ott-platform-uploads",
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": "AKIA.../20260401/us-east-1/s3/aws4_request",
      "X-Amz-Date": "20260401T120000Z",
      "Policy": "eyJleHBpcmF0aW9uIj...",
      "X-Amz-Signature": "8a71b..."
    }
  },
  "s3_key": "uploads/video/cont_98142/master_video_raw.mp4"
}
```

#### `POST /api/v1/content/content/upload/multipart/init`
- **Call Chain:** [uploadHelper.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/uploadHelper.ts) -> `initMultipartUpload()` in [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts)
- **Purpose:** Used for large video files (>100MB) to split uploads into chunks.
- **Response Structure (200 OK):**
```json
{
  "upload_id": "VXBsb2FkSWQxMjM0NQ==",
  "s3_key": "uploads/video/cont_98142/raw_movie.mov",
  "part_size": 10485760,
  "num_parts": 120
}
```

---

### D. Payment Plans & Subscriptions Module

#### `GET /api/v1/payments/plans`
- **Call Chain:** [payment-plans/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/payment-plans/page.tsx) -> `listPlans()` in [lib/paymentsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/paymentsApi.ts)
- **Query Parameters:** `page`, `search`, `is_active`, `ad_supported`
- **Response Structure (200 OK):**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "plan_full_access",
      "name": "Full Access Pass",
      "description": "Complete 4K & VR access with up to 5 devices.",
      "price": 14.99,
      "currency": "USD",
      "duration_days": 30,
      "max_devices": 5,
      "max_profiles": 5,
      "can_access_premium": true,
      "ad_supported": false,
      "stripe_price_id": "price_1OmFullAccess",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/v1/payments/stripe/create-checkout-session`
- **Call Chain:** [PlansList.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/payments/PlansList.client.tsx) -> `createSubscriptionCheckout()` in [lib/paymentsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/paymentsApi.ts)
- **Request Payload:**
```json
{
  "plan_id": "plan_full_access",
  "success_url": "http://localhost:3000/account/billing?success=true",
  "cancel_url": "http://localhost:3000/plans"
}
```
- **Response Structure (200 OK):**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4..."
}
```

---

### E. Pre-Signup, Trial Quotas & Waitlist Module

#### `GET /api/v1/platform/pre-signup-analytics`
- **Call Chain:** [pre-signup/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/pre-signup/page.tsx) -> `getPreSignupAnalytics()` in [lib/preSignupApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/preSignupApi.ts)
- **Response Structure (200 OK):**
```json
{
  "quota": {
    "is_enabled": true,
    "capacity": 600,
    "trial_days": 7,
    "trial_plan_name": "Pre-registration VIP Trial",
    "current_cohort_size": 458,
    "remaining_capacity": 142,
    "capacity_fill_percentage": 76.3
  },
  "waitlist": {
    "total_entries": 1280,
    "pending": 822,
    "converted": 458,
    "notified": 120,
    "expired": 34,
    "conversion_rate_percentage": 35.8
  },
  "next_in_line": [
    {
      "id": 1092,
      "email": "sarah.t@example.com",
      "name": "Sarah Turner",
      "status": "pending",
      "source": "landing_hero",
      "created_at": "2026-09-02T14:22:10Z"
    }
  ],
  "recent_conversions": [
    {
      "id": 981,
      "email": "david.k@example.com",
      "name": "David Kim",
      "status": "converted",
      "source": "referral",
      "converted_at": "2026-09-03T18:11:45Z"
    }
  ]
}
```

#### `POST /api/v1/platform/waitlist/promote`
- **Call Chain:** [PromoteBatchModal.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/pre-signup/components/PromoteBatchModal.tsx) -> `promoteWaitlist()` in [lib/preSignupApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/preSignupApi.ts)
- **Request Payload:**
```json
{
  "count": 50
}
```
- **Response Structure (200 OK):**
```json
{
  "promoted_count": 50,
  "remaining_capacity": 92,
  "detail": "Successfully promoted and notified 50 waitlist members."
}
```

---

### F. Internal Next.js Route Handlers (`app/api/*`)

#### `GET /api/health`
- **Source File:** [app/api/health/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/health/route.ts)
- **Response (200 OK):**
```json
{
  "message": "OTT Platform API",
  "version": "1.0.0",
  "status": "healthy",
  "timestamp": "2026-10-13T12:00:00.000Z"
}
```

#### `POST /api/leads`
- **Source File:** [app/api/leads/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/leads/route.ts)
- **Request Payload:** `{"email": "prospective_user@example.com"}`
- **Response (200 OK):** `{"success": true, "message": "Thank you for your interest! We'll be in touch soon."}`

#### `POST /api/stripe/webhook`
- **Source File:** [app/api/stripe/webhook/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/stripe/webhook/route.ts)
- **Headers:** `stripe-signature: t=...,v1=...`
- **Events Processed:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.created`
- **Backend Handler:** Updates mock user membership in `lib/db/adapter.ts`.
- **Response (200 OK):** `{"received": true}`
