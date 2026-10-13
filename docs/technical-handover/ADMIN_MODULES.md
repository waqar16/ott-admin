# Complete Admin Panel Module Inventory — URVIEW OTT

This document provides an exhaustive inventory of every page, screen, modal, drawer, and submodule available within the URVIEW Admin Panel (`/admin/*`).

---

## 1. Executive Overview Dashboard

- **Route:** `/admin`
- **Source File:** [app/admin/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/page.tsx)
- **Purpose:** Central operational dashboard displaying high-level platform health, active users, subscription metrics, content inventory, recent revenue, and 7-day viewing trends.
- **Main Components:**
  - `HeroKPICard` stat cards (Users, Subscriptions, Content, Revenue).
  - `ReactECharts` User Distribution (Donut Chart - Active vs. Inactive).
  - `ReactECharts` Content Distribution (Bar Chart - Movies, Series, Episodes).
  - `ReactECharts` Revenue Source Mix (Pie Chart - Subscriptions vs. PPV).
  - `ReactECharts` Platform Views Trend (Smooth line chart over the last 7 days).
  - `SkeletonLoader` for placeholder loading states.
- **UI Features & Interactions:**
  - Manual data refresh button triggering re-fetch.
  - Dynamically formatted calendar date banner.
  - Interactive chart tooltips and legend highlighting.
- **User Actions Supported:** Viewing metrics, manual refresh, navigating to submodules.
- **APIs Used:**
  - `GET /api/v1/admin-dashboard/overview`
- **States Handled:**
  - *Loading:* Full grid of skeleton card loaders.
  - *Error:* Explicit red banner if API fails and no fallback is returned.
  - *Data Mode:* **Hybrid.** Calls real backend endpoint; if the API fails or token is missing, automatically populates with high-fidelity mock data.
- **Known Limitations:**
  - Views trend line chart generates pseudo-historical points based on the 24-hour metric rather than displaying true 7-day timeseries data from the backend.

---

## 2. Platform Analytics Dashboard

- **Route:** `/admin/analytics`
- **Source File:** [app/admin/analytics/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/analytics/page.tsx)
- **Purpose:** Deep-dive analytical monitoring covering 5 major operational domains: User Growth & Demographics, Subscriptions & Churn, Revenue & Payment Processors, Content Performance & Completion Rates, and User Engagement & Devices.
- **Main Components & Sections:**
  1. *Executive KPI Summary:* 4 Hero KPI cards (Total Users, Active Subscriptions, 30-Day Revenue, 24-Hour Views).
  2. *User Analytics Section:*
     - User Growth Line Chart (ECharts).
     - Active Users Trend Line Chart (ECharts).
     - Role Distribution Donut Chart (admin, creator, subscriber, free_user).
     - Account Status Distribution Donut Chart (active, inactive, banned).
  3. *Subscription & Churn Section:*
     - Plan Breakdown Donut Chart (Basic HD, Premium 4K, Family Pass).
     - Subscription Status Donut Chart (active, trialing, canceled).
     - Churn Rate Gauge Chart (ECharts gauge displaying churn percentage).
     - New Subscriptions Velocity Line Chart.
  4. *Revenue & Monetization Section:*
     - Revenue Timeseries Area Chart.
     - Revenue by Plan Horizontal Bar Chart.
     - Top Spending Subscribers Table (Username, Email, Total Spend, Subscription Count).
     - Payment Status Pie Chart (succeeded, pending, failed, refunded).
     - Payment Processor Share Bar Chart (Stripe, PayPal, Apple Pay, Google Pay).
  5. *Content Performance Section:*
     - Top Movies Ranked Table (Rank, Title, Views, Unique Viewers, Watch Time).
     - Top Series Ranked Table (Rank, Title, Views, Total Episodes, Watch Time).
     - Top Episodes Ranked Table (Rank, Series, Season/Episode, Views, Watch Time).
     - Content Completion Rates Bar Chart (percentage completed).
     - Content Dropoff Interval Curve Chart (0-25%, 25-50%, 50-75%, 75-100%).
  6. *User Engagement Section:*
     - Daily / Monthly Active Users (DAU / MAU) Ratio Gauge.
     - Total Watch Time Timeseries Chart.
     - Device Type Distribution Donut Chart (web, mobile, tv, tablet, vr_headset).
     - Engagement Activity Heatmap / Timeline.
     - Peak Viewing Hours Bar Chart (00:00 to 23:00 hourly distribution).
