# Application Overview — URVIEW OTT Admin Platform

## 1. Executive Summary & Purpose

**URVIEW** (also referred to as UR VIEW) is an enterprise-grade Over-The-Top (OTT) streaming and digital media distribution platform. The platform is designed to distribute standard 2D video (cinema, serialized television shows, trailers, documentaries) alongside spatial and virtual reality media (180° and 360° monoscopic and stereoscopic formats) directly to web and mobile browsers without requiring proprietary app downloads.

The codebase audited here represents the **OTT Admin Panel & Web Application Client**, built with Next.js 14 (App Router). It serves as the operational headquarters for platform operators, administrators, content managers, and operations personnel to monitor platform health, ingest media, orchestrate cloud transcoding, configure monetization tiers, manage user access, oversee creators, and control global system settings.

### Primary Use Cases
1. **Catalog & Media Management:** Creation, editing, tagging, metadata assignment, and publishing of movies, series, seasons, episodes, trailers, and documentaries.
2. **Cloud Video Ingestion & Processing:** Multi-part direct browser-to-S3 uploads, Google Drive asset imports, triggering AWS MediaConvert transcoding pipelines, and tracking real-time encoding progress via Server-Sent Events (SSE).
3. **Monetization & Subscription Management:** Configuration of recurring subscription plans (pricing, device limits, profile limits, ad tiers), Stripe checkout generation, and user subscription lifecycle monitoring.
4. **Creator & Revenue Operations:** Onboarding content creators, tracking performance metrics, auditing creator revenue splits, and generating/exporting financial reports to Excel.
5. **Audience & Access Governance:** User account management (status, activation, roles), pre-signup waitlist management with cohort promotions, and multi-profile parental control management.
6. **Platform Branding & Content Customization:** Managing hero banner copy, footer links, branding logos, colors, and frequently asked questions (FAQs).
7. **Business & Streaming Analytics:** Monitoring 25+ real-time business and engagement metrics including churn, peak viewing hours, watch completion rates, device breakdown, and revenue time-series.

---

## 2. Application Type & Target Users

- **Application Type:** Single Page / Server-Rendered Enterprise Web Application (B2B / Internal Back-Office Operations Tool with customer-facing authentication and preview capabilities).
- **Target User Personas:**
  - **Super Administrators / Platform Owners:** Full system control, financial reporting, system configurations, and subscription plan pricing.
  - **Content Managers / Media Operators:** Media uploading, metadata curation, transcoding status monitoring, publishing workflows, dubbing/subtitle track management.
  - **Customer Support Agents:** User lookups, subscription status checks, troubleshooting customer access issues, waitlist management.
  - **Content Creators:** Creators whose assets and revenue allocations are administered through the creator module.

---

## 3. High-Level Architecture

The platform operates under a hybrid client-server model:
```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 14 FRONTEND CLIENT                      │
│                                                                        │
│  Admin Dashboard UI  •  ECharts Analytics  •  Shaka & A-Frame Players │
│  Client Forms (Sonner, Framer Motion) • Multi-part XHR / S3 Uploaders  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
┌───────────────────────────────┐          ┌─────────────────────────────┐
│    NEXT.JS ROUTE HANDLERS     │          │    EXTERNAL BACKEND API     │
│       (app/api/*)             │          │  (Django / DRF @ API_BASE)  │
│                               │          │                             │
│ • /api/admin/content (Mock)   │          │ • /api/v1/login, me, refresh│
│ • /api/catalog (JSON Catalog) │          │ • /api/v1/content/contents  │
│ • /api/checkout (Stripe Mock) │          │ • /api/v1/payments/plans    │
│ • /api/settings/devices       │          │ • /api/v1/admin-dashboard/* │
│ • /api/stripe/webhook         │          │ • /api/v1/platform/*        │
│ • /api/upload (S3 Presigning) │          │ • /api/v1/users             │
└───────────────────────────────┘          └──────────────┬──────────────┘
                                                          │
                                           ┌──────────────┴──────────────┐
                                           ▼                             ▼
                                    ┌──────────────┐             ┌──────────────┐
                                    │ AWS S3 / DRM │             │  POSTGRESQL  │
                                    │ MediaConvert │             │   DATABASE   │
                                    └──────────────┘             └──────────────┘
```

