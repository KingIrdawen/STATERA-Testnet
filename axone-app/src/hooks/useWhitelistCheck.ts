'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { referralRegistryContract, REFERRAL_REGISTRY_ADDRESS } from '@/contracts/referralRegistry';

/**
 * Hook to check if user is whitelisted and redirect to referral page if not
 * Should be used in layout or page components that require whitelist
 */
export function useWhitelistCheck() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const pathname = usePathname();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  // Check whitelist status
  const { data: isWhitelisted, isLoading: isLoadingWhitelist } = useReadContract({
    ...referralRegistryContract(),
    functionName: 'isWhitelisted',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!REFERRAL_REGISTRY_ADDRESS && isCorrectChain && isConnected,
    },
  });

  useEffect(() => {
    // Only check if wallet is connected and on correct chain
    if (!isConnected || !address || !isCorrectChain || !REFERRAL_REGISTRY_ADDRESS) {
      return;
    }

    // Don't redirect if still loading
    if (isLoadingWhitelist) {
      return;
    }

    // Allow access to referral page even if not whitelisted
    if (pathname === '/dashboard/referral' || pathname === '/referral') {
      return;
    }

    // Redirect to referral if not whitelisted
    if (isWhitelisted === false) {
      router.replace('/dashboard/referral');
    }
  }, [isConnected, address, isCorrectChain, isWhitelisted, isLoadingWhitelist, pathname, router]);

  return {
    isWhitelisted: isWhitelisted ?? false,
    isLoading: isLoadingWhitelist,
  };
}