- **APIs Used:** 25 distinct backend endpoints:
  - `GET /api/v1/admin-dashboard/overview`
  - `GET /api/v1/admin-dashboard/users/growth`
  - `GET /api/v1/admin-dashboard/users/active`
  - `GET /api/v1/admin-dashboard/users/roles`
  - `GET /api/v1/admin-dashboard/users/status`
  - `GET /api/v1/admin-dashboard/subscriptions/plan-breakdown`
  - `GET /api/v1/admin-dashboard/subscriptions/status`
  - `GET /api/v1/admin-dashboard/subscriptions/churn`
  - `GET /api/v1/admin-dashboard/subscriptions/new`
  - `GET /api/v1/admin-dashboard/revenue/summary`
  - `GET /api/v1/admin-dashboard/revenue/timeseries`
  - `GET /api/v1/admin-dashboard/revenue/plan-breakdown`
  - `GET /api/v1/admin-dashboard/revenue/top-users`
  - `GET /api/v1/admin-dashboard/revenue/payment-status`
  - `GET /api/v1/admin-dashboard/revenue/payment-processor`
  - `GET /api/v1/admin-dashboard/content/top-movies`
  - `GET /api/v1/admin-dashboard/content/top-series`
  - `GET /api/v1/admin-dashboard/content/top-episodes`
  - `GET /api/v1/admin-dashboard/content/completion-rates`
  - `GET /api/v1/admin-dashboard/content/dropoff`
  - `GET /api/v1/admin-dashboard/engagement/active-users`
  - `GET /api/v1/admin-dashboard/engagement/watch-time`
  - `GET /api/v1/admin-dashboard/engagement/devices`
  - `GET /api/v1/admin-dashboard/engagement/timeline`
  - `GET /api/v1/admin-dashboard/engagement/peak-hours`
- **Data Mode:** **Hybrid with Complete Fallback.** If any individual API call fails, an internal dictionary (`fallbacks`) supplies realistic data so the visual presentation never breaks.

---

## 3. Creator Management

- **Route:** `/admin/creator`
- **Source File:** [app/admin/creator/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/creator/page.tsx)
- **Purpose:** Onboarding, auditing, and maintaining independent content creators, studios, and production partners.
- **Main Components:**
  - `CreatorPageHeader`: Title, description, and primary "+ Add Creator" action button.
  - `CreatorStatsCards`: Total creators count and active breakdown.
  - `CreatorToolbar`: Search input and filter select.
  - `CreatorTable`: Responsive data table (Avatar, Name, Bio, Email, Phone, Actions).
  - `CreatorDrawer`: Slide-over drawer container for creator forms.
  - `CreatorEditor` (`components/Creator/EditCreator.tsx`): Form for creating and updating creator profiles.
  - `DeleteConfirmationDialog`: Confirmation modal for destructive deletion.
- **User Actions Supported:**
  - List all creators.
  - Search creators by name, email, or bio.
  - Create new creator (`POST /api/v1/content/creators`).
  - Edit existing creator (`PATCH /api/v1/content/creators/{id}`).
  - Delete creator (`DELETE /api/v1/content/creators/{id}`).
- **Data Mode:** **Real Backend Data.** Calls `lib/creatorApi.ts`.

---

## 4. Creator Revenue & Financial Reporting

- **Route:** `/admin/revenue`
- **Source File:** [app/admin/revenue/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/revenue/page.tsx)
- **Purpose:** Auditing financial performance and revenue generated by creators, with date-range filtering and spreadsheet export for accounting.
- **Main Components:**
  - `CreatorReportHeader`: Page header with "Export to Excel (.xlsx)" button.
  - `CreatorFilters`: Date range picker (`start_date`, `end_date`).
  - `SummaryStatCards`: Aggregate metrics (Gross Revenue, Creator Payouts, Platform Share, Top Earner).
  - `PerformerCard`: Highlight card spotlighting the highest-grossing creator.
  - `CreatorTable`: Granular breakdown table (Creator Name, Total Streams, PPV Sales, Ad Revenue, Total Earnings, Payout Status).
  - `RevenueSkeleton`: Shimmer loading skeleton.
