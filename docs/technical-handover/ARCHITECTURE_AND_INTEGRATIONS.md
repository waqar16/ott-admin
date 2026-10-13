# Architecture & Integrations — URVIEW OTT

This document provides a technical overview of the system architecture, frontend design patterns, backend API communication protocols, and third-party cloud integrations in the URVIEW application.

---

## 1. High-Level System Architecture

```
                       ┌─────────────────────────────────────────┐
                       │          CLIENT WEB BROWSER             │
                       │   (Next.js 14 App Router Frontend)      │
                       └─────┬─────────────────────────────┬───────┘
                             │                             │
              Direct Video   │                             │ REST API Calls
              Multipart XHR  │                             │ (Axios / Fetch)
                             ▼                             ▼
               ┌───────────────────────┐     ┌───────────────────────────┐
               │    AWS S3 UPLOADS     │     │   DJANGO REST FRAMEWORK   │
               │        BUCKET         │     │        BACKEND API        │
               └───────────┬───────────┘     │    (https://api.urview.com)│
                           │                 └─────────────┬─────────────┘
                  S3 Event │                               │
                  Trigger  │                               │ Database / ORM
                           ▼                               ▼
               ┌───────────────────────┐             ┌───────────┐
               │   AWS LAMBDA & AWS    │             │ POSTGRESQL│
               │     MEDIACONVERT      │             │ DATABASE  │
               └───────────┬───────────┘             └───────────┘
                           │
                 Transcoded│ HLS/DASH + DRM
                 Outputs   ▼
               ┌───────────────────────┐
               │  AWS S3 PROCESSED     │
               │   CDN CLOUDFRONT      │
               └───────────────────────┘
```

The platform separates the **interactive administrative interface** from the **heavy media processing pipeline**:
1. The **Next.js Web Client** renders administrative forms, triggers API mutations, and connects directly to AWS S3 using presigned upload credentials for video ingestion, avoiding file uploads through the web server.
2. The **Django REST Framework (DRF) Backend** acts as the single source of truth for database operations, business logic, authentication, DRM license tokens, and analytical aggregations.
3. The **Serverless Cloud Transcoding Pipeline** converts raw uploaded video assets into adaptive multi-bitrate HLS and DASH renditions, extracting poster frames and WebP thumbnails.

---

## 2. Frontend Architecture & UI System

### A. Routing & Layout Architecture
- Built on **Next.js 14 App Router**.
- **Root Layout (`app/layout.tsx`):** Hosts the global `AuthProvider` ([lib/useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx)), Sonner `Toaster`, and HTML document wrapper.
- **Admin Layout (`app/admin/layout.tsx`):** Protects and wraps all administrative pages:
  - Injects `PlatformSettingsProvider` ([lib/platformSettings.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/platformSettings.tsx)) for global site name and logo state.
  - Injects `ThemeProvider` ([components/theme/ThemeContext.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/theme/ThemeContext.tsx)) for dark/light mode toggling.
  - Controls responsive sidebar collapse states (`sidebarCollapsed` boolean) and dynamic main container margin adjustments (`md:pl-[260px]` vs `md:pl-[76px]`).
  - Emits a custom window `resize` event after sidebar transitions (300ms) to ensure ECharts instances automatically resize.

### B. Navigation & Sidebar
- **Desktop Sidebar (`components/AdminSidebar/AdminSidebar.tsx`):**
  - Features collapsible accordion sections for Users, Content, FAQs, and Payments.
  - Includes custom tooltips (`SidebarTooltip.tsx`) active when the sidebar is collapsed into icon-only mode.
  - Automatically auto-expands parent dropdown accordions based on the active route matching `usePathname()`.
- **Mobile Navigation (`components/AdminSidebar/MobileAdminNav.tsx`):**
  - Provides a slide-over mobile drawer triggered via the hamburger menu on the sticky navbar.
- **Top Sticky Navbar (`components/AdminNavbar/AdminNavbar.tsx`):**
  - Generates dynamic breadcrumb links from route path segments.
  - Integrates theme toggle button (`FiSun` / `FiMoon`).
  - Provides administrator profile dropdown with direct signout execution.

