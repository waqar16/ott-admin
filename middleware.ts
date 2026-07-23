import { NextRequest, NextResponse } from 'next/server'
import { API_BASE } from '@/lib/config'
import axios from 'axios'

const publicRoutes = ['/login', '/signup', '/error']

/**
 * Next.js Middleware for authentication and authorization
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    publicRoutes.some((route) => route !== '/' && pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  try {
    const token = request.cookies.get('access_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Validate token
    const accessCheck = await axios.get(`${API_BASE}api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const role = accessCheck.data.role
    // ADMIN ROUTES
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  } catch (error) {
    console.log(error, 'middleware error')
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