- **User Actions Supported:**
  - Filter revenue reports by custom date range (`start_date`, `end_date`).
  - Download full Excel report directly in the browser as a `.xlsx` blob.
- **APIs Used:**
  - `GET /api/v1/admin-dashboard/creator-report?start_date=...&end_date=...`
  - `GET /api/v1/admin-dashboard/creator-report/excel?start_date=...&end_date=...`
- **Data Mode:** **Real Backend Data.**

---

## 5. User Account Management

- **Route:** `/admin/users`
- **Source File:** [app/admin/users/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/users/page.tsx)
- **Purpose:** Overseeing all registered user accounts, editing user profiles, modifying security status (active, suspended, banned), and deleting accounts.
- **Main Components:**
  - `UsersPageHeader`: Header with refresh action.
  - `UserStatsCards`: Aggregate cards (Total Users, Active Users, Suspended/Banned, Admins).
  - `UserSearchFilter`: Search input and role/status dropdown filter (`all`, `admin`, `user`, `active`, `inactive`, `beta_tester`).
  - `UsersTable`: Desktop table (Avatar, Name, Email, Role Badge, Status Badge, Verified Badge, Created Date, Actions).
  - `UserCardMobile`: Card-based layout for mobile viewports.
  - `UserForm` (`components/User/UserForm.tsx`): Slide-over drawer form for editing user fields.
  - `DeleteUserDialog`: Confirmation modal for deleting accounts.
- **User Actions Supported:**
  - List and search users by name, email, or role.
  - Filter by role or active status.
  - Edit user profile, name, status (`active`, `suspended`, `banned`), kid mode, educational mode (`PATCH /api/v1/users/{id}/update`).
  - Delete user account (`DELETE /api/v1/users/{id}/delete`).
- **Data Mode:** **Real Backend Data.** Calls `lib/userApi.ts`.

---

## 6. Pre-Signup, Trial Quotas & Waitlist

- **Route:** `/admin/pre-signup`
- **Source File:** [app/admin/pre-signup/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/pre-signup/page.tsx)
- **Purpose:** Governing early-access campaigns, beta invitations, pre-registration trial quotas, and batch promotion of waitlist candidates into active platform users.
- **Main Components:**
  - `PreSignupHeader`: Header with "Configure Quota" and "Promote Cohort" buttons.
  - `PreSignupQuotaCard`: Progress gauge showing current capacity fill percentage, cohort size, and remaining slots.
  - `PreSignupWaitlistHealthCard`: Waitlist metrics (Total entries, Pending, Converted, Conversion rate %).
  - `NextInLineCard`: Priority queue of candidates waiting for admission.
  - `RecentConversionsCard`: Recently converted users with timestamps.
  - `WaitlistTable` & `WaitlistMobileCards`: Paginated list of all waitlist entries with status badges (`pending`, `notified`, `converted`, `expired`).
  - `WaitlistSearchFilter`: Search and status filter controls.
  - `QuotaSettingsModal`: Modal form to adjust capacity limits, trial duration (days), and toggle pre-signup mode on/off.
  - `PromoteBatchModal`: Batch promotion wizard to notify and promote the top N waitlist candidates.
  - `WaitlistDetailDrawer`: Slide-over detail drawer for viewing and editing individual waitlist records.
  - `DeleteWaitlistDialog`: Confirmation modal for removing waitlist entries.
- **User Actions Supported:**
  - View quota metrics and waitlist conversion statistics.
  - Update pre-signup settings: capacity, trial days, enabled state (`PATCH /api/v1/platform/pre-signup-settings`).
  - Promote batch of waitlist candidates (`POST /api/v1/platform/waitlist/promote`).
  - Search and filter waitlist entries.
  - View entry details, update entry status (`PATCH /api/v1/platform/waitlist/{id}`).
  - Delete waitlist entry (`DELETE /api/v1/platform/waitlist/{id}`).
