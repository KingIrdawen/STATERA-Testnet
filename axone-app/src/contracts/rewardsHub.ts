import { rewardsHubAbi } from '@/lib/abi/rewardsHub';
import type { Address } from 'viem';

export const REWARDS_HUB_ADDRESS = process.env.NEXT_PUBLIC_REWARDS_HUB_ADDRESS as Address | undefined;

export function rewardsHubContract(address?: Address) {
  const hubAddress = address ?? REWARDS_HUB_ADDRESS;
  if (!hubAddress) {
    // Return a dummy contract to prevent crashes, but hooks will handle the error
    return {
      address: '0x0000000000000000000000000000000000000000' as Address,
      abi: rewardsHubAbi,
    } as const;
  }
  return {
    address: hubAddress,
    abi: rewardsHubAbi,
  } as const;
}

