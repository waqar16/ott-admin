'use client';
import { PriceComparison, PriceCardProps } from '@/components/PriceCard';
import { useRouter } from 'next/navigation';
import { useAuthMock } from '@/lib/useAuthMock';

export default function MembershipCheckoutPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthMock();

  const go = (plan: 'free' | 'full' | 'kids') => {
    if (isLoggedIn) {
      router.push('/home');
    } else {
      router.push(`/signup?plan=${plan}`);
    }
  };

  const cards: PriceCardProps[] = [
    {
      title: 'Free',
      description: 'Watch demo content',
      price: 0,
      period: 'month',
      features: [
        { text: 'Demo titles', included: true },
        { text: 'HD streaming', included: true },
        { text: 'Offline downloads', included: false },
      ],
      buttonText: 'Continue Free',
      onPurchase: () => go('free'),
      buttonVariant: 'outline',
    },
    {
      title: 'Full',
      description: 'All content access',
      price: 14.99,
      period: 'month',
      isPopular: true,
      features: [
        { text: 'All titles', included: true, highlight: true },
        { text: '4K HDR', included: true },
        { text: '5 devices', included: true },
      ],
      buttonText: 'Select Full',
      onPurchase: () => go('full'),
    },
    {
      title: 'Kids',
      description: 'Kids-only content',
      price: 7.99,
      period: 'month',
      features: [
        { text: 'Parental controls', included: true },
        { text: 'Kids catalog', included: true },
        { text: 'Ad-free', included: true },
      ],
      buttonText: 'Select Kids',
      onPurchase: () => go('kids'),
      buttonVariant: 'secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Choose a Plan</h1>
        <p className="text-gray-600 text-center mb-10">Select a membership to continue</p>
        <PriceComparison cards={cards} />
      </div>
    </div>
  );
}