- **Data Mode:** **Real Backend Data.** Calls `lib/preSignupApi.ts` with mock fallback data.

---

## 7. FAQ Management

- **Route:** `/admin/faqs`
- **Source File:** [app/admin/faqs/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/faqs/page.tsx)
- **Purpose:** Creating, updating, reordering, and publishing platform Frequently Asked Questions displayed on customer help and landing pages.
- **Main Components:**
  - `FaqPageHeader`: Header with "+ Add FAQ" action.
  - `FaqStatsCards`: Total FAQs, Active FAQs, and Inactive FAQs count.
  - `FaqSearchFilter`: Search input and active/inactive status filter.
  - `FaqTable`: Desktop table (Question, Answer preview, Display Order, Status toggle, Actions).
  - `FaqCardMobile`: Mobile card view.
  - `FaqForm` (`components/FaqForm/FaqForm.tsx`): Modal form for editing/creating FAQs.
  - `DeleteFaqDialog`: Confirmation dialog for deleting FAQs.
- **User Actions Supported:**
  - List and search FAQs.
  - Create new FAQ with question, answer, display order, active flag (`POST /api/v1/platform/faqs`).
  - Edit existing FAQ (`PATCH /api/v1/platform/faqs/{id}`).
  - Delete FAQ (`DELETE /api/v1/platform/faqs/{id}`).
- **Data Mode:** **Real Backend Data.** Calls `lib/faq.ts`.

---

## 8. Movie Management

- **Route:** `/admin/movie-management`
- **Source File:** [app/admin/movie-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/movie-management/page.tsx)
- **Purpose:** Full lifecycle management of standalone cinema titles, including ingestion, multi-part video uploads, metadata tagging, subtitles/dubbings, transcoding monitoring, and publishing.
- **Main Components:**
  - `ContentHeaderComponent`: Title and "+ Add Movie" action.
  - `ContentStats`: Metrics on total movies, published, processing, and drafts.
  - `ContentFilter`: Status filter (`ready`, `draft`, `published`, `inactive`), visibility mode (`public`, `beta`), kid-safe toggle, PPV toggle.
  - `ContentCard`: Rich media card with poster thumbnail, transcoding progress bar, status pill, and quick-action menu (Edit, Details, Watch/Preview, Publish/Unpublish, Delete).
  - `ContentEditor` (`components/admin/content/ContentEditor.client.tsx`): 120KB full-featured slide-over wizard for:
    - Basic metadata (Title, Description, Duration, Release Year, Age Rating, Genres).
    - Media configuration (Projection: Flat, VR 180, VR 360; Dimension: 2D, 3D SBS/TB).
    - Poster, banner, and thumbnail uploads.
    - S3 direct multi-part video uploads with progress bar.
    - Google Drive video picker (`GoogleDriveButton`).
    - Subtitle track uploader (`SubtitleUploader.tsx`).
    - Multi-language audio dubbing uploader (`DubbingUploader.tsx`).
  - `ContentDetailsModal`: Modal displaying detailed content metadata, renditions list, and stream URLs.
- **User Actions Supported:**
  - Create movie record (`POST /api/v1/content/contents`).
  - Update movie metadata (`PATCH /api/v1/content/contents/{id}`).
  - Upload video files directly to S3 via presigned multipart URLs.
  - Import video files from Google Drive.
  - Upload images (poster, banner, thumbnail) (`POST /api/v1/content/content/{id}/images`).
  - Manage subtitles and audio dubbings.
  - Listen to real-time transcoding progress via Server-Sent Events (`EventSource`).
  - Publish / Unpublish movie (`POST /api/v1/content/contents/{id}/publish`).
  - Delete movie (`DELETE /api/v1/content/contents/{id}`).
  - Launch internal streaming preview in player modal.
- **Data Mode:** **Real Backend Data.** Calls `lib/contentApi.ts`.

---

## 9. Series Management

