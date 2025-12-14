import { referralRegistryAbi } from '@/lib/abi/referralRegistry';
import type { Address } from 'viem';

export const REFERRAL_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REFERRAL_REGISTRY_ADDRESS as Address | undefined;

export function referralRegistryContract(address?: Address) {
  const registryAddress = address ?? REFERRAL_REGISTRY_ADDRESS;
  if (!registryAddress) {
    // Return a dummy contract to prevent crashes, but hooks will handle the error
    return {
      address: '0x0000000000000000000000000000000000000000' as Address,
      abi: referralRegistryAbi,
    } as const;
  }
  return {
    address: registryAddress,
    abi: referralRegistryAbi,
  } as const;
}


