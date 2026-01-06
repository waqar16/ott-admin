'use client';
import { useParams, useRouter } from 'next/navigation';
import { useAuthMock } from '@/lib/useAuthMock';
import CheckoutButton from '@/components/payments/CheckoutButton.client';

export default function PremiereCheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuthMock();

  function handleAccess(streamUrl: string) {
    // Navigate to watch page with the content ID
    router.push(`/watch/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">Premiere Checkout</h1>
          <p className="text-gray-300 mb-6">
            You are about to rent: <span className="font-semibold text-white">{id}</span>
          </p>
          
          <CheckoutButton
            contentId={id}
            onAccess={handleAccess}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Complete Purchase
          </CheckoutButton>

          {!isLoggedIn && (
            <p className="text-xs text-gray-400 mt-3 text-center">
              Note: Login required for purchase
            </p>
          )}

          <button
            onClick={() => router.back()}
            className="w-full mt-4 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
