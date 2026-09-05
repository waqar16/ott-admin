import { NextRequest, NextResponse } from 'next/server'
// TODO: Uncomment when NextAuth backend ready
// import { getServerSession } from 'next-auth';
import { authOptions, MembershipType } from '@/lib/auth'
import type { Device } from '@/lib/types'
import { USE_MOCK_DATA, logMockDataUsage } from '@/lib/config'
import { mockSession, mockDevices as mockUserDevices } from '@/lib/mockData'

// Mock mode active — replace with real API later
if (USE_MOCK_DATA) {
  logMockDataUsage('Devices API - Using mock session and devices')
}

// Mock active devices data
const mockDevices: Record<string, Device[]> = {
  'user-1': [
    {
      id: 'device-1',
      userId: 'user-1',
      deviceName: 'Chrome on Windows',
      deviceType: 'web',
      lastActive: new Date('2025-11-11T10:30:00'),
      createdAt: new Date('2025-11-01T08:00:00'),
    },
    {
      id: 'device-2',
      userId: 'user-1',
      deviceName: 'Safari on iPhone 15 Pro',
      deviceType: 'mobile',
      lastActive: new Date('2025-11-10T18:45:00'),
      createdAt: new Date('2025-11-05T12:30:00'),
    },
    {
      id: 'device-3',
      userId: 'user-1',
      deviceName: 'Samsung Smart TV',
      deviceType: 'tv',
      lastActive: new Date('2025-11-09T20:15:00'),
      createdAt: new Date('2025-10-20T19:00:00'),
    },
  ],
}

export interface DeviceResponse {
  devices: Device[]
  total: number
  currentDevice?: string
  limits: {
    max: number
    current: number
    remaining: number
  }
}

export interface UpdateDeviceTierRequest {
  membershipType: MembershipType
}

// GET /api/settings/devices - Get user's active devices
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.email || 'mock-user-1' // Use email as userId for demo
    const membershipType = (session.user as any).membershipType || MembershipType.FREE

    // Get device limits based on membership
    const deviceLimits = {
      [MembershipType.FREE]: 1,
      [MembershipType.KIDS]: 2,
      [MembershipType.FULL]: 5,
    }

    const maxDevices = deviceLimits[membershipType]

    // Get user's devices (mock data)
    const userDevices = USE_MOCK_DATA ? mockUserDevices : mockDevices[userId] || []

    // Get current device ID from request headers
    const currentDevice = request.headers.get('x-device-id') || undefined

    const response: DeviceResponse = {
      devices: userDevices,
      total: userDevices.length,
      currentDevice,
      limits: {
        max: maxDevices,
        current: userDevices.length,
        remaining: Math.max(0, maxDevices - userDevices.length),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/settings/devices/:id - Remove a device
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('id')

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 })
    }

    const userId = session.user.email || 'user-1'

    // Remove device from mock data
    if (mockDevices[userId]) {
      mockDevices[userId] = mockDevices[userId].filter((d) => d.id !== deviceId)
    }

    return NextResponse.json({
      success: true,
      message: 'Device removed successfully',
    })
  } catch (error) {
    console.error('Failed to remove device:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/settings/devices/remove-all - Remove all devices except current
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.email || 'user-1'
    const currentDeviceId = request.headers.get('x-device-id')

    // Remove all devices except current
    if (mockDevices[userId]) {
      if (currentDeviceId) {
        mockDevices[userId] = mockDevices[userId].filter((d) => d.id === currentDeviceId)
      } else {
        mockDevices[userId] = []
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All other devices removed successfully',
      remaining: mockDevices[userId]?.length || 0,
    })
  } catch (error) {
    console.error('Failed to remove devices:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
