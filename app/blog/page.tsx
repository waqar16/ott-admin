import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  fetchPosts,
  fetchCategories,
  getFeaturedImageUrl,
  getAuthorName,
  getPostCategories,
  stripHtmlTags,
  formatPostDate,
  type WordPressPost,
  type WordPressCategory,
} from '@/lib/wordpress';

interface BlogPageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
  };
}

export const metadata: Metadata = {
  title: 'Blog - OTT Platform',
  description: 'Latest news, updates, and insights from our OTT platform.',
  openGraph: {
    title: 'Blog - OTT Platform',
    description: 'Latest news, updates, and insights from our OTT platform.',
    type: 'website',
  },
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const categoryFilter = searchParams.category;
  const searchQuery = searchParams.search;

  // Fetch categories for sidebar
  const categories = await fetchCategories();

  // Find category ID if filtering
  const categoryId = categoryFilter
    ? categories.find((cat) => cat.slug === categoryFilter)?.id
    : undefined;

  // Fetch posts
  const { posts, totalPages, totalPosts } = await fetchPosts({
    page: currentPage,
    perPage: 12,
    categories: categoryId ? [categoryId] : undefined,
    search: searchQuery,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-purple-100 max-w-2xl">
            Discover the latest updates, tips, and insights from our platform.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              {/* Search */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Search</h3>
                <form action="/blog" method="get">
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      defaultValue={searchQuery}
                      placeholder="Search posts..."
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                    >
                      🔍
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <Link
                    href="/blog"
                    className={`block px-3 py-2 rounded-lg transition ${
                      !categoryFilter
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Posts ({totalPosts})
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog?category=${category.slug}`}
                      className={`block px-3 py-2 rounded-lg transition ${
                        categoryFilter === category.slug
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category.name} ({category.count})
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Active Filters */}
            {(categoryFilter || searchQuery) && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {categoryFilter && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    Category: {categories.find((c) => c.slug === categoryFilter)?.name}
                    <Link href="/blog" className="hover:text-purple-900">
                      ✕
                    </Link>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    Search: "{searchQuery}"
                    <Link
                      href={categoryFilter ? `/blog?category=${categoryFilter}` : '/blog'}
                      className="hover:text-purple-900"
                    >
                      ✕
                    </Link>
                  </span>
                )}
              </div>
            )}

            {/* Posts Grid */}
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h2>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Check back later for new content'}
                </p>
                {(categoryFilter || searchQuery) && (
                  <Link
                    href="/blog"
                    className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    View All Posts
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    {/* Previous Button */}
                    {currentPage > 1 && (
                      <Link
                        href={buildPaginationUrl(currentPage - 1, categoryFilter, searchQuery)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        ← Previous
                      </Link>
                    )}

                    {/* Page Numbers */}
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and 2 pages around current
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 2
                          );
                        })
                        .map((page, index, array) => {
                          // Add ellipsis between non-consecutive pages
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;

                          return (
                            <div key={page} className="flex items-center gap-2">
                              {showEllipsis && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <Link
                                href={buildPaginationUrl(page, categoryFilter, searchQuery)}
                                className={`px-4 py-2 rounded-lg transition ${
                                  page === currentPage
                                    ? 'bg-purple-600 text-white font-medium'
                                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </Link>
                            </div>
                          );
                        })}
                    </div>

                    {/* Next Button */}
                    {currentPage < totalPages && (
                      <Link
                        href={buildPaginationUrl(currentPage + 1, categoryFilter, searchQuery)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Blog Post Card Component
 */
function BlogPostCard({ post }: { post: WordPressPost }) {
  const featuredImage = getFeaturedImageUrl(post, 'medium');
  const author = getAuthorName(post);
  const categories = getPostCategories(post);
  const excerpt = stripHtmlTags(post.excerpt.rendered);

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Featured Image */}
      {featuredImage ? (
        <Link href={`/blog/${post.slug}`} className="block relative h-48 bg-gray-200">
          <Image
            src={featuredImage}
            alt={post.title.rendered}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      ) : (
        <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <span className="text-6xl">📝</span>
        </div>
      )}

      <div className="p-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.slice(0, 2).map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2
            className="text-xl font-bold text-gray-900 mb-2 hover:text-purple-600 transition line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{author}</span>
          <span>{formatPostDate(post.date)}</span>
        </div>
      </div>
    </article>
  );
}

/**
 * Build pagination URL with filters
 */
function buildPaginationUrl(
  page: number,
  category?: string,
  search?: string
): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.append('page', page.toString());
  }

  if (category) {
    params.append('category', category);
  }

  if (search) {
    params.append('search', search);
  }

  const queryString = params.toString();
  return queryString ? `/blog?${queryString}` : '/blog';
}
