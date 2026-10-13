# AI Handover Master Guide — URVIEW OTT Admin Platform

> **Instructions for AI Assistants:**
> Read this document completely before proposing, planning, or executing any modifications to this repository. This document outlines the application architecture, active vs. legacy mechanisms, established API patterns, and critical safety rules to ensure future changes do not break existing functionality.

---

## 1. What the Application Does

**URVIEW** is an enterprise Over-The-Top (OTT) media platform and content distribution ecosystem. The platform supports standard 2D cinema and television series alongside **immersive virtual reality (VR)** formats: 180° and 360° monoscopic and stereoscopic (side-by-side / top-bottom) media playable directly in standard web and mobile browsers.

This specific repository (`OTT`) is the **Next.js 14 Admin Panel & Web Application Client**. Its primary function is to serve as the back-office control panel for platform administrators and media operators to:
- Ingest raw video and trigger cloud transcoding (AWS MediaConvert/S3).
- Curate and publish movies, episodic series, trailers, and documentaries.
- Configure commercial subscription tiers (pricing, device limits, profile limits) and monitor active subscriptions.
- Manage content creator accounts, track revenue splits, and export financial reports to Excel.
- Administer user accounts, manage early-access pre-signup waitlists, and enforce trial quotas.
- Customize platform branding, logos, support emails, and public FAQs.
- Monitor 25+ real-time platform KPIs, audience engagement metrics, and streaming analytics.

---

## 2. Technology Stack & Architecture

- **Framework:** Next.js 14.0.4 using the **App Router** (`app/`).
- **Language & Runtime:** TypeScript 5.3.3 (Strict mode), Node.js `>=18.0.0`, React 18.2.0.
- **Styling:** Vanilla CSS & TailwindCSS 3.4.0 with dark/light mode toggle. Custom typography via Google Fonts (`League Spartan`).
- **Data Visualization:** `echarts@6.0.0` & `echarts-for-react@3.0.5`.
- **UI & Feedback:** `framer-motion@12.26.2` for transitions; `sonner@2.0.7` for toast notifications.
- **Media Players:** `shaka-player@4.16.14` (Google Shaka DASH/HLS with Widevine/ClearKey DRM), `hls.js@1.6.15`, and `aframe@1.7.1` / `three@0.160.0` for WebXR 360°/180° spatial playback.
- **Backend Architecture:**
  - External API: Django REST Framework (DRF) hosted at `https://api.urview.com/` (configured via `NEXT_PUBLIC_API_BASE`).
  - Next.js Route Handlers: 9 internal endpoints in `app/api/*` providing mock data, Stripe webhook processing, device sessions, and local S3 upload presigning.
  - Serverless Media Transcoding: AWS S3 + AWS Lambda (`lambda/mediaProcessor.js`, `lambda/imageProcessor.js`) triggering AWS MediaConvert.

---

## 3. Major Modules & Routes

All administrative pages reside under [app/admin/](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin):

