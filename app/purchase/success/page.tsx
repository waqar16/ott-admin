import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Purchase Successful | OTT Platform',
  description: 'Thank you for your purchase!',
};

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PurchaseSuccess />
    </Suspense>
  );
}

async function PurchaseSuccess() {
  // In a real implementation, you would:
  // 1. Get session_id from URL params
  // 2. Verify the session with Stripe
  // 3. Check purchase status in database
  // 4. Grant access to the content

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-10 h-10 text-green-600"
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
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Purchase Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your content is now available to watch.
          </p>

          {/* Details Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📧</span>
              What happens next?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>A confirmation email has been sent to your email address</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Your purchase is available in your account library</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>You can start watching immediately on any device</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Lifetime access - watch as many times as you want</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              Start Watching
            </Link>
            <Link
              href="/premiere"
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Browse More Titles
            </Link>
          </div>

          {/* Support Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link href="/support" className="text-purple-600 hover:text-purple-700 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p>
              <strong>💡 Tip:</strong> Sign in to access your purchased content from any device.
              Your purchase is linked to your account.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">🎬</div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">HD Quality</h3>
            <p className="text-xs text-gray-600">Stream in high definition</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Any Device</h3>
            <p className="text-xs text-gray-600">Watch on phone, tablet, or TV</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">♾️</div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Unlimited</h3>
            <p className="text-xs text-gray-600">Watch anytime, forever</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4 mx-auto"></div>
        <p className="text-gray-600 font-medium">Confirming your purchase...</p>
      </div>
    </div>
  );
}
