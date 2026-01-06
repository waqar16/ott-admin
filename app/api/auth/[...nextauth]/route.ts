// TODO: Uncomment when NextAuth backend ready (Stripe / AWS / WP integration)
// import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { USE_MOCK_DATA } from '@/lib/config';
import { NextResponse } from 'next/server';

// Mock mode active — replace with real NextAuth later
if (USE_MOCK_DATA) {
  console.log('[NextAuth] Mock mode - auth endpoints disabled, using mock sessions');
}

// TODO: Uncomment when NextAuth backend ready
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// Mock auth endpoints for development
export async function GET() {
  if (USE_MOCK_DATA) {
    return NextResponse.json({
      message: 'NextAuth mock mode - authentication disabled for development',
      useMockAuth: true,
    });
  }
  return NextResponse.json({ error: 'NextAuth not configured' }, { status: 500 });
}

export async function POST() {
  if (USE_MOCK_DATA) {
    return NextResponse.json({
      message: 'NextAuth mock mode - authentication disabled for development',
      useMockAuth: true,
    });
  }
  return NextResponse.json({ error: 'NextAuth not configured' }, { status: 500 });
}