- **Route:** `/admin/series-management`
- **Source File:** [app/admin/series-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/series-management/page.tsx)
- **Purpose:** Hierarchical administration of episodic content: Series -> Seasons -> Episodes.
- **Main Components:**
  - Series header and "+ Add Series" modal.
  - `SeriesTree` (`components/SeriesTree.tsx`): 36KB interactive hierarchical accordion tree:
    - *Level 1 (Series):* Title, description, poster, trailer, seasons count, add season button.
    - *Level 2 (Seasons):* Season number, title, episodes count, add episode button.
    - *Level 3 (Episodes):* Episode number, title, duration, thumbnail, transcoding progress, watch preview button, edit episode form.
  - `ContentEditor` integration for series-level metadata and episode video uploading.
- **User Actions Supported:**
  - Create Series (`POST /api/v1/content/contents/series`).
  - Create Season under a series (`POST /api/v1/content/seasons`).
  - Create Episode under a season (`POST /api/v1/content/episodes`).
  - Upload episode video, thumbnail, subtitles, and audio dubbings.
  - Real-time transcoding progress tracking per episode via SSE.
  - Refresh single season hierarchy (`GET /api/v1/content/frontend/season/full/{seasonId}`).
  - Edit and delete at any hierarchy level.
- **Data Mode:** **Real Backend Data.** Calls `lib/contentApi.ts`.

---

## 10. Trailer Management

- **Route:** `/admin/trailer-management`
- **Source File:** [app/admin/trailer-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/trailer-management/page.tsx)
- **Purpose:** Ingesting and managing promotional trailers, teaser videos, and marketing clips associated with movies and television series.
- **Main Components:**
  - Inherits standard content management cards, filters, and `ContentEditor`.
  - Sets `content_type: 'trailer'` filter parameter automatically.
  - `UploadTrailerClient`: Modal client for linking YouTube trailers or uploading native trailer video assets.
- **User Actions Supported:**
  - List, create, update, delete, and publish trailers.
  - Link YouTube trailer URL or upload raw video file.
- **Data Mode:** **Real Backend Data.** Calls `lib/contentApi.ts`.

---

## 11. Documentary Management

- **Route:** `/admin/documentary-management`
- **Source File:** [app/admin/documentary-management/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/documentary-management/page.tsx)
- **Purpose:** Dedicated catalog interface for non-fiction films, docuseries, and educational programs.
- **Main Components:**
  - Specialized filtering preset with `content_type: 'documentary'`.
  - Content cards, editor drawer, stats bar, and detail modals.
- **User Actions Supported:**
  - Full CRUD operations, video upload, image tagging, and publishing for documentary titles.
- **Data Mode:** **Real Backend Data.** Calls `lib/contentApi.ts`.

---

## 12. Legacy Content Flag Management

- **Route:** `/admin/content`
- **Source File:** [app/admin/content/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/content/page.tsx)
- **Purpose:** Historical prototype screen for toggling promotional visibility flags (`visibleWithoutSignup`, `isDemoContent`) across mock catalog items.
- **Main Components:**
  - Filter tabs: All, Visible, Demo, Kids.
  - Bulk action toolbar: Enable/Disable visible without signup, Enable/Disable demo content.
  - Static catalog table with inline toggle switches.
- **APIs Used:**
  - `GET /api/admin/content`
  - `PATCH /api/admin/content`
- **Data Mode:** **Local Next.js Route Handler & Static JSON.** Operates against `lib/data/catalog.json` and in-memory cache `lib/adminFlags.ts`.
- **Note:** Superseded by `movie-management` and `series-management`. Should be preserved or deprecated carefully.

---

## 13. Payment Plans Management

- **Routes:**
  - List: `/admin/payment-plans` ([app/admin/payment-plans/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/payment-plans/page.tsx))
  - Add: `/admin/payment-plans/add` ([app/admin/payment-plans/add/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/payment-plans/add/page.tsx))
  - Edit: `/admin/payment-plans/[id]` ([app/admin/payment-plans/[id]/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/payment-plans/%5Bid%5D/page.tsx))
