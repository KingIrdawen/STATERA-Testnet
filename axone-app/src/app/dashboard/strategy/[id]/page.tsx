'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import type { Strategy } from '@/types/strategy';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { useStrategyToken1Meta } from '@/hooks/useStrategyToken1Meta';
import { formatUsd } from '@/lib/format';

export default function StrategyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const strategyId = params?.id as string;
  const { strategies, loading } = useStrategies();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  useWhitelistCheck(); // Check whitelist and redirect if needed

  // Find strategy by ID
  useEffect(() => {
    if (strategyId && strategies.length > 0) {
      const found = strategies.find(s => s.id === strategyId);
      if (found) {
        setStrategy(found);
      } else {
        // Strategy not found, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [strategyId, strategies, router]);

  // Get strategy data
  const strategyData = useStrategyData(strategy);
  const { symbol: token1Symbol, name: token1Name } = useStrategyToken1Meta(strategy);
  const displayToken1 = token1Symbol || token1Name || 'TOKEN1';

  const isCorrectChain = strategy ? chainId === strategy.contracts.chainId : false;
  const EXPECTED_CHAIN_ID = strategy?.contracts.chainId ?? 998;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#5a9a9a] text-lg">Loading strategy...</p>
        </div>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-[#5a9a9a] text-lg mb-4">Strategy not found</p>
            <Link
              href="/dashboard/strategy"
              className="text-[#fab062] hover:text-[#e89a4a] transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-gray-800 z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/dashboard" className="flex items-center gap-3">
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
            href="/dashboard"
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
                {strategy.name}
              </span>
            </h1>
            {strategy.description && (
              <p className="text-[#5a9a9a] text-lg mb-4">{strategy.description}</p>
            )}
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                strategy.riskLevel === 'low' ? 'bg-green-400/20 border-green-400/30 text-green-400' :
                strategy.riskLevel === 'medium' ? 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400' :
                'bg-red-400/20 border-red-400/30 text-red-400'
              }`}>
                {strategy.riskLevel}
              </span>
              {strategy.status && (
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

          {/* Strategy Metrics - Placeholder for future implementation */}
          <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-white">Strategy Metrics</h2>
            
            {strategyData.loading ? (
              <div className="text-center py-8">
                <p className="text-[#5a9a9a] text-sm">Loading metrics...</p>
              </div>
            ) : strategyData.error ? (
              <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <p className="text-red-400 text-sm">Error loading metrics: {strategyData.error.message}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-2">Total Value Locked (TVL)</p>
                  <p className="text-white text-2xl font-bold">
                    {strategyData.tvlUsd !== undefined ? formatUsd(strategyData.tvlUsd, 2) : '-'}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-2">Price per Share (PPS)</p>
                  <p className="text-white text-2xl font-bold">
                    {strategyData.ppsUsd !== undefined ? formatUsd(strategyData.ppsUsd, 4) : '-'}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-2">Total Shares</p>
                  <p className="text-white text-2xl font-bold">
                    {strategyData.totalShares !== undefined ? strategyData.totalShares.toFixed(6) : '-'}
                  </p>
                </div>
                
                {address && (
                  <>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-500 text-xs mb-2">Your Deposit</p>
                      <p className="text-white text-2xl font-bold">
                        {strategyData.userValueUsd !== undefined ? formatUsd(strategyData.userValueUsd, 2) : '-'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-500 text-xs mb-2">Your Shares</p>
                      <p className="text-white text-2xl font-bold">
                        {strategyData.userShares !== undefined ? strategyData.userShares.toFixed(6) : '-'}
                      </p>
                    </div>
                  </>
                )}
                
                {strategyData.oracleHypeUsd !== undefined && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-2">HYPE Price</p>
                    <p className="text-white text-2xl font-bold">
                      {formatUsd(strategyData.oracleHypeUsd, 2)}
                    </p>
                  </div>
                )}
                
                {strategyData.oracleToken1Usd !== undefined && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-500 text-xs mb-2">{displayToken1} Price</p>
                    <p className="text-white text-2xl font-bold">
                      {formatUsd(strategyData.oracleToken1Usd, 2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contract Addresses */}
          <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-white">Contract Addresses</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Vault Address</span>
                <span className="text-white font-mono text-xs">{strategy.contracts.vaultAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Handler Address</span>
                <span className="text-white font-mono text-xs">{strategy.contracts.handlerAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Core Views Address</span>
                <span className="text-white font-mono text-xs">{strategy.contracts.coreViewsAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">L1 Read Address</span>
                <span className="text-white font-mono text-xs">{strategy.contracts.l1ReadAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Chain ID</span>
                <span className="text-white font-mono text-xs">{strategy.contracts.chainId}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

