import { NextRequest, NextResponse } from 'next/server'
// TODO: Uncomment when NextAuth backend ready
// import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'
// TODO: Uncomment when Stripe integration ready
// import Stripe from 'stripe';
import { USE_MOCK_DATA, STRIPE_CONFIG, logMockDataUsage } from '@/lib/config'
import { mockSession, mockCheckoutSession } from '@/lib/mockData'

// Mock mode active — replace with real Stripe integration later
if (USE_MOCK_DATA) {
  logMockDataUsage('Checkout API - Using mock Stripe session')
}

// TODO: Uncomment when Stripe integration ready
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   apiVersion: '2023-10-16',
// });

interface CheckoutRequestBody {
  premiereId: string
  priceId: string
  successUrl?: string
  cancelUrl?: string
}

/**
 * POST /api/checkout
 * Create a Stripe Checkout Session for pay-per-view purchases
 *
 * Body:
 * {
 *   premiereId: string;
 *   priceId: string;
 *   successUrl?: string;
 *   cancelUrl?: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Uncomment when NextAuth backend ready
    // const session = await getServerSession(authOptions);
    const session = USE_MOCK_DATA ? mockSession : null // Mock mode active

    // Allow both authenticated and guest purchases
    const customerEmail = session?.user?.email

    const body: CheckoutRequestBody = await request.json()
    const { premiereId, priceId, successUrl, cancelUrl } = body

    if (!premiereId || !priceId) {
      return NextResponse.json(
        { error: 'Missing required fields: premiereId, priceId' },
        { status: 400 }
      )
    }

    // Get the origin from the request
    const origin =
      request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Mock mode: Return dummy checkout session
    if (USE_MOCK_DATA) {
      console.log('[Checkout] Mock mode - returning fake checkout session:', {
        premiereId,
        customerEmail,
      })
      return NextResponse.json(
        {
          sessionId: mockCheckoutSession.id,
          url: mockCheckoutSession.url,
        },
        { status: 200 }
      )
    }

    // TODO: Uncomment when Stripe integration ready
    // Create Stripe Checkout Session
    /* const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment for PPV
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      client_reference_id: premiereId, // Store premiere ID for webhook processing
      metadata: {
        premiereId,
        userId: session?.user?.id || 'guest',
        purchaseType: 'premiere',
      },
      success_url: successUrl || `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/premiere`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    }); */

    // Fallback return for non-mock mode (shouldn't reach here normally)
    return NextResponse.json({ error: 'Stripe not configured in production mode' }, { status: 500 })
  } catch (error) {
    console.error('[Checkout] Error creating session:', error)

    // TODO: Uncomment when Stripe integration ready
    // if (error instanceof Stripe.errors.StripeError) {
    //   return NextResponse.json(
    //     { error: error.message },
    //     { status: error.statusCode || 500 }
    //   );
    // }

    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}

/**
 * GET /api/checkout?session_id=xxx
 * Retrieve checkout session details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id parameter' }, { status: 400 })
    }

    // Mock mode: Return dummy session
    if (USE_MOCK_DATA) {
      return NextResponse.json({
        session: {
          id: sessionId,
          status: 'complete',
          paymentStatus: 'paid',
          customerEmail: mockSession.user.email,
          amountTotal: 1999,
          currency: 'usd',
          metadata: { premiereId: 'premiere-1' },
          paymentIntent: 'pi_mock_123456',
        },
      })
    }

    // TODO: Uncomment when Stripe integration ready
    // const session = await stripe.checkout.sessions.retrieve(sessionId, {
    //   expand: ['payment_intent', 'line_items'],
    // });
    const session: any = null // Placeholder

    // TODO: Uncomment when Stripe integration ready
    // return NextResponse.json({
    //   session: {
    //     id: session.id,
    //     status: session.status,
    //     paymentStatus: session.payment_status,
    //     customerEmail: session.customer_details?.email,
    //     amountTotal: session.amount_total,
    //     currency: session.currency,
    //     metadata: session.metadata,
    //     paymentIntent: session.payment_intent,
    //   },
    // });
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  } catch (error) {
    console.error('[Checkout] Error retrieving session:', error)

    // TODO: Uncomment when Stripe integration ready
    // if (error instanceof Stripe.errors.StripeError) {
    //   return NextResponse.json(
    //     { error: error.message },
    //     { status: error.statusCode || 500 }
    //   );
    // }

    return NextResponse.json({ error: 'Failed to retrieve checkout session' }, { status: 500 })
  }
}
