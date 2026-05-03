/**
 * Generic hook for reading strategy data
 * Supporte v1 (ERA, handler+views) et v3 (RebalancingVault auto-suffisant)
 */
import { useAccount, useReadContracts } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { formatUnits } from 'viem';
import { useVaultStakedShares } from './useVaultStakedShares';

export interface StrategyData {
  loading: boolean;
  error: Error | null;
  navUsd: number | undefined;       // Total NAV in USD
  ppsUsd: number | undefined;       // Price per share in USD
  totalShares: number | undefined;  // Total shares issued
  userShares: number | undefined;   // User's shares (wallet + staked)
  userSharesAvailable: number | undefined;
  userSharesStaked: number | undefined;
  userValueUsd: number | undefined;
  tvlUsd: number | undefined;
  oracleHypeUsd: number | undefined;   // v1 only
  oracleToken1Usd: number | undefined; // v1 only
  // Raw values
  navUsd1e18: bigint | undefined;
  ppsUsd1e18: bigint | undefined;
  totalSharesRaw: bigint | undefined;
  userSharesRaw: bigint | undefined;
  userSharesStakedRaw: bigint | undefined;
  // v3 specifics
  sharePriceUsdc8: bigint | undefined;
  grossAssets: bigint | undefined;
}

const EMPTY: StrategyData = {
  loading: false,
  error: null,
  navUsd: undefined,
  ppsUsd: undefined,
  totalShares: undefined,
  userShares: undefined,
  userSharesAvailable: undefined,
  userSharesStaked: undefined,
  userValueUsd: undefined,
  tvlUsd: undefined,
  oracleHypeUsd: undefined,
  oracleToken1Usd: undefined,
  navUsd1e18: undefined,
  ppsUsd1e18: undefined,
  totalSharesRaw: undefined,
  userSharesRaw: undefined,
  userSharesStakedRaw: undefined,
  sharePriceUsdc8: undefined,
  grossAssets: undefined,
};

const QUERY_OPTIONS = {
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: false,
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 8000),
} as const;

