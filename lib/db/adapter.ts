/**
 * Mock Database Adapter
 *
 * This is a mock implementation of database operations.
 * Replace this with a real database adapter (Prisma, PostgreSQL, etc.)
 * when deploying to production.
 */

import { MembershipType } from '../types'

export interface User {
  id: string
  email: string
  name?: string | null
  hashedPassword?: string | null
  membershipType: MembershipType
  stripeCustomerId?: string | null
  stripeSubscriptionId?: string | null
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
  createdAt: Date
  updatedAt: Date
}

export interface Device {
  id: string
  userId: string
  deviceName: string
  deviceType: 'web' | 'mobile' | 'tv' | 'tablet'
  lastActive: Date
  createdAt: Date
}

// Mock in-memory database
let mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    hashedPassword: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'password123'
    membershipType: MembershipType.FREE,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    email: 'full@example.com',
    name: 'Full Member',
    hashedPassword: '$2a$10$YourHashedPasswordHere',
    membershipType: MembershipType.FULL,
    stripeCustomerId: 'cus_mock_full',
    stripeSubscriptionId: 'sub_mock_full',
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    email: 'kids@example.com',
    name: 'Kids Account',
    hashedPassword: '$2a$10$YourHashedPasswordHere',
    membershipType: MembershipType.KIDS,
    stripeCustomerId: 'cus_mock_kids',
    stripeSubscriptionId: 'sub_mock_kids',
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

let mockDevices: Device[] = [
  {
    id: 'd1',
    userId: '1',
    deviceName: 'Chrome Browser',
    deviceType: 'web',
    lastActive: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'd2',
    userId: '2',
    deviceName: 'iPhone 14',
    deviceType: 'mobile',
    lastActive: new Date(),
    createdAt: new Date(),
  },
  {
    id: 'd3',
    userId: '2',
    deviceName: 'Samsung Smart TV',
    deviceType: 'tv',
    lastActive: new Date(),
    createdAt: new Date(),
  },
]

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = mockUsers.find((u) => u.email === email)
  return user || null
}

export async function getUserById(id: string): Promise<User | null> {
  const user = mockUsers.find((u) => u.id === id)
  return user || null
}

export async function createUser(data: {
  email: string
  name?: string
  hashedPassword?: string
  membershipType?: MembershipType
}): Promise<User> {
  const newUser: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.name || null,
    hashedPassword: data.hashedPassword || null,
    membershipType: data.membershipType || MembershipType.FREE,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  mockUsers.push(newUser)
  return newUser
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>
): Promise<User | null> {
  const index = mockUsers.findIndex((u) => u.id === id)

  if (index === -1) return null

  mockUsers[index] = {
    ...mockUsers[index],
    ...data,
    updatedAt: new Date(),
  }

  return mockUsers[index]
}

export async function deleteUser(id: string): Promise<boolean> {
  const index = mockUsers.findIndex((u) => u.id === id)

  if (index === -1) return false

  mockUsers.splice(index, 1)
  // Also delete associated devices
  mockDevices = mockDevices.filter((d) => d.userId !== id)

  return true
}

// Membership operations
export async function updateUserMembership(
  userId: string,
  membershipType: MembershipType,
  stripeData?: {
    customerId?: string
    subscriptionId?: string
    status?: 'active' | 'canceled' | 'past_due' | 'trialing'
  }
): Promise<User | null> {
  const user = await updateUser(userId, {
    membershipType,
    stripeCustomerId: stripeData?.customerId || null,
    stripeSubscriptionId: stripeData?.subscriptionId || null,
    subscriptionStatus: stripeData?.status || null,
  })

  return user
}

export async function getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  const user = mockUsers.find((u) => u.stripeCustomerId === stripeCustomerId)
  return user || null
}

export async function getUserByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<User | null> {
  const user = mockUsers.find((u) => u.stripeSubscriptionId === stripeSubscriptionId)
  return user || null
}

// Device operations
export async function getDevicesByUserId(userId: string): Promise<Device[]> {
  return mockDevices.filter((d) => d.userId === userId)
}

export async function createDevice(data: {
  userId: string
  deviceName: string
  deviceType: 'web' | 'mobile' | 'tv' | 'tablet'
}): Promise<Device> {
  const newDevice: Device = {
    id: `device_${Date.now()}`,
    userId: data.userId,
    deviceName: data.deviceName,
    deviceType: data.deviceType,
    lastActive: new Date(),
    createdAt: new Date(),
  }

  mockDevices.push(newDevice)
  return newDevice
}

export async function updateDeviceLastActive(deviceId: string): Promise<Device | null> {
  const index = mockDevices.findIndex((d) => d.id === deviceId)

  if (index === -1) return null

  mockDevices[index].lastActive = new Date()
  return mockDevices[index]
}

export async function deleteDevice(deviceId: string): Promise<boolean> {
  const index = mockDevices.findIndex((d) => d.id === deviceId)

  if (index === -1) return false

  mockDevices.splice(index, 1)
  return true
}

export async function getDeviceCount(userId: string): Promise<number> {
  return mockDevices.filter((d) => d.userId === userId).length
}

// Helper function to check if user can add more devices
export async function canAddDevice(userId: string, deviceLimit: number): Promise<boolean> {
  const currentDeviceCount = await getDeviceCount(userId)
  return currentDeviceCount < deviceLimit
}

// Stripe integration helpers
export async function handleSubscriptionCreated(
  customerId: string,
  subscriptionId: string,
  membershipType: MembershipType
): Promise<User | null> {
  const user = await getUserByStripeCustomerId(customerId)

  if (!user) return null

  return updateUserMembership(user.id, membershipType, {
    customerId,
    subscriptionId,
    status: 'active',
  })
}

export async function handleSubscriptionUpdated(
  subscriptionId: string,
  status: 'active' | 'canceled' | 'past_due' | 'trialing',
  membershipType?: MembershipType
): Promise<User | null> {
  const user = await getUserByStripeSubscriptionId(subscriptionId)

  if (!user) return null

  // If subscription is canceled, downgrade to FREE
  const newMembershipType =
    status === 'canceled' ? MembershipType.FREE : membershipType || user.membershipType

  return updateUserMembership(user.id, newMembershipType, {
    customerId: user.stripeCustomerId || undefined,
    subscriptionId,
    status,
  })
}

export async function handleSubscriptionDeleted(subscriptionId: string): Promise<User | null> {
  const user = await getUserByStripeSubscriptionId(subscriptionId)

  if (!user) return null

  return updateUserMembership(user.id, MembershipType.FREE, {
    customerId: user.stripeCustomerId || undefined,
    status: 'canceled',
  })
}

/**
 * NOTE: In production, replace this with:
 *
 * - Prisma ORM with PostgreSQL/MySQL
 * - Direct PostgreSQL client (pg)
 * - MongoDB with Mongoose
 * - Supabase client
 * - Firebase Firestore
 *
 * Example Prisma schema:
 *
 * model User {
 *   id                    String   @id @default(cuid())
 *   email                 String   @unique
 *   name                  String?
 *   hashedPassword        String?
 *   membershipType        String   @default("FREE")
 *   stripeCustomerId      String?  @unique
 *   stripeSubscriptionId  String?  @unique
 *   subscriptionStatus    String?
 *   devices               Device[]
 *   createdAt             DateTime @default(now())
 *   updatedAt             DateTime @updatedAt
 * }
 *
 * model Device {
 *   id         String   @id @default(cuid())
 *   userId     String
 *   user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 *   deviceName String
 *   deviceType String
 *   lastActive DateTime @default(now())
 *   createdAt  DateTime @default(now())
 * }
 */
