# OTT Platform Project Guide

## Overview

This project is a modern OTT streaming platform built with **Next.js 14** using the **App Router** and **TypeScript**. It is designed for video streaming, membership-based access, and a robust admin/content management workflow.

The project combines:

- User authentication and membership tiers
- Video playback support for HLS and VR
- Content browsing and filtering
- Stripe payment flow (mock mode enabled by default)
- Admin and creator management screens
- A modular component-based UI built with Tailwind CSS

## User Journey

### 1. Landing and Authentication

- The user lands on the home page served from `app/page.tsx`.
- Public pages and login pages live under `app/` and `app/auth/`.
- Authentication is handled through `lib/auth.ts` using `next-auth`.
- Credentials provider is active by default, while Google and GitHub providers are configured as placeholders.
- On login, the project queries the mock user store in `lib/db/adapter.ts` and creates a session.

### 2. Membership and Access Control

- The app supports three membership tiers:
  - `FREE`
  - `KIDS`
  - `FULL`
- Guard logic is implemented in `lib/guards/membership.tsx`.
- Pages and APIs use guard helpers like `requireAuth()`, `requireKidsMembership()`, and `requireFullMembership()`.
- If a user lacks access, they are redirected to the appropriate sign-in or billing page.
- Membership state is stored on the session and reinforced in JWT callbacks.

### 3. Content Browsing

- Content-related UI components are in `components/Content/`.
- The platform supports browsing movies, series, and kids content.
- Components such as `ContentCard.tsx`, `ContentHeader.tsx`, and `ContentFilter.tsx` are used to render content lists.
- `lib/contentApi.ts`, `lib/featuredTrailers.ts`, and `lib/mockData.ts` provide content data.

### 4. Video Playback

- Video players are implemented in `players/` and `components/`.
- `players/HLSPlayer.tsx` and `components/ShakaPlayer/ShakaPlayer.tsx` handle HLS playback.
- VR playback is available via `components/VrAframePlayer/VRAframePlayer.tsx`.
- The app supports both standard streaming and immersive playback experiences.

### 5. Billing and Payments

- Payment and subscription utilities are located in `lib/stripe.ts`, `lib/paymentsApi.ts`, and `lib/db/adapter.ts`.
- The app can run in **mock payment mode** controlled by `NEXT_PUBLIC_USE_MOCK_DATA=true`.
- In mock mode, payment flows return fake Stripe sessions and portal URLs.
- Real Stripe integration is scaffolded but disabled by default.

### 6. Admin & Creator Experience

- Admin pages are inside `app/admin/` and `components/admin/`.
- There are dedicated areas for content management, creator management, analytics, and settings.
- The admin sidebar, upload widgets, and content forms are split into reusable components.
- Upload helpers and media conversion logic are present in `lib/uploader.ts`, `lib/uploadHelper.ts`, and `lambda/` scripts.

## Architecture and Core Directories

### `app/`

- Holds all route-level server and client components.
- Includes root layout and route files such as `layout.tsx`, `loading.tsx`, `not-found.tsx`, and `page.tsx`.
- Subfolders like `admin/` and `api/` define nested routes.

### `components/`

- Reusable UI building blocks used by pages throughout the site.
- Includes layout components, forms, loaders, player wrappers, and admin UI.
- Key component folders include `Loader/`, `auth/`, `Content/`, `admin/`, `payments/`, and `profiles/`.

### `lib/`

- Contains business logic, helpers, API wrappers, authentication, and mock data.
- Important files:
  - `lib/auth.ts` — NextAuth configuration and session handling
  - `lib/config.ts` — feature flags, mock mode settings, and environment controls
  - `lib/guards/membership.tsx` — server-side authorization guards
  - `lib/stripe.ts` — stripe checkout and subscription helpers
  - `lib/db/adapter.ts` — mock database adapter and membership data

## Data Flow

1. A user requests a page.
2. Server components use `lib/guards/membership.tsx` to validate access.
3. UI components call helper functions or API routes from `lib/`.
4. `lib/config.ts` determines whether the app uses mock data or real backend services.
5. Authentication state is stored in `next-auth` session tokens via `lib/auth.ts`.
6. When the user plays a video, player components load media URLs from the content store.
7. Billing interactions pass through `lib/stripe.ts` and update mock membership values in `lib/db/adapter.ts`.

## Important Notes

- The project currently supports **mock mode** for development. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` to avoid external dependencies.
- Stripe and WordPress integrations are scaffolded but disabled by default in `lib/config.ts` and `lib/stripe.ts`.
- Next.js build settings are configured to ignore ESLint and TypeScript build errors during production build (`next.config.js`).

## Recommended Extension Points

- Replace mock adapter in `lib/db/adapter.ts` with a real database adapter.
- Enable Stripe by uncommenting the Stripe client initialization in `lib/stripe.ts` and providing real keys.
- Connect `WORDPRESS_CONFIG` to a live WordPress API for blog posts.
- Add actual API routes beneath `app/api/` for content, billing, and session management.
- Expand `components/Content/` and `components/admin/` for richer catalog and backend management.