### C. State Management
The application avoids bulky state containers (e.g. Redux) in favor of localized React state and context providers:
1. **`AuthContext` (`lib/useAuth.tsx`):** Tracks `user`, `isLoggedIn`, `loading`, `login()`, `signup()`, `logout()`, and `refreshUser()`.
2. **`ThemeContext` (`components/theme/ThemeContext.tsx`):** Controls light/dark mode and synchronizes with `localStorage.getItem('admin-theme')`.
3. **`PlatformSettingsContext` (`lib/platformSettings.tsx`):** Caches global branding parameters (logo URL, site title, support email).

### D. Component Reuse & Design System
Future development should prioritize reusing these existing components:
- **`ContentEditor` (`components/admin/content/ContentEditor.client.tsx`):** The comprehensive 120KB media editing modal; manages metadata, tags, Google Drive imports, video uploading, subtitles, and audio dubbing.
- **`SeriesTree` (`components/SeriesTree.tsx`):** Hierarchical series tree for accordion rendering of multi-season, multi-episode content.
- **`PlanForm` (`components/PlanForm/PlanForm.tsx`):** Reusable form for configuring subscription rules.
- **`GoogleDriveButton` (`components/GoogleDriveUploadButton/GoogleDriveButton.tsx`):** Plug-and-play Google Picker upload button.
- **`SkeletonLoader` (`components/Loader/SkeletonLoader.tsx`):** Standard animated placeholder skeleton.
- **`DeleteConfirmationDialog` (`components/Creator/DeleteConfirmationDialog.tsx`):** Reusable destructive confirmation modal.

### E. Data Visualization Ecosystem
- **ECharts 6.0.0 & echarts-for-react 3.0.5:** Used across `/admin` and `/admin/analytics`.
- Automatically adjusts color schemes, grid lines, and axis labels based on `useTheme()` (`theme === 'dark' ? '#9ca3af' : '#4b5563'`).
- Supports bar charts, area charts, line series, donut charts, and gauge meters.

---

## 3. External Integrations Architecture

### A. AWS Media Processing Pipeline
Implemented in `lambda/mediaProcessor.js` and `lambda/imageProcessor.js`:
1. **Video Ingestion:**
   - Raw video uploaded by the browser directly to S3 bucket `S3_UPLOAD_BUCKET` under prefix `uploads/video/{content_id}/{filename}`.
   - S3 emits a `s3:ObjectCreated:Put` notification triggering AWS Lambda `mediaProcessor.js`.
2. **Transcoding (AWS MediaConvert):**
   - Lambda creates a job in AWS MediaConvert using endpoint `MEDIACONVERT_ENDPOINT` and IAM role `MEDIACONVERT_ROLE`.
   - Transcodes source into multi-bitrate HLS streams (1080p, 720p, 480p, 360p).
   - Generates video frame thumbnail sprites.
   - Stores transcoded outputs in `S3_PROCESSED_BUCKET`.
   - Updates status records in DynamoDB (`DYNAMODB_TABLE`).
3. **Image Resizing (AWS Lambda + Sharp):**
   - Image uploads to S3 trigger `imageProcessor.js`.
   - Generates multi-density WebP variants for posters, banners, and thumbnails.

### B. Google Drive Picker Integration
- Handled by [components/GoogleDriveUploadButton/GoogleDriveButton.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/GoogleDriveUploadButton/GoogleDriveButton.tsx).
- Dynamically injects `https://apis.google.com/js/api.js` (`gapi`) and `https://accounts.google.com/gsi/client` (`google.accounts.oauth2`).
- Uses `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_API_KEY`.
- Allows operators to authenticate their Google account, browse their Drive, and pass the selected file ID and OAuth token to `initUpload()`, enabling backend ingestion without downloading large files locally.

### C. Stripe Billing & Checkout Integration
- **Subscriptions:**
  - Admin defines Stripe Price IDs in [Payment Plans](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/payment-plans/page.tsx).
  - Consumer checkout session created via `createSubscriptionCheckout()` in [lib/paymentsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/paymentsApi.ts) calling `/api/v1/payments/stripe/create-checkout-session`.