- **Purpose:** Configuring commercial subscription tiers (pricing, duration, device limits, profile limits, premium access rights, ad-supported status, Stripe Price ID binding).
- **Main Components:**
  - `PaymentPlansHeader`: Header with "+ Add New Plan" action.
  - `PaymentPlanStats`: Cards showing total plans, active plans, and average price.
  - `PaymentPlanFilters`: Search by plan name, active status toggle, ad-supported filter.
  - `PaymentPlanGrid` & `PaymentPlanCard`: Grid displaying plan cards with feature badges, price tag, max devices, max profiles, and action dropdown (Edit, Delete).
  - `PlanForm` (`components/PlanForm/PlanForm.tsx`): Multi-field form for configuring plan rules:
    - Name, Description, Price, Currency (`USD`, `EUR`, `GBP`, etc.).
    - Duration (days), Max Devices (1-10), Max Profiles (1-5).
    - Can Access Premium (toggle), Ad Supported (toggle), Is Active (toggle).
    - Stripe Price ID (for automated Stripe recurring billing).
  - `DeletePlanDialog`: Confirmation modal for removing a plan.
- **User Actions Supported:**
  - List, search, and filter subscription plans.
  - Create payment plan (`POST /api/v1/payments/plans`).
  - View plan details (`GET /api/v1/payments/plans/{id}`).
  - Update payment plan (`PUT /api/v1/payments/plans/{id}`).
  - Delete payment plan (`DELETE /api/v1/payments/plans/{id}`).
- **Data Mode:** **Real Backend Data.** Calls `lib/paymentsApi.ts` and direct Axios endpoints.

---

## 14. Subscriptions Auditing

- **Route:** `/admin/subscriptions`
- **Source File:** [app/admin/subscriptions/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/subscriptions/page.tsx)
- **Purpose:** Real-time visibility into customer subscription states, renewing periods, and plan assignments across the entire platform.
- **Main Components:**
  - `SubscriptionHeader`: Header with refresh action.
  - `SubscriptionStats`: Active subscriptions, trialing subscriptions, canceled subscriptions count.
  - `SubscriptionFilters`: User email filter, Plan name filter, Status filter (`active`, `canceled`, `past_due`, `trialing`).
  - `SubscriptionGrid` & `SubscriptionCard`: Detailed cards showing Subscriber name/email, Plan name, Monthly price, Status badge, Start Date, End Date, and Created Date.
  - `SubscriptionPagination`: Page switcher.
- **User Actions Supported:**
  - List all active and past customer subscriptions.
  - Filter by user email, plan name, or subscription status.
  - Pagination controls.
- **APIs Used:**
  - `GET /api/v1/payments/subscriptions?page=...&user=...&plan=...&status=...`
- **Data Mode:** **Real Backend Data.** Calls Axios against `${API_BASE}api/v1/payments/subscriptions`.

---

## 15. Platform Settings & Branding

- **Route:** `/admin/settings`
- **Source File:** [app/admin/settings/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/settings/page.tsx)
- **Purpose:** Customizing platform-wide metadata, customer support contacts, brand colors, default currency, and global platform logo.
- **Main Components:**
  - Branding Card: Platform Logo preview with direct file picker, Platform Name input, Support Email input.
  - Appearance & System Card: Primary brand color picker, Secondary brand color picker, Default currency dropdown (`USD`, `EUR`, `GBP`, `CAD`, `AUD`).
  - Save Changes button with loading spinner.
- **User Actions Supported:**
  - Load existing platform settings (`GET /api/v1/platform/settings`).
  - Upload new platform logo (`POST /api/v1/platform/logo-upload`).
  - Update settings: name, colors, support email, currency (`POST /api/v1/platform/settings`).
- **Data Mode:** **Real Backend Data.** Calls `lib/platformApi.ts`.

---

## 16. Additional Settings (Footer & Editorial Content)

