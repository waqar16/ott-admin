// TODO: Uncomment when Stripe integration ready
// import Stripe from 'stripe';
import { USE_MOCK_DATA, STRIPE_CONFIG, logMockDataUsage } from './config';
import { mockCheckoutSession, mockStripePrices } from './mockData';

// Mock mode active — replace with real Stripe integration later
if (USE_MOCK_DATA) {
  logMockDataUsage('Stripe Client - Using mock Stripe data');
}

// TODO: Uncomment when Stripe integration ready
// Initialize Stripe
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   apiVersion: '2023-10-16',
// });

// export { stripe };

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  email: string,
  successUrl: string,
  cancelUrl: string
) {
  // Mock mode: Return dummy checkout session
  if (USE_MOCK_DATA) {
    console.log('[Stripe] Mock mode - returning fake checkout session');
    return { sessionId: mockCheckoutSession.id, url: mockCheckoutSession.url };
  }

  try {
    // TODO: Uncomment when Stripe integration ready
    /* const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    }); */

    // return { sessionId: session.id, url: session.url };
    throw new Error('Stripe not configured in production mode');
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create a Stripe customer portal session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  // Mock mode: Return dummy portal URL
  if (USE_MOCK_DATA) {
    return { url: 'https://billing.stripe.com/mock-portal-session' };
  }

  try {
    // TODO: Uncomment when Stripe integration ready
    /* const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    }); */

    // return { url: session.url };
    throw new Error('Stripe not configured in production mode');
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new Error('Failed to create portal session');
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  // Mock mode: Return mock subscription
  if (USE_MOCK_DATA) {
    return { id: subscriptionId, cancel_at_period_end: true, status: 'active' };
  }

  try {
    // TODO: Uncomment when Stripe integration ready
    /* const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    }); */

    // return subscription;
    throw new Error('Stripe not configured in production mode');
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Reactivate a subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  // Mock mode: Return mock subscription
  if (USE_MOCK_DATA) {
    return { id: subscriptionId, cancel_at_period_end: false, status: 'active' };
  }

  try {
    // TODO: Uncomment when Stripe integration ready
    /* const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    }); */

    // return subscription;
    throw new Error('Stripe not configured in production mode');
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    throw new Error('Failed to reactivate subscription');
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  // Mock mode: Return mock subscription
  if (USE_MOCK_DATA) {
    return {
      id: subscriptionId,
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000) - 15 * 24 * 3600,
      current_period_end: Math.floor(Date.now() / 1000) + 15 * 24 * 3600,
      cancel_at_period_end: false,
    };
  }

  try {
    // TODO: Uncomment when Stripe integration ready
    // const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    // return subscription;
    throw new Error('Stripe not configured in production mode');
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

/**
 * Create a Stripe customer
 */
export async function createCustomer(email: string, name?: string) {
  // Mock mode: Return mock customer
  if (USE_MOCK_DATA) {
    return {
      id: 'cus_mock_' + Date.now(),
      email,
      name,
    };
  }

  try {
    // TODO: Uncomment when Stripe integration ready
    /* const customer = await stripe.customers.create({
      email,
      name,
    }); */

    // return customer;
    throw new Error('Stripe not configured in production mode');
  } catch (error) {
    console.error('Error creating customer:', error);
    throw new Error('Failed to create customer');
  }
}
