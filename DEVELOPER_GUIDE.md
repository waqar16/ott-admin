# Developer Guide

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Optional: Git if you are cloning from a repository

## Project Setup

1. Open the repository root:

```bash
cd c:\Users\Mubashir\Desktop\Saim\OTT
```

2. Install dependencies:

```bash
pnpm install
```

3. Create your local environment file:

```bash
copy .env.example .env.local
```

4. Update `.env.local` with your values.

### Recommended environment variables

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
NEXT_PUBLIC_FRONTEND_BASE=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_API_KEY
```

> Use `NEXT_PUBLIC_USE_MOCK_DATA=true` for local development and testing without requiring real backend or Stripe services.

## Running the App Locally

### Development server

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

### Production build and start

```bash
pnpm build
pnpm start
```

This builds the Next.js application and serves the optimized production version.

## Common Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Start the development server with hot reload |
| `pnpm build`        | Build the app for production                 |
| `pnpm start`        | Start the production server                  |
| `pnpm lint`         | Run ESLint on the project                    |
| `pnpm lint:fix`     | Run ESLint and automatically fix issues      |
| `pnpm format`       | Format project files with Prettier           |
| `pnpm format:check` | Check formatting without modifying files     |
| `pnpm type-check`   | Run TypeScript type checking                 |
| `pnpm clean`        | Remove build artifacts (`.next`, `out`)      |
| `pnpm zip`          | Create a deployable ZIP archive              |

## Useful Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm lint:fix
pnpm format
pnpm type-check
pnpm clean
```

## Notes for Developers

- The app uses **Next.js App Router** and server components by default.
- Authentication is configured via `lib/auth.ts` and uses `next-auth`.
- Membership guard utilities are in `lib/guards/membership.tsx`.
- Core configuration values are in `lib/config.ts`.
- Payment helper code is in `lib/stripe.ts` and currently runs in mock mode unless fully configured.
- To enable real Stripe integration, provide the Stripe keys and uncomment the Stripe initialization code in `lib/stripe.ts`.

## Debugging and Local Development Tips

- If you need to use mock data, ensure `NEXT_PUBLIC_USE_MOCK_DATA=true`.
- For route-specific authorization issues, check `lib/guards/membership.tsx`.
- If media playback fails, inspect `players/` and `components/ShakaPlayer/ShakaPlayer.tsx`.
- If login fails, verify the mock user database in `lib/db/adapter.ts`.

## Project Structure Summary

- `app/` — Next.js page routes and layout
- `components/` — UI components and page building blocks
- `lib/` — auth, guards, API helpers, mock data, payment utilities
- `players/` — video playback components
- `public/` — static assets
- `styles/` — global styles and Tailwind setup
- `scripts/` — helper scripts such as ZIP creation

## Build Considerations

- Next.js is configured to ignore ESLint and TypeScript build errors during production builds in `next.config.js`.
- For production quality, fix lint and type issues before deploying.
- Confirm remote patterns in `next.config.js` if you serve images from external domains.

## Optional Deployment

### Vercel

1. Connect repository to Vercel.
2. Configure environment variables.
3. Deploy.

### Docker

Use a Node 18 base image, install pnpm, install dependencies, build, and run.

---

If you want, I can also add a short `CONTRIBUTING.md` for team onboarding and development conventions.
