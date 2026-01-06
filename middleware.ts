import { NextRequest, NextResponse } from 'next/server';
// TODO: Uncomment when NextAuth backend ready
// import { getToken } from 'next-auth/jwt';
import { MembershipType } from '@/lib/auth';
import { API_BASE, USE_MOCK_DATA } from '@/lib/config';
import axios from 'axios';
const adminProtectedRoutes = ['/admin/:path*','/admin']; 
const userProtectedRoutes = ['/user-tasks/:path*']; 
const publicRoutes = ['/login', '/signup', '/error', '/home', '/']; 
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

  

  if (USE_MOCK_DATA) {
    return NextResponse.next();
  }
  
   if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  } 
try {
 

    const token = request.cookies.get('access_token')?.value;

    if (!token) {
   
        return NextResponse.redirect(new URL('/login', request.url));
 
    }

    // Validate token
    const accessCheck = await axios.get(`${API_BASE}/api/v1/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const role = accessCheck.data.role; 
    // ADMIN ROUTES
    if (pathname.startsWith('/admin')) {
      if (role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    
    // USER-PROTECTED ROUTES (restrict admin)
    // if (pathname.startsWith('/user-tasks')) {
    //   if (role !== 'user') {
    //     return NextResponse.redirect(new URL('/login', request.url));
    //   }
    // } 
    
  } catch (error) {
    console.log(error, 'middleware error');

    return NextResponse.redirect(new URL('/login', request.url));
  }
   
}
 
export const config = {
  matcher: [
    
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
