'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useChainId, useSwitchChain, useBalance, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import type { Strategy } from '@/types/strategy';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { useStrategyDeposit } from '@/hooks/useStrategyDeposit';
import { useStrategyWithdraw } from '@/hooks/useStrategyWithdraw';
import { useStrategyToken1Meta } from '@/hooks/useStrategyToken1Meta';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { formatUsd } from '@/lib/format';
import { l1readContract } from '@/contracts/l1read';
import { usePpsHistory } from '@/hooks/usePpsHistory';

// Token composition interface
interface TokenComposition {
  tokenId: string;
  name: string;
  balance: number;
  valueUsd: number;
  oraclePriceUsd: number;
}


// Query options to reduce RPC calls and prevent 429
const QUERY_OPTIONS = {
  staleTime: 60_000, // 1 minute
  gcTime: 5 * 60_000, // 5 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchInterval: false,
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 8000),
} as const;

export default function StrategyStatsPage() {
  const params = useParams<{ id: string }>();
  const strategyId = params?.id;
  const { strategies, loading } = useStrategies();

  // Find strategy by ID
  const strategy = useMemo(() => {
    if (!strategyId || loading || !Array.isArray(strategies) || strategies.length === 0) {
      return null;
    }
    return strategies.find(s => s && s.id === strategyId) || null;
  }, [strategyId, strategies, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#5a9a9a] text-lg">Loading strategy...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-[#5a9a9a] text-lg mb-4">Strategy not found</p>
            <Link
              href="/dashboard/strategy"
              className="text-[#fab062] hover:text-[#e89a4a] transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <StrategyClient strategy={strategy} />;
}

function StrategyClient({ strategy }: { strategy: Strategy }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  useWhitelistCheck();

  // Get strategy data - strategy is guaranteed to be defined here
  const strategyData = useStrategyData(strategy);
  const { symbol: token1Symbol, name: token1Name } = useStrategyToken1Meta(strategy);
  const displayToken1 = token1Symbol || token1Name || 'TOKEN1';

  // Fetch PPS history for APR calculation
  const vaultAddress = strategy?.contracts?.vaultAddress;
  const { data: ppsHistory } = usePpsHistory(vaultAddress, 1000); // Get enough history for 30D

  // Deposit/Withdraw hooks
  const { deposit, isPending: isDepositPending } = useStrategyDeposit(strategy);
  const { withdraw, isPending: isWithdrawPending } = useStrategyWithdraw(strategy);

  // HYPE balance for deposit
  const isCorrectChain = strategy?.contracts ? chainId === strategy.contracts.chainId : false;
  const { data: hypeBalance } = useBalance({
    address,
    query: {
      enabled: !!address && isCorrectChain,
      ...QUERY_OPTIONS,
    },
  });

  // Deposit/Withdraw state
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Token composition - read HYPE and TOKEN1 balances from Core
  const contracts = useMemo(() => getStrategyContracts(strategy), [strategy]);
  const handlerAddress = strategy?.contracts?.handlerAddress;

  // Read handler token IDs (HYPE and TOKEN1) - memoized to prevent recreation
  const tokenIdContracts = useMemo(() => {
    if (!handlerAddress || !contracts?.handler) {
      return [];
    }
    return [
      {
        ...contracts.handler,
        functionName: 'spotTokenHYPE' as const,
      },
      {
        ...contracts.handler,
        functionName: 'spotTokenTOKEN1' as const,
      },
    ];
  }, [handlerAddress, contracts?.handler]);

  const { data: tokenIdsData, isError: isTokenIdsError, refetch: refetchTokenIds } = useReadContracts({
    contracts: tokenIdContracts,
    query: {
      enabled: tokenIdContracts.length > 0,
      ...QUERY_OPTIONS,
    },
  });

  // Defensive check: ensure tokenIdsData is an array before accessing
  const tokenIdsArray = Array.isArray(tokenIdsData) ? tokenIdsData : [];
  const hypeTokenId = tokenIdsArray[0]?.result as bigint | undefined;
  const token1TokenId = tokenIdsArray[1]?.result as bigint | undefined;

  const l1ReadAddress = strategy?.contracts?.l1ReadAddress;

  // Read token balances and info - memoized and only if prerequisites are met
  const tokenCompositionContracts = useMemo(() => {
    if (!handlerAddress || !l1ReadAddress || !hypeTokenId || !token1TokenId) {
      return [];
    }
    // Only load if strategyData is ready and oracles are available
    if (strategyData.loading || strategyData.oracleHypeUsd === undefined || strategyData.oracleToken1Usd === undefined) {
      return [];
    }
    return [
      // HYPE balance
      {
        ...l1readContract(l1ReadAddress),
        functionName: 'spotBalance' as const,
        args: [handlerAddress, hypeTokenId] as const,
      },
      // HYPE token info
      {
        ...l1readContract(l1ReadAddress),
        functionName: 'tokenInfo' as const,
        args: [Number(hypeTokenId)] as const,
      },
      // TOKEN1 balance
      {
        ...l1readContract(l1ReadAddress),
        functionName: 'spotBalance' as const,
        args: [handlerAddress, token1TokenId] as const,
      },
      // TOKEN1 token info
      {
        ...l1readContract(l1ReadAddress),
        functionName: 'tokenInfo' as const,
        args: [Number(token1TokenId)] as const,
      },
    ];
  }, [handlerAddress, l1ReadAddress, hypeTokenId, token1TokenId, strategyData.loading, strategyData.oracleHypeUsd, strategyData.oracleToken1Usd]);

  const { data: tokenData, isError: isTokenDataError, refetch: refetchTokenData } = useReadContracts({
    contracts: tokenCompositionContracts,
    query: {
      enabled: tokenCompositionContracts.length > 0,
      ...QUERY_OPTIONS,
    },
  });

  // Parse token composition - defensive check for undefined/array
  const tokenComposition: TokenComposition[] = useMemo(() => {
    const composition: TokenComposition[] = [];
    const tokenDataArray = Array.isArray(tokenData) ? tokenData : [];
    if (tokenDataArray.length >= 4 && strategyData.oracleHypeUsd !== undefined && strategyData.oracleToken1Usd !== undefined) {
      try {
        // HYPE
        const hypeBalanceResult = tokenDataArray[0]?.result as { total: bigint } | undefined;
        const hypeInfo = tokenDataArray[1]?.result as { name: string; weiDecimals: number } | undefined;
        if (hypeBalanceResult && hypeInfo && hypeTokenId) {
          const balance = Number(formatUnits(hypeBalanceResult.total, hypeInfo.weiDecimals || 18));
          const valueUsd = balance * strategyData.oracleHypeUsd;
          composition.push({
            tokenId: hypeTokenId.toString(),
            name: hypeInfo.name || 'HYPE',
            balance,
            valueUsd,
            oraclePriceUsd: strategyData.oracleHypeUsd,
          });
        }

        // TOKEN1
        const token1BalanceResult = tokenDataArray[2]?.result as { total: bigint } | undefined;
        const token1Info = tokenDataArray[3]?.result as { name: string; weiDecimals: number } | undefined;
        if (token1BalanceResult && token1Info && token1TokenId) {
          const balance = Number(formatUnits(token1BalanceResult.total, token1Info.weiDecimals || 18));
          const valueUsd = balance * strategyData.oracleToken1Usd;
          composition.push({
            tokenId: token1TokenId.toString(),
            name: token1Info.name || displayToken1,
            balance,
            valueUsd,
            oraclePriceUsd: strategyData.oracleToken1Usd,
          });
        }
      } catch (e) {
        // Silently handle token composition parsing errors
        if (process.env.NODE_ENV === 'development') {
          console.error('[StrategyClient] Error parsing token composition:', e);
        }
      }
    }
    return composition;
  }, [tokenData, strategyData.oracleHypeUsd, strategyData.oracleToken1Usd, hypeTokenId, token1TokenId, displayToken1]);

  const EXPECTED_CHAIN_ID = strategy?.contracts?.chainId ?? 998;

  // Handlers
  const handleDeposit = async () => {
    if (!depositAmount || !strategy) return;
    try {
      await deposit(depositAmount);
      setDepositAmount('');
    } catch (err) {
      // Error is handled by toast system
      if (process.env.NODE_ENV === 'development') {
        console.error('[StrategyClient] Deposit error:', err);
      }
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !strategy) return;
    try {
      await withdraw(withdrawAmount);
      setWithdrawAmount('');
    } catch (err) {
      // Error is handled by toast system
      if (process.env.NODE_ENV === 'development') {
        console.error('[StrategyClient] Withdraw error:', err);
      }
    }
  };

  const setMaxDeposit = () => {
    if (hypeBalance) {
      const max = Number(formatUnits(hypeBalance.value, 18)) - 0.01; // Buffer for gas
      setDepositAmount(Math.max(0, max).toFixed(6));
    }
  };

  const setMaxWithdraw = () => {
    if (strategyData.userSharesAvailable !== undefined) {
      setWithdrawAmount(strategyData.userSharesAvailable.toFixed(6));
    }
  };

  // Calculate APR from PPS history
  const calculateApr = useMemo(() => {
    const aprs: { '1D': number | null; '7D': number | null; '30D': number | null } = {
      '1D': null,
      '7D': null,
      '30D': null,
    };

    if (!ppsHistory?.entries || ppsHistory.entries.length === 0) {
      return aprs;
    }

    // Convert entries to HistoryPoint format and sort by timestamp ascending
    type HistoryPoint = { t: number; pps: number };
    const points: HistoryPoint[] = ppsHistory.entries
      .map(entry => {
        // Parse PPS - could be 1e18 format or decimal string
        let pps: number;
        try {
          const ppsStr = entry.pps;
          // If it looks like a bigint (very large number), assume 1e18 format
          if (ppsStr.includes('e') || Number(ppsStr) > 1e10) {
            pps = Number(formatUnits(BigInt(ppsStr), 18));
          } else {
            pps = Number(ppsStr);
          }
          if (isNaN(pps) || pps <= 0) return null;
          return { t: entry.timestamp, pps };
        } catch {
          return null;
        }
      })
      .filter((p): p is HistoryPoint => p !== null)
      .sort((a, b) => a.t - b.t); // Sort ascending by timestamp

    if (points.length === 0) {
      return aprs;
    }

    const nowPoint = points[points.length - 1]; // Latest point
    if (!nowPoint || nowPoint.pps <= 0) {
      return aprs;
    }

    // Calculate APR for each window
    const windows = [
      { key: '1D' as const, days: 1 },
      { key: '7D' as const, days: 7 },
      { key: '30D' as const, days: 30 },
    ];

    for (const window of windows) {
      const targetTime = nowPoint.t - window.days * 24 * 60 * 60 * 1000;
      
      // Find the point closest to targetTime (or closest earlier)
      let thenPoint: HistoryPoint | null = null;
      let minDiff = Infinity;
      
      for (const point of points) {
        if (point.t <= targetTime) {
          const diff = targetTime - point.t;
          if (diff < minDiff) {
            minDiff = diff;
            thenPoint = point;
          }
        }
      }

      // If no earlier point found, try closest point (even if later)
      if (!thenPoint) {
        for (const point of points) {
          const diff = Math.abs(point.t - targetTime);
          if (diff < minDiff) {
            minDiff = diff;
            thenPoint = point;
          }
        }
      }

      if (thenPoint && thenPoint.pps > 0) {
        const deltaDays = (nowPoint.t - thenPoint.t) / (1000 * 60 * 60 * 24);
        
        // Only calculate if we have at least 0.5 days of data
        if (deltaDays >= 0.5) {
          const growth = (nowPoint.pps / thenPoint.pps) - 1;
          const apr = growth * (365 / deltaDays);
          
          // Check for valid number
          if (isFinite(apr) && !isNaN(apr)) {
            aprs[window.key] = apr;
          }
        }
      }
    }

    return aprs;
  }, [ppsHistory]);

  // Check for RPC errors (429 rate limit)
  const hasRpcError = isTokenIdsError || isTokenDataError || strategyData.error;
  const rpcErrorMessage = hasRpcError
    ? (strategyData.error?.message?.includes('429') || 
       strategyData.error?.message?.includes('rate limit') ||
       strategyData.error?.message?.includes('Too Many Requests'))
      ? 'Data temporarily unavailable (RPC rate limit). Please retry.'
      : strategyData.error?.message || 'Error loading data'
    : null;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header with navigation */}
      <DashboardHeader />

      {/* Main Content */}
      <main className="pt-20 md:pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/dashboard/strategy"
            className="inline-flex items-center gap-2 text-[#5a9a9a] hover:text-[#fab062] transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          {/* Strategy Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                {strategy?.name ?? 'Strategy'}
              </span>
            </h1>
            <p className="text-[#5a9a9a] text-lg mb-4">Strategy statistics and actions</p>
            {strategy?.description && (
              <p className="text-gray-400 text-sm mb-4">{strategy.description}</p>
            )}
            <div className="flex items-center gap-4">
              {strategy?.riskLevel && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  strategy.riskLevel === 'low' ? 'bg-green-400/20 border-green-400/30 text-green-400' :
                  strategy.riskLevel === 'medium' ? 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400' :
                  'bg-red-400/20 border-red-400/30 text-red-400'
                }`}>
                  {strategy.riskLevel}
                </span>
              )}
              {strategy?.status && (
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  strategy.status === 'open' ? 'bg-green-400/20 text-green-400' :
                  strategy.status === 'paused' ? 'bg-yellow-400/20 text-yellow-400' :
                  'bg-red-400/20 text-red-400'
                }`}>
                  {strategy.status}
                </span>
              )}
            </div>
          </div>

          {/* Network warning */}
          {address && !isCorrectChain && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
              <p className="text-red-400 text-sm mb-2">Wrong network. Please switch to Chain ID {EXPECTED_CHAIN_ID}</p>
              <button
                onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Switch Network
              </button>
            </div>
          )}

          {/* RPC Error Banner */}
          {rpcErrorMessage && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-sm mb-2">{rpcErrorMessage}</p>
              <button
                onClick={() => {
                  if (isTokenIdsError) refetchTokenIds();
                  if (isTokenDataError) refetchTokenData();
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* SECTION A — Key Metrics */}
          <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white">Key Metrics</h2>
            
            {strategyData.loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#fab062]"></div>
                <p className="text-[#5a9a9a] text-sm mt-4">Loading metrics...</p>
              </div>
            ) : strategyData.error && !rpcErrorMessage ? (
              <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <p className="text-red-400 text-sm">Error loading metrics: {strategyData.error.message}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Primary Metrics - TVL, PPS, Total Shares */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl p-5 sm:p-6 hover:border-[#fab062]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#fab062]/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wide">TVL</p>
                      <svg className="w-5 h-5 text-[#fab062]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-white text-2xl sm:text-3xl font-bold mb-1">
                      {strategyData.tvlUsd !== undefined ? formatUsd(strategyData.tvlUsd, 2) : '—'}
                    </p>
                    <p className="text-gray-500 text-xs">Total Value Locked</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl p-5 sm:p-6 hover:border-[#fab062]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#fab062]/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wide">PPS</p>
                      <svg className="w-5 h-5 text-[#fab062]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-white text-2xl sm:text-3xl font-bold mb-1">
                      {strategyData.ppsUsd !== undefined ? formatUsd(strategyData.ppsUsd, 4) : '—'}
                    </p>
                    <p className="text-gray-500 text-xs">Price Per Share</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl p-5 sm:p-6 hover:border-[#fab062]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#fab062]/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wide">Total Shares</p>
                      <svg className="w-5 h-5 text-[#fab062]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-white text-2xl sm:text-3xl font-bold mb-1">
                      {strategyData.totalShares !== undefined ? strategyData.totalShares.toFixed(4) : '—'}
                    </p>
                    <p className="text-gray-500 text-xs">All Shares Issued</p>
                  </div>
                </div>

                {/* User Metrics - Only shown if connected */}
                {address && (strategyData.userShares !== undefined || strategyData.userValueUsd !== undefined) && (
                  <div className="border-t border-gray-700/50 pt-8">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Your Position</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gradient-to-br from-[#fab062]/10 to-[#fab062]/5 border border-[#fab062]/20 rounded-xl p-5 sm:p-6 hover:border-[#fab062]/40 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[#fab062] text-xs sm:text-sm font-medium uppercase tracking-wide">Your Shares</p>
                          <svg className="w-5 h-5 text-[#fab062]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="text-white text-2xl sm:text-3xl font-bold mb-1">
                          {strategyData.userShares !== undefined ? strategyData.userShares.toFixed(4) : '—'}
                        </p>
                        <p className="text-gray-400 text-xs">Your total shares (wallet + staked)</p>
                      </div>

                      <div className="bg-gradient-to-br from-[#fab062]/10 to-[#fab062]/5 border border-[#fab062]/20 rounded-xl p-5 sm:p-6 hover:border-[#fab062]/40 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[#fab062] text-xs sm:text-sm font-medium uppercase tracking-wide">Your Value</p>
                          <svg className="w-5 h-5 text-[#fab062]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-white text-2xl sm:text-3xl font-bold mb-1">
                          {strategyData.userValueUsd !== undefined ? formatUsd(strategyData.userValueUsd, 2) : '—'}
                        </p>
                        <p className="text-gray-400 text-xs">Your deposited value (USDT)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* APR Metrics */}
                <div className="border-t border-gray-700/50 pt-8">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Performance (APR)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {(['1D', '7D', '30D'] as const).map((period) => {
                      const apr = calculateApr[period];
                      const aprValue = apr !== null ? apr * 100 : null;
                      const isPositive = aprValue !== null && aprValue > 0;
                      const isNegative = aprValue !== null && aprValue < 0;
                      
                      return (
                        <div
                          key={period}
                          className={`bg-gradient-to-br rounded-xl p-5 sm:p-6 border transition-all duration-300 hover:shadow-lg ${
                            isPositive
                              ? 'from-green-900/20 to-green-800/10 border-green-700/30 hover:border-green-600/50 hover:shadow-green-500/10'
                              : isNegative
                              ? 'from-red-900/20 to-red-800/10 border-red-700/30 hover:border-red-600/50 hover:shadow-red-500/10'
                              : 'from-gray-800/60 to-gray-900/60 border-gray-700/50 hover:border-gray-600/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-wide">APR ({period})</p>
                            {aprValue !== null && (
                              <svg
                                className={`w-5 h-5 ${
                                  isPositive ? 'text-green-400/60' : isNegative ? 'text-red-400/60' : 'text-gray-500/60'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {isPositive ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                ) : isNegative ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                )}
                              </svg>
                            )}
                          </div>
                          <p
                            className={`text-2xl sm:text-3xl font-bold mb-1 ${
                              isPositive
                                ? 'text-green-400'
                                : isNegative
                                ? 'text-red-400'
                                : 'text-white'
                            }`}
                          >
                            {aprValue !== null ? `${aprValue.toFixed(2)}%` : '—'}
                          </p>
                          <p className="text-gray-500 text-xs">Annualized (historical)</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B — Deposit / Withdraw Panels */}
          {address && isCorrectChain && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Deposit Card */}
              <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Deposit</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="deposit-amount" className="text-sm text-gray-400">
                        Amount (HYPE)
                      </label>
                      <button
                        onClick={setMaxDeposit}
                        className="text-xs text-[#fab062] hover:text-[#e89a4a] transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    <input
                      id="deposit-amount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none"
                      step="0.000001"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wallet balance: {hypeBalance ? Number(formatUnits(hypeBalance.value, 18)).toFixed(4) : '0.0000'} HYPE
                    </p>
                  </div>
                  <button
                    onClick={handleDeposit}
                    disabled={isDepositPending || !depositAmount || Number(depositAmount) <= 0}
                    className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDepositPending ? 'Processing...' : 'Deposit'}
                  </button>
                </div>
              </div>

              {/* Withdraw Card */}
              <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-white">Withdraw</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="withdraw-amount" className="text-sm text-gray-400">
                        Shares to withdraw
                      </label>
                      <button
                        onClick={setMaxWithdraw}
                        className="text-xs text-[#fab062] hover:text-[#e89a4a] transition-colors"
                      >
                        Max
                      </button>
                    </div>
                    <input
                      id="withdraw-amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none"
                      step="0.000001"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Available shares: {strategyData.userSharesAvailable !== undefined ? strategyData.userSharesAvailable.toFixed(4) : '0.0000'}
                    </p>
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawPending || !withdrawAmount || Number(withdrawAmount) <= 0}
                    className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isWithdrawPending ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!address && (
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-6 text-center">
              <p className="text-[#5a9a9a] text-sm mb-4">Connect your wallet to deposit or withdraw</p>
            </div>
          )}

          {/* SECTION C — Token Composition */}
          <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Token Composition</h2>
            
            {!tokenComposition || tokenComposition.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#5a9a9a] text-sm">Token composition unavailable</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Token Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Token ID</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Balance in Strategy</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Value (USDT)</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Oracle Price (USDT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tokenComposition ?? []).map((token, idx) => (
                      <tr key={idx} className="border-b border-gray-800/50">
                        <td className="py-3 px-4 text-sm text-white">{token.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-400 font-mono">{token.tokenId}</td>
                        <td className="py-3 px-4 text-sm text-white text-right">{token.balance.toFixed(6)}</td>
                        <td className="py-3 px-4 text-sm text-white text-right">{formatUsd(token.valueUsd, 2)}</td>
                        <td className="py-3 px-4 text-sm text-white text-right">{formatUsd(token.oraclePriceUsd, 4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