- **Pay-Per-View Premieres:**
  - Dedicated endpoint `POST /api/v1/content/ppv/checkout` creates one-time payment sessions.
- **Webhook Processing:**
  - Handled by [app/api/stripe/webhook/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/stripe/webhook/route.ts).
  - Validates `stripe-signature` using `STRIPE_WEBHOOK_SECRET`.
  - Dispatches `customer.subscription.*` and `invoice.payment_*` events.

### D. Digital Rights Management (DRM) & Streaming Players
- **Players Supported:**
  1. **Shaka Player (`components/ShakaPlayer/ShakaPlayer.tsx`):**
     - Plays MPEG-DASH manifests (`.mpd`) and HLS playlists (`.m3u8`).
     - Configured to negotiate Widevine (Google) and FairPlay (Apple) DRM licenses via `GET /api/v1/content/drm/key`.
  2. **A-Frame WebXR Player (`components/VrAframePlayer/VRAframePlayer.tsx`):**
     - Uses A-Frame and Three.js to render 360° and 180° video spheres and stereoscopic side-by-side (SBS) / top-bottom (TB) projections with drag-to-look camera controls and VR headset support.

### E. Headless WordPress Blog Integration
- Integrated via [lib/wordpress.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/wordpress.ts).
- Queries `NEXT_PUBLIC_WORDPRESS_API_URL` (`/wp-json/wp/v2/posts`, `/categories`, `/media`).
- Implements embedded media parsing, author profile extraction, and tag mapping.

---

## 4. Environment Variables Reference

| Variable Name | Required In | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | Frontend & Edge | Root URL of backend API (e.g. `https://api.urview.com/`). |
| `NEXT_PUBLIC_FRONTEND_BASE`| Frontend | Origin of web app (e.g. `http://localhost:3000/`). |
| `NEXT_PUBLIC_USE_MOCK_DATA`| Frontend | Toggles offline mock mode (`'true'` or `'false'`). |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`| Frontend | Google OAuth client ID for Drive picker. |
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Frontend | Google Cloud API key for Drive picker. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Frontend | Stripe publishable key for client checkout. |
| `STRIPE_SECRET_KEY` | Backend | Stripe private API secret key. |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook signing secret. |
| `STRIPE_PRICE_ID_KIDS` | Backend | Stripe Price ID for Kids plan. |
| `STRIPE_PRICE_ID_FULL` | Backend | Stripe Price ID for Full Access plan. |
| `NEXTAUTH_URL` | Backend | NextAuth callback base URL. |
| `NEXTAUTH_SECRET` | Backend | NextAuth encryption secret. |
| `GOOGLE_CLIENT_ID` | Backend | Server-side Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | Backend | Server-side Google OAuth client secret. |
| `GITHUB_CLIENT_ID` | Backend | Server-side GitHub OAuth client ID. |
| `GITHUB_CLIENT_SECRET` | Backend | Server-side GitHub OAuth client secret. |
| `DATABASE_URL` | Backend | PostgreSQL connection string for production. |
| `AWS_REGION` | Server / Lambda | AWS region (e.g. `us-east-1`). |
| `AWS_ACCESS_KEY_ID` | Server / Lambda | AWS IAM access key for S3 and MediaConvert. |
| `AWS_SECRET_ACCESS_KEY` | Server / Lambda | AWS IAM secret key for S3 and MediaConvert. |
| `S3_UPLOAD_BUCKET` | Server / Lambda | Bucket name for raw uploads. |
| `S3_PROCESSED_BUCKET` | Server / Lambda | Bucket name for transcoded streaming outputs. |
| `WORDPRESS_API_URL` | Frontend | Headless WordPress REST API endpoint. |
| `WORDPRESS_PREVIEW_SECRET`| Frontend | Secret for previewing draft blog articles. |
| `NODE_ENV` | Global | Runtime environment (`development` / `production`). |
