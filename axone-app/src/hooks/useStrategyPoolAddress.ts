import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { swapPoolFactory, SWAP_POOL_FACTORY_ADDRESS } from '@/contracts/swapContracts';

/**
 * Hook to get the swap pool address for a strategy
 * Returns undefined if no pool exists or factory is not configured
 */
export function useStrategyPoolAddress(strategy: Strategy | null) {
  const publicClient = usePublicClient();
  const [poolAddress, setPoolAddress] = useState<`0x${string}` | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!strategy || !publicClient || !SWAP_POOL_FACTORY_ADDRESS || !swapPoolFactory) {
      setPoolAddress(undefined);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPool() {
      setLoading(true);
      try {
        const vaultAddress = strategy.contracts.vaultAddress;
        const pool = (await publicClient.readContract({
          address: swapPoolFactory.address,
          abi: swapPoolFactory.abi,
          functionName: 'getPool',
          args: [vaultAddress],
        })) as `0x${string}`;

        if (!cancelled) {
          if (pool && pool !== `0x0000000000000000000000000000000000000000`) {
            setPoolAddress(pool);
          } else {
            setPoolAddress(undefined);
          }
        }
      } catch (e) {
        if (!cancelled) {
          // No pool exists for this vault
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