| Route | Module Name | Primary Purpose | Primary Component / File |
|---|---|---|---|
| `/admin` | Executive Overview | High-level KPI summary, user breakdown, content counts, revenue mix | [app/admin/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/page.tsx) |
| `/admin/analytics` | Analytics Dashboard | 25-metric analytical suite (User growth, churn, devices, completion rates) | [app/admin/analytics/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/analytics/page.tsx) |
| `/admin/creator` | Creators Management | Onboarding, auditing, and CRUD operations for content creator accounts | [app/admin/creator/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/creator/page.tsx) |
| `/admin/revenue` | Revenue Reporting | Auditing creator earnings and generating Excel spreadsheet exports | [app/admin/revenue/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/revenue/page.tsx) |
| `/admin/users` | Users Management | User account inspection, status updates (active, banned, suspended), deletion | [app/admin/users/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/users/page.tsx) |
| `/admin/pre-signup`| Pre-Signup & Waitlist | Quota capacity settings, trial days, cohort promotion, waitlist queue | [app/admin/pre-signup/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/pre-signup/page.tsx) |
| `/admin/faqs` | FAQs Management | Creating, editing, ordering, and publishing platform customer FAQs | [app/admin/faqs/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/faqs/page.tsx) |
| `/admin/movie-management` | Movie Management | Movie catalog, S3 uploads, Google Drive import, SSE progress, publishing | [app/admin/movie-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/movie-management/page.tsx) |
| `/admin/series-management`| Series Management | Hierarchical accordion tree (Series -> Seasons -> Episodes) & video uploads | [app/admin/series-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/series-management/page.tsx) |
| `/admin/trailer-management`| Trailer Management | Managing standalone and promotional trailers and YouTube links | [app/admin/trailer-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/trailer-management/page.tsx) |
| `/admin/documentary-management`| Documentary Management | Dedicated non-fiction and documentary catalog interface | [app/admin/documentary-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/documentary-management/page.tsx) |
| `/admin/payment-plans` | Payment Plans | CRUD for subscription tiers (pricing, duration, device limits, Stripe Price ID)| [app/admin/payment-plans/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/payment-plans/page.tsx) |
| `/admin/subscriptions`| Subscriptions Auditing| Real-time inspection of active customer subscriptions and renewing periods | [app/admin/subscriptions/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/subscriptions/page.tsx) |
| `/admin/settings` | Platform Settings | Platform name, support email, brand colors, and logo S3 upload | [app/admin/settings/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/settings/page.tsx) |
| `/admin/additional-settings`| Additional Settings | Managing website footer copy, social media links, and policy URLs | [app/admin/additional-settings/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/additional-settings/page.tsx) |
| `/admin/user-profiles`| User Profiles | Auditing subscriber sub-profiles, kids flags, and parental PIN locks | [app/admin/user-profiles/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/user-profiles/page.tsx) |
| `/admin/watch/[id]` | Admin Watch Preview | Internal streaming preview player testing DASH/HLS and VR playback | [app/admin/watch/[id]/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/watch/%5Bid%5D/page.tsx) |
| `/admin/premiere` | Premiere (PPV) | **Stub only** (placeholder layout with TODO comment) | [app/admin/premiere/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/premiere/page.tsx) |
| `/admin/content` | Legacy Content Flags | Prototype screen operating against local mock `catalog.json` | [app/admin/content/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/content/page.tsx) |

---

## 4. Key API Endpoints & Implementation Files

| Purpose | Method & Endpoint | Implementation File | Calling Page / Hook |
|---|---|---|---|
| Admin Login | `POST /api/v1/login` | [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts) | [components/auth/LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx) |
| Token Refresh | `POST /api/v1/token/refresh` | [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts) | [lib/useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx) (on 401 response) |
| Session & Role Check | `GET /api/v1/me` | [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts) | [middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts) & [lib/useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx) |
| Executive Overview | `GET /api/v1/admin-dashboard/overview` | Direct fetch | [app/admin/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/page.tsx) |
| Analytics (25 APIs) | `GET /api/v1/admin-dashboard/*` | Inline `fetchAPI()` | [app/admin/analytics/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/analytics/page.tsx) |
| Creator Report (Excel) | `GET /api/v1/admin-dashboard/creator-report/excel` | Direct Axios | [app/admin/revenue/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/revenue/page.tsx) |
| Content CRUD | `GET, POST, PATCH, DELETE /api/v1/content/contents` | [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts) | `movie-management`, `trailer-management`, `ContentEditor` |
| S3 Upload Init | `POST /api/v1/content/content/upload/init` | [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts) | [components/admin/content/ContentEditor.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/admin/content/ContentEditor.client.tsx) |
| Transcoding Progress | `GET /api/v1/content/transcoding-progress/{id}` (SSE) | Native `EventSource` | `movie-management/page.tsx`, `SeriesTree.tsx` |
| Streaming URLs | `GET /api/v1/content/content/{id}/stream` | [lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts) | [app/admin/watch/[id]/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/watch/%5Bid%5D/page.tsx) |
| Payment Plans CRUD | `GET, POST, PUT, DELETE /api/v1/payments/plans` | [lib/paymentsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/paymentsApi.ts) | `payment-plans/page.tsx`, `PlanForm.tsx` |
| Subscriptions Audit | `GET /api/v1/payments/subscriptions` | Direct Axios | [app/admin/subscriptions/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/subscriptions/page.tsx) |
| Pre-Signup Settings | `GET, PATCH /api/v1/platform/pre-signup-settings` | [lib/preSignupApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/preSignupApi.ts) | [app/admin/pre-signup/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/pre-signup/page.tsx) |
| Waitlist Promotion | `POST /api/v1/platform/waitlist/promote` | [lib/preSignupApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/preSignupApi.ts) | `PromoteBatchModal.tsx` |
| Platform Branding | `GET, POST /api/v1/platform/settings` | [lib/platformApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/platformApi.ts) | [app/admin/settings/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/settings/page.tsx) |

