import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  fetchPostBySlug,
  getFeaturedImageUrl,
  getAuthorName,
  getPostCategories,
  formatPostDate,
} from '@/lib/wordpress';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const featuredImage = getFeaturedImageUrl(post, 'large');

  return {
    title: `${post.title.rendered} - OTT Platform Blog`,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
    openGraph: {
      title: post.title.rendered,
      description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: featuredImage ? [{ url: featuredImage }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const featuredImage = getFeaturedImageUrl(post, 'large');
  const author = getAuthorName(post);
  const categories = getPostCategories(post);

  // Get canonical URL (WordPress site if hosted separately)
  const wpBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL;
  const canonicalUrl = wpBaseUrl ? `${wpBaseUrl}/${post.slug}` : undefined;

  return (
    <>
      {/* Canonical Link */}
      {canonicalUrl && (
        <link rel="canonical" href={canonicalUrl} />
      )}

      <article className="min-h-screen bg-gray-50">
        {/* Header with Featured Image */}
        <div className="relative h-96 bg-gray-900">
          {featuredImage ? (
            <Image
              src={featuredImage}
              alt={post.title.rendered}
              fill
              className="object-cover opacity-60"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
          )}

          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-12">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog?category=${category.slug}`}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm hover:bg-white/30 transition"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1
                className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <span className="text-2xl">👤</span>
                  {author}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  {formatPostDate(post.date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-gray-600">
              <Link href="/" className="hover:text-purple-600 transition">
                Home
              </Link>
              {' / '}
              <Link href="/blog" className="hover:text-purple-600 transition">
                Blog
              </Link>
              {categories.length > 0 && (
                <>
                  {' / '}
                  <Link
                    href={`/blog?category=${categories[0].slug}`}
                    className="hover:text-purple-600 transition"
                  >
                    {categories[0].name}
                  </Link>
                </>
              )}
              {' / '}
              <span className="text-gray-900">{post.title.rendered.replace(/<[^>]*>/g, '')}</span>
            </nav>

            {/* Post Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
              <div
                className="prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:text-gray-700 prose-ol:text-gray-700
                  prose-blockquote:border-l-purple-600 prose-blockquote:text-gray-700
                  prose-img:rounded-lg prose-img:shadow-md
                  prose-pre:bg-gray-900 prose-pre:text-gray-100
                  prose-code:text-purple-600 prose-code:bg-purple-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                "
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />
            </div>

            {/* Back to Blog */}
            <div className="mt-12 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                ← Back to Blog
              </Link>
            </div>

            {/* Canonical Notice */}
            {canonicalUrl && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <strong>Note:</strong> This content was originally published at{' '}
                <a
                  href={canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {canonicalUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
