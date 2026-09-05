import { NextRequest, NextResponse } from 'next/server'
// TODO: Uncomment when NextAuth backend ready
// import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'
import catalogData from '@/lib/data/catalog.json'
import type { CatalogTitle } from '../../catalog/route'
import { USE_MOCK_DATA, AUTH_CONFIG, logMockDataUsage } from '@/lib/config'
import { mockSession } from '@/lib/mockData'

// Mock mode active — replace with real API later
if (USE_MOCK_DATA) {
  logMockDataUsage('Admin Content API - Using mock session and catalog')
}

// In-memory storage for title updates
// In production, this would be stored in a database
let titlesCache: CatalogTitle[] = catalogData.titles.map((title) => ({
  ...title,
  visibleWithoutSignup: title.visibleWithoutSignup ?? false,
  isDemoContent: title.isDemoContent ?? false,
}))

export interface AdminContentResponse {
  titles: CatalogTitle[]
  total: number
  stats: {
    totalTitles: number
    visibleWithoutSignup: number
    demoContent: number
    kidsTitles: number
    immersiveTitles: number
  }
}

export interface UpdateTitleRequest {
  id: string
  visibleWithoutSignup?: boolean
  isDemoContent?: boolean
}

export interface BulkUpdateRequest {
  ids: string[]
  visibleWithoutSignup?: boolean
  isDemoContent?: boolean
}

// GET /api/admin/content - List all titles with admin flags
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active
    if (!session && !USE_MOCK_DATA) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate statistics
    const stats = {
      totalTitles: titlesCache.length,
      visibleWithoutSignup: titlesCache.filter((t) => t.visibleWithoutSignup).length,
      demoContent: titlesCache.filter((t) => t.isDemoContent).length,
      kidsTitles: titlesCache.filter((t) => t.contentType === 'kids').length,
      immersiveTitles: titlesCache.filter((t) => t.isImmersive).length,
    }

    const response: AdminContentResponse = {
      titles: titlesCache,
      total: titlesCache.length,
      stats,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch admin content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/admin/content - Update single title flags
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active
    if (!session && !USE_MOCK_DATA) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdateTitleRequest = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Title ID is required' }, { status: 400 })
    }

    // Find and update the title
    const titleIndex = titlesCache.findIndex((t) => t.id === body.id)

    if (titleIndex === -1) {
      return NextResponse.json({ error: 'Title not found' }, { status: 404 })
    }

    // Update flags
    if (body.visibleWithoutSignup !== undefined) {
      titlesCache[titleIndex].visibleWithoutSignup = body.visibleWithoutSignup
    }

    if (body.isDemoContent !== undefined) {
      titlesCache[titleIndex].isDemoContent = body.isDemoContent
    }

    return NextResponse.json({
      success: true,
      title: titlesCache[titleIndex],
      message: 'Title updated successfully',
    })
  } catch (error) {
    console.error('Failed to update title:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/content - Bulk update title flags
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active
    if (!session && !USE_MOCK_DATA) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: BulkUpdateRequest = await request.json()

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs array is required and must not be empty' },
        { status: 400 }
      )
    }

    let updatedCount = 0

    // Update all matching titles
    body.ids.forEach((id) => {
      const titleIndex = titlesCache.findIndex((t) => t.id === id)
      if (titleIndex !== -1) {
        if (body.visibleWithoutSignup !== undefined) {
          titlesCache[titleIndex].visibleWithoutSignup = body.visibleWithoutSignup
        }
        if (body.isDemoContent !== undefined) {
          titlesCache[titleIndex].isDemoContent = body.isDemoContent
        }
        updatedCount++
      }
    })

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} title(s) updated successfully`,
    })
  } catch (error) {
    console.error('Failed to bulk update titles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/content - Reset to defaults (for testing)
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active
    if (!session && !USE_MOCK_DATA) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Reset cache to original data
    titlesCache = catalogData.titles.map((title) => ({
      ...title,
      visibleWithoutSignup: false,
      isDemoContent: false,
    }))

    return NextResponse.json({
      success: true,
      message: 'All title flags reset to defaults',
    })
  } catch (error) {
    console.error('Failed to reset titles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
