'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain, useBalance, useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { SiteFooter } from '@/components/layout/SiteFooter';
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#121212]/80 backdrop-blur-sm border-b border-gray-800 z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/dashboard/strategy" className="flex items-center gap-3">
              <Image
                src="/Logo-Statera-sandy-brown-détouré.png"
                alt="Statera Logo"
                width={48}
                height={48}
                className="h-8 w-auto sm:h-10 md:h-12"
                sizes="(min-width: 768px) 150px, 120px"
              />
            </Link>
            <div className="flex items-center gap-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

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
          <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Key Metrics</h2>
            
            {strategyData.loading ? (
              <div className="text-center py-8">
                <p className="text-[#5a9a9a] text-sm">Loading metrics...</p>
              </div>
            ) : strategyData.error && !rpcErrorMessage ? (
              <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <p className="text-red-400 text-sm">Error loading metrics: {strategyData.error.message}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-2">Total Shares</p>
                  <p className="text-white text-2xl font-bold">
                    {strategyData.totalShares !== undefined ? strategyData.totalShares.toFixed(4) : '—'}
                  </p>
                </div>

                {address && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-2">Your Shares</p>
                    <p className="text-white text-2xl font-bold">
                      {strategyData.userShares !== undefined ? strategyData.userShares.toFixed(4) : '—'}
                    </p>
                  </div>
                )}

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-2">TVL (USDT)</p>
                  <p className="text-white text-2xl font-bold">
                    {strategyData.tvlUsd !== undefined ? formatUsd(strategyData.tvlUsd, 2) : '—'}
                  </p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-2">PPS (USDT)</p>
                  <p className="text-white text-2xl font-bold">
                    {strategyData.ppsUsd !== undefined ? formatUsd(strategyData.ppsUsd, 4) : '—'}
                  </p>
                </div>

                {address && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-2">Your Deposited Value (USDT)</p>
                    <p className="text-white text-2xl font-bold">
                      {strategyData.userValueUsd !== undefined ? formatUsd(strategyData.userValueUsd, 2) : '—'}
                    </p>
                  </div>
                )}

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-2">APR (30d)</p>
                  <p className="text-white text-2xl font-bold">—</p>
                  {/* TODO: Implement APR calculation when historical dataset is available */}
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

          {/* Contract Addresses */}
          <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Contract Addresses</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Vault Address</span>
                <span className="text-white font-mono text-xs">{strategy?.contracts?.vaultAddress ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Handler Address</span>
                <span className="text-white font-mono text-xs">{strategy?.contracts?.handlerAddress ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Core Views Address</span>
                <span className="text-white font-mono text-xs">{strategy?.contracts?.coreViewsAddress ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">L1 Read Address</span>
                <span className="text-white font-mono text-xs">{strategy?.contracts?.l1ReadAddress ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Chain ID</span>
                <span className="text-white font-mono text-xs">{strategy?.contracts?.chainId ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
