# Authentication & Membership Setup Guide

This guide explains how to configure and use the authentication and membership system in your OTT platform.

## Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Membership Tiers](#membership-tiers)
4. [Stripe Integration](#stripe-integration)
5. [Usage Examples](#usage-examples)
6. [Database Migration](#database-migration)

## Overview

The OTT platform includes:

- **NextAuth.js** for authentication (credentials, Google, GitHub)
- **Three membership tiers**: Free, Kids, Full
- **Stripe integration** for payment processing
- **Device management** with tier-based limits
- **Server-side guards** for route protection
- **Mock database adapter** (replaceable with real database)

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

#### Required Variables:

```bash
# Generate a secret key
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
```

#### Stripe Setup:

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from Dashboard → Developers → API keys
3. Add to `.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

4. Create products and prices in Stripe Dashboard:
   - **Kids Plan**: $9.99/month
   - **Full Plan**: $14.99/month

5. Copy the price IDs to `.env.local`:

```bash
STRIPE_PRICE_ID_KIDS=price_...
STRIPE_PRICE_ID_FULL=price_...
```

6. Set up webhook endpoint:

- URL: `https://yourdomain.com/api/stripe/webhook`
- Events to listen for:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

7. Copy webhook secret to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### OAuth Providers (Optional):

**Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add to `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**GitHub OAuth:**

1. Go to [GitHub Settings → Developer settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm dev
```

### 4. Test Stripe Webhooks Locally

Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Linux
See: https://stripe.com/docs/stripe-cli#install
```

Forward webhooks to local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Trigger test events:

```bash
stripe trigger customer.subscription.created
```

## Membership Tiers

### Free Tier ($0)

- 1 device
- Access to kids content only
- No adult content
- No premium features

### Kids Plan ($9.99/month)

- 2 devices
- Kids content ringfenced
- Parental controls
- No adult content

### Full Access ($14.99/month)

- 5 devices
- Full content library
- Kids + adult content
- 4K streaming
- Offline downloads

## Stripe Integration

### Payment Flow

1. User clicks "Upgrade" button on billing page
2. App creates Stripe checkout session
3. User completes payment on Stripe
4. Stripe sends webhook to `/api/stripe/webhook`
5. Webhook handler updates user membership in database
6. User is redirected back to app with updated membership

### Creating a Checkout Session

```typescript
import { createCheckoutSession } from '@/lib/stripe'

const { url } = await createCheckoutSession(
  userId,
  priceId,
  userEmail,
  'http://localhost:3000/billing?success=true',
  'http://localhost:3000/billing?canceled=true'
)

// Redirect user to Stripe checkout
window.location.href = url
```

### Managing Subscription

```typescript
import { createCustomerPortalSession } from '@/lib/stripe'

const { url } = await createCustomerPortalSession(stripeCustomerId, 'http://localhost:3000/billing')

// Redirect user to Stripe customer portal
window.location.href = url
```

## Usage Examples

### Protecting a Page (Server Component)

```tsx
// app/premium/page.tsx
import { requireFullMembership } from '@/lib/guards/membership'

export default async function PremiumPage() {
  // This will redirect if user doesn't have FULL membership
  const session = await requireFullMembership()

  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>You have full access to premium content.</p>
    </div>
  )
}
```

### Protecting an API Route

```tsx
// app/api/premium-content/route.ts
import { requireFullMembership } from '@/lib/guards/membership'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    await requireFullMembership()

    return NextResponse.json({
      data: 'Premium content here',
    })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

### Checking Access Without Redirecting

```tsx
// app/content/[id]/page.tsx
import { checkMembershipAccess } from '@/lib/guards/membership'
import { MembershipType } from '@/lib/auth'

export default async function ContentPage() {
  const { hasAccess, session } = await checkMembershipAccess([MembershipType.FULL])

  if (!hasAccess) {
    return (
      <div>
        <h1>Premium Content</h1>
        <p>Upgrade to Full Access to view this content.</p>
        <a href="/billing">Upgrade Now</a>
      </div>
    )
  }

  return <div>Premium content here</div>
}
```

### Client Component with Session

```tsx
'use client'

import { useSession } from 'next-auth/react'
import { membershipGuardUtils } from '@/lib/guards/membership'

export function UserProfile() {
  const { data: session } = useSession()

  if (!session) {
    return <div>Please sign in</div>
  }

  const canAccessFull = membershipGuardUtils.canAccessFullContent(session.user.membershipType)

  return (
    <div>
      <h2>{session.user.name}</h2>
      <p>Membership: {session.user.membershipType}</p>
      <p>Devices: {session.user.deviceLimit}</p>
      {!canAccessFull && (
        <p>{membershipGuardUtils.getUpgradeMessage(session.user.membershipType)}</p>
      )}
    </div>
  )
}
```

## Database Migration

The current implementation uses a mock in-memory database. For production, replace it with a real database.

### Using Prisma with PostgreSQL

1. Install Prisma:

```bash
pnpm add prisma @prisma/client
pnpm prisma init
```

2. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  name                  String?
  hashedPassword        String?
  membershipType        String   @default("FREE")
  stripeCustomerId      String?  @unique
  stripeSubscriptionId  String?  @unique
  subscriptionStatus    String?
  devices               Device[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Device {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceName String
  deviceType String
  lastActive DateTime @default(now())
  createdAt  DateTime @default(now())
}
```

3. Generate Prisma client:

```bash
pnpm prisma generate
```

4. Create and run migrations:

```bash
pnpm prisma migrate dev --name init
```

5. Replace mock functions in `lib/db/adapter.ts` with Prisma calls:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

// ... rest of the functions
```

### Using Supabase

1. Install Supabase client:

```bash
pnpm add @supabase/supabase-js
```

2. Create tables in Supabase dashboard

3. Replace functions in `lib/db/adapter.ts` with Supabase calls

### Using MongoDB with Mongoose

1. Install Mongoose:

```bash
pnpm add mongoose
```

2. Define schemas and models

3. Replace functions in `lib/db/adapter.ts` with Mongoose calls

## Testing

### Test User Accounts

The mock database includes three test users:

```
Email: demo@example.com
Password: password123
Membership: FREE

Email: full@example.com
Password: password123
Membership: FULL (with active subscription)

Email: kids@example.com
Password: password123
Membership: KIDS (with active subscription)
```

### Test Stripe Integration

Use Stripe test cards:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

## Troubleshooting

### "Cannot find module 'next-auth'"

Run `pnpm install` to install dependencies.

### Stripe webhook not receiving events

- Check webhook URL is correct
- Verify webhook secret matches `.env.local`
- Use Stripe CLI for local testing

### Session not persisting

- Verify `NEXTAUTH_SECRET` is set
- Check cookies are enabled in browser
- Clear browser cache and cookies

### TypeScript errors

Run `pnpm type-check` to see all errors. The mock database will show type errors until dependencies are installed with `pnpm install`.

## Support

For issues or questions:

- Check the README.md
- Review code comments in source files
- Open an issue on GitHub

---

**Note:** Remember to replace the mock database with a real database before deploying to production!
