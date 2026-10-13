# Data Models & Schema Specifications — URVIEW OTT

This document provides a comprehensive catalog of all confirmed data models, database entities, frontend TypeScript interfaces, relationships, and schema enums in the URVIEW application.

---

## 1. Schema Classification Overview

Data structures across this repository fall into three distinct architectural tiers:

1. **Confirmed Backend DRF Entities:** Models backed by database tables on the external Django REST Framework API, verified through request payloads, API responses, and Django documentation files (`Part4_Admin_Analytics.md`, `lib/types/content.ts`).
2. **Frontend-Only TypeScript Interfaces:** Interfaces defining view models, form state, and UI representations within the Next.js application.
3. **Mock & In-Memory Entities:** Mock data structures used during offline development (`lib/db/adapter.ts`, `lib/data/catalog.json`, `lib/adminFlags.ts`).

---

## 2. Core Entities & Model Specifications

### A. Content Entity (`Content`)
The foundational media entity representing movies, series, episodes, trailers, and documentaries.

- **Primary Source File:** [lib/types/content.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/types/content.ts#L58-L95)
- **Database Status:** Confirmed Django Model (`content_content` table)
- **Relationships:**
  - `creators`: Many-to-Many with `Creator` (`content_creator`)
  - `parent`: Foreign Key to self (`Content.id` representing Series or Season parent)
  - `children`: One-to-Many reverse relation for sub-items (Seasons/Episodes)
  - `renditions`: One-to-Many with `Rendition`
  - `assets`: One-to-Many with `Asset`
  - `metadata`: One-to-One with `ContentMetadata`
  - `trailer`: Optional relation to another `Content` item of type `'trailer'`

| Field Name | Type | Required | Description / Constraints |
|---|---|---|---|
| `id` | `string` / `number` | Yes | Primary Key (e.g. `"cont_123"` or numeric ID) |
| `title` | `string` | Yes | Media display title (max 255 chars) |
| `description` | `string` | Yes | Synopsis / overview text |
| `content_type` | `ContentType` (Enum) | Yes | `'movie'`, `'series'`, `'episode'`, `'trailer'`, `'documentary'`, `'season'`, `'democontent'` |
| `media_type` | `MediaType` (Enum) | Yes | Projection mode: `'flat'`, `'vr_360_mono'`, `'vr_360_sbs'`, `'vr_360_tb'`, `'vr_180_mono'`, `'vr_180_sbs'`, `'vr_180_tb'` |
| `status` | `ContentStatus` (Enum) | Yes | Lifecycle: `'ready'`, `'draft'`, `'uploaded'`, `'published'`, `'inactive'`, `'failed'`, `'archived'` |
| `visibility_mode` | `VisibilityMode` (Enum)| Yes | Audience visibility: `'public'` or `'beta'` |
| `is_kid_safe` | `boolean` | Yes | Child safety filter flag for Kids Zone |
| `is_educational` | `boolean` | No | Educational categorization flag |
| `is_ppv` | `boolean` | Yes | Pay-Per-View flag requiring ticket purchase |
| `price` | `number` | No | PPV price in default currency if `is_ppv: true` |
| `genres` | `string[]` | No | Genre tags (e.g. `["Action", "Sci-Fi"]`) |
| `creators` | `string[]` | No | Associated Creator IDs |
| `poster_url` | `string` | No | URL to portrait poster image (2:3 aspect) |
| `banner_url` | `string` | No | URL to landscape wide banner (16:9 aspect) |
| `thumbnail_url` | `string` | No | URL to square or video preview thumbnail |
| `duration_seconds` | `number` | No | Runtime in seconds |
| `release_date` | `string` (ISO date) | No | Official release date (`YYYY-MM-DD`) |
| `rating` | `string` | No | Content maturity rating (`TV-Y`, `PG-13`, `R`, etc.) |
| `director` | `string` | No | Director's name |
| `cast` | `string[]` | No | Array of principal cast members |
| `parent` | `number` / `string` | No | Foreign Key to parent Series or Season |
| `season_number` | `number` | No | Season ordinal number (for episodes/seasons) |
| `episode_number` | `number` | No | Episode ordinal number (for episodes) |
| `trailer_id` | `string` | No | ID of associated native trailer content |
| `trailer_youtube_url`| `string` | No | Embedded YouTube fallback link |
| `transcoding_progress`| `number` | No | 0 to 100 percentage integer |
| `ingest_status` | `IngestStatus` (Enum)| No | `'ready'`, `'processing'`, `'uploading'`, `'failed'` |
| `created_at` | `string` (ISO 8601) | Yes | Record creation timestamp |
| `updated_at` | `string` (ISO 8601) | Yes | Last modified timestamp |
- **Associated Endpoints:**
  - `GET /api/v1/content/contents`
  - `POST /api/v1/content/contents`
  - `GET /api/v1/content/contents/{id}`
  - `PATCH /api/v1/content/contents/{id}`
  - `DELETE /api/v1/content/contents/{id}`
  - `POST /api/v1/content/contents/{id}/publish`

---

### B. Extended Content Metadata (`ContentMetadata`)
Stores deep filmographic details, production credits, and linguistic parameters.

- **Primary Source File:** [lib/types/content.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/types/content.ts#L43-L57)
- **Database Status:** Confirmed Django Model (`content_contentmetadata`)
- **Relationships:** One-to-One with `Content` (`content_id`)

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | `string` / `number` | No (Auto) | Primary Key |
| `content` | `string` / `number` | Yes | Foreign Key to `Content.id` |
| `directors` | `string[]` | Yes | Array of director names |
| `producers` | `string[]` | Yes | Array of producer names |
| `cast` | `string[]` | Yes | Array of starring actors/actresses |
| `genres` | `string[]` | Yes | Genre classifications |
| `release_year` | `number` | No | Release year (e.g. `2026`) |
| `age_rating` | `string` | No | Content advisory certification |
| `language` | `string` | No | Primary audio language ISO code |
| `subtitles_available`| `string[]` | Yes | ISO codes of available subtitle tracks |
| `production_company`| `string` | No | Studio / production company |
| `country` | `string` | No | Country of origin |
| `awards` | `string[]` | Yes | Film festival awards and honors |
- **Associated Endpoints:**
  - `POST /api/v1/content/content-metadata`
  - `PATCH /api/v1/content/content-metadata/{id}`

---

### C. Media Asset & Rendition (`Asset`, `Rendition`)
Tracks raw source files in S3 and processed adaptive-bitrate video streams.

- **Primary Source File:** [lib/types/content.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/types/content.ts#L166-L238)
- **Database Status:** Confirmed Models (`content_asset`, `content_rendition`)

#### Asset
| Field Name | Type | Description |
|---|---|---|
| `id` | `string` | Asset Primary Key |
| `content` | `string` | Foreign Key to `Content.id` |
| `s3_key` | `string` | S3 object key (e.g. `uploads/video/123/master.mp4`) |
| `bucket` | `string` | S3 bucket name |
| `size_bytes` | `number` | File size in bytes |
| `mime_type` | `string` | MIME type (e.g. `video/mp4`, `video/quicktime`) |
| `ingest_status` | `IngestStatus` | `'ready'`, `'processing'`, `'uploading'`, `'failed'` |
| `original_filename`| `string` | Original file name during client upload |

#### Rendition
| Field Name | Type | Description |
|---|---|---|
| `id` | `string` | Rendition Primary Key |
| `label` | `string` | Resolution label (`"1080p"`, `"720p"`, `"4K"`, `"8K"`) |
| `width` | `number` | Pixel width (e.g. `1920`) |
| `height` | `number` | Pixel height (e.g. `1080`) |
| `bitrate` | `number` | Target bitrate in bits per second (e.g. `5000000`) |
| `stream_url` | `string` | Direct HLS/DASH variant stream URL |
- **Associated Endpoints:**
  - `GET /api/v1/content/content/{contentId}/renditions`
  - `GET /api/v1/content/content/{contentId}/stream`

---

### D. Creator Entity (`Creator`)
Represents independent studios, directors, and production partners.

- **Primary Source File:** [lib/creatorApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/creatorApi.ts#L5-L11)
- **Database Status:** Confirmed Django Model (`content_creator`)

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | `string` / `number` | No (Auto) | Primary Key |
| `name` | `string` | Yes | Creator / Studio brand name |
| `bio` | `string` | No | Biography / studio description |
| `email` | `string` | No | Contact email address |
| `phone` | `string` | No | Contact phone number |
- **Associated Endpoints:**
  - `GET /api/v1/content/creators`
  - `POST /api/v1/content/creators`
  - `PATCH /api/v1/content/creators/{id}`
  - `DELETE /api/v1/content/creators/{id}`

---

### E. User Entity (`User`)
Represents customer and administrator accounts.

- **Primary Source Files:** [lib/userApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/userApi.ts#L5-L18) / [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts#L58-L67)
- **Database Status:** Confirmed Django User Model (`auth_user` / custom user table)

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | `number` / `string` | Yes | Primary Key |
| `email` | `string` | Yes | Unique login email address |
| `name` | `string` | Yes | Full name / display username |
| `role` | `string` | Yes | `'admin'`, `'creator'`, `'subscriber'`, `'user'`, `'beta_tester'` |
| `status` | `string` (Enum) | Yes | Account status: `'active'`, `'banned'`, `'suspended'` |
| `is_active` | `boolean` | Yes | System activation boolean flag |
| `email_verified` | `boolean` | No | Verification confirmation flag |
| `subscription_tier`| `string` | No | `'free'`, `'premium'`, `'vip'` |
| `kid_mode` | `boolean` | No | Restricts master account viewing to Kids Zone |
| `educational_mode` | `boolean` | No | Restricts account to educational content |
| `created_at` | `Date` / `string` | Yes | Timestamp of account registration |
- **Associated Endpoints:**
  - `GET /api/v1/users`
  - `PATCH /api/v1/users/{id}/update`
  - `DELETE /api/v1/users/{id}/delete`
  - `GET /api/v1/me`

---

### F. User Sub-Profile (`Profile`)
Child profiles under a parent subscriber account.

- **Primary Source Files:** [lib/profilesApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/profilesApi.ts#L32-L43) / [app/admin/user-profiles/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/user-profiles/page.tsx#L8-L16)
- **Database Status:** Confirmed Django Model (`accounts_profile`)
- **Relationships:** Many-to-One with `User` (`user_id`)

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Profile Primary Key |
| `user_id` / `user` | `string` / `number` | Yes | Foreign Key to master `User.id` |
| `display_name` / `username`| `string` | Yes | Profile display nickname |
| `avatar_url` | `string` | No | Custom avatar image URL |
| `is_kids_profile` | `boolean` | Yes | Forces sandboxed Kids Zone interface |
| `is_profile_locked`| `boolean` | Yes | Enforces parental PIN verification to enter |
| `pin` | `string` (4 digits) | No | Encrypted 4-digit security PIN |
| `preferred_language`| `string` | No | Preferred audio/subtitle language code |
| `maturity_rating` | `string` | No | Maximum permitted content rating |
| `created_at` | `string` | Yes | Creation timestamp |
- **Associated Endpoints:**
  - `GET /api/v1/accounts/profiles/` (or `/api/v1/profiles`)
  - `POST /api/v1/accounts/profiles/`
  - `PUT /api/v1/accounts/profiles/{id}/`
  - `DELETE /api/v1/accounts/profiles/{id}/`
  - `POST /api/v1/profiles/{id}/verify-pin`

---

### G. Payment Plan (`PaymentPlan`)
Commercial monetization tiers for recurring access.

- **Primary Source Files:** [lib/types/content.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/types/content.ts#L376-L390) / [lib/paymentsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/paymentsApi.ts#L22-L37)
- **Database Status:** Confirmed Django Model (`payments_plan`)

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Primary Key (e.g. `"plan_premium_4k"`) |
| `name` | `string` | Yes | Display plan title (e.g. `"Family Premium"`) |
| `description` | `string` | Yes | Marketing description / bullet points |
| `price` | `number` | Yes | Subscription cost (e.g. `14.99`) |
| `currency` | `string` | Yes | 3-letter currency code (e.g. `"USD"`) |
| `duration_days` | `number` | Yes | Billing interval duration (typically `30` or `365`) |
| `max_devices` | `number` | Yes | Maximum concurrent registered devices (1-10) |
| `max_profiles` | `number` | Yes | Maximum sub-profiles permitted (1-5) |
| `can_access_premium`| `boolean` | Yes | Grants access to 4K, VR, and VIP catalog items |
| `ad_supported` | `boolean` | Yes | Controls whether user is served preroll ads |
| `stripe_price_id` | `string` | Yes | Bound Stripe Price ID (`price_...`) |
| `is_active` | `boolean` | Yes | Controls public visibility for new subscriptions |
| `created_at` | `string` | Yes | Creation timestamp |
- **Associated Endpoints:**
  - `GET /api/v1/payments/plans`
  - `POST /api/v1/payments/plans`
  - `GET /api/v1/payments/plans/{id}`
  - `PUT /api/v1/payments/plans/{id}`
  - `DELETE /api/v1/payments/plans/{id}`

---

### H. Subscription (`Subscription`)
Customer active recurring subscription contracts.

- **Primary Source Files:** [lib/types.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/types.ts#L73-L82) / [app/admin/subscriptions/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/subscriptions/page.tsx#L17-L29)
- **Database Status:** Confirmed Django Model (`payments_subscription`)
- **Relationships:** Many-to-One with `User`, Many-to-One with `PaymentPlan`

| Field Name | Type | Description |
|---|---|---|
| `id` | `string` | Subscription Primary Key |
| `user` / `userId` | `string` | User reference (email or user ID) |
| `plan` | `object` / `string` | Embedded Plan object (`id`, `name`, `price`) |
| `status` | `string` (Enum) | `'active'`, `'trialing'`, `'canceled'`, `'past_due'` |
| `stripeSubscriptionId`| `string` | Stripe Subscription ID (`sub_...`) |
| `stripeCustomerId` | `string` | Stripe Customer ID (`cus_...`) |
| `start_date` | `string` (ISO) | Beginning of subscription |
| `end_date` / `currentPeriodEnd` | `string` / `Date`| Renewal / termination timestamp |
| `created_at` | `string` (ISO) | Timestamp of subscription start |

---

### I. Pre-Signup Settings & Waitlist Entry (`PreSignupSettings`, `WaitlistEntry`)

- **Primary Source File:** [lib/preSignupApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/preSignupApi.ts#L16-L36)
- **Database Status:** Confirmed Django Models (`platform_presignupsettings`, `platform_waitlist`)

#### PreSignupSettings
| Field Name | Type | Description |
|---|---|---|
| `pre_signup_enabled` | `boolean` | Master toggle enabling pre-signup gate |
| `pre_signup_capacity` | `number` | Maximum allowed beta / trial cohort capacity |
| `pre_signup_trial_days` | `number` | Trial access duration awarded to invitees |
| `pre_signup_trial_plan_name` | `string` | Display name of granted trial plan |
| `remaining_pre_signup_capacity`| `number` | Read-only calculation of remaining open slots |
| `updated_at` | `string` | Last modified timestamp |

#### WaitlistEntry
| Field Name | Type | Description |
|---|---|---|
| `id` | `number` | Waitlist Primary Key |
| `email` | `string` | Candidate email address |
| `name` | `string` | Candidate full name |
| `status` | `WaitlistStatus` | `'pending'`, `'notified'`, `'converted'`, `'expired'` |
| `source` | `string` | Attribution source (e.g. `'landing_hero'`, `'referral'`) |
| `user` | `number` \| `null` | Foreign Key to `User.id` once converted |
| `notified_at` | `string` \| `null` | Timestamp when invitation email was sent |
| `converted_at` | `string` \| `null` | Timestamp when user completed signup |
| `created_at` | `string` | Submission timestamp |
- **Associated Endpoints:**
  - `GET /api/v1/platform/pre-signup-settings`
  - `PATCH /api/v1/platform/pre-signup-settings`
  - `GET /api/v1/platform/waitlist`
  - `POST /api/v1/platform/waitlist/promote`
  - `GET /api/v1/platform/waitlist/{id}`
  - `PATCH /api/v1/platform/waitlist/{id}`
  - `DELETE /api/v1/platform/waitlist/{id}`

---

### J. Frequently Asked Questions (`FAQ`)

- **Primary Source File:** [lib/faq.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/faq.ts#L3-L11)
- **Database Status:** Confirmed Django Model (`platform_faq`)

| Field Name | Type | Required | Description |
|---|---|---|---|
| `id` | `number` | No (Auto) | Primary Key |
| `question` | `string` | Yes | FAQ question heading |
| `answer` | `string` | Yes | FAQ answer markdown / text body |
| `order` | `number` | Yes | Integer defining display sequence order |
| `is_active` | `boolean` | Yes | Visibility toggle on customer portal |
| `created_at` | `string` | No | Timestamp of creation |
| `updated_at` | `string` | No | Timestamp of last modification |
- **Associated Endpoints:**
  - `GET /api/v1/platform/faqs`
  - `POST /api/v1/platform/faqs`
  - `PATCH /api/v1/platform/faqs/{id}`
  - `DELETE /api/v1/platform/faqs/{id}`

---

### K. Platform & Editorial Settings

- **Primary Source Files:** [lib/platformApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/platformApi.ts) / [lib/additionalSettingsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/additionalSettingsApi.ts)
- **Database Status:** Confirmed Models (`platform_settings`, `platform_footercontent`)

#### PlatformSettings
| Field Name | Type | Description |
|---|---|---|
| `site_name` | `string` | Global platform title (e.g. `"URVIEW"`) |
| `logo_s3_key` | `string` | S3 object key for the active logo |
| `primary_color` | `string` | Hex color code for primary buttons/accents |
| `secondary_color`| `string` | Hex color code for secondary accents |
| `support_email` | `string` | Customer support contact address |
| `currency_default`| `string` | ISO currency code (e.g. `"USD"`) |

#### FooterContent
| Field Name | Type | Description |
|---|---|---|
| `id` | `number` | Primary Key |
| `text_1` | `string` | Primary footer slogan / description |
| `text_2` | `string` | Copyright statement |
| `social_links` | `object` | `{ facebook?, twitter?, linkedin?, instagram? }` |
| `other_links` | `object` | `{ privacy?, terms?, contact? }` |

---

## 3. Mock & In-Memory Entities (Dev / Offline Only)

### In-Memory Adapter User (`lib/db/adapter.ts`)
```typescript
export interface User {
  id: string
  email: string
  name?: string | null
  hashedPassword?: string | null
  membershipType: MembershipType // FREE, KIDS, FULL
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
  createdAt: Date
  updatedAt: Date
}
```

### In-Memory Device Entity (`lib/types.ts` & `lib/db/adapter.ts`)
```typescript
export interface Device {
  id: string
  userId: string
  deviceName: string
  deviceType: 'web' | 'mobile' | 'tv' | 'tablet'
  lastActive: Date
  createdAt: Date
}
```

### Static Catalog Title (`lib/data/catalog.json` & `app/api/catalog/route.ts`)
Used exclusively for local mock catalog search, featuring custom fields:
- `isImmersive`: boolean (VR flag)
- `projection`: `'360' | '180' | 'flat'`
- `dimension`: `'2D' | '3D'`
- `resolutionClass`: `'8K' | '11K' | '13K' | '14K'`
- `visibleWithoutSignup`: boolean (overridden by `lib/adminFlags.ts`)
- `isDemoContent`: boolean (overridden by `lib/adminFlags.ts`)
