import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from '@/lib/db/adapter';
import { MembershipType } from '@/lib/auth';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Stripe webhook secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Mapping of Stripe price IDs to membership types
const PRICE_TO_MEMBERSHIP: Record<string, MembershipType> = {
  [process.env.STRIPE_PRICE_ID_KIDS || 'price_kids']: MembershipType.KIDS,
  [process.env.STRIPE_PRICE_ID_FULL || 'price_full']: MembershipType.FULL,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreatedEvent(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdatedEvent(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletedEvent(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log(`Customer created: ${customer.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Handle subscription created
async function handleSubscriptionCreatedEvent(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price.id;

  // Determine membership type from price ID
  const membershipType = PRICE_TO_MEMBERSHIP[priceId] || MembershipType.FREE;

  console.log(`Subscription created: ${subscriptionId} for customer ${customerId}`);
  console.log(`Membership type: ${membershipType}`);

  try {
    await handleSubscriptionCreated(customerId, subscriptionId, membershipType);
    console.log(`User membership updated successfully`);
  } catch (error) {
    console.error('Error updating user membership:', error);
  }
}

// Handle subscription updated
async function handleSubscriptionUpdatedEvent(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  // Map Stripe status to our status
  let subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  switch (status) {
    case 'active':
      subscriptionStatus = 'active';
      break;
    case 'canceled':
      subscriptionStatus = 'canceled';
      break;
    case 'past_due':
      subscriptionStatus = 'past_due';
      break;
    case 'trialing':
      subscriptionStatus = 'trialing';
      break;
    default:
      subscriptionStatus = 'active';
  }

  // Determine membership type from price ID
  const membershipType = PRICE_TO_MEMBERSHIP[priceId];

  console.log(`Subscription updated: ${subscriptionId}, status: ${status}`);

  try {
    await handleSubscriptionUpdated(subscriptionId, subscriptionStatus, membershipType);
    console.log(`User membership updated successfully`);
  } catch (error) {
    console.error('Error updating user membership:', error);
  }
}

// Handle subscription deleted
async function handleSubscriptionDeletedEvent(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  console.log(`Subscription deleted: ${subscriptionId}`);

  try {
    await handleSubscriptionDeleted(subscriptionId);
    console.log(`User downgraded to FREE tier`);
  } catch (error) {
    console.error('Error downgrading user:', error);
  }
}

// Handle invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  console.log(`Invoice payment succeeded for subscription: ${subscriptionId}`);
  
  // Update subscription status to active
  if (subscriptionId) {
    try {
      await handleSubscriptionUpdated(subscriptionId, 'active');
      console.log(`Subscription ${subscriptionId} marked as active`);
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  }
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  console.log(`Invoice payment failed for subscription: ${subscriptionId}`);
  
  // Update subscription status to past_due
  if (subscriptionId) {
    try {
      await handleSubscriptionUpdated(subscriptionId, 'past_due');
      console.log(`Subscription ${subscriptionId} marked as past_due`);
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  }
}

/**
 * Webhook Testing:
 * 
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Login: stripe login
 * 3. Forward events to local endpoint:
 *    stripe listen --forward-to localhost:3000/api/stripe/webhook
 * 4. Test webhook:
 *    stripe trigger customer.subscription.created
 * 
 * Webhook Events to Handle:
 * - customer.subscription.created: New subscription
 * - customer.subscription.updated: Subscription changed
 * - customer.subscription.deleted: Subscription canceled
 * - invoice.payment_succeeded: Payment successful
 * - invoice.payment_failed: Payment failed
 * 
 * Security:
 * - Always verify webhook signature
 * - Use STRIPE_WEBHOOK_SECRET from Stripe dashboard
 * - Enable only necessary webhook events in Stripe dashboard
 */
