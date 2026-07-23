import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/leads
 *
 * Captures email leads from the landing page hero section.
 * In a production environment, this would typically:
 * - Store leads in a database (PostgreSQL, MongoDB, etc.)
 * - Send to email marketing service (Mailchimp, SendGrid, etc.)
 * - Trigger welcome email automation
 * - Add to CRM system
 *
 * @param request - Next.js request object
 * @returns JSON response with success status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // TODO: In production, implement one or more of the following:
    //
    // 1. Store in database:
    //    await db.leads.create({ email, createdAt: new Date(), source: 'landing_hero' })
    //
    // 2. Send to email marketing service:
    //    await mailchimp.lists.addListMember(LIST_ID, { email_address: email, status: 'subscribed' })
    //
    // 3. Add to CRM:
    //    await crm.contacts.create({ email, properties: { source: 'website' } })
    //
    // 4. Send welcome email:
    //    await sendEmail({ to: email, template: 'welcome', subject: 'Welcome to OTT Platform' })
    //
    // 5. Fire analytics event:
    //    await analytics.track({ event: 'lead_captured', properties: { email } })

    // For now, just log the lead (remove in production)
    console.log('Lead captured:', {
      email,
      timestamp: new Date().toISOString(),
      source: 'landing_hero',
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    // Simulate processing delay (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your interest! We'll be in touch soon.",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/leads
 *
 * Optional endpoint to retrieve lead statistics or verify service is running.
 * In production, this would be protected by authentication.
 */
export async function GET() {
  return NextResponse.json(
    {
      service: 'leads-api',
      status: 'operational',
      version: '1.0.0',
    },
    { status: 200 }
  )
}
