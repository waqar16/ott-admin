# Web - OTT Platform

A modern Next.js + TypeScript streaming platform with Tailwind CSS, built for scalability and performance.

## 🚀 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Video Players:** Custom React video players with HLS support

## 📁 Project Structure

```
web/
├── app/                    # Next.js app router pages
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── index.ts
├── players/               # Video player components
│   ├── VideoPlayer.tsx
│   ├── HLSPlayer.tsx
│   └── index.ts
├── lib/                   # Utility functions and helpers
│   ├── utils.ts
│   ├── api.ts
│   └── index.ts
├── styles/                # Global styles
│   └── globals.css
├── public/                # Static assets
│   └── logo.svg
├── scripts/               # Build and utility scripts
│   └── create-zip.js
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
├── .eslintrc.json        # ESLint configuration
├── .prettierrc           # Prettier configuration
├── pnpm-workspace.yaml   # pnpm workspace config
└── .env.example          # Environment variables template
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### Install Dependencies

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.example.com

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Stripe Payment Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs for Membership Tiers
STRIPE_PRICE_ID_KIDS=price_your_kids_plan_id
STRIPE_PRICE_ID_FULL=price_your_full_plan_id

# Database Connection (if needed)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## 🏃 Running the Project

### Development Server

Start the development server with hot-reload:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application for production:

```bash
pnpm build
```

### Start Production Server

Run the production build locally:

```bash
pnpm start
```

### Other Commands

```bash
# Run ESLint
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check

# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean

# Create deployment ZIP
pnpm zip
```

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project to [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy automatically on every push

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:

```bash
docker build -t ott-web .
docker run -p 3000:3000 ott-web
```

### Manual Deployment

1. Build the project: `pnpm build`
2. Copy `.next`, `public`, `package.json`, and `pnpm-lock.yaml` to server
3. Install production dependencies: `pnpm install --prod`
4. Start the server: `pnpm start`

## 🎯 Features

- ✅ Next.js 14+ with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ ESLint + Prettier for code quality
- ✅ Custom video players (HTML5 & HLS)
- ✅ Responsive design
- ✅ API utilities for backend integration
- ✅ Environment variable configuration
- ✅ Modern folder structure
- ✅ pnpm workspace support
- ✅ **NextAuth.js authentication** (Credentials, Google, GitHub)
- ✅ **Three membership tiers** (Free, Kids, Full)
- ✅ **Stripe payment integration**
- ✅ **Device management** with tier-based limits
- ✅ **Kids ringfenced content** for family safety
- ✅ **Server-side membership guards**
- ✅ **Mock database adapter** (replaceable with Postgres)

## 📚 Key Components

### Authentication

The app uses NextAuth.js for authentication with multiple providers:

```tsx
// Protected page example
import { requireAuth } from '@/lib/guards/membership'

export default async function ProtectedPage() {
  const session = await requireAuth()
  return <div>Welcome, {session.user.name}!</div>
}

// Membership-restricted page
import { requireFullMembership } from '@/lib/guards/membership'

export default async function PremiumPage() {
  const session = await requireFullMembership()
  return <div>Premium content</div>
}
```

### Membership Tiers

Three membership types with different features:

| Feature | Free | Kids | Full |
|---------|------|------|------|
| Devices | 1 | 2 | 5 |
| Kids Content | ✅ | ✅ | ✅ |
| Adult Content | ❌ | ❌ | ✅ |
| Price | $0 | $9.99/mo | $14.99/mo |

### Stripe Integration

```tsx
// Webhook handler processes subscription events
// Located at: app/api/stripe/webhook/route.ts

// Supported events:
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
```

### Database Adapter

The app includes a mock database adapter that can be replaced with a real database:

```tsx
// Current: Mock in-memory database
import { getUserByEmail, updateUserMembership } from '@/lib/db/adapter'

// Replace with Prisma, PostgreSQL, or your preferred database
// See comments in lib/db/adapter.ts for Prisma schema example
```

### Video Players

```tsx
import { VideoPlayer, HLSPlayer } from '@/players'

// HTML5 Video Player
<VideoPlayer src="/videos/sample.mp4" poster="/posters/sample.jpg" controls />

// HLS Streaming Player
<HLSPlayer src="https://example.com/stream.m3u8" autoPlay />
```

### UI Components

```tsx
import { Button, Card } from '@/components'

<Button variant="primary" size="lg">
  Watch Now
</Button>

<Card title="Featured Content">
  <p>Content goes here</p>
</Card>
```

### API Utilities

```tsx
import { get, post } from '@/lib'

// Fetch data
const videos = await get('/api/videos')

// Send data
const result = await post('/api/videos', { title: 'New Video' })
```

## 🔧 Configuration

### Path Aliases

Configured in `tsconfig.json`:

- `@/*` - Root directory
- `@/components/*` - Components folder
- `@/players/*` - Players folder
- `@/lib/*` - Library folder
- `@/styles/*` - Styles folder
- `@/public/*` - Public assets

### Tailwind CSS

Custom configuration in `tailwind.config.ts` with theme extensions and custom utilities.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and TypeScript**
