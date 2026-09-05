/**
 * WordPress REST API Client
 *
 * Fetches posts, categories, and media from a headless WordPress installation.
 * Supports caching and error handling.
 */

import { USE_MOCK_DATA, WORDPRESS_CONFIG, logMockDataUsage } from './config'
import { mockBlogPosts } from './mockData'

// Mock mode active — replace with real WordPress API later
if (USE_MOCK_DATA) {
  logMockDataUsage('WordPress Client - Using mock blog posts')
}

export interface WordPressPost {
  id: number
  date: string
  modified: string
  slug: string
  status: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
    protected: boolean
  }
  excerpt: {
    rendered: string
    protected: boolean
  }
  author: number
  featured_media: number
  categories: number[]
  tags: number[]
  _embedded?: {
    author?: Array<{
      id: number
      name: string
      avatar_urls?: Record<string, string>
    }>
    'wp:featuredmedia'?: Array<{
      id: number
      source_url: string
      alt_text: string
      media_details?: {
        width: number
        height: number
        sizes?: Record<
          string,
          {
            source_url: string
            width: number
            height: number
          }
        >
      }
    }>
    'wp:term'?: Array<
      Array<{
        id: number
        name: string
        slug: string
      }>
    >
  }
}

export interface WordPressCategory {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

export interface WordPressMedia {
  id: number
  source_url: string
  alt_text: string
  media_details: {
    width: number
    height: number
    sizes?: Record<
      string,
      {
        source_url: string
        width: number
        height: number
      }
    >
  }
}

interface FetchPostsOptions {
  page?: number
  perPage?: number
  categories?: number[]
  tags?: number[]
  search?: string
  orderBy?: 'date' | 'title' | 'relevance'
  order?: 'asc' | 'desc'
}

/**
 * WordPress API configuration
 */
const WP_API_BASE_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
  process.env.WORDPRESS_API_URL ||
  'https://yourdomain.com/wp-json/wp/v2'

const WP_CACHE_DURATION = 60 * 5 // 5 minutes in seconds

/**
 * Fetch posts from WordPress REST API
 */
export async function fetchPosts(options: FetchPostsOptions = {}): Promise<{
  posts: WordPressPost[]
  totalPages: number
  totalPosts: number
}> {
  // Mock mode: Return dummy blog posts
  if (USE_MOCK_DATA) {
    const { page = 1, perPage = 10 } = options
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedPosts = mockBlogPosts.slice(startIndex, endIndex)

    return {
      posts: paginatedPosts as WordPressPost[],
      totalPages: Math.ceil(mockBlogPosts.length / perPage),
      totalPosts: mockBlogPosts.length,
    }
  }

  const {
    page = 1,
    perPage = 10,
    categories,
    tags,
    search,
    orderBy = 'date',
    order = 'desc',
  } = options

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    orderby: orderBy,
    order,
    _embed: 'true', // Include embedded data (author, featured image, etc.)
  })

  if (categories && categories.length > 0) {
    params.append('categories', categories.join(','))
  }

  if (tags && tags.length > 0) {
    params.append('tags', tags.join(','))
  }

  if (search) {
    params.append('search', search)
  }

  try {
    // TODO: Uncomment when WordPress integration ready
    // TODO: Uncomment when WordPress integration ready
    /* const response = await fetch(`${WP_API_BASE_URL}/posts?${params.toString()}`, {
      next: { revalidate: WP_CACHE_DURATION },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const posts: WordPressPost[] = await response.json();
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    return {
      posts,
      totalPages,
      totalPosts,
    }; */

    throw new Error('WordPress API not configured in production mode')
  } catch (error) {
    console.error('Failed to fetch WordPress posts:', error)
    return {
      posts: [],
      totalPages: 0,
      totalPosts: 0,
    }
  }
}

/**
 * Fetch a single post by slug
 */
export async function fetchPostBySlug(slug: string): Promise<WordPressPost | null> {
  // Mock mode: Return mock post by slug
  if (USE_MOCK_DATA) {
    const post = mockBlogPosts.find((p: any) => p.slug === slug)
    return post ? (post as WordPressPost) : null
  }

  try {
    // TODO: Uncomment when WordPress integration ready
    /* const response = await fetch(
      `${WP_API_BASE_URL}/posts?slug=${slug}&_embed=true`,
      {
        next: { revalidate: WP_CACHE_DURATION },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts: WordPressPost[] = await response.json();
    return posts.length > 0 ? posts[0] : null; */

    throw new Error('WordPress API not configured in production mode')
  } catch (error) {
    console.error(`Failed to fetch post with slug "${slug}":`, error)
    return null
  }
}

/**
 * Fetch categories from WordPress
 */
export async function fetchCategories(): Promise<WordPressCategory[]> {
  // Mock mode: Return mock categories
  if (USE_MOCK_DATA) {
    return [
      {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        description: 'Tech news and updates',
        count: 5,
      },
      { id: 2, name: 'Reviews', slug: 'reviews', description: 'Product reviews', count: 3 },
      { id: 3, name: 'Family', slug: 'family', description: 'Family content', count: 2 },
    ]
  }

  try {
    // TODO: Uncomment when WordPress integration ready
    /* const response = await fetch(
      `${WP_API_BASE_URL}/categories?per_page=100&orderby=count&order=desc`,
      {
        next: { revalidate: WP_CACHE_DURATION * 2 }, // Cache longer for categories
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    return await response.json(); */

    throw new Error('WordPress API not configured in production mode')
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}

/**
 * Fetch media by ID
 */
export async function fetchMedia(mediaId: number): Promise<WordPressMedia | null> {
  // Mock mode: Return mock media
  if (USE_MOCK_DATA) {
    return {
      id: mediaId,
      source_url: `https://picsum.photos/seed/media${mediaId}/1200/630`,
      alt_text: `Media ${mediaId}`,
      media_details: {
        width: 1200,
        height: 630,
      },
    }
  }

  try {
    // TODO: Uncomment when WordPress integration ready
    /* const response = await fetch(`${WP_API_BASE_URL}/media/${mediaId}`, {
      next: { revalidate: WP_CACHE_DURATION * 4 }, // Cache longer for media
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    return await response.json(); */

    throw new Error('WordPress API not configured in production mode')
  } catch (error) {
    console.error(`Failed to fetch media ${mediaId}:`, error)
    return null
  }
}

/**
 * Get featured image URL from post
 */
export function getFeaturedImageUrl(
  post: WordPressPost,
  size: 'thumbnail' | 'medium' | 'large' | 'full' = 'large'
): string | null {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]

  if (!featuredMedia) {
    return null
  }

  // Try to get specific size
  if (size !== 'full' && featuredMedia.media_details?.sizes?.[size]) {
    return featuredMedia.media_details.sizes[size].source_url
  }

  // Fallback to full size
  return featuredMedia.source_url || null
}

/**
 * Get author name from post
 */
export function getAuthorName(post: WordPressPost): string {
  return post._embedded?.author?.[0]?.name || 'Unknown Author'
}

/**
 * Get categories from post
 */
export function getPostCategories(
  post: WordPressPost
): Array<{ id: number; name: string; slug: string }> {
  const categories = post._embedded?.['wp:term']?.[0]
  return categories || []
}

/**
 * Strip HTML tags from excerpt
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Format date for display
 */
export function formatPostDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const text = stripHtmlTags(content)
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength).trim() + '...'
}
