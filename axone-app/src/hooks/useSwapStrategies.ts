import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { useStrategies } from './useStrategies';
import { swapPoolFactory, SWAP_POOL_FACTORY_ADDRESS, KNOWN_POOLS } from '@/contracts/swapContracts';

export interface SwapStrategy {
  strategy: Strategy;
  poolAddress: `0x${string}`;
}

const ZERO = '0x0000000000000000000000000000000000000000' as const;

export function useSwapStrategies() {
  const { strategies, loading: strategiesLoading } = useStrategies();
  const publicClient = usePublicClient();
  const [swapStrategies, setSwapStrategies] = useState<SwapStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (strategiesLoading || !publicClient) {
      setSwapStrategies([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadPools() {
      setLoading(true);
      setError(null);

      try {
        // Mappe vaultAddress.toLowerCase() → Strategy (depuis KV)
        const strategyByVault = new Map<string, Strategy>(
          strategies.map((s) => [s.contracts.vaultAddress.toLowerCase(), s])
        );

        // Mappe vaultAddress.toLowerCase() → poolAddress (résultats déjà trouvés)
        const results = new Map<string, SwapStrategy>();

        // ─── Étape 1 : vaults en KV → interroger la factory on-chain ─────────
        if (publicClient && swapPoolFactory && SWAP_POOL_FACTORY_ADDRESS) {
          for (const strategy of strategies) {
            const vaultKey = strategy.contracts.vaultAddress.toLowerCase();
            try {
              const pool = (await publicClient.readContract({
                address: swapPoolFactory.address,
                abi: swapPoolFactory.abi,
                functionName: 'getPool',
                args: [strategy.contracts.vaultAddress],
              })) as `0x${string}`;

              if (pool && pool !== ZERO) {
                results.set(vaultKey, { strategy, poolAddress: pool });
              }
            } catch (e) {
              // getPool RPC error — on continue, le fallback KNOWN_POOLS prendra le relais
              console.debug(`[useSwapStrategies] getPool failed for ${strategy.id}:`, e);
            }
          }
        }

        // ─── Étape 2 : KNOWN_POOLS — toujours inclus, même sans KV ───────────
        for (const [vaultAddr, known] of Object.entries(KNOWN_POOLS)) {
          if (results.has(vaultAddr)) continue; // déjà trouvé via on-chain

          // Cherche la stratégie dans KV, sinon crée un objet minimal
          const strategy: Strategy = strategyByVault.get(vaultAddr) ?? {
            id: `known-${vaultAddr}`,
            name: known.name,
            description: known.description,
            riskLevel: known.riskLevel,
            contracts: {
              chainId: 998,
              vaultVersion: 'v3',
              vaultAddress: vaultAddr as `0x${string}`,
              shareDecimals: 18,
              hypeDecimals: 18,
              usdcDecimals: 6,
              depositIsNative: true,
            },
          };

          results.set(vaultAddr, { strategy, poolAddress: known.poolAddress });
        }

        if (!cancelled) {
          setSwapStrategies([...results.values()]);
        }
      } catch (e: any) {
        if (!cancelled) {
          console.error('[useSwapStrategies] Error:', e);
          setError(e?.message ?? 'Erreur lors du chargement des pools');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPools();
    return () => { cancelled = true; };
  }, [strategies, strategiesLoading, publicClient]);

  return { swapStrategies, loading: loading || strategiesLoading, error };
}