export function useStrategyData(strategy: Strategy | null): StrategyData {
  const { address } = useAccount();

  const hasContracts =
    !!strategy &&
    !!(strategy as any).contracts &&
    typeof (strategy as any).contracts === 'object' &&
    typeof (strategy as any).contracts.vaultAddress === 'string';

  const isV3 = hasContracts && strategy?.contracts?.vaultVersion === 'v3';

  const vaultAddress = hasContracts && strategy ? strategy.contracts.vaultAddress : undefined;
  const { sharesStaked, isLoading: isLoadingStaked } = useVaultStakedShares(vaultAddress);

  // ── v3 reads ──────────────────────────────────────────────────────────────
  const v3Contracts = (isV3 && strategy && address)
    ? (() => {
        const { vault } = getStrategyContracts(strategy);
        return [
          { ...vault, functionName: 'sharePriceUsdc8' as const },
          { ...vault, functionName: 'grossAssets' as const },
          { ...vault, functionName: 'totalSupply' as const },
          { ...vault, functionName: 'balanceOf' as const, args: [address] as const },
        ];
      })()
    : [];

  const {
    data: v3Data,
    isLoading: v3Loading,
    isError: v3IsError,
    error: v3Error,
  } = useReadContracts({
    contracts: v3Contracts,
    query: { enabled: isV3 && v3Contracts.length > 0, ...QUERY_OPTIONS },
  });

  // ── v1 reads ──────────────────────────────────────────────────────────────
  const isV1Configured =
    !isV3 &&
    hasContracts &&
    !!strategy?.contracts?.handlerAddress &&
    !!strategy?.contracts?.coreViewsAddress &&
    !!address;

  const v1Contracts = (isV1Configured && strategy)
    ? (() => {
        const { vault, views } = getStrategyContracts(strategy);
        if (!views) return [];
        return [
          { ...vault, functionName: 'nav1e18' as const },
          { ...vault, functionName: 'pps1e18' as const },
          { ...vault, functionName: 'totalSupply' as const },
          { ...vault, functionName: 'balanceOf' as const, args: [address!] as const },
          { ...views, functionName: 'equitySpotUsd1e18' as const, args: [strategy.contracts.handlerAddress!] as const },
          { ...views, functionName: 'oraclePxHype1e8' as const, args: [strategy.contracts.handlerAddress!] as const },
          { ...views, functionName: 'oraclePxToken11e8' as const, args: [strategy.contracts.handlerAddress!] as const },
        ];
      })()
    : [];

  const {
    data: v1Data,
    isLoading: v1Loading,
    isError: v1IsError,
    error: v1Error,
  } = useReadContracts({
    contracts: v1Contracts,
    query: { enabled: !isV3 && isV1Configured && v1Contracts.length > 0, ...QUERY_OPTIONS },
  });

  // ── bail out ──────────────────────────────────────────────────────────────
  if (!hasContracts) {
    return EMPTY;
  }

  const shareDecimals = strategy!.contracts.shareDecimals ?? 18;

  // ── parse v3 ──────────────────────────────────────────────────────────────
  if (isV3) {
    const arr = Array.isArray(v3Data) ? v3Data : [];
    const sharePriceUsdc8Raw = arr[0]?.result as bigint | undefined;
    const grossAssetsRaw = arr[1]?.result as bigint | undefined;
    const totalSharesRaw = arr[2]?.result as bigint | undefined;
    const userSharesRaw = arr[3]?.result as bigint | undefined;

    // sharePriceUsdc8 → USD (8 decimals)
    const ppsUsd = sharePriceUsdc8Raw !== undefined
      ? Number(sharePriceUsdc8Raw) / 1e8
      : undefined;

    // grossAssets → USD (6 decimals USDC)
    const tvlUsd = grossAssetsRaw !== undefined
      ? Number(formatUnits(grossAssetsRaw, 6))
      : undefined;

    const totalShares = totalSharesRaw !== undefined
      ? Number(formatUnits(totalSharesRaw, shareDecimals))
      : undefined;

    const userSharesAvailable = userSharesRaw !== undefined
      ? Number(formatUnits(userSharesRaw, shareDecimals))
      : undefined;

    const userSharesStakedFormatted = sharesStaked
      ? Number(formatUnits(sharesStaked, shareDecimals))
      : undefined;

    const userShares = (userSharesAvailable ?? 0) + (userSharesStakedFormatted ?? 0);
    const userValueUsd = userShares > 0 && ppsUsd !== undefined ? userShares * ppsUsd : undefined;

    return {
      loading: v3Loading || isLoadingStaked,
      error: (v3IsError ? v3Error : null) as Error | null,
      navUsd: tvlUsd,
      ppsUsd,
      totalShares,
      userShares: userShares > 0 ? userShares : undefined,
      userSharesAvailable,
      userSharesStaked: userSharesStakedFormatted,
      userValueUsd,
      tvlUsd,
      oracleHypeUsd: undefined,
      oracleToken1Usd: undefined,
      navUsd1e18: undefined,
      ppsUsd1e18: undefined,
      totalSharesRaw,
      userSharesRaw,
      userSharesStakedRaw: sharesStaked,
      sharePriceUsdc8: sharePriceUsdc8Raw,
      grossAssets: grossAssetsRaw,
    };
  }

  // ── parse v1 ──────────────────────────────────────────────────────────────
  const arr = Array.isArray(v1Data) ? v1Data : [];

  if (!isV1Configured || arr.length === 0) {
    return {
      ...EMPTY,
      loading: v1Loading || isLoadingStaked,
      error: (v1IsError ? v1Error : null) as Error | null,
    };
  }

  const navUsd1e18 = arr[0]?.result as bigint | undefined;
  const ppsUsd1e18 = arr[1]?.result as bigint | undefined;
  const totalSharesRaw = arr[2]?.result as bigint | undefined;
  const userSharesRaw = arr[3]?.result as bigint | undefined;
  const oraclePxHype1e8 = arr[5]?.result as bigint | undefined;
  const oraclePxToken11e8 = arr[6]?.result as bigint | undefined;

  const navUsd = navUsd1e18 ? Number(formatUnits(navUsd1e18, 18)) : undefined;
  const ppsUsd = ppsUsd1e18 ? Number(formatUnits(ppsUsd1e18, 18)) : undefined;
  const totalShares = totalSharesRaw ? Number(formatUnits(totalSharesRaw, shareDecimals)) : undefined;
  const userSharesAvailable = userSharesRaw ? Number(formatUnits(userSharesRaw, shareDecimals)) : undefined;
  const userSharesStakedFormatted = sharesStaked ? Number(formatUnits(sharesStaked, shareDecimals)) : undefined;
  const userShares = (userSharesAvailable ?? 0) + (userSharesStakedFormatted ?? 0);
  const userValueUsd = userShares > 0 && ppsUsd !== undefined ? userShares * ppsUsd : undefined;
  const oracleHypeUsd = oraclePxHype1e8 ? Number(oraclePxHype1e8) / 1e8 : undefined;
  const oracleToken1Usd = oraclePxToken11e8 ? Number(oraclePxToken11e8) / 1e8 : undefined;

  return {
    loading: v1Loading || isLoadingStaked,
    error: (v1IsError ? v1Error : null) as Error | null,
    navUsd,
    ppsUsd,
    totalShares,
    userShares: userShares > 0 ? userShares : undefined,
    userSharesAvailable,
    userSharesStaked: userSharesStakedFormatted,
    userValueUsd,
    tvlUsd: navUsd,
    oracleHypeUsd,
    oracleToken1Usd,
    navUsd1e18,
    ppsUsd1e18,
    totalSharesRaw,
    userSharesRaw,
    userSharesStakedRaw: sharesStaked,
    sharePriceUsdc8: undefined,
    grossAssets: undefined,
  };
}