---

## 5. Authentication & Permission Rules

1. **Active Authentication System:** Custom JWT Authentication. Do **NOT** attempt to use NextAuth for new admin features. NextAuth code in `lib/auth.ts` is inactive/mocked.
2. **Token Storage:** Access and refresh tokens are stored in:
   - Cookies: `access_token` and `refresh_token` (used by `middleware.ts`).
   - LocalStorage: `urv_access` and `urv_refresh` (fallback for client scripts).
   - Use `getAccessToken()` and `setTokens()` from [lib/tokenStore.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/tokenStore.ts).
3. **Role Authorization:** Only users with `role === 'admin'` can access `/admin/*`.
   - In [middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts), every route matching `/admin/:path*` validates `access_token` against `GET /api/v1/me`. If `role !== 'admin'`, the user is redirected to `/`.
   - In [LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx), any login returning `role: 'user'` or `role: 'beta_tester'` is rejected before routing.
4. **Token Refresh:** Automatic token refresh on 401 is built into `useAuth.tsx`. If an API call fails with 401, `attemptTokenRefresh()` issues `POST /api/v1/token/refresh` with the refresh token.

---

## 6. Database Models & Schema Relationships

The Next.js application does not connect directly to a database; all database operations are managed by the external Django REST Framework backend.

### Key Backend Models
- **`Content`:** Movies, series, episodes, trailers, documentaries. Key fields: `id`, `title`, `content_type`, `media_type` (flat vs VR), `status`, `visibility_mode`, `is_kid_safe`, `is_ppv`, `price`, `genres`, `parent` (self-referencing FK), `duration_seconds`.
- **`ContentMetadata`:** One-to-one with `Content`. Stores `directors`, `producers`, `cast`, `release_year`, `language`, `subtitles_available`, `production_company`, `awards`.
- **`Asset` & `Rendition`:** One-to-many with `Content`. Raw S3 upload keys and transcoded stream bitrates (`stream_url`, `label`, `width`, `height`, `bitrate`).
- **`Creator`:** Independent studios and production partners (`name`, `bio`, `email`, `phone`).
- **`User`:** Master platform accounts (`email`, `name`, `role`, `status: 'active' | 'banned' | 'suspended'`, `subscription_tier`).
- **`Profile`:** Sub-profiles under a master user (`display_name`, `is_kids_profile`, `is_profile_locked`, `pin`, `maturity_rating`).
- **`PaymentPlan`:** Commercial tiers (`name`, `price`, `duration_days`, `max_devices`, `max_profiles`, `can_access_premium`, `ad_supported`, `stripe_price_id`).
- **`Subscription`:** User subscription instances (`user`, `plan`, `status: 'active' | 'trialing' | 'canceled'`, `stripeSubscriptionId`).
- **`PreSignupSettings` & `WaitlistEntry`:** Quota management (`pre_signup_capacity`, `pre_signup_trial_days`) and waitlist candidate queue.

---

## 7. Reusable Components & Services

When building new features, **always reuse existing components and services** instead of writing redundant code:

1. **Content Wizard:** [components/admin/content/ContentEditor.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/admin/content/ContentEditor.client.tsx) — Full slide-over wizard handling metadata, video uploads, Drive imports, subtitles, and dubbing.
2. **Hierarchical Tree:** [components/SeriesTree.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/SeriesTree.tsx) — Accordion tree for multi-tier content hierarchies.
3. **Google Drive Uploader:** [components/GoogleDriveUploadButton/GoogleDriveButton.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/GoogleDriveUploadButton/GoogleDriveButton.tsx) — Ready-to-use Google Picker integration.
4. **Subscription Form:** [components/PlanForm/PlanForm.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/PlanForm/PlanForm.tsx) — Prebuilt payment plan creation and editing form.
5. **Slide-Over Drawers:** [components/Creator/CreatorDrawer.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/Creator/CreatorDrawer.tsx) — Standardized slide-over drawer layout.
6. **Deletion Dialogs:** [components/Creator/DeleteConfirmationDialog.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/Creator/DeleteConfirmationDialog.tsx) — Reusable animated confirmation modal.
7. **Skeleton Loaders:** [components/Loader/SkeletonLoader.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/Loader/SkeletonLoader.tsx) — Standard loading shimmer.
8. **Video Players:** [components/ShakaPlayer/ShakaPlayer.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/ShakaPlayer/ShakaPlayer.tsx) (DASH/HLS DRM player) and [components/VrAframePlayer/VRAframePlayer.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/VrAframePlayer/VRAframePlayer.tsx) (WebXR 180°/360° player).

