import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { useStrategies } from './useStrategies';
import { swapPoolFactory, SWAP_POOL_FACTORY_ADDRESS } from '@/contracts/swapContracts';

export interface SwapStrategy {
  strategy: Strategy;
  poolAddress: `0x${string}`;
}

export function useSwapStrategies() {
  const { strategies, loading: strategiesLoading } = useStrategies();
  const publicClient = usePublicClient();
  const [swapStrategies, setSwapStrategies] = useState<SwapStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (strategiesLoading || !strategies.length || !publicClient || !SWAP_POOL_FACTORY_ADDRESS || !swapPoolFactory) {
      if (!SWAP_POOL_FACTORY_ADDRESS) {
        setError('NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS not configured');
      }
      setSwapStrategies([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPools() {
      setLoading(true);
      setError(null);
      try {
        const results: SwapStrategy[] = [];

        for (const strategy of strategies) {
          const vaultAddress = strategy.contracts.vaultAddress;
          
          try {
            if (!publicClient || !swapPoolFactory) break;
            
            const pool = (await publicClient.readContract({
              address: swapPoolFactory.address,
              abi: swapPoolFactory.abi,
              functionName: 'getPool',
              args: [vaultAddress],
            })) as `0x${string}`;

            if (pool && pool !== `0x0000000000000000000000000000000000000000`) {
              results.push({ strategy, poolAddress: pool });
            }
          } catch (e) {
            // Skip strategies that fail (no pool or error)
            console.debug(`[useSwapStrategies] No pool for strategy ${strategy.id}:`, e);
          }
        }

        if (!cancelled) {
          setSwapStrategies(results);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('[useSwapStrategies] Error loading pools', e);
          setError(e?.message ?? 'Erreur lors du chargement des pools de swap');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPools();
    return () => {
      cancelled = true;
    };
  }, [strategies, strategiesLoading, publicClient]);

  return { swapStrategies, loading: loading || strategiesLoading, error };
}

