/**
 * Generic hook for reading strategy data from ERA contracts
 * Works with any strategy that follows the ERA pattern
 */
import { useAccount, useReadContracts } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { formatUnits } from 'viem';

export interface StrategyData {
  loading: boolean;
  error: Error | null;
  navUsd: number | undefined; // Total NAV in USD
  ppsUsd: number | undefined; // Price per share in USD
  totalShares: number | undefined; // Total shares issued
  userShares: number | undefined; // User's shares
  userValueUsd: number | undefined; // User's position value in USD
  tvlUsd: number | undefined; // Total Value Locked (same as NAV)
  oracleHypeUsd: number | undefined; // HYPE oracle price in USD
  oracleToken1Usd: number | undefined; // TOKEN1 oracle price in USD
  // Raw values for advanced use
  navUsd1e18: bigint | undefined;
  ppsUsd1e18: bigint | undefined;
  totalSharesRaw: bigint | undefined;
  userSharesRaw: bigint | undefined;
}

export function useStrategyData(strategy: Strategy | null): StrategyData {
  const { address } = useAccount();

  // Defensive check: ensure strategy has a valid contracts block
  const hasContracts =
    !!strategy &&
    !!(strategy as any).contracts &&
    typeof (strategy as any).contracts === "object" &&
    typeof (strategy as any).contracts.vaultAddress === "string" &&
    typeof (strategy as any).contracts.handlerAddress === "string" &&
    typeof (strategy as any).contracts.coreViewsAddress === "string" &&
    typeof (strategy as any).contracts.l1ReadAddress === "string";

  if (!hasContracts) {
    return {
      loading: false,
      error: null,
      navUsd: undefined,
      ppsUsd: undefined,
      totalShares: undefined,
      userShares: undefined,
      userValueUsd: undefined,
      tvlUsd: undefined,
      oracleHypeUsd: undefined,
      oracleToken1Usd: undefined,
      navUsd1e18: undefined,
      ppsUsd1e18: undefined,
      totalSharesRaw: undefined,
      userSharesRaw: undefined,
    };
  }

  const isConfigured =
    hasContracts &&
    !!(strategy as Strategy).contracts.vaultAddress &&
    !!(strategy as Strategy).contracts.handlerAddress &&
    !!(strategy as Strategy).contracts.coreViewsAddress &&
    !!address;

  const contracts = isConfigured && strategy && hasContracts
    ? (() => {
        const contracts = getStrategyContracts(strategy as Strategy);
        const shareDecimals = (strategy as Strategy).contracts.shareDecimals ?? 18;

        return [
          // From Vault
          {
            ...contracts.vault,
            functionName: 'nav1e18' as const,
          },
          {
            ...contracts.vault,
            functionName: 'pps1e18' as const,
          },
          {
            ...contracts.vault,
            functionName: 'totalSupply' as const,
          },
          {
            ...contracts.vault,
            functionName: 'balanceOf' as const,
            args: [address] as const,
          },
          // From Views
          {
            ...contracts.views,
            functionName: 'equitySpotUsd1e18' as const,
            args: [strategy.contracts.handlerAddress] as const,
          },
          {
            ...contracts.views,
            functionName: 'oraclePxHype1e8' as const,
            args: [strategy.contracts.handlerAddress] as const,
          },
          {
            ...contracts.views,
            functionName: 'oraclePxToken11e8' as const,
            args: [strategy.contracts.handlerAddress] as const,
          },
        ];
      })()
    : [];

  const { data, isLoading, isError, error } = useReadContracts({
    contracts,
    query: {
      enabled: isConfigured,
      retry: 1,
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  if (!isConfigured || !strategy || !data || !hasContracts) {
    return {
      loading: isLoading,
      error: error as Error | null,
      navUsd: undefined,
      ppsUsd: undefined,
      totalShares: undefined,
      userShares: undefined,
      userValueUsd: undefined,
      tvlUsd: undefined,
      oracleHypeUsd: undefined,
      oracleToken1Usd: undefined,
      navUsd1e18: undefined,
      ppsUsd1e18: undefined,
      totalSharesRaw: undefined,
      userSharesRaw: undefined,
    };
  }

  const shareDecimals = (strategy as Strategy).contracts.shareDecimals ?? 18;

  // Parse results
  const navUsd1e18 = data[0]?.result as bigint | undefined;
  const ppsUsd1e18 = data[1]?.result as bigint | undefined;
  const totalSharesRaw = data[2]?.result as bigint | undefined;
  const userSharesRaw = data[3]?.result as bigint | undefined;
  const equitySpotUsd1e18 = data[4]?.result as bigint | undefined;
  const oraclePxHype1e8 = data[5]?.result as bigint | undefined;
  const oraclePxToken11e8 = data[6]?.result as bigint | undefined;

  // Format values
  const navUsd = navUsd1e18 ? Number(formatUnits(navUsd1e18, 18)) : undefined;
  const ppsUsd = ppsUsd1e18 ? Number(formatUnits(ppsUsd1e18, 18)) : undefined;
  const totalShares = totalSharesRaw ? Number(formatUnits(totalSharesRaw, shareDecimals)) : undefined;
  const userShares = userSharesRaw ? Number(formatUnits(userSharesRaw, shareDecimals)) : undefined;
  const userValueUsd = userShares !== undefined && ppsUsd !== undefined ? userShares * ppsUsd : undefined;
  const tvlUsd = navUsd; // TVL is the same as NAV for ERA
  const oracleHypeUsd = oraclePxHype1e8 ? Number(oraclePxHype1e8) / 1e8 : undefined;
  const oracleToken1Usd = oraclePxToken11e8 ? Number(oraclePxToken11e8) / 1e8 : undefined;

  return {
    loading: isLoading,
    error: error as Error | null,
    navUsd,
    ppsUsd,
    totalShares,
    userShares,
    userValueUsd,
    tvlUsd,
    oracleHypeUsd,
    oracleToken1Usd,
    navUsd1e18,
    ppsUsd1e18,
    totalSharesRaw,
    userSharesRaw,
  };
}