1. **Frontend Presentation Layer (`app/admin/*`, `components/*`):**
   - Built on React 18 and Next.js 14 App Router.
   - Client components (`'use client'`) drive rich interactive tables, modals, drawers, and form wizards.
   - Responsive design with collapsible sidebar navigation, breadcrumbs, dark/light theme switching, and desktop/mobile drawer layouts.
2. **API Integration & Service Layer (`lib/*`):**
   - Centralized Axios and native Fetch service modules (`contentApi.ts`, `paymentsApi.ts`, `preSignupApi.ts`, `creatorApi.ts`, `userApi.ts`, `platformApi.ts`, `additionalSettingsApi.ts`, `faq.ts`, `authApi.ts`).
   - Token storage (`tokenStore.ts`) persisting JWTs in `js-cookie` (`access_token`, `refresh_token`) and `localStorage` (`urv_access`, `urv_refresh`).
3. **Internal Next.js Route Handlers (`app/api/*`):**
   - Standalone endpoints providing mock data, Stripe webhook processing, device session mocking, and local S3 upload presigning.
4. **External Backend Services:**
   - Primary REST API powered by a Django REST Framework (DRF) backend hosted at `https://api.urview.com/` (configured via `NEXT_PUBLIC_API_BASE`).
   - Cloud media processing pipeline utilizing AWS S3, AWS MediaConvert, and AWS Lambda functions (`lambda/mediaProcessor.js`, `lambda/imageProcessor.js`).

---

## 4. Technology Stack & Important Dependencies

### Core Framework & Runtime
- **Node.js:** `>=18.0.0`
- **Package Manager:** `pnpm` (`>=8.0.0`) / `npm` (with `package-lock.json` present)
- **Framework:** Next.js 14.0.4 (App Router)
- **Language:** TypeScript 5.3.3 (Strict mode enabled)
- **UI Runtime:** React 18.2.0, React DOM 18.2.0

### Styling & Design System
- **TailwindCSS:** `3.4.0` with `tailwindcss-animate` (`1.0.7`) and `postcss` (`8.4.32`)
- **Typography:** Custom font loader using Google Fonts (`League Spartan` from `fonts/fonts.ts`)
- **Theme:** Dual Light/Dark mode managed via React Context (`components/theme/ThemeContext.tsx`) and persistent `admin-theme` local storage flag.
- **Icons:** `react-icons` (5.5.0) providing Feather (`fi`), Bootstrap (`bs`), Boxicons (`bi`), Game Icons (`gr`), and Lucide (`lu`).

### UI Components, Animation & Visualization
- **Framer Motion:** `12.26.2` for smooth page entries, slide-overs, and modal transitions.
- **ECharts & ECharts for React:** `echarts@6.0.0` & `echarts-for-react@3.0.5` powering multi-series line charts, donut charts, gauge meters, and bar charts.
- **Toast Notifications:** `sonner@2.0.7` for actionable toasts and alerts.
- **Utility:** `clsx` (`2.1.1`) for conditional class concatenation.

### Media & Video Players
- **Shaka Player:** `shaka-player@4.16.14` (Google Shaka player supporting DASH, HLS, Widevine/ClearKey DRM).
- **HLS.js:** `hls.js@1.6.15` for adaptive HTTP Live Streaming.
- **WebXR & 3D / VR:** `three@0.160.0`, `@react-three/fiber@8.15.12`, `@react-three/drei@9.92.7`, and `aframe@1.7.1` for 360°/180° spatial video viewing.

### Cloud, Storage & Payments
- **AWS SDK v3:** `@aws-sdk/client-s3@^3.490.0`, `@aws-sdk/s3-request-presigner@^3.490.0`.
- **Stripe:** `stripe@14.10.0` (server SDK) and `@stripe/stripe-js@2.4.0` (client SDK).
- **Google Picker API:** Integrated via Google Identity Services (`gsi/client`) and `gapi` script for Google Drive video import.