- **Route:** `/admin/additional-settings`
- **Source File:** [app/admin/additional-settings/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/additional-settings/page.tsx)
- **Purpose:** Managing public-facing footer content, copyright text, social media URLs, and policy hyperlinks.
- **Main Components:**
  - `FooterContentManagement` (`components/FooterContentManagement/FooterContentManagement.tsx`): Form for editing:
    - Primary footer text (`text_1`), secondary copyright notice (`text_2`).
    - Social links: Facebook, Twitter/X, LinkedIn, Instagram.
    - Legal links: Privacy Policy URL, Terms of Service URL, Contact Us URL.
- **User Actions Supported:**
  - Fetch footer content (`GET /api/v1/platform/footer-content/single/`).
  - Create or update footer configuration (`POST` / `PUT /api/footer-content/single/`).
- **Data Mode:** **Real Backend Data.** Calls `lib/additionalSettingsApi.ts`.
- **Known Limitation:** The page currently only mounts `FooterContentManagement`. The existing `LandingPageContentManagement` and `LoginScreenContentManagement` components exist in `components/` but are not embedded in this page layout.

---

## 17. User Profiles & Parental PIN Management

- **Route:** `/admin/user-profiles`
- **Source File:** [app/admin/user-profiles/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/user-profiles/page.tsx)
- **Purpose:** Auditing and configuring sub-profiles created under subscriber master accounts (kids profiles, adult profiles, language preferences, PIN locks).
- **Main Components:**
  - Profile search and filter bar (Username/Email search, Active status filter, Profile type filter).
  - Profiles data table (Username, Email, Full Name, Profile Type, Active Status, Created Date, Actions).
  - Add / Edit Profile modal.
- **User Actions Supported:**
  - List user profiles (`GET /api/v1/accounts/profiles/?page=...`).
  - Create profile (`POST /api/v1/accounts/profiles/`).
  - Update profile (`PUT /api/v1/accounts/profiles/{id}/`).
  - Delete profile (`DELETE /api/v1/accounts/profiles/{id}/`).
- **Data Mode:** **Real Backend Data.** Calls Django endpoint `/api/v1/accounts/profiles/`.
- **Known Inconsistency:** This page makes direct Axios calls to `/api/v1/accounts/profiles/` instead of using the service in [lib/profilesApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/profilesApi.ts) which targets `/api/v1/profiles`.

---

## 18. Premiere Management (Pay-Per-View)

- **Route:** `/admin/premiere`
- **Source File:** [app/admin/premiere/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/premiere/page.tsx)
- **Purpose:** Intended for managing Pay-Per-View premiere releases, ticket pricing, and premiere availability windows.
- **Status:** **PLANNED / STUB ONLY.**
- **Content:** Contains only a 12-line placeholder layout with an `h1` and comment: `"TODO: Implement CRUD for premiere titles when backend is ready"`.
- **Note:** PPV features exist inside `movie-management` (via the `is_ppv` and `price` fields on content records), but this dedicated premiere screen is not yet built.

---

## 19. Admin Watch / Streaming Preview Player

- **Route:** `/admin/watch/[id]`
- **Source File:** [app/admin/watch/[id]/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/watch/%5Bid%5D/page.tsx)
- **Purpose:** Internal administrative playback inspector allowing operators to test and verify transcoded video streams, multi-bitrate renditions, and VR projections before publishing to customers.
- **Main Components:**
  - `ShakaPlayer` (`components/ShakaPlayer/ShakaPlayer.tsx`): Google Shaka player integration for DASH and HLS with DRM support.
  - `VRAframePlayer` (`components/VrAframePlayer/VRAframePlayer.tsx`): WebXR and A-Frame spatial media player for 180° and 360° monoscopic/stereoscopic video.
  - Custom full-screen loading spinner.
  - Back navigation button returning to the originating admin catalog page.
- **User Actions Supported:**
  - Stream video content directly within the admin interface.
  - Auto-selects playback technology based on format: A-Frame for VR media (`media_type.startsWith('vr_')`), Shaka Player with DASH/HLS for flat media, native HLS fallback for Safari.
  - Validates DRM license tokens when provided.
- **APIs Used:**
  - `GET /api/v1/content/content/{contentId}/stream` (via `getStreamingUrl`)
- **Data Mode:** **Real Backend Data.**
