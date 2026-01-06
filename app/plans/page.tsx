'use client';
import Link from 'next/link';
import PlansList from '@/components/payments/PlansList.client';

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <PlansList />
        <div className="text-center mt-10 text-sm text-gray-400">
          Or go directly to <Link href="/checkout/membership" className="text-purple-400 hover:text-purple-300">membership checkout</Link>.
        </div>
      </div>
    </div>
  );
}
