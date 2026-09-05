// Featured trailer data for landing hero carousel (mock only)
// TODO: Replace with real API or CMS driven featured sets
export interface FeaturedTrailer {
  id: string
  title: string
  logline: string
  backgroundImage: string
  trailerHlsUrl?: string // HLS playlist (mock)
  poster?: string
  isImmersive: boolean
  badges: string[]
}

export const featuredTrailers: FeaturedTrailer[] = [
  {
    id: 'feat-1',
    title: 'Cosmic Odyssey',
    logline: 'An epic 8K 360° voyage through spacetime.',
    backgroundImage: 'https://picsum.photos/seed/hero360a/1920/1080',
    trailerHlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    isImmersive: true,
    badges: ['8K', '360VR', 'Immersive'],
  },
  {
    id: 'feat-2',
    title: 'Virtual Reality: The Revolution',
    logline: 'Documentary exploring the VR future.',
    backgroundImage: 'https://picsum.photos/seed/hero360b/1920/1080',
    trailerHlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    isImmersive: true,
    badges: ['8K', '360VR', 'Docu'],
  },
  {
    id: 'feat-3',
    title: 'Neon City Chronicles',
    logline: 'Cyberpunk thriller. Flat + VR teaser.',
    backgroundImage: 'https://picsum.photos/seed/hero-flat/1920/1080',
    trailerHlsUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    isImmersive: false,
    badges: ['4K HDR', 'Series'],
  },
]
