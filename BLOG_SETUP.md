# WordPress Blog Integration Guide

Complete guide for integrating a headless WordPress blog with your Next.js OTT platform, including hosting options, proxy configuration, and SEO best practices.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [WordPress Setup](#wordpress-setup)
- [Hosting Options](#hosting-options)
- [Proxy Configuration](#proxy-configuration)
- [SEO and Canonical Tags](#seo-and-canonical-tags)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Your Domain                          │
│                 https://yourdomain.com                  │
└─────────────────────────────────────────────────────────┘
                        │
                        ├─── /                 → Next.js App (Main OTT Platform)
                        ├─── /catalog         → Next.js App
                        ├─── /blog            → Next.js (Headless WP)
                        └─── /wp-admin        → WordPress Admin (Proxied/Subdomain)
                                │
                                └─── WordPress Installation
                                     ├── WP REST API (/wp-json/wp/v2)
                                     └── Admin Dashboard
```

### Two Main Approaches:

1. **Subdomain Approach** (Recommended)
   - WordPress: `blog.yourdomain.com` or `wp.yourdomain.com`
   - Next.js fetches from subdomain REST API
   - Separate hosting/infrastructure
   - Better isolation and scaling

2. **Reverse Proxy Approach**
   - WordPress: Hidden backend server
   - Next.js: `/blog` routes (headless display)
   - Nginx/CloudFlare proxies `/wp-admin` to WordPress
   - Single domain for everything

## 🔧 WordPress Setup

### 1. Install WordPress

Choose your hosting method (see [Hosting Options](#hosting-options)), then install WordPress:

```bash
# Using WP-CLI (recommended)
wp core download --path=/var/www/wordpress
wp config create --dbname=wordpress --dbuser=wpuser --dbpass=password
wp core install --url="https://wp.yourdomain.com" \
  --title="OTT Platform Blog" \
  --admin_user=admin \
  --admin_email=admin@yourdomain.com
```

### 2. Configure WordPress for Headless Use

Add to `wp-config.php`:

```php
// Enable REST API
define('REST_API_ENABLED', true);

// Disable XML-RPC (security)
add_filter('xmlrpc_enabled', '__return_false');

// Allow CORS for your Next.js domain
header("Access-Control-Allow-Origin: https://yourdomain.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Disable WordPress admin bar for headless
show_admin_bar(false);
```

### 3. Install Essential Plugins

```bash
# Install via WP-CLI
wp plugin install wordpress-seo --activate       # Yoast SEO
wp plugin install advanced-custom-fields --activate  # Custom fields
wp plugin install wp-rest-api-v2-menus --activate   # Menu endpoints
wp plugin install jwt-authentication-for-wp-rest-api --activate  # Auth
```

**Recommended Plugins:**
- **Yoast SEO**: Meta tags and canonical URLs
- **ACF (Advanced Custom Fields)**: Extra post metadata
- **WP REST API Menus**: Expose menus via REST API
- **JWT Authentication**: Secure API access
- **WP REST Cache**: Cache REST API responses

### 4. Enable Featured Images

In your theme's `functions.php`:

```php
// Enable post thumbnails
add_theme_support('post-thumbnails');

// Add custom image sizes
add_image_size('blog-thumbnail', 320, 180, true);
add_image_size('blog-medium', 640, 360, true);
add_image_size('blog-large', 1280, 720, true);
```

### 5. REST API Configuration

Create a plugin file `wp-content/plugins/custom-rest-api/custom-rest-api.php`:

```php
<?php
/**
 * Plugin Name: Custom REST API Configuration
 * Description: Configure REST API for headless WordPress
 */

// Add CORS headers
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://yourdomain.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
});

// Expose additional fields in REST API
add_action('rest_api_init', function() {
    register_rest_field('post', 'reading_time', [
        'get_callback' => function($post) {
            $content = get_post_field('post_content', $post['id']);
            $word_count = str_word_count(strip_tags($content));
            return ceil($word_count / 200); // 200 words per minute
        },
        'schema' => ['type' => 'integer']
    ]);
});

// Increase REST API posts per page limit
add_filter('rest_post_query', function($args, $request) {
    $per_page = $request->get_param('per_page');
    if ($per_page && $per_page <= 100) {
        $args['posts_per_page'] = $per_page;
    }
    return $args;
}, 10, 2);
```

Activate the plugin:
```bash
wp plugin activate custom-rest-api
```

## 🌐 Hosting Options

### Option 1: Subdomain (Recommended)

**Setup:**
- WordPress hosted at: `wp.yourdomain.com` or `blog.yourdomain.com`
- Next.js fetches from: `https://wp.yourdomain.com/wp-json/wp/v2`

**Advantages:**
- ✅ Clean separation of concerns
- ✅ Independent scaling
- ✅ Easier SSL management
- ✅ No proxy complexity

**DNS Configuration:**
```
A    wp.yourdomain.com    → YOUR_WP_SERVER_IP
A    yourdomain.com       → YOUR_NEXTJS_SERVER_IP
```

**WordPress `.env`:**
```bash
WP_HOME=https://wp.yourdomain.com
WP_SITEURL=https://wp.yourdomain.com
```

**Next.js `.env.local`:**
```bash
NEXT_PUBLIC_WORDPRESS_API_URL=https://wp.yourdomain.com/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_SITE_URL=https://wp.yourdomain.com
```

### Option 2: Reverse Proxy on Same Domain

**Setup:**
- WordPress: Backend server (not publicly accessible)
- Next.js: Handles `/blog` routes
- Nginx/Apache: Proxies `/wp-admin` and `/wp-json` to WordPress

**Advantages:**
- ✅ Single domain for everything
- ✅ Better for SEO (single domain authority)
- ✅ Easier SSL certificate management

**Nginx Configuration:**
```nginx
# Main Next.js application
upstream nextjs {
    server localhost:3000;
}

# WordPress backend
upstream wordpress {
    server localhost:8080;  # WordPress running on different port
}

server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # WordPress Admin & REST API (proxied)
    location ~ ^/(wp-admin|wp-login\.php|wp-json) {
        proxy_pass http://wordpress;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for admin
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # WordPress static assets (proxied)
    location ~ ^/wp-content/ {
        proxy_pass http://wordpress;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js application (handles /blog routes headlessly)
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**WordPress `.env`:**
```bash
WP_HOME=https://yourdomain.com
WP_SITEURL=https://yourdomain.com
```

**Next.js `.env.local`:**
```bash
WORDPRESS_API_URL=http://localhost:8080/wp-json/wp/v2  # Internal
NEXT_PUBLIC_WORDPRESS_API_URL=https://yourdomain.com/wp-json/wp/v2  # External
```

### Option 3: Separate Server with NGINX Proxy

**Setup:**
- WordPress: Separate VPS/cloud server
- Next.js: Main application server
- Nginx on Next.js server proxies WordPress requests

**Nginx Configuration:**
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com;

    # Proxy WordPress admin to separate server
    location ~ ^/(wp-admin|wp-login\.php|wp-json|wp-content) {
        proxy_pass https://YOUR_WP_SERVER_IP;
        proxy_ssl_verify off;  # Or configure proper SSL verification
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Next.js handles everything else
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 4: Docker Compose (Development)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # WordPress with MySQL
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
      MYSQL_ROOT_PASSWORD: rootpassword
    volumes:
      - db_data:/var/lib/mysql

  # Next.js App
  nextjs:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_WORDPRESS_API_URL: http://localhost:8080/wp-json/wp/v2
    depends_on:
      - wordpress

volumes:
  wordpress_data:
  db_data:
```

Run with:
```bash
docker-compose up -d
```

## 🔍 SEO and Canonical Tags

### Why Canonical Tags Matter

When content exists on multiple URLs (e.g., WordPress admin URL and Next.js display URL), search engines need to know which is the "canonical" (preferred) version to avoid duplicate content penalties.

### Implementation Options

#### Option 1: WordPress as Canonical (Recommended for SEO)

If WordPress is your primary content source:

**In WordPress - `functions.php`:**
```php
// Force canonical URLs to WordPress
add_action('wp_head', function() {
    if (is_single() || is_page()) {
        $canonical = get_permalink();
        echo '<link rel="canonical" href="' . esc_url($canonical) . '" />' . "\n";
    }
}, 1);

// Add to REST API response
add_action('rest_api_init', function() {
    register_rest_field('post', 'canonical_url', [
        'get_callback' => function($post) {
            return get_permalink($post['id']);
        }
    ]);
});
```

**In Next.js - `app/blog/[slug]/page.tsx`:**
```tsx
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await fetchPostBySlug(params.slug);
  
  // Use WordPress URL as canonical
  const canonicalUrl = post.canonical_url || 
    `${process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL}/${post.slug}`;

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      {/* ... rest of content */}
    </>
  );
}
```

#### Option 2: Next.js as Canonical (Headless Architecture)

If Next.js is the primary display:

**In WordPress - Yoast SEO Settings:**
1. Install Yoast SEO plugin
2. Go to SEO → Search Appearance → Content Types
3. Set "Canonical URL" to point to Next.js: `https://yourdomain.com/blog/{{slug}}`

**Or via code in `functions.php`:**
```php
// Override canonical URLs to point to Next.js
add_filter('wpseo_canonical', function($canonical) {
    if (is_single()) {
        global $post;
        return 'https://yourdomain.com/blog/' . $post->post_name;
    }
    return $canonical;
});
```

**In Next.js - Automatic:**
```tsx
// Next.js will automatically use current URL as canonical
// No extra configuration needed if you want /blog/slug as canonical
```

#### Option 3: Dynamic Canonical Based on User Agent

**In WordPress - `functions.php`:**
```php
add_filter('wpseo_canonical', function($canonical) {
    // If accessed via REST API or preview, keep WordPress URL
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return $canonical;
    }
    
    // If accessed directly by users, redirect to Next.js
    if (is_single()) {
        global $post;
        return 'https://yourdomain.com/blog/' . $post->post_name;
    }
    
    return $canonical;
});
```

### Meta Tags Configuration

**In Next.js - `app/blog/[slug]/page.tsx`:**
```tsx
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);
  const canonicalUrl = `https://yourdomain.com/blog/${params.slug}`;

  return {
    title: post.title.rendered,
    description: stripHtmlTags(post.excerpt.rendered).substring(0, 160),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title.rendered,
      description: stripHtmlTags(post.excerpt.rendered).substring(0, 160),
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: [getAuthorName(post)],
      images: getFeaturedImageUrl(post, 'large') 
        ? [{ url: getFeaturedImageUrl(post, 'large')! }] 
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title.rendered,
      description: stripHtmlTags(post.excerpt.rendered).substring(0, 160),
      images: getFeaturedImageUrl(post, 'large') ? [getFeaturedImageUrl(post, 'large')!] : [],
    },
  };
}
```

### Robots.txt Configuration

**WordPress - Prevent indexing of admin:**
```
# WordPress robots.txt
User-agent: *
Disallow: /wp-admin/
Disallow: /wp-includes/
Disallow: /wp-json/
Allow: /wp-content/uploads/

Sitemap: https://yourdomain.com/blog-sitemap.xml
```

**Next.js - `public/robots.txt`:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://yourdomain.com/sitemap.xml
```

## 🔐 Environment Variables

Create `.env.local` in your Next.js project:

```bash
# WordPress API Configuration
NEXT_PUBLIC_WORDPRESS_API_URL=https://wp.yourdomain.com/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_SITE_URL=https://wp.yourdomain.com

# Private API URL (if using reverse proxy)
WORDPRESS_API_URL=http://localhost:8080/wp-json/wp/v2

# Optional: WordPress Authentication (for private posts)
WORDPRESS_AUTH_USERNAME=api_user
WORDPRESS_AUTH_PASSWORD=api_password

# Optional: Preview mode secret
WORDPRESS_PREVIEW_SECRET=your-secret-key-here
```

Update `.env.example`:
```bash
# WordPress Blog Integration
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_SITE_URL=https://your-wordpress-site.com
WORDPRESS_API_URL=http://localhost:8080/wp-json/wp/v2
```

## ⚡ Performance Optimization

### 1. Next.js ISR (Incremental Static Regeneration)

Already implemented in `lib/wordpress.ts`:

```typescript
const response = await fetch(url, {
  next: { revalidate: 300 }, // Revalidate every 5 minutes
});
```

### 2. WordPress REST API Caching

Install **WP REST Cache** plugin:
```bash
wp plugin install wp-rest-cache --activate
```

Or add manual caching in `functions.php`:
```php
add_filter('rest_pre_dispatch', function($result, $server, $request) {
    $cache_key = 'rest_' . md5($request->get_route());
    $cached = get_transient($cache_key);
    
    if ($cached !== false) {
        return $cached;
    }
    
    return $result;
}, 10, 3);

add_filter('rest_post_dispatch', function($result, $server, $request) {
    $cache_key = 'rest_' . md5($request->get_route());
    set_transient($cache_key, $result, 300); // Cache for 5 minutes
    return $result;
}, 10, 3);
```

### 3. CDN for WordPress Media

Configure WordPress to serve media from CDN:

```php
// wp-config.php
define('WP_CONTENT_URL', 'https://cdn.yourdomain.com/wp-content');
```

### 4. Image Optimization

Install **ShortPixel** or **Imagify** plugin for automatic image optimization.

## 🔧 Troubleshooting

### CORS Issues

**Error:** "Access to fetch blocked by CORS policy"

**Solution:** Add to WordPress `wp-config.php`:
```php
header("Access-Control-Allow-Origin: https://yourdomain.com");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
```

### REST API Not Working

**Test the API:**
```bash
curl https://yourdomain.com/wp-json/wp/v2/posts
```

**If 404 error:**
1. Check permalinks: WordPress Admin → Settings → Permalinks → Save
2. Verify .htaccess permissions
3. Check if REST API is disabled in plugin

### Slow Loading Times

**Solutions:**
1. Enable WordPress object caching (Redis/Memcached)
2. Install caching plugin (WP Super Cache)
3. Optimize database (WP-Optimize plugin)
4. Use CDN for media files
5. Implement lazy loading for images

### Featured Images Not Appearing

**Check:**
1. Images uploaded to WordPress media library
2. Post has featured image set
3. Theme supports post thumbnails
4. `_embed` parameter included in API request

## 📚 Additional Resources

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Next.js ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [Headless WordPress Best Practices](https://www.wpgraphql.com/docs/headless-wordpress-best-practices)
- [Canonical URL SEO Guide](https://moz.com/learn/seo/canonicalization)

## 🎯 Quick Start Checklist

- [ ] Install WordPress (subdomain or proxied)
- [ ] Enable REST API and configure CORS
- [ ] Install essential plugins (Yoast SEO, ACF, JWT Auth)
- [ ] Configure permalink structure
- [ ] Set up featured images and custom image sizes
- [ ] Add environment variables to Next.js
- [ ] Configure canonical URLs strategy
- [ ] Set up nginx proxy (if using same domain)
- [ ] Test REST API endpoints
- [ ] Create test posts and verify display
- [ ] Configure caching (WordPress + Next.js ISR)
- [ ] Set up CDN for media files
- [ ] Configure robots.txt and sitemap
- [ ] Test SEO meta tags with Google Rich Results Test

