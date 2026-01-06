'use client';

import { useState, useEffect } from 'react';
import { Plan, ApiError, listPlans, createSubscriptionCheckout } from '@/lib/paymentsApi';

export default function PlansList() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setError(null);
      const response = await listPlans({ page: 1, pageSize: 20 });
      setPlans(response.results.filter(plan => plan.is_active));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load plans');
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(planId: string) {
    try {
      setCheckoutLoading(planId);
      setError(null);
      const checkoutUrl = await createSubscriptionCheckout(planId);
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      const apiError = err as ApiError;
      
      if (apiError.needAuth) {
        setError('Please login to subscribe');
      } else if (apiError.status === 400 && apiError.message.includes('already have')) {
        setError('You already have an active subscription. Cancel it first or change your plan from account settings.');
      } else {
        setError(apiError.message || 'Failed to create checkout session');
      }
      
      console.error('Error creating checkout:', err);
      setCheckoutLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">
          Select the perfect plan for your viewing experience
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No subscription plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isPopular = plan.name.toLowerCase() === 'standard';
            
            return (
              <div
                key={plan.id}
                className={`bg-gray-800 rounded-lg p-6 relative ${
                  isPopular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                {/* Description */}
                {plan.description && (
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                )}

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-gray-400 ml-2">
                      / {plan.duration_days} days
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{plan.currency}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-300 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start text-gray-300 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Up to {plan.max_devices} {plan.max_devices === 1 ? 'device' : 'devices'}
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Up to {plan.max_profiles} {plan.max_profiles === 1 ? 'profile' : 'profiles'}
                      </li>
                      <li className="flex items-start text-gray-300 text-sm">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Cancel anytime
                      </li>
                    </>
                  )}
                </ul>

                {/* Subscribe Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={checkoutLoading === plan.id}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {checkoutLoading === plan.id ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Section */}
      <div className="max-w-2xl mx-auto text-center text-gray-400 text-sm space-y-2">
        <p>
          All plans include access to our full content library and can be canceled at any time.
        </p>
        <p>
          You can change or cancel your subscription from your account settings.
        </p>
      </div>
    </div>
  );
}
