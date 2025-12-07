import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { useSwapStrategies, type SwapStrategy } from './useSwapStrategies';
import { vaultContract } from '@/contracts/vault';
import { coreInteractionViewsContract } from '@/contracts/coreInteractionViews';
import { swapPool } from '@/contracts/swapContracts';
import type { Strategy } from '@/types/strategy';

const ONE_HYPE_18 = parseUnits('1', 18);

export interface ArbitrageOpportunity {
  strategy: Strategy;
  priceViaVault: number; // vault tokens per 1 HYPE via deposit
  priceViaSwap: number; // vault tokens per 1 HYPE via swap
  priceViaVaultUsd: number | null; // USD per token via vault (optional)
  priceViaSwapUsd: number | null; // USD per token via swap (optional)
  difference: number; // priceViaSwap - priceViaVault
  differencePercent: number; // difference / priceViaVault * 100
  recommendation: 'vault' | 'swap' | 'neutral';
  isLoading: boolean;
}

export function useArbitrageOpportunities() {
  const { swapStrategies, loading: poolsLoading, error: poolsError } = useSwapStrategies();

  // Build contracts array for all strategies with pools
  const contracts = useMemo(() => {
    if (!swapStrategies || swapStrategies.length === 0) {
      return [];
    }

    const contractCalls: any[] = [];

    for (const swapStrategy of swapStrategies) {
      const strat = swapStrategy.strategy;
      const vaultAddress = strat.contracts.vaultAddress;
      const handlerAddress = strat.contracts.handlerAddress;
      const coreViewsAddress = strat.contracts.coreViewsAddress;
      const poolAddress = swapStrategy.poolAddress;

      // Vault calls
      contractCalls.push({
        ...vaultContract(vaultAddress),
        functionName: 'pps1e18' as const,
      });
      // Note: depositFeeBps might not exist in vault ABI, using 0 as fallback
      contractCalls.push({
        ...vaultContract(vaultAddress),
        functionName: 'decimals' as const,
      });

      // Core views call (if available)
      if (coreViewsAddress) {
        contractCalls.push({
          ...coreInteractionViewsContract(coreViewsAddress),
          functionName: 'oraclePxHype1e8' as const,
          args: [handlerAddress] as const,
        });
      }

      // Swap pool call
      if (poolAddress) {
        contractCalls.push({
          ...swapPool(poolAddress),
          functionName: 'getAmountOut' as const,
          args: [ONE_HYPE_18, true] as const, // true = HYPE is input
        });
      }
    }

    return contractCalls;
  }, [swapStrategies]);

  const { data: contractsData, isLoading: contractsLoading } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      retry: 1,
      staleTime: 30_000,
      gcTime: 5 * 60 * 1000,
    },
  });

  // Compute arbitrage opportunities
  const opportunities = useMemo(() => {
    if (!swapStrategies || swapStrategies.length === 0 || !contractsData) {
      return [];
    }

    const results: ArbitrageOpportunity[] = [];
    let contractIndex = 0;

    for (const swapStrategy of swapStrategies) {
      const strat = swapStrategy.strategy;
      const handlerAddress = strat.contracts.handlerAddress;
      const coreViewsAddress = strat.contracts.coreViewsAddress;
      const poolAddress = swapStrategy.poolAddress;
      const shareDecimals = strat.contracts.shareDecimals ?? 18;
      const hypeDecimals = strat.contracts.hypeDecimals ?? 18;

      // Read vault data
      const pps1e18Raw = (contractsData[contractIndex++]?.result as bigint | undefined) ?? 0n;
      const vaultDecimalsRaw = contractsData[contractIndex++]?.result;
      const vaultDecimals = vaultDecimalsRaw ? Number(vaultDecimalsRaw) : shareDecimals;

      // Read oracle (if available)
      let oraclePxHype1e8Raw = 0n;
      if (coreViewsAddress) {
        oraclePxHype1e8Raw = (contractsData[contractIndex++]?.result as bigint | undefined) ?? 0n;
      }

      // Read swap amount out (if available)
      let swapAmountOutRaw = 0n;
      if (poolAddress) {
        swapAmountOutRaw = (contractsData[contractIndex++]?.result as bigint | undefined) ?? 0n;
      }

      // Compute HYPE price in USD
      const hypePriceUsd = oraclePxHype1e8Raw > 0n ? Number(oraclePxHype1e8Raw) / 1e8 : 0;

      // For now, assume no deposit fee (depositFeeBps not in ABI)
      // If depositFeeBps exists, use: const depositFeeBps = Number(contractsData[contractIndex++]?.result ?? 0);
      const depositFeeBps = 0; // Default to 0 if not available
      const amountUsd = hypePriceUsd; // price of 1 HYPE
      const netAmountUsd = amountUsd * (1 - depositFeeBps / 10000);

      // Convert PPS to USD
      const ppsUsd = pps1e18Raw > 0n ? Number(formatUnits(pps1e18Raw, 18)) : 0;

      // Price via vault (tokens per 1 HYPE)
      const priceViaVault = ppsUsd > 0 ? netAmountUsd / ppsUsd : 0;

      // Price via swap (tokens per 1 HYPE)
      const priceViaSwap = swapAmountOutRaw > 0n
        ? parseFloat(formatUnits(swapAmountOutRaw, vaultDecimals))
        : 0;

      // Optional USD per token
      const priceViaVaultUsd =
        hypePriceUsd > 0 && priceViaVault > 0 ? hypePriceUsd / priceViaVault : null;

      const priceViaSwapUsd =
        hypePriceUsd > 0 && priceViaSwap > 0 ? hypePriceUsd / priceViaSwap : null;

      // Difference and recommendation
      const difference = priceViaSwap - priceViaVault;
      const differencePercent =
        priceViaVault > 0 ? (difference / priceViaVault) * 100 : 0;

      let recommendation: 'vault' | 'swap' | 'neutral' = 'neutral';
      if (Math.abs(differencePercent) > 1) {
        recommendation = differencePercent > 0 ? 'swap' : 'vault';
      }

      results.push({
        strategy: strat,
        priceViaVault,
        priceViaSwap,
        priceViaVaultUsd,
        priceViaSwapUsd,
        difference,
        differencePercent,
        recommendation,
        isLoading: false,
      });
    }

    // Sort by absolute difference percent descending
    return results.sort((a, b) => Math.abs(b.differencePercent) - Math.abs(a.differencePercent));
  }, [swapStrategies, contractsData]);

  return {
    opportunities,
    isLoading: poolsLoading || contractsLoading,
    error: poolsError,
  };
}