---

## 5. Project Directory Structure

```
c:\Users\Mubashir\Desktop\Saim\OTT\
├── app/                              # Next.js App Router root
│   ├── admin/                        # Admin panel protected pages & layouts
│   │   ├── additional-settings/      # Footer & landing page text management
│   │   ├── analytics/                # Comprehensive 25-metric analytics dashboard
│   │   ├── content/                  # Legacy mock catalog flag manager
│   │   ├── creator/                  # Content creator CRUD & performance
│   │   ├── documentary-management/   # Documentaries catalog & publishing
│   │   ├── faqs/                     # Platform FAQs CRUD
│   │   ├── movie-management/         # Movies catalog, SSE progress, and editing
│   │   ├── payment-plans/            # Subscription tier definitions & Stripe pricing
│   │   │   ├── add/                  # Add payment plan page
│   │   │   └── [id]/                 # Edit payment plan dynamic route
│   │   ├── pre-signup/               # Waitlist, quota tracking & batch promotion
│   │   ├── premiere/                 # PPV Premiere titles management (stub)
│   │   ├── revenue/                  # Creator revenue reporting & Excel export
│   │   ├── series-management/        # Series, season & episode hierarchy tree
│   │   ├── settings/                 # Global platform settings & branding
│   │   ├── subscriptions/            # User subscriptions audit & filtering
│   │   ├── trailer-management/       # Movie & series trailers management
│   │   ├── user-profiles/            # Multi-profile accounts & parental controls
│   │   ├── users/                    # Platform user account administration
│   │   ├── watch/[id]/               # Admin internal Shaka/VR playback preview
│   │   ├── layout.tsx                # Admin layout (Sidebar, Navbar, Theme, Platform Settings)
│   │   └── page.tsx                  # Admin dashboard overview
│   ├── api/                          # Internal Next.js API Route Handlers
│   │   ├── admin/content/            # Local content flag persistence
│   │   ├── auth/[...nextauth]/       # NextAuth handler (placeholder / disabled)
│   │   ├── catalog/                  # Local mock catalog queries
│   │   ├── checkout/                 # Local mock checkout session creator
│   │   ├── health/                   # API health check endpoint
│   │   ├── leads/                    # Email lead capture endpoint
│   │   ├── settings/devices/         # Local active device management
│   │   ├── stripe/webhook/           # Stripe subscription webhook processor
│   │   └── upload/                   # Local S3 presigned URL generator
│   ├── login/page.tsx                # Forwarding wrapper to root login
│   ├── layout.tsx                    # Root HTML layout and providers
│   ├── loading.tsx                   # Top-level fallback loader
│   ├── not-found.tsx                 # 404 error screen
│   └── page.tsx                      # Root Landing & Administrative Login Screen
├── components/                       # Shared UI and modular admin components
│   ├── admin/content/                # ContentEditor, Dubbing, Subtitle, Progress
│   ├── AdminNavbar/                  # Top sticky navbar with breadcrumbs & user menu
│   ├── AdminSidebar/                 # Desktop sidebar & mobile drawer navigation
│   ├── auth/                         # LoginForm.client.tsx and SignupForm.client.tsx
│   ├── Content/                      # Content cards, filters, tables, stats modals
│   ├── Creator/                      # Creator tables, drawers, stat cards
│   ├── FaqForm/                      # FAQ creation and edit modal
│   ├── GoogleDriveUploadButton/      # Google Picker integration component
│   ├── PlanForm/                     # Payment plan creation and edit modal
│   ├── SeriesTree.tsx                # Expandable Series -> Seasons -> Episodes tree
│   ├── ShakaPlayer/                  # DRM & DASH video player
│   ├── VrAframePlayer/               # A-Frame WebXR 360/180 video player
│   └── theme/ThemeContext.tsx        # Dark/Light theme state
├── fonts/fonts.ts                    # Google Fonts (League Spartan) definition
├── lambda/                           # AWS Lambda functions for S3 video/image ingest
│   ├── mediaProcessor.js             # S3 -> MediaConvert HLS transcode trigger
│   └── imageProcessor.js             # S3 -> Sharp poster/banner/thumbnail resizer
├── lib/                              # Core API services, configurations & adapters
│   ├── additionalSettingsApi.ts      # Landing, login & footer content API
│   ├── adminFlags.ts                 # In-memory title visibility flag store
│   ├── api.ts                        # Axios instance and generic fetch wrappers
│   ├── auth.ts                       # NextAuth options & mock session guards
│   ├── authApi.ts                    # Real DRF authentication API client
│   ├── config.ts                     # Central configuration & mock mode switches
│   ├── contentApi.ts                 # Full content, asset, rendition, upload API
│   ├── creatorApi.ts                 # Creator accounts API
│   ├── faq.ts                        # Platform FAQ API
│   ├── paymentsApi.ts                # Plans, subscriptions & checkout API
│   ├── platformApi.ts                # Branding & platform settings API
│   ├── platformSettings.tsx          # Platform settings React Context provider
│   ├── preSignupApi.ts               # Waitlist & trial quota API
│   ├── profilesApi.ts                # User sub-profile & PIN verification API
│   ├── tokenStore.ts                 # Cookies & LocalStorage token manager
│   ├── types.ts                      # Shared core types & enums
│   ├── types/content.ts              # Content management types & payloads
│   ├── uploader.ts                   # XHR file upload with progress tracking
│   ├── uploadHelper.ts               # S3 presigned post & multipart helper
│   ├── useAuth.tsx                   # Global AuthContext & hook
│   └── userApi.ts                    # Users CRUD API client
├── middleware.ts                     # Next.js edge route protection & role verification
├── players/                          # Specialized media player wrappers
├── styles/globals.css                # Global CSS styles & animations
└── netlify.toml                      # Netlify deployment configuration
```

