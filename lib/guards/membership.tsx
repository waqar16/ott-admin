import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions, MembershipType, AppSession } from '../auth'

/**
 * Server-side Membership Guard
 *
 * Usage in server components:
 *
 * import { requireAuth, requireMembership } from '@/lib/guards/membership';
 *
 * // Require any authenticated user
 * export default async function ProtectedPage() {
 *   await requireAuth();
 *   return <div>Protected content</div>;
 * }
 *
 * // Require specific membership type
 * export default async function PremiumPage() {
 *   await requireMembership([MembershipType.FULL]);
 *   return <div>Premium content</div>;
 * }
 */

export interface MembershipGuardOptions {
  redirectTo?: string
  allowedMemberships?: MembershipType[]
}

/**
 * Require authenticated user (any membership type)
 */
export async function requireAuth(redirectTo: string = '/auth/signin'): Promise<AppSession> {
  const session = (await getServerSession(authOptions)) as AppSession | null

  if (!session || !session.user) {
    redirect(redirectTo)
  }

  return session
}

/**
 * Require specific membership type(s)
 */
export async function requireMembership(
  allowedMemberships: MembershipType[],
  redirectTo: string = '/billing'
): Promise<AppSession> {
  const session = await requireAuth()

  if (!allowedMemberships.includes(session.user.membershipType)) {
    redirect(redirectTo)
  }

  return session
}

/**
 * Check if user has access to content without redirecting
 */
export async function checkMembershipAccess(
  allowedMemberships: MembershipType[]
): Promise<{ hasAccess: boolean; session: AppSession | null }> {
  const session = (await getServerSession(authOptions)) as AppSession | null

  if (!session || !session.user) {
    return { hasAccess: false, session: null }
  }

  const hasAccess = allowedMemberships.includes(session.user.membershipType)

  return { hasAccess, session }
}

/**
 * Require FREE membership (free tier only)
 */
export async function requireFreeMembership(redirectTo: string = '/'): Promise<AppSession> {
  return requireMembership([MembershipType.FREE], redirectTo)
}

/**
 * Require KIDS membership or higher
 */
export async function requireKidsMembership(redirectTo: string = '/billing'): Promise<AppSession> {
  return requireMembership([MembershipType.KIDS, MembershipType.FULL], redirectTo)
}

/**
 * Require FULL membership (premium only)
 */
export async function requireFullMembership(redirectTo: string = '/billing'): Promise<AppSession> {
  return requireMembership([MembershipType.FULL], redirectTo)
}

/**
 * Get current session without redirecting
 */
export async function getSession(): Promise<AppSession | null> {
  const session = (await getServerSession(authOptions)) as AppSession | null
  return session
}

/**
 * Higher-order function to wrap server component with membership guard
 */
export function withMembership<T extends Record<string, any>>(
  Component: (props: T) => Promise<JSX.Element>,
  options: MembershipGuardOptions = {}
) {
  return async function MembershipGuardedComponent(props: T) {
    const { redirectTo = '/auth/signin', allowedMemberships } = options

    if (allowedMemberships && allowedMemberships.length > 0) {
      await requireMembership(allowedMemberships, redirectTo)
    } else {
      await requireAuth(redirectTo)
    }

    return Component(props)
  }
}

/**
 * Client-side membership guard hook (for use in client components)
 * Import this in client components with 'use client' directive
 */
export const membershipGuardUtils = {
  checkAccess: (membershipType: MembershipType, allowedMemberships: MembershipType[]): boolean => {
    return allowedMemberships.includes(membershipType)
  },

  canAccessKidsContent: (membershipType: MembershipType): boolean => {
    return true // All memberships can access kids content
  },

  canAccessFullContent: (membershipType: MembershipType): boolean => {
    return membershipType === MembershipType.FULL
  },

  getUpgradeMessage: (currentMembership: MembershipType): string => {
    switch (currentMembership) {
      case MembershipType.FREE:
        return 'Upgrade to Kids or Full plan to unlock more features'
      case MembershipType.KIDS:
        return 'Upgrade to Full plan to access all content'
      case MembershipType.FULL:
        return 'You have full access to all features'
      default:
        return 'Upgrade your plan to access more features'
    }
  },
}

/**
 * Example usage in app/premium/page.tsx:
 *
 * import { requireFullMembership } from '@/lib/guards/membership';
 *
 * export default async function PremiumPage() {
 *   const session = await requireFullMembership();
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {session.user.name}!</h1>
 *       <p>You have full access</p>
 *     </div>
 *   );
 * }
 *
 * Example usage in app/api/premium-content/route.ts:
 *
 * import { requireFullMembership } from '@/lib/guards/membership';
 * import { NextResponse } from 'next/server';
 *
 * export async function GET() {
 *   try {
 *     await requireFullMembership();
 *     // Return premium content
 *     return NextResponse.json({ data: 'premium content' });
 *   } catch {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 * }
 */
