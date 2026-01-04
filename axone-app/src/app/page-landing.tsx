'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import Link from 'next/link';

interface LandingStats {
  vaultCount: number;
  vaultAddresses: string[];
  totalDepositCount: number;
  depositCountByVault: Record<string, number>;
  fromBlockUsed: number;
  totalDepositedUsd: number;
  vaults: Array<{
    id: string;
    name: string;
    riskLevel: string;
    status: string;
    tvlUsd: number;
    vaultAddress: string;
    chainId: number;
  }>;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export default function Home() {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/public/landing-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('[Landing] Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Get top 6 vaults by TVL
  const topVaults = stats?.vaults.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative">
        {/* Logo background */}
        <div className="absolute inset-x-0 top-[45%] flex items-center justify-center pointer-events-none z-0 -translate-y-1/2">
          <Image
            src="/Logo-Statera-sandy-brown-détouré.png"
            alt="Statera Logo"
            width={1200}
            height={1200}
            className="h-96 w-auto sm:h-[500px] md:h-[600px] lg:h-[800px] opacity-10"
            sizes="(min-width: 1024px) 800px, (min-width: 768px) 600px, 400px"
            priority
          />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <Reveal>
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent relative inline-block statera-shimmer">
                  STATERA
                </span>
              </h2>
              <style jsx global>{`
                @keyframes shimmer {
                  0%, 90%, 100% {
                    background-position: -200% center;
                  }
                  5%, 85% {
                    background-position: 200% center;
                  }
                }
                .statera-shimmer {
                  background-size: 200% 100%;
                  animation: shimmer 5s infinite;
                }
              `}</style>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                  Decentralized Investment Strategies
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-10 sm:mb-12 leading-relaxed font-medium max-w-3xl mx-auto">
                Automated portfolio management on-chain. Deposit into strategies that rebalance hourly, optimize allocations, and deliver transparent returns.
              </p>

              {/* Metrics - Just below title */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 sm:mb-12">
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-2">
                      —
                    </p>
                    <p className="text-gray-400 text-sm">Total Deposited</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-2">
                      —
                    </p>
                    <p className="text-gray-400 text-sm">Active Vaults</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-2">
                      —
                    </p>
                    <p className="text-gray-400 text-sm">Total Unique Deposits</p>
                  </div>
                </div>
              ) : error ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 sm:mb-12">
                  <div className="text-center">
                    <p className="text-red-400 text-sm">Unable to load metrics</p>
                  </div>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 sm:mb-12">
                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-2">
                      <AnimatedCounter
                        value={stats.totalDepositedUsd}
                        duration={2000}
                        formatter={(val) => formatUsd(val)}
                      />
                    </p>
                    <p className="text-gray-400 text-sm">Total Deposited</p>
                  </div>

                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-2">
                      <AnimatedCounter
                        value={stats.vaultCount}
                        duration={2000}
                        formatter={(val) => Math.floor(val).toString()}
                      />
                    </p>
                    <p className="text-gray-400 text-sm">Active Vaults</p>
                  </div>

                  <div className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-2">
                      <AnimatedCounter
                        value={stats.totalDepositCount}
                        duration={2000}
                        formatter={(val) => Math.floor(val).toLocaleString()}
                      />
                    </p>
                    <p className="text-gray-400 text-sm" title="Number of deposit transactions across all deployed vaults">
                      Total Unique Deposits
                    </p>
                  </div>
                </div>
              ) : null}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dashboard/strategy"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-[#EF9B13] to-[#FAB062] text-[#121212] font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:from-[#D36A03] hover:to-[#EF9B13] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FAB062] focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  Launch App
                </Link>

                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white/20 text-white font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:border-white/40 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  Documentation
                </Link>
              </div>

              {/* How the protocol works */}
              <div className="mt-16 sm:mt-20 py-16 sm:py-20">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                  {/* Part A: Headline + Subheadline */}
                  <Reveal delayMs={0}>
                    <div className="text-center mb-12 sm:mb-16">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-4">
                        Web3 investing, simplified and optimized.
                      </h2>
                      <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
                        Statera turns DeFi complexity into a streamlined, accessible experience.
                      </p>
                    </div>
                  </Reveal>

                  {/* Part B: Short narrative */}
                  <div className="space-y-8 sm:space-y-12 mb-16 sm:mb-20">
                    {/* Block 1 */}
                    <Reveal delayMs={80}>
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-4">
                          A unified investment experience
                        </h3>
                        <p className="text-base sm:text-lg text-white/70 leading-relaxed">
                          Statera Index combines DeFi execution with a simple interface. Deposit into strategies that manage positions automatically, providing access to diversified exposure through a single transaction.
                        </p>
                      </div>
                    </Reveal>

                    {/* Block 2 */}
                    <Reveal delayMs={160}>
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-4">
                          An intelligent protocol layer
                        </h3>
                        <p className="text-base sm:text-lg text-white/70 leading-relaxed">
                          The protocol manages positions automatically according to strategy rules, designed to improve efficiency and manage risk. Rebalancing occurs when allocations deviate from targets, keeping strategies aligned with their intended exposures.
                        </p>
                      </div>
                    </Reveal>
                  </div>

