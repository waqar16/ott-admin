import type { CatalogTitle } from '@/app/api/catalog/route';
import type { MockUser } from './useAuthMock';

export function getPlayPath(title: CatalogTitle, user: MockUser | null): string {
  if (title.visibleWithoutSignup) return `/watch/${title.id}`;
  if (user) {
    const hasAccess =
      title.requiredMembership === 'FREE' ||
      (title.requiredMembership === 'KIDS' && user.membership !== 'free') ||
      title.requiredMembership === 'FULL';
    if (hasAccess && (user.membership === 'full' || (user.membership === 'kids' && title.requiredMembership !== 'FULL'))) {
      return `/watch/${title.id}`;
    }
    return `/plans?upgrade=true`;
  }
  return `/login?redirect=${encodeURIComponent(`/watch/${title.id}`)}`;
}

export function getPremiereCheckoutPath(premiereId: string, isLoggedIn: boolean): string {
  return isLoggedIn
    ? `/checkout/premiere/${encodeURIComponent(premiereId)}`
    : `/login?redirect=${encodeURIComponent('/checkout/premiere/' + premiereId)}`;
}

// TODO: Replace with real entitlement checks once backend is wired.
