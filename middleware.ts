import { NextRequest, NextResponse } from 'next/server';
// TODO: Uncomment when NextAuth backend ready
// import { getToken } from 'next-auth/jwt';
import { MembershipType } from '@/lib/auth';
import { API_BASE, USE_MOCK_DATA } from '@/lib/config';
import axios from 'axios';
const adminProtectedRoutes = ['/admin/:path*','/admin'];   
const publicRoutes = ['/login', '/signup', '/error' ];

/**
 * Next.js Middleware for authentication and authorization
 * 
 * This middleware runs before matched routes and can:
 * - Protect routes requiring authentication
 * - Restrict routes based on membership type
 * - Redirect users to appropriate pages
 * 
 * Mock mode active — replace with real auth checks later
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; 
  const isPublicRoute =
  publicRoutes.includes(pathname) ||
  publicRoutes.some(
    (route) => route !== '/' && pathname.startsWith(route)
  );

if (isPublicRoute) {
  return NextResponse.next();
}


 
 
try {
 

    const token = request.cookies.get('access_token')?.value;

    if (!token) {
       console.log('object')
        return NextResponse.redirect(new URL('/', request.url));
 
    } 
    // Validate token
    const accessCheck = await axios.get(`${API_BASE}api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const role = accessCheck.data.role; 
    // ADMIN ROUTES
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    
    
    
  } catch (error) {
    console.log(error, 'middleware error');

    return NextResponse.redirect(new URL('/', request.url));
  }
   
}
 
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin', 
  ],
};