---

## 6. Application Entry Points, Layouts & Routing

### Application Entry Points
- **Root URL (`/`):** Defined in [app/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/page.tsx). Renders the URVIEW branded login interface alongside marketing hero copy and feature highlights.
- **Login Route (`/login`):** Defined in [app/login/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/login/page.tsx). Seamlessly delegates to `app/page.tsx`.
- **Admin Root (`/admin`):** Defined in [app/admin/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/page.tsx). The main Executive Overview dashboard.

### Layout System
1. **Root Layout (`app/layout.tsx`):**
   - Wraps the entire application with `AuthProvider` (`lib/useAuth.tsx`), Sonner `Toaster`, and HTML root headers.
2. **Admin Layout (`app/admin/layout.tsx`):**
   - Wraps all `/admin/*` routes.
   - Embeds `PlatformSettingsProvider` (`lib/platformSettings.tsx`) and `ThemeProvider` (`components/theme/ThemeContext.tsx`).
   - Implements anti-flash inline script for dark mode resolution.
   - Renders the responsive frame:
     - Desktop sidebar (`components/AdminSidebar/AdminSidebar.tsx` — 260px expanded, 76px collapsed).
     - Mobile drawer (`components/AdminSidebar/MobileAdminNav.tsx`).
     - Sticky top navbar (`components/AdminNavbar/AdminNavbar.tsx` — 64px height with breadcrumb generator, theme toggle, profile menu, and logout).
     - Main content container with dynamic padding transition (`md:pl-[260px]` vs `md:pl-[76px]`).

---

## 7. Authentication & Authorization Summary

The application contains two distinct authentication systems:

| System | Files | Implementation Status | Used In Admin Panel? |
|---|---|---|---|
| **Custom JWT Auth** | [authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts), [useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx), [tokenStore.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/tokenStore.ts), [middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts), [LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx) | **Fully Implemented** | **YES — Primary System** |
| **NextAuth.js** | [auth.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/auth.ts), [adapter.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/db/adapter.ts), [app/api/auth/[...nextauth]/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/auth/[...nextauth]/route.ts) | **Partially Implemented / Disabled** | **NO** (Commented out in active admin flows) |

