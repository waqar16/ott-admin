# Feature Implementation Status Report — URVIEW OTT

This report categorizes all features, submodules, and integrations into one of six implementation states based on static code inspection:
- **Implemented:** Fully functional and wired to backend endpoints or confirmed workflows.
- **Partial:** UI or client logic built, but has incomplete subsections, unmounted views, or missing backend sync.
- **Mocked:** Operating entirely against static fixtures, JSON files, or in-memory arrays.
- **Planned:** Stub placeholder, commented-out logic, or pending backend readiness.
- **Failing / Fragile:** Verified runtime risk or hardcoded domain conflict.
- **Unverified:** Backend behavior or cloud resource status cannot be confirmed without remote infrastructure access.

---

## 1. Feature Status Matrix

| Module / Feature | Route / File Reference | Implementation Status | Notes & Verification Summary |
|---|---|---|---|
| **Admin Login & 2FA** | `app/page.tsx`, `components/auth/LoginForm.client.tsx` | **Implemented** | Authenticates against `POST /api/v1/login`, supports 2FA challenge, stores cookies, verifies `admin` role. |
| **Token Refresh & Session Store** | `lib/authApi.ts`, `lib/tokenStore.ts`, `lib/useAuth.tsx` | **Implemented** | Auto-refreshes JWT access token on 401 via `POST /api/v1/token/refresh`. Non-httpOnly storage. |
| **Edge Route Protection** | `middleware.ts` | **Implemented** | Validates cookies and requests `GET /api/v1/me` to enforce `admin` role. |
| **Admin Overview Dashboard** | `app/admin/page.tsx` | **Partial (w/ Fallback)** | Queries `GET /api/v1/admin-dashboard/overview`. Reverts to static metrics if API fails. |
| **Analytics Dashboard (25 Metrics)**| `app/admin/analytics/page.tsx` | **Partial (w/ Fallback)** | Full ECharts suite. Queries 25 endpoints; has fallbacks for every single endpoint. |
| **Content Creator Management** | `app/admin/creator/page.tsx`, `lib/creatorApi.ts` | **Implemented** | Complete CRUD operations against `POST/GET/PATCH/DELETE /api/v1/content/creators`. |
| **Creator Revenue Reporting** | `app/admin/revenue/page.tsx` | **Implemented** | Queries `GET /api/v1/admin-dashboard/creator-report`, downloads Excel report via blob. |
| **User Management** | `app/admin/users/page.tsx`, `lib/userApi.ts` | **Implemented** | Queries `GET /api/v1/users`, updates status via `PATCH /api/v1/users/{id}/update`. |
| **Pre-Signup, Quotas & Waitlist**| `app/admin/pre-signup/page.tsx`, `lib/preSignupApi.ts` | **Implemented** | Manages settings, cohort promotions (`POST .../waitlist/promote`), waitlist entries CRUD. |
| **FAQs Management** | `app/admin/faqs/page.tsx`, `lib/faq.ts` | **Implemented** | Complete CRUD operations against `POST/GET/PATCH/DELETE /api/v1/platform/faqs`. |
| **Movie Management** | `app/admin/movie-management/page.tsx` | **Implemented** | List, create, edit, filter, publish, delete movies via `lib/contentApi.ts`. |
| **SSE Transcoding Progress** | `movie-management/page.tsx`, `SeriesTree.tsx` | **Failing / Fragile** | Real-time SSE listener functional, but uses hardcoded domain `https://api.urview.com/`. |
| **Series, Seasons & Episodes** | `app/admin/series-management/page.tsx`, `SeriesTree.tsx` | **Implemented** | Hierarchical accordion tree, series/season/episode creation, transcoding tracking. |
| **Trailer Management** | `app/admin/trailer-management/page.tsx` | **Implemented** | Trailer creation, filtering, and YouTube link assignment. |
| **Documentary Management** | `app/admin/documentary-management/page.tsx` | **Implemented** | Documentaries catalog, publishing, and filtering. |
| **Legacy Content Flag Manager** | `app/admin/content/page.tsx`, `app/api/admin/content` | **Mocked** | Operates against local `catalog.json` and in-memory flags `lib/adminFlags.ts`. |
| **Payment Plans CRUD** | `app/admin/payment-plans/page.tsx`, `PlanForm.tsx` | **Implemented** | Plans list, creation, editing, deletion via `/api/v1/payments/plans`. |
| **Subscriptions Auditing** | `app/admin/subscriptions/page.tsx` | **Implemented** | Paginated customer subscription inspection via `/api/v1/payments/subscriptions`. |
| **Platform Branding & Settings** | `app/admin/settings/page.tsx`, `lib/platformApi.ts` | **Implemented** | Platform name, colors, support email, and logo upload via `/api/v1/platform/*`. |
| **Footer Content Settings** | `app/admin/additional-settings/page.tsx` | **Implemented** | Footer text, copyright, social links via `lib/additionalSettingsApi.ts`. |
| **Landing & Login Copy Settings**| `lib/additionalSettingsApi.ts`, `components/` | **Partial** | Components and API service fully implemented, but unmounted on any page. |
| **User Sub-Profiles Management** | `app/admin/user-profiles/page.tsx` | **Partial / Conflicting** | UI functions via `/api/v1/accounts/profiles/`, but diverges from `lib/profilesApi.ts`. |
| **Parental PIN Verification** | `lib/profilesApi.ts`, `components/ParentalPIN.tsx` | **Implemented** | 4-digit PIN verification against `/api/v1/profiles/{id}/verify-pin`. |
| **Premiere (PPV) Management** | `app/admin/premiere/page.tsx` | **Planned** | 12-line placeholder stub. No CRUD functionality implemented. |
| **Admin Watch Preview Player** | `app/admin/watch/[id]/page.tsx` | **Implemented** | Inspects streaming URLs via Shaka Player (DASH/HLS) and A-Frame (VR 180/360). |
| **Google Drive Video Picker** | `components/GoogleDriveUploadButton/GoogleDriveButton.tsx`| **Implemented** | Injects Google Picker API, acquires OAuth token, passes file ID to `initUpload()`. |
| **Direct S3 Multipart Upload** | `lib/uploader.ts`, `lib/uploadHelper.ts` | **Implemented** | Chunks files and uploads directly to S3 with progress tracking. |
| **S3 Upload Dev Callback** | `lib/contentApi.ts#L853` | **Mocked / Fragile** | Client-simulated S3 callback using hardcoded API key `'devtestkey'`. |
| **AWS Lambda Transcoder** | `lambda/mediaProcessor.js` | **Unverified (Backend)**| Node.js Lambda function configured for MediaConvert jobs. Requires AWS deploy. |
| **AWS Lambda Image Resizer** | `lambda/imageProcessor.js` | **Unverified (Backend)**| Node.js Lambda function configured for Sharp WebP generation. Requires AWS deploy. |
| **Stripe Webhook Handler** | `app/api/stripe/webhook/route.ts` | **Implemented** | Verifies signature, updates mock user memberships in `lib/db/adapter.ts`. |
| **Consumer Stripe Checkout** | `lib/paymentsApi.ts`, `components/payments/` | **Implemented** | Generates checkout sessions via `/api/v1/payments/stripe/create-checkout-session`. |
| **NextAuth Authentication** | `lib/auth.ts`, `app/api/auth/[...nextauth]` | **Planned / Disabled** | Configured in code but handler endpoints are disabled in favor of DRF JWT. |
| **Headless WordPress Client** | `lib/wordpress.ts` | **Implemented** | WP REST API client with mock post fallbacks. |
| **Lead Capture Endpoint** | `app/api/leads/route.ts` | **Mocked** | Validates email format, logs to server console, returns success. |
| **Automated Testing Suite** | `package.json` | **Planned** | Zero unit, integration, or end-to-end tests exist in the project. |

---

## 2. Summary by Status Breakdown

```
Total Tracked Capabilities: 36
├── Implemented:          23  (63.9%)
├── Partial:               4  (11.1%)
├── Mocked:                3   (8.3%)
├── Failing / Fragile:     2   (5.6%)
├── Planned:               2   (5.6%)
└── Unverified (Backend):  2   (5.6%)
```

### Action Items for Future Development
1. **Fix SSE Hardcoded Domain:** Switch `app/admin/movie-management/page.tsx` to `API_BASE` to prevent staging/local disconnects.
2. **Mount Orphaned Additional Settings:** Embed `LandingPageContentManagement` and `LoginScreenContentManagement` into `/admin/additional-settings`.
3. **Consolidate Profiles API:** Unify `app/admin/user-profiles/page.tsx` and `lib/profilesApi.ts` on the confirmed backend route `/api/v1/accounts/profiles/`.
4. **Implement or Redirect Premiere:** Build out `/admin/premiere` or route PPV configuration into `movie-management`.
5. **Decide on NextAuth:** Remove commented NextAuth dependencies and mock adapter if DRF JWT is the permanent architecture.
