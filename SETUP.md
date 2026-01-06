# OTT Web Project - Quick Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **pnpm** (version 8 or higher)
   - Install globally: `npm install -g pnpm`
   - Verify installation: `pnpm --version`

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
pnpm install
```

This will install all required packages including Next.js, React, TypeScript, Tailwind CSS, ESLint, and Prettier.

### Step 2: Configure Environment Variables

Copy the example environment file:

```bash
# Windows
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-string
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

### Step 3: Start Development Server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser. You're ready to go! 🎉

## 📦 Creating a ZIP Distribution

To create a ZIP file of this project scaffold:

### Windows:
```bash
# Double-click create-zip.bat
# OR run in command prompt:
create-zip.bat
```

### macOS/Linux:
```bash
pnpm zip
```

This will create `web-scaffold.zip` in the project root.

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server on http://localhost:3000 |
| `pnpm build` | Create production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint to check code quality |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm format` | Format all code with Prettier |
| `pnpm format:check` | Check if code is formatted |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm clean` | Remove build artifacts |
| `pnpm zip` | Create deployment ZIP file |

## 📂 Project Structure Overview

```
web/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with header/footer
│   ├── page.tsx             # Home page
│   ├── loading.tsx          # Loading UI
│   ├── error.tsx            # Error handling
│   ├── not-found.tsx        # 404 page
│   └── api/                 # API routes
│       └── health/          # Health check endpoint
├── components/              # Reusable UI components
│   ├── Button.tsx          # Button component
│   ├── Card.tsx            # Card component
│   └── index.ts            # Component exports
├── players/                # Video player components
│   ├── VideoPlayer.tsx     # HTML5 video player
│   ├── HLSPlayer.tsx       # HLS streaming player
│   └── index.ts            # Player exports
├── lib/                    # Utilities and helpers
│   ├── utils.ts            # General utility functions
│   ├── api.ts              # API fetch wrappers
│   └── index.ts            # Library exports
├── styles/                 # Global styles
│   └── globals.css         # Tailwind CSS imports
├── public/                 # Static assets
│   ├── logo.svg            # Logo file
│   └── robots.txt          # SEO robots file
└── scripts/               # Build scripts
    └── create-zip.js      # ZIP creation script
```

## 🎨 Key Features

✅ **Next.js 14+** with App Router  
✅ **TypeScript** for type safety  
✅ **Tailwind CSS** for styling  
✅ **ESLint + Prettier** configured  
✅ **Custom Video Players** (HTML5 & HLS)  
✅ **API Utilities** for backend integration  
✅ **Error Boundaries** and loading states  
✅ **SEO Ready** with metadata API  
✅ **pnpm Workspace** configuration  

## 🔧 Configuration Files Explained

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration with path aliases |
| `tailwind.config.ts` | Tailwind CSS customization |
| `next.config.js` | Next.js configuration |
| `.eslintrc.json` | ESLint rules |
| `.prettierrc` | Code formatting rules |
| `pnpm-workspace.yaml` | pnpm workspace setup |
| `.npmrc` | pnpm configuration |

## 🌐 Deployment Options

### Vercel (Recommended)
1. Push code to GitHub
2. Import to Vercel
3. Configure environment variables
4. Auto-deploy on every push

```bash
# Or use Vercel CLI
pnpm add -g vercel
vercel
```

### Docker
```bash
docker build -t ott-web .
docker run -p 3000:3000 ott-web
```

### Manual Server
1. Build: `pnpm build`
2. Copy files to server
3. Install deps: `pnpm install --prod`
4. Start: `pnpm start`

## 💡 Common Tasks

### Add a New Page
Create a new folder in `app/`:
```typescript
// app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>
}
```

### Add a Component
Create in `components/`:
```typescript
// components/MyComponent.tsx
export const MyComponent = () => {
  return <div>My Component</div>
}
```

### Use Video Player
```typescript
import { VideoPlayer } from '@/players'

<VideoPlayer 
  src="/videos/demo.mp4" 
  poster="/posters/demo.jpg"
  controls 
/>
```

### Call API
```typescript
import { get, post } from '@/lib'

const data = await get('/api/videos')
const result = await post('/api/videos', { title: 'New Video' })
```

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Use different port
pnpm dev --port 3001
```

### Install fails
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### TypeScript errors
```bash
# Rebuild types
pnpm type-check
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [pnpm Documentation](https://pnpm.io/)

## 🤝 Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review Next.js and TypeScript docs
3. Open an issue on GitHub

---

**Ready to build something amazing! 🚀**
