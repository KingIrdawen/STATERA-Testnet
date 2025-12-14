import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { swapPoolFactory, SWAP_POOL_FACTORY_ADDRESS } from '@/contracts/swapContracts';

/**
 * Helper to check if an address is the zero address
 */
const isZeroAddress = (address: string): boolean => {
  return /^0x0{40}$/i.test(address);
};

/**
 * Hook to get the swap pool address for a strategy
 * Returns undefined if no pool exists or factory is not configured
 */
export function useStrategyPoolAddress(strategy: Strategy | null) {
  const publicClient = usePublicClient({ chainId: 998 });
  const [poolAddress, setPoolAddress] = useState<`0x${string}` | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPool() {
      // Guard: ensure all required dependencies are available
      if (!publicClient) {
        setPoolAddress(undefined);
        setLoading(false);
        return;
      }

      if (!strategy || !strategy.contracts || !strategy.contracts.vaultAddress) {
        setPoolAddress(undefined);
        setLoading(false);
        return;
      }

      if (!SWAP_POOL_FACTORY_ADDRESS || !swapPoolFactory) {
        setPoolAddress(undefined);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const vaultAddress = strategy.contracts.vaultAddress;
        // At this point, TypeScript knows publicClient is defined due to the guard above
        const pool = (await publicClient.readContract({
          address: swapPoolFactory.address,
          abi: swapPoolFactory.abi,
          functionName: 'getPool',
          args: [vaultAddress],
        })) as `0x${string}`;

        if (!cancelled) {
          // Normalize: treat zero address as no pool
          if (pool && !isZeroAddress(pool)) {
            setPoolAddress(pool);
          } else {
            setPoolAddress(undefined);
          }
        }
      } catch (e) {
        if (!cancelled) {
          // No pool exists for this vault or error occurred
          setPoolAddress(undefined);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPool();
    return () => {
      cancelled = true;
    };
  }, [strategy, publicClient]);

  return { poolAddress, loading };
}

