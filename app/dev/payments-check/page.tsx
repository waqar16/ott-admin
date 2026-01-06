'use client';

import { useState } from 'react';
import {
  listPlans,
  createSubscriptionCheckout,
  checkStreamAccess,
  createPpvCheckout,
  listSubscriptions,
  listPayments,
  ApiError,
} from '@/lib/paymentsApi';

export default function PaymentsCheckPage() {
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentId, setContentId] = useState('premiere-1');

  async function executeApi(fn: () => Promise<any>, operation: string) {
    try {
      setLoading(true);
      setResult(null);
      setStatus(null);
      const data = await fn();
      setResult(data);
      setStatus(200);
      console.log(`[${operation}] Success:`, data);
    } catch (err) {
      const error = err as ApiError;
      setResult(error);
      setStatus(error.status || 0);
      console.error(`[${operation}] Error:`, error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCheckout() {
    try {
      setLoading(true);
      setResult(null);
      setStatus(null);

      // First get plans
      const plansResponse = await listPlans({ page: 1, pageSize: 10 });
      const firstPlan = plansResponse.results[0];

      if (!firstPlan) {
        setResult({ error: 'No plans available' });
        setStatus(404);
        return;
      }

      // Create checkout session
      const checkoutUrl = await createSubscriptionCheckout(firstPlan.id);
      setResult({
        plan: firstPlan,
        checkout_url: checkoutUrl,
        action: 'Open this URL in a new tab to complete checkout',
      });
      setStatus(200);

      // Open in new tab
      window.open(checkoutUrl, '_blank');
    } catch (err) {
      const error = err as ApiError;
      setResult(error);
      setStatus(error.status || 0);
      console.error('[Create Checkout] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckPpvAccess() {
    executeApi(() => checkStreamAccess(contentId), 'Check PPV Access');
  }

  async function handleCreatePpvCheckout() {
    try {
      setLoading(true);
      setResult(null);
      setStatus(null);

      const checkoutUrl = await createPpvCheckout(contentId);
      setResult({
        content_id: contentId,
        checkout_url: checkoutUrl,
        action: 'Open this URL in a new tab to complete checkout',
      });
      setStatus(200);

      // Open in new tab
      window.open(checkoutUrl, '_blank');
    } catch (err) {
      const error = err as ApiError;
      setResult(error);
      setStatus(error.status || 0);
      console.error('[Create PPV Checkout] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Payments & Subscriptions API - Dev Smoke Test</h1>
        <p className="text-gray-400 mb-8">
          Test payment operations (plans, subscriptions, PPV checkout)
        </p>

        {/* Subscription Plans Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => executeApi(() => listPlans({ page: 1, pageSize: 20 }), 'List Plans')}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              List Plans
            </button>

            <button
              onClick={handleCreateCheckout}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              Create Checkout (First Plan)
            </button>
          </div>
        </div>

        {/* User Subscription Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => executeApi(() => listSubscriptions(), 'List Subscriptions')}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              List Subscriptions
            </button>

            <button
              onClick={() =>
                executeApi(() => listPayments({ page: 1, pageSize: 20 }), 'List Payments')
              }
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              List Payment History
            </button>
          </div>
        </div>

        {/* PPV Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pay-Per-View (PPV)</h2>
          <div className="bg-gray-800 rounded-lg p-6 mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content ID
            </label>
            <input
              type="text"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              placeholder="e.g., premiere-1"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-600 mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleCheckPpvAccess}
                disabled={loading || !contentId}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                Check Stream Access
              </button>

              <button
                onClick={handleCreatePpvCheckout}
                disabled={loading || !contentId}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                Create PPV Checkout
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Mock mode: "free-*" content IDs grant immediate access. Others trigger PPV flow.
            </p>
          </div>
        </div>

        {/* Result Display */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Response</h3>
            {status !== null && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  status >= 200 && status < 300
                    ? 'bg-green-900 text-green-200'
                    : status === 402
                    ? 'bg-yellow-900 text-yellow-200'
                    : 'bg-red-900 text-red-200'
                }`}
              >
                HTTP {status}
                {status === 402 && ' (Payment Required - PPV)'}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {!loading && result && (
            <div>
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.checkout_url && (
                <div className="mt-4 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                  <p className="text-blue-200 font-semibold mb-2">Checkout URL Generated:</p>
                  <a
                    href={result.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {result.checkout_url}
                  </a>
                </div>
              )}
            </div>
          )}

          {!loading && !result && (
            <p className="text-gray-500 text-center py-8">
              Click a button above to test API operations
            </p>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-900/30 border border-blue-600/50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-200 mb-2">Quick Tips:</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• List Plans: Shows all available subscription plans</li>
            <li>
              • Create Checkout: Creates a Stripe checkout session for the first plan (opens in new
              tab)
            </li>
            <li>• List Subscriptions: Shows active subscriptions for the user</li>
            <li>• List Payments: Shows payment history</li>
            <li>
              • Check Stream Access: Returns stream URL if user has access, or PPV checkout info if
              payment required
            </li>
            <li>• Create PPV Checkout: Creates a checkout session for PPV content (opens in new tab)</li>
            <li>• Check browser console for detailed logs</li>
            <li>• In mock mode, checkout URLs are simulated and won't complete actual payments</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
