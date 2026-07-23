import type { NextAuthOptions, User as NextAuthUser, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { getUserByEmail, getUserById } from './db/adapter'
import { MembershipType, DEVICE_LIMITS } from './types'

// Re-export for backward compatibility
export { MembershipType } from './types'

// Extended user type
export interface AppUser extends NextAuthUser {
  id: string
  email: string
  name?: string | null
  membershipType: MembershipType
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
  deviceLimit: number
  isKidsRingfenced: boolean
}

// Extended session type
export interface AppSession extends Session {
  user: AppUser
}

// Extend JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    membershipType: MembershipType
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
    subscriptionStatus?: string | null
    deviceLimit: number
    isKidsRingfenced: boolean
  }
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        // Get user from database
        const user = await getUserByEmail(credentials.email)

        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials')
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword)

        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          membershipType: user.membershipType,
          stripeCustomerId: user.stripeCustomerId,
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionStatus: user.subscriptionStatus,
          deviceLimit: DEVICE_LIMITS[user.membershipType],
          isKidsRingfenced: user.membershipType === MembershipType.KIDS,
        }
      },
    }),

    // Google OAuth provider (placeholder)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
    }),

    // GitHub OAuth provider (placeholder)
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
    }),
  ],

  // Custom pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Callbacks
  callbacks: {
    // JWT callback - runs when token is created or updated
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        const appUser = user as AppUser
        token.id = appUser.id
        token.email = appUser.email
        token.membershipType = appUser.membershipType
        token.stripeCustomerId = appUser.stripeCustomerId
        token.stripeSubscriptionId = appUser.stripeSubscriptionId
        token.subscriptionStatus = appUser.subscriptionStatus
        token.deviceLimit = appUser.deviceLimit
        token.isKidsRingfenced = appUser.isKidsRingfenced
      }

      // Update session trigger (for membership changes)
      if (trigger === 'update' && session) {
        const updatedUser = await getUserById(token.id)
        if (updatedUser) {
          token.membershipType = updatedUser.membershipType
          token.stripeCustomerId = updatedUser.stripeCustomerId
          token.stripeSubscriptionId = updatedUser.stripeSubscriptionId
          token.subscriptionStatus = updatedUser.subscriptionStatus
          token.deviceLimit = DEVICE_LIMITS[updatedUser.membershipType]
          token.isKidsRingfenced = updatedUser.membershipType === MembershipType.KIDS
        }
      }

      return token
    },

    // Session callback - runs when session is checked
    async session({ session, token }): Promise<AppSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email as string,
          membershipType: token.membershipType,
          stripeCustomerId: token.stripeCustomerId,
          stripeSubscriptionId: token.stripeSubscriptionId,
          subscriptionStatus: token.subscriptionStatus,
          deviceLimit: token.deviceLimit,
          isKidsRingfenced: token.isKidsRingfenced,
        },
      } as AppSession
    },

    // Redirect callback
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },

  // Events
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`)
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`)
    },
  },

  // Debug mode
  debug: process.env.NODE_ENV === 'development',
}

// Helper function to check membership access
export function hasAccessToContent(
  membershipType: MembershipType,
  contentType: 'kids' | 'adult' | 'all'
): boolean {
  if (contentType === 'all') return true
  if (contentType === 'kids') return true // All users can access kids content
  if (contentType === 'adult') {
    return membershipType === MembershipType.FULL // Only FULL members can access adult content
  }
  return false
}

// Helper function to get membership display name
export function getMembershipDisplayName(membershipType: MembershipType): string {
  switch (membershipType) {
    case MembershipType.FREE:
      return 'Free Tier'
    case MembershipType.KIDS:
      return 'Kids Plan'
    case MembershipType.FULL:
      return 'Full Access'
    default:
      return 'Unknown'
  }
}
