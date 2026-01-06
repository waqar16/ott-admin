# OTT Platform - Netlify Deployment Guide

## Prerequisites

1. A Netlify account (sign up at https://netlify.com)
2. Git repository with your code pushed to GitHub/GitLab/Bitbucket
3. Node.js 18+ installed locally

## Quick Deploy Steps

### Option 1: Deploy via Netlify UI

1. **Connect Repository**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - **IMPORTANT**: Install the Next.js plugin automatically when prompted

3. **Set Environment Variables** (in Netlify dashboard → Site settings → Environment variables)
   ```
   # Required for mock mode (already set in code)
   NODE_ENV=production
   
   # Optional: Set when ready for production backend
   # NEXT_PUBLIC_API_URL=https://your-api.com
   # NEXTAUTH_URL=https://your-site.netlify.app
   # NEXTAUTH_SECRET=your-secret-here
   # STRIPE_SECRET_KEY=sk_live_...
   # NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   # WORDPRESS_API_URL=https://your-wp-site.com/wp-json/wp/v2
   # AWS_REGION=us-east-1
   # AWS_ACCESS_KEY_ID=your-key
   # AWS_SECRET_ACCESS_KEY=your-secret
   # S3_UPLOAD_BUCKET=your-bucket-name
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait 2-5 minutes for build to complete

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Navigate to your project
cd web

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

## Current Configuration

Your app is configured to run in **MOCK MODE** by default:
- ✅ No backend APIs required
- ✅ All features work with dummy data
- ✅ No database needed
- ✅ No authentication backend required

Mock mode is controlled in `lib/config.ts`:
```typescript
export const USE_MOCK_DATA = true;
```

## Post-Deployment

After successful deployment:

1. **Test Your Site**
   - Visit your Netlify URL (e.g., `your-site.netlify.app`)
   - Test all pages: Home, Catalog, Premiere, Blog, Kids Zone, Settings, Admin
   - Verify images load correctly
   - Test interactive features (filters, FAQ accordions, etc.)

2. **Custom Domain** (optional)
   - Go to Site settings → Domain management
   - Add your custom domain
   - Update DNS records as instructed

3. **Enable Forms** (if using Netlify Forms)
   - The email lead capture form can be configured to use Netlify Forms
   - Add `netlify` attribute to form element

## Switching to Production Mode

When ready to connect real backends:

1. **Update Configuration**
   ```typescript
   // lib/config.ts
   export const USE_MOCK_DATA = false;
   ```

2. **Add Environment Variables in Netlify**
   - Set all required API keys and secrets
   - Redeploy the site

3. **Uncomment Backend Code**
   - Search for `// TODO: Uncomment when backend ready`
   - Uncomment NextAuth, Stripe, AWS, WordPress code

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version (18+)

### Images Not Loading
- Images are configured for: unsplash.com, picsum.photos, i.pravatar.cc
- Check `next.config.js` for allowed image domains

### API Routes Not Working
- Netlify automatically handles Next.js API routes
- Check function logs in Netlify dashboard → Functions

### Environment Variables Not Working
- Redeploy after adding environment variables
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access

## Performance Optimization

1. **Enable Netlify CDN** (automatic)
2. **Enable asset optimization** in Site settings → Build & deploy → Post processing
3. **Configure caching headers** in `netlify.toml`

## Monitoring

- View real-time logs: Netlify dashboard → Functions
- Monitor bandwidth: Site settings → Usage
- Set up notifications: Site settings → Build notifications

## Support

- Netlify Docs: https://docs.netlify.com/integrations/frameworks/next-js/
- Next.js Docs: https://nextjs.org/docs/deployment#netlify
- GitHub Issues: Create an issue in your repository

---

**Note**: This deployment guide assumes you're deploying with mock data enabled. For production deployments with real backends, additional configuration will be required.