---

## 8. Known Issues & Limitations to Be Aware Of

1. **Hardcoded Domain in Movie SSE:** [movie-management/page.tsx:88](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/movie-management/page.tsx#L88) hardcodes `https://api.urview.com/` for Server-Sent Events. If changing API endpoints or deploying to staging, update this to use `API_BASE`.
2. **Conflicting Profiles APIs:** [app/admin/user-profiles/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/user-profiles/page.tsx) uses direct Axios calls to `/api/v1/accounts/profiles/`, bypassing [lib/profilesApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/profilesApi.ts) which targets `/api/v1/profiles`.
3. **Silent Fallback Data in Analytics:** If backend endpoints fail, [app/admin/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/page.tsx) and [app/admin/analytics/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/analytics/page.tsx) automatically fall back to hardcoded mock numbers. Do not confuse mock numbers with live production metrics.
4. **Premiere Management Stub:** [app/admin/premiere/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/premiere/page.tsx) is currently an unbuilt placeholder.
5. **Orphaned Content Management Views:** Editorial components `LandingPageContentManagement` and `LoginScreenContentManagement` exist in `components/` and have full API support in `lib/additionalSettingsApi.ts`, but are not mounted in `/admin/additional-settings`.
6. **No Automated Tests:** The repository has zero test files; manual verification is required after making changes.

---

## 9. Critical Constraints for Making Safe Changes

1. **Do NOT Replace the Active Auth Flow:** Do not attempt to re-enable NextAuth for `/admin/*` routes unless explicitly directed. The active admin system relies strictly on custom JWT tokens stored in cookies and validated via `GET /api/v1/me`.
2. **Preserve Fallback Structures:** In analytical views (`analytics/page.tsx`), retain fallback mappings so the dashboard continues to render during backend maintenance or in offline development modes.
3. **Preserve Video Projection Enums:** The video projection model (`media_type: 'flat' | 'vr_360_mono' | 'vr_360_sbs' | 'vr_360_tb' | 'vr_180_mono' | 'vr_180_sbs' | 'vr_180_tb'`) is tightly coupled with both the DRF backend database choices and the A-Frame player. Do not alter these enum values.
4. **Avoid Heavy File Uploads through Next.js:** All video files must be uploaded **directly from the browser to AWS S3** via presigned POST or multipart URLs (`lib/uploadHelper.ts`). Never proxy large media files through Next.js server actions or API routes.
5. **Never Commit Secrets:** Do not hardcode API keys, AWS credentials, or Stripe secrets. Use `.env.example` as the schema template.

---

## 10. Documentation Index & Cross-References

For deeper technical exploration into specific subsystems, refer to the following companion documents:

- 📖 **[APPLICATION_OVERVIEW.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/APPLICATION_OVERVIEW.md):** Executive overview, user personas, technology stack, directory layout, and environment variables.
- 📋 **[ADMIN_MODULES.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/ADMIN_MODULES.md):** Granular page-by-page inventory of all 19 admin routes, UI components, user actions, and data sources.
- 🔌 **[API_REFERENCE.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/API_REFERENCE.md):** Complete catalog of all 60+ API endpoints, request payloads, responses, call chains, and verification statuses.
- 🔐 **[AUTH_AND_PERMISSIONS.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/AUTH_AND_PERMISSIONS.md):** Complete authentication lifecycle, token refresh logic, edge middleware analysis, and RBAC rules.
- 🗄️ **[DATA_MODELS.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/DATA_MODELS.md):** Full entity schemas, TypeScript types, relationships, enums, and database mapping.
- 🏗️ **[ARCHITECTURE_AND_INTEGRATIONS.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/ARCHITECTURE_AND_INTEGRATIONS.md):** System architecture, AWS pipeline, Stripe, Google Drive Picker, and DRM players.
- ⚠️ **[KNOWN_ISSUES.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/KNOWN_ISSUES.md):** Prioritized inventory of all identified bugs, technical debt, and security considerations.
- 📊 **[IMPLEMENTATION_STATUS.md](file:///c:/Users/Mubashir/Desktop/Saim/OTT/docs/technical-handover/IMPLEMENTATION_STATUS.md):** Feature-by-feature matrix classifying every capability as Implemented, Partial, Mocked, or Planned.