                  {/* Part C: Why Statera? */}
                  <Reveal delayMs={220}>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062] text-center mb-8 sm:mb-12">
                      Why Statera?
                    </h3>
                  </Reveal>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {/* Item 1 */}
                    <Reveal delayMs={280}>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="h-[2px] w-8 bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-4"></div>
                        <h4 className="text-xl font-semibold text-white mb-3">
                          One deposit, diversified exposure
                        </h4>
                        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                          A single deposit provides access to an index-style portfolio designed to stay aligned with its target allocation.
                        </p>
                      </div>
                    </Reveal>

                    {/* Item 2 */}
                    <Reveal delayMs={360}>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="h-[2px] w-8 bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-4"></div>
                        <h4 className="text-xl font-semibold text-white mb-3">
                          Adaptive by design
                        </h4>
                        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                          Strategy logic and rebalancing are designed to respond to market moves while keeping risk constraints in view.
                        </p>
                      </div>
                    </Reveal>

                    {/* Item 3 */}
                    <Reveal delayMs={440}>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="h-[2px] w-8 bg-gradient-to-r from-[#EF9B13] to-[#FAB062] mb-4"></div>
                        <h4 className="text-xl font-semibold text-white mb-3">
                          On-chain transparency
                        </h4>
                        <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                          Key operations are verifiable on-chain, enabling auditable execution and clear accounting.
                        </p>
                      </div>
                    </Reveal>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Vaults Preview */}
      {stats && stats.vaults.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <Reveal delayMs={100}>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Available Strategies</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Explore our on-chain investment strategies. Each vault is transparent, non-custodial, and managed by automated rebalancing.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topVaults.map((vault, index) => (
                <Reveal key={vault.id} delayMs={200 + index * 100}>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-[#FAB062]/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{vault.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        vault.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                        vault.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {vault.riskLevel}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">TVL</span>
                        <span className="text-white font-semibold">{formatUsd(vault.tvlUsd)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-semibold ${
                          vault.status === 'open' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {vault.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/strategy"
                      className="block w-full text-center px-4 py-2 rounded-lg bg-gradient-to-r from-[#EF9B13] to-[#FAB062] text-[#121212] font-semibold text-sm hover:from-[#D36A03] hover:to-[#EF9B13] transition-all"
                    >
                      Open Vault
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Statera simplifies DeFi investment through automated, transparent strategies.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#EF9B13] to-[#FAB062] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Deposit</h3>
                <p className="text-gray-400 text-sm">
                  Deposit HYPE into a strategy vault. Your funds remain in your control—non-custodial and on-chain.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#EF9B13] to-[#FAB062] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Vault Shares</h3>
                <p className="text-gray-400 text-sm">
                  Receive vault shares representing your position. Shares are ERC20 tokens you can transfer or stake.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={400}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#EF9B13] to-[#FAB062] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Rebalancing</h3>
                <p className="text-gray-400 text-sm">
                  Strategies automatically rebalance hourly to optimize allocations and capture market opportunities.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={500}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#EF9B13] to-[#FAB062] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  4
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Transparency</h3>
                <p className="text-gray-400 text-sm">
                  All positions, rebalancing, and fees are recorded on-chain. View your strategy's performance in real-time.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Smart Rebalancing */}
      <section className="py-16 sm:py-20 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Smart Rebalancing</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Automated portfolio management through continuous monitoring and threshold-based execution.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Continuous Monitoring</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Strategies are monitored hourly to track market conditions and portfolio allocations. 
                  Real-time data ensures positions remain aligned with target allocations.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Threshold-Based Execution</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Rebalancing occurs when allocations deviate beyond predefined thresholds. 
                  This approach minimizes unnecessary transactions while maintaining target exposure.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={400}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Execution Advantages</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Leveraging Hyperliquid's decentralized order book and high-performance infrastructure, 
                  rebalancing executes with minimal slippage, low fees, and instant settlement.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Fees & Transparency */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Fees & Transparency</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Clear fee structure with all costs disclosed upfront.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Vault Fees</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start">
                    <span className="text-[#FAB062] mr-2">•</span>
                    <span><strong className="text-white">Deposit fees:</strong> Applied on shares minted, configurable per vault</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FAB062] mr-2">•</span>
                    <span><strong className="text-white">Withdrawal fees:</strong> Applied on payout, may vary by amount</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FAB062] mr-2">•</span>
                    <span><strong className="text-white">Management fees:</strong> Ongoing costs for strategy operation</span>
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">External Fees</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li className="flex items-start">
                    <span className="text-[#FAB062] mr-2">•</span>
                    <span><strong className="text-white">Hypercore fees:</strong> Network and execution costs related to Hyperliquid infrastructure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#FAB062] mr-2">•</span>
                    <span><strong className="text-white">On-chain transparency:</strong> All fees are recorded on-chain and verifiable via block explorer</span>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* App Features */}
      <section className="py-16 sm:py-20 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">App Features</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Core functionality available in the Statera application.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Strategies</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Users deposit into on-chain vaults implementing predefined strategies. 
                  Vaults manage exposure and rebalancing automatically. Performance and risk are strategy-dependent.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Dashboard</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Central interface to monitor deposits, NAV, performance, and positions. 
                  Real-time on-chain data and strategy metrics provide full transparency.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={400}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Swap</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Interface to swap supported assets. Used to enter or rebalance positions within the ecosystem.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={500}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Staking</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Stake protocol-related tokens. Earn rewards as defined by the protocol mechanics.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={600}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Referral</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Referral system allowing users to invite others. Rewards or benefits follow the rules 
                  defined in the referral contracts.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Security & Transparency */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={100}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Security & Transparency</h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">Non-Custodial</h3>
                <p className="text-gray-400">
                  Your funds never leave your wallet. Vault shares are ERC20 tokens you control. Withdraw at any time.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-3">On-Chain Accounting</h3>
                <p className="text-gray-400">
                  All deposits, withdrawals, and rebalancing operations are recorded on-chain. Verify everything via block explorer.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={100}>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join the decentralized investment revolution. Start with as little as you want, withdraw anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dashboard/strategy"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-[#EF9B13] to-[#FAB062] text-[#121212] font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:from-[#D36A03] hover:to-[#EF9B13] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FAB062] focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  Launch App
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-white/20 text-white font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:border-white/40 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  Read Documentation
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
}
