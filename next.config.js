 
 
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'demo-bucket.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'demo-cdn.example.com' },
    ],
  },

  experimental: {
    typedRoutes: true,
  },
}

module.exports = nextConfig 
