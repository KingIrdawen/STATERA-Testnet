/**
 * Points calculator using AxoneIndex rules exactly
 * DAILY_POINTS_TOTAL = 1,000,000
 * Category weights: swap, LP, vault, referral
 * Referral bonus = 5% of referred users' earned points
 */
import type { Address } from 'viem';
import type { DailyPointsResult } from './pointsStore';

// Constants (AxoneIndex rules)
export const DAILY_POINTS_TOTAL = 1_000_000;

// Category weights (must sum to 1.0)
export const WEIGHTS = {
  SWAP: 0.25, // 25%
  LP: 0.25, // 25%
  VAULT: 0.40, // 40%
  REFERRAL: 0.10, // 10%
} as const;

export interface UserActivity {
  address: Address;
  swapVolume?: bigint; // USD value (1e18)
  lpBalance?: bigint; // LP token balance (1e18)
  vaultShares?: bigint; // Vault shares (1e18)
  referredUsers?: Address[]; // List of users referred by this address
}

export interface ReferralRelations {
  [referrer: Address]: Address[]; // referrer -> list of referred users
}

/**
 * Calculate daily points for all users
 */
export async function calculateDailyPoints(
  activities: UserActivity[],
  referralRelations: ReferralRelations
): Promise<DailyPointsResult[]> {
  if (activities.length === 0) {
    return [];
  }

  // Step 1: Calculate base points per category
  const swapTotal = activities.reduce((sum, a) => sum + (a.swapVolume || 0n), 0n);
  const lpTotal = activities.reduce((sum, a) => sum + (a.lpBalance || 0n), 0n);
  const vaultTotal = activities.reduce((sum, a) => sum + (a.vaultShares || 0n), 0n);

  const swapPointsAllocation = Math.floor(DAILY_POINTS_TOTAL * WEIGHTS.SWAP);
  const lpPointsAllocation = Math.floor(DAILY_POINTS_TOTAL * WEIGHTS.LP);
  const vaultPointsAllocation = Math.floor(DAILY_POINTS_TOTAL * WEIGHTS.VAULT);
  const referralPointsAllocation = Math.floor(DAILY_POINTS_TOTAL * WEIGHTS.REFERRAL);

  // Step 2: Calculate points per user per category
  const baseResults: Map<Address, DailyPointsResult> = new Map();

  for (const activity of activities) {
    let swapPoints = 0;
    let lpPoints = 0;
    let vaultPoints = 0;

    // Swap points (proportional to volume)
    if (swapTotal > 0n && activity.swapVolume) {
      const swapRatio = Number(activity.swapVolume) / Number(swapTotal);
      swapPoints = Math.floor(swapPointsAllocation * swapRatio);
    }

    // LP points (proportional to balance)
    if (lpTotal > 0n && activity.lpBalance) {
      const lpRatio = Number(activity.lpBalance) / Number(lpTotal);
      lpPoints = Math.floor(lpPointsAllocation * lpRatio);
    }

    // Vault points (proportional to shares)
    if (vaultTotal > 0n && activity.vaultShares) {
      const vaultRatio = Number(activity.vaultShares) / Number(vaultTotal);
      vaultPoints = Math.floor(vaultPointsAllocation * vaultRatio);
    }

    baseResults.set(activity.address, {
      address: activity.address,
      swapPoints,
      lpPoints,
      vaultPoints,
      referralPoints: 0, // Will be calculated in step 3
      totalPoints: swapPoints + lpPoints + vaultPoints,
    });
  }

  // Step 3: Calculate referral bonus (5% of referred users' earned points)
  const referralResults: DailyPointsResult[] = [];

  for (const [address, result] of baseResults.entries()) {
    const referredUsers = referralRelations[address] || [];
    let referralBonus = 0;

    if (referredUsers.length > 0) {
      // Sum up points earned by all referred users
      let referredPointsSum = 0;
      for (const referred of referredUsers) {
        const referredResult = baseResults.get(referred);
        if (referredResult) {
          referredPointsSum += referredResult.totalPoints;
        }
      }
      // 5% bonus
      referralBonus = Math.floor(referredPointsSum * 0.05);
    }

    referralResults.push({
      ...result,
      referralPoints: referralBonus,
      totalPoints: result.totalPoints + referralBonus,
    });
  }

  return referralResults;
}

