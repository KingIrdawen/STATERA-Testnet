export const REFERRAL_PROTECTED = ['/dashboard?tab=Referral'] as const;

export function isReferralProtectedRoute(path: string): boolean {
  return REFERRAL_PROTECTED.includes(path as any);
}

