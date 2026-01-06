import { NextRequest, NextResponse } from 'next/server';
import catalogData from '@/lib/data/catalog.json';
import { getAdminFlags } from '@/lib/adminFlags';
import { USE_MOCK_DATA, logMockDataUsage } from '@/lib/config';

// Mock mode active — replace with real API later
if (USE_MOCK_DATA) {
  logMockDataUsage('Catalog API - Using mock catalog data');
}

export interface CatalogTitle {
  id: string;
  title: string;
  type: 'movie' | 'series';
  genre: string[];
  year: number;
  duration?: number;
  seasons?: number;
  episodes?: number;
  rating: string;
  imdbRating: number;
  description: string;
  thumbnail: string;
  banner: string;
  trailer: string;
  formats: string[];
  isImmersive: boolean;
  director?: string;
  creator?: string;
  cast: string[];
  previewImages: string[];
  contentType: 'kids' | 'all';
  requiredMembership: 'FREE' | 'KIDS' | 'FULL';
  // Admin-set flags
  visibleWithoutSignup: boolean;
  isDemoContent: boolean;
  // Extended metadata for advanced search & badges
  projection: '360' | '180' | 'flat';
  dimension: '2D' | '3D';
  resolutionClass: '8K' | '11K' | '13K' | '14K';
  kind: 'video' | 'image';
}

export interface CatalogResponse {
  titles: CatalogTitle[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Pagination parameters
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');

  // Filter parameters
  const search = searchParams.get('search')?.toLowerCase() || '';
  const immersiveOnly = searchParams.get('immersiveOnly') === 'true';
  const type = searchParams.get('type'); // 'movie' | 'series'
  const genre = searchParams.get('genre'); // comma-separated
  const contentType = searchParams.get('contentType'); // 'kids' | 'all'
  const formats = searchParams.get('formats')?.split(',') || []; // comma-separated
  const projection = searchParams.get('projection'); // 360 | 180 | flat
  const dimension = searchParams.get('dimension'); // 2D | 3D
  const resolutionClass = searchParams.get('resolutionClass'); // 8K | 11K | 13K | 14K
  const kind = searchParams.get('kind'); // video | image

  // Start with all titles
  let filteredTitles = (catalogData.titles as any[]).map(raw => {
    const flags = getAdminFlags(raw.id);
    // Derive extended metadata heuristically for now
    const immersive = !!raw.isImmersive;
    const projection: '360' | '180' | 'flat' = immersive ? (raw.formats?.some((f: string) => /180/i.test(f)) ? '180' : '360') : 'flat';
    const dimension: '2D' | '3D' = raw.formats?.some((f: string) => /3D/i.test(f)) ? '3D' : '2D';
    const resolutionClass: '8K' | '11K' | '13K' | '14K' = immersive ? '8K' : '8K'; // Placeholder; TODO map real resolutions
    const kind: 'video' | 'image' = 'video';
    return {
      ...raw,
      visibleWithoutSignup: flags.visibleWithoutSignup,
      isDemoContent: flags.isDemoContent,
      projection,
      dimension,
      resolutionClass,
      kind,
    } as CatalogTitle;
  });

  // Apply search filter
  if (search) {
    filteredTitles = filteredTitles.filter(
      (title) =>
        title.title.toLowerCase().includes(search) ||
        title.description.toLowerCase().includes(search) ||
        title.genre.some((g) => g.toLowerCase().includes(search)) ||
        title.cast.some((c) => c.toLowerCase().includes(search))
    );
  }

  // Apply immersive filter
  if (immersiveOnly) {
    filteredTitles = filteredTitles.filter((title) => title.isImmersive);
  }

  // Apply type filter
  if (type && (type === 'movie' || type === 'series')) {
    filteredTitles = filteredTitles.filter((title) => title.type === type);
  }

  // Apply genre filter
  if (genre) {
    const genres = genre.split(',').map((g) => g.trim().toLowerCase());
    filteredTitles = filteredTitles.filter((title) =>
      genres.some((g) => title.genre.some((tg) => tg.toLowerCase() === g))
    );
  }

  // Apply content type filter
  if (contentType === 'kids') {
    filteredTitles = filteredTitles.filter((title) => title.contentType === 'kids');
  } else if (contentType === 'all') {
    filteredTitles = filteredTitles.filter((title) => title.contentType === 'all');
  }

  // Apply format filter
  if (formats.length > 0) {
    filteredTitles = filteredTitles.filter((title) =>
      formats.some((f) =>
        title.formats.some((tf) => tf.toLowerCase() === f.toLowerCase())
      )
    );
  }

  if (projection) {
    filteredTitles = filteredTitles.filter(t => t.projection === projection);
  }
  if (dimension) {
    filteredTitles = filteredTitles.filter(t => t.dimension === dimension);
  }
  if (resolutionClass) {
    filteredTitles = filteredTitles.filter(t => t.resolutionClass === resolutionClass);
  }
  if (kind) {
    filteredTitles = filteredTitles.filter(t => t.kind === kind);
  }

  // Calculate pagination
  const total = filteredTitles.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTitles = filteredTitles.slice(startIndex, endIndex);
  const hasMore = endIndex < total;

  // Return response
  const response: CatalogResponse = {
    titles: paginatedTitles,
    total,
    page,
    pageSize,
    hasMore,
  };

  return NextResponse.json(response);
}

// Get a single title by ID
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Title ID is required' }, { status: 400 });
    }

    const title = catalogData.titles.find((t) => t.id === id);

    if (!title) {
      return NextResponse.json({ error: 'Title not found' }, { status: 404 });
    }

    return NextResponse.json(title);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