### Active Custom JWT Workflow
1. User enters email, password, and optional 2FA token on [app/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/page.tsx).
2. [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts) sends `POST ${API_BASE}api/v1/login`.
3. If response indicates `two_factor_required: true`, the UI toggles the 2FA input field.
4. Tokens (`access_token` and `refresh_token`) are stored in `js-cookie` (accessible to middleware) and `localStorage`.
5. Frontend checks user role: only `role === 'admin'` is granted access; `user` and `beta_tester` roles receive an access denied toast.
6. [middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts) intercepts all requests to `/admin/:path*`:
   - Checks `request.cookies.get('access_token')`. If absent, redirects to `/`.
   - If present and not in mock mode, executes `GET ${apiBase}api/v1/me` with a 7000ms timeout.
   - Verifies `role === 'admin'`. If mismatched, redirects to `/`.

---

## 8. Database Architecture & Schema Models

### Production Database
- Hosted and managed externally by the Django DRF backend (typically PostgreSQL as documented in `.env.example`).
- The Next.js frontend has **no direct database connection** (no Prisma, Drizzle, or raw SQL clients configured).

### Local & Mock Data Stores
- **In-Memory Mock Adapter (`lib/db/adapter.ts`):** Stores in-memory user objects (`mockUsers`) and device registrations (`mockDevices`).
- **Static Catalog File (`lib/data/catalog.json`):** 12KB static JSON file containing 20+ titles with tags, ratings, and image links used for offline testing and fallback catalog rendering.
- **In-Memory Title Flags (`lib/adminFlags.ts`):** In-memory dictionary tracking `visibleWithoutSignup` and `isDemoContent` boolean overrides.

---

## 9. External Integrations & Services

1. **Backend API (`API_BASE`):**
   - Main backend endpoint (`https://api.urview.com/` or AWS API Gateway).
2. **AWS S3 & MediaConvert:**
   - Raw media storage bucket (`S3_UPLOAD_BUCKET`) and processed CDN bucket (`S3_PROCESSED_BUCKET`).
   - Direct presigned browser uploads using `AWS SDK S3Client` and presigned POST URLs.
   - Real-time transcoding status via Server-Sent Events (`EventSource`).
3. **Google Drive Picker API:**
   - Loads `https://apis.google.com/js/api.js` and `https://accounts.google.com/gsi/client`.
   - Allows content operators to import videos directly from Google Drive into the transcoding pipeline.
4. **Stripe:**
   - Handles subscriptions and one-time PPV premiere ticket purchases.
   - Client-side checkout redirection via `createSubscriptionCheckout` in [lib/paymentsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/paymentsApi.ts).
   - Webhook processor implemented in [app/api/stripe/webhook/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/stripe/webhook/route.ts).
5. **Headless WordPress (Blog):**
   - Integration module in [lib/wordpress.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/wordpress.ts) configured to consume WP REST API (`/wp-json/wp/v2`) for platform editorial articles.

---

## 10. Environment Variables Inventory

| Variable Name | Exposure | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | Client & Server | Base URL of the backend API (e.g. `https://api.urview.com/`). |
| `NEXT_PUBLIC_FRONTEND_BASE` | Client & Server | Base URL of the frontend web application (e.g. `http://localhost:3000/`). |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Client & Server | Flag (`'true'` / `'false'`) enabling complete offline fallback mode. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client | Google OAuth Client ID for Google Drive Picker API. |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Client | Google Developer API Key for Google Picker service. |
| `NEXT_PUBLIC_S3_CALLBACK_KEY` | Client & Server | API Key used for S3 upload callback validation during dev simulation. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Stripe public key for client-side Stripe Elements or redirects. |
| `STRIPE_SECRET_KEY` | Server Only | Stripe secret key for backend API operations and checkout generation. |
| `STRIPE_WEBHOOK_SECRET` | Server Only | Signing secret for validating incoming Stripe webhook events. |
| `STRIPE_PRICE_ID_KIDS` | Server Only | Stripe Price ID for the Kids Subscription Plan. |
| `STRIPE_PRICE_ID_FULL` | Server Only | Stripe Price ID for the Full Access Subscription Plan. |
| `NEXTAUTH_URL` | Server Only | Canonical URL for NextAuth.js callbacks. |
| `NEXTAUTH_SECRET` | Server Only | Encryption key for NextAuth JWT token encryption. |
| `GOOGLE_CLIENT_ID` | Server Only | Server-side OAuth client ID for Google provider. |
| `GOOGLE_CLIENT_SECRET` | Server Only | Server-side OAuth client secret for Google provider. |
| `GITHUB_CLIENT_ID` | Server Only | Server-side OAuth client ID for GitHub provider. |
| `GITHUB_CLIENT_SECRET` | Server Only | Server-side OAuth client secret for GitHub provider. |
| `DATABASE_URL` | Server Only | PostgreSQL database connection string (for production migration). |
| `AWS_REGION` | Server Only | AWS region for S3 and MediaConvert (e.g., `us-east-1`). |
| `AWS_ACCESS_KEY_ID` | Server Only | AWS IAM credentials for S3 uploads and presigning. |
| `AWS_SECRET_ACCESS_KEY` | Server Only | AWS IAM secret key for S3 uploads. |
| `S3_UPLOAD_BUCKET` | Server Only | S3 bucket name receiving raw video and image uploads. |
| `S3_PROCESSED_BUCKET` | Server Only | S3 bucket hosting transcoded HLS/DASH outputs. |
| `WORDPRESS_API_URL` / `NEXT_PUBLIC_WORDPRESS_API_URL` | Client & Server | Headless WordPress endpoint for blog posts. |
| `WORDPRESS_PREVIEW_SECRET` | Server Only | Secret token for draft post previewing. |
| `NODE_ENV` | Client & Server | Node environment (`development` / `production`). |

---

## 11. Implementation State Categorization

- **Fully Implemented & Connected to Real Backend:**
  - Administrative Login with 2FA, JWT handling, and Cookie storage ([LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx)).
  - Middleware route protection and token verification ([middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts)).
  - Movie, Series, Season, Episode, and Trailer management ([movie-management](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/movie-management/page.tsx), [series-management](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/series-management/page.tsx), [trailer-management](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/trailer-management/page.tsx)).
  - Creator management & Creator Revenue Reporting with Excel export ([creator](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/creator/page.tsx), [revenue](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/revenue/page.tsx)).
  - Pre-Signup, Trial Quotas, and Waitlist batch promotion ([pre-signup](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/pre-signup/page.tsx)).
  - Platform FAQs management ([faqs](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/faqs/page.tsx)).
  - Payment Plans CRUD and Subscriptions auditing ([payment-plans](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/payment-plans/page.tsx), [subscriptions](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/subscriptions/page.tsx)).
  - Platform branding & logo uploading ([settings](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/settings/page.tsx)).
  - Google Drive upload picker integration ([GoogleDriveButton.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/GoogleDriveUploadButton/GoogleDriveButton.tsx)).
  - Video streaming preview with Shaka DRM player & A-Frame WebXR player ([watch/[id]](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/watch/%5Bid%5D/page.tsx)).
- **Partially Implemented with High-Fidelity Fallbacks:**
  - Executive Overview Dashboard ([app/admin/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/page.tsx)) — fetches real backend metrics; if offline, displays rich mock data.
  - Analytics Dashboard ([app/admin/analytics/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/analytics/page.tsx)) — queries 25 distinct backend endpoints; contains fallbacks for every single endpoint.
  - Additional Settings ([app/admin/additional-settings/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/additional-settings/page.tsx)) — only renders Footer Content component; landing page and login screen management components exist in `components/` but are omitted from this page.
- **Mocked / Legacy:**
  - Legacy Content Page ([app/admin/content/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/content/page.tsx)) — uses local `catalog.json` and in-memory flags.
  - User Profiles Page ([app/admin/user-profiles/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/user-profiles/page.tsx)) — calls `/api/v1/accounts/profiles/` directly using Axios rather than the service in `lib/profilesApi.ts`.
- **Planned / Stub Only:**
  - Premiere Management ([app/admin/premiere/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/premiere/page.tsx)) — contains only a plain placeholder header with a TODO comment.
