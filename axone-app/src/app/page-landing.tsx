'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import { WhyStateraMarquee } from '@/components/landing/WhyStateraMarquee';
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
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 right-0 w-full sm:w-3/5 lg:w-1/2">
            <Image
              src="/Image-titre.png"
              alt="Statera visual"
              fill
              className="object-cover object-right opacity-20"
              sizes="(min-width: 1280px) 50vw, (min-width: 1024px) 60vw, 100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/95 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(201,163,106,0.18),rgba(18,18,18,0.95))]" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <Reveal>
            <div className="text-left max-w-2xl">
              <p className="text-[0.7rem] sm:text-xs tracking-[0.32em] uppercase text-[rgba(230,230,230,0.7)]">
                Decentralized Investment Strategies
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[0.12em] text-[#C9A36A]">
                STATERA
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[#E6E6E6] leading-relaxed">
                Non-custodial access to disciplined volatility exposure, powered by rules-based allocation and transparent on-chain execution.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href="/dashboard/strategy"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-lg bg-[#C9A36A] text-[#121212] font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 hover:bg-[#b8935f] focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/60 focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  Access Platform
                </Link>

                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center px-7 py-3 rounded-lg border border-[#C9A36A]/30 text-[#E6E6E6] font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 hover:border-[#C9A36A]/60 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/40 focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  View Documentation
                </Link>
              </div>
            </div>

            <div className="mt-10 border-t border-[#C9A36A]/20 pt-6">
              <div className="flex flex-wrap items-center gap-3 text-[0.65rem] sm:text-xs tracking-[0.24em] uppercase text-[rgba(230,230,230,0.7)]">
                <span>Non-Custodial Architecture</span>
                <span className="hidden sm:inline text-[#C9A36A]/40">•</span>
                <span>Rules-Based Allocation</span>
                <span className="hidden sm:inline text-[#C9A36A]/40">•</span>
                <span>On-Chain Transparency</span>
              </div>
            </div>

            {/* KPI block */}
            <div className="mt-10">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Total Deposited', 'Active Vaults', 'Total Unique Deposits'].map((label) => (
                    <div key={label} className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6">
                      <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(230,230,230,0.7)] mb-3">
                        {label}
                      </p>
                      <p className="text-3xl sm:text-4xl font-semibold text-[#C9A36A]">—</p>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6 text-sm text-[rgba(230,230,230,0.7)]">
                  Unable to load metrics.
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(230,230,230,0.7)] mb-3">
                      Total Deposited
                    </p>
                    <p className="text-3xl sm:text-4xl font-semibold text-[#C9A36A]">
                      <AnimatedCounter
                        value={stats.totalDepositedUsd}
                        duration={2000}
                        formatter={(val) => formatUsd(val)}
                      />
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(230,230,230,0.7)] mb-3">
                      Active Vaults
                    </p>
                    <p className="text-3xl sm:text-4xl font-semibold text-[#C9A36A]">
                      <AnimatedCounter
                        value={stats.vaultCount}
                        duration={2000}
                        formatter={(val) => Math.floor(val).toString()}
                      />
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(230,230,230,0.7)] mb-3">
                      Total Unique Deposits
                    </p>
                    <p className="text-3xl sm:text-4xl font-semibold text-[#C9A36A]" title="Number of deposit transactions across all deployed vaults">
                      <AnimatedCounter
                        value={stats.totalDepositCount}
                        duration={2000}
                        formatter={(val) => Math.floor(val).toLocaleString()}
                      />
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

              {/* The art of Volatility */}
              <div className="py-16 sm:py-20">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                  <Reveal delayMs={0}>
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl md:text-4xl italic text-[rgba(230,230,230,0.7)]">
                        "The art of Volatility"
                      </p>
                    </div>
                  </Reveal>
                </div>
              </div>

              {/* How the protocol works */}
              <div className="py-16 sm:py-20">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
                  {/* Part A: Headline + Subheadline */}
                  <Reveal delayMs={0}>
                    <div className="text-center mb-12 sm:mb-16">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4 leading-relaxed">
                        Web3 investing, simplified and optimized.
                      </h2>
                      <p className="text-lg sm:text-xl text-[rgba(230,230,230,0.7)] max-w-3xl mx-auto">
                        Statera turns DeFi complexity into a streamlined, accessible experience.
                      </p>
                    </div>
                  </Reveal>

                  {/* Part B: Short narrative */}
                  <div className="space-y-8 sm:space-y-12 mb-16 sm:mb-20">
                    {/* Block 1 */}
                    <Reveal delayMs={80}>
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                          A unified investment experience
                        </h3>
                        <p className="text-base sm:text-lg text-[rgba(230,230,230,0.7)] leading-relaxed">
                          Statera Index combines DeFi execution with a simple interface. Deposit into strategies that manage positions automatically, providing access to diversified exposure through a single transaction.
                        </p>
                      </div>
                    </Reveal>

                    {/* Block 2 */}
                    <Reveal delayMs={160}>
                      <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                          An intelligent protocol layer
                        </h3>
                        <p className="text-base sm:text-lg text-[rgba(230,230,230,0.7)] leading-relaxed">
                          The protocol manages positions automatically according to strategy rules, designed to improve efficiency and manage risk. Rebalancing occurs when allocations deviate from targets, keeping strategies aligned with their intended exposures.
                        </p>
                      </div>
                    </Reveal>
                  </div>

                  {/* Part C: Why Statera? */}
                  <Reveal delayMs={220}>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-[#C9A36A] tracking-[0.08em] text-center mb-8 sm:mb-12">
                      Why Statera?
                    </h3>
                  </Reveal>

                  <div className="w-full px-6 sm:px-8 lg:px-12">
                    <WhyStateraMarquee />
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
            <Reveal delayMs={300}>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                  Available Strategies
                </h2>
                <p className="text-[rgba(230,230,230,0.7)] max-w-2xl mx-auto">
                  Explore our on-chain investment strategies. Each vault is transparent, non-custodial, and managed by automated rebalancing.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topVaults.map((vault, index) => (
                <Reveal key={vault.id} delayMs={200 + index * 100}>
                  <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 hover:border-[#C9A36A]/35 transition-colors">
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
                        <span className="text-[rgba(230,230,230,0.7)]">TVL</span>
                        <span className="text-[#E6E6E6] font-semibold">{formatUsd(vault.tvlUsd)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[rgba(230,230,230,0.7)]">Status</span>
                        <span className={`font-semibold ${
                          vault.status === 'open' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {vault.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/strategy"
                      className="block w-full text-center px-4 py-2 rounded-lg bg-[#C9A36A] text-[#121212] font-semibold text-sm hover:bg-[#b8935f] transition-all"
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
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                How It Works
              </h2>
              <p className="text-[rgba(230,230,230,0.7)] max-w-2xl mx-auto">
                Statera simplifies DeFi investment through automated, transparent strategies.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-[#C9A36A] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#C9A36A] mb-2">Deposit</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm">
                  Deposit HYPE into a strategy vault. Your funds remain in your control—non-custodial and on-chain.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-[#C9A36A] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#C9A36A] mb-2">Vault Shares</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm">
                  Receive vault shares representing your position. Shares are ERC20 tokens you can transfer or stake.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={400}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-[#C9A36A] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#C9A36A] mb-2">Rebalancing</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm">
                  Strategies automatically rebalance hourly to optimize allocations and capture market opportunities.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={500}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <div className="w-12 h-12 rounded-full bg-[#C9A36A] flex items-center justify-center text-[#121212] font-bold text-xl mb-4">
                  4
                </div>
                <h3 className="text-lg font-bold text-[#C9A36A] mb-2">Transparency</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm">
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
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                Smart Rebalancing
              </h2>
              <p className="text-[rgba(230,230,230,0.7)] max-w-2xl mx-auto">
                Automated portfolio management through continuous monitoring and threshold-based execution.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[220px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Continuous Monitoring</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
                  Strategies are monitored hourly to track market conditions and portfolio allocations. 
                  Real-time data ensures positions remain aligned with target allocations.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[220px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Threshold-Based Execution</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
                  Rebalancing occurs when allocations deviate beyond predefined thresholds. 
                  This approach minimizes unnecessary transactions while maintaining target exposure.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={400}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[220px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Execution Advantages</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
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
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                Fees & Transparency
              </h2>
              <p className="text-[rgba(230,230,230,0.7)] max-w-2xl mx-auto">
                Clear fee structure with all costs disclosed upfront.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-4">Vault Fees</h3>
                <p className="text-[#E6E6E6] font-medium mb-2">
                  Deposit, withdrawal, and management fees
                </p>
                <p className="text-[rgba(230,230,230,0.7)] text-sm">
                  Applied on shares minted and payouts, configurable per vault. Ongoing costs for strategy operation.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-4">External Fees</h3>
                <p className="text-[#E6E6E6] font-medium mb-2">
                  Network and execution costs
                </p>
                <p className="text-[rgba(230,230,230,0.7)] text-sm">
                  Hypercore fees related to Hyperliquid infrastructure. All fees are recorded on-chain and verifiable via block explorer.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* App Features */}
      <section className="py-16 sm:py-20 bg-[#121212]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                App Features
              </h2>
              <p className="text-[rgba(230,230,230,0.7)] max-w-2xl mx-auto">
                Core functionality available in the Statera application.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Strategies</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
                  Users deposit into on-chain vaults implementing predefined strategies. 
                  Vaults manage exposure and rebalancing automatically. Performance and risk are strategy-dependent.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Dashboard</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
                  Central interface to monitor deposits, NAV, performance, and positions. 
                  Real-time on-chain data and strategy metrics provide full transparency.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={400}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Swap</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
                  Interface to swap supported assets. Used to enter or rebalance positions within the ecosystem.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={450}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Arbitrage</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
                  Automated arbitrage execution designed to capture price discrepancies across venues when opportunities arise.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={500}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Staking</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
                  Stake protocol-related tokens. Earn rewards as defined by the protocol mechanics.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={600}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Referral</h3>
                <p className="text-[rgba(230,230,230,0.7)] text-sm leading-relaxed">
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
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-4">
                Security & Transparency
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[180px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">Non-Custodial</h3>
                <p className="text-[rgba(230,230,230,0.7)]">
                  Your funds never leave your wallet. Vault shares are ERC20 tokens you control. Withdraw at any time.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[180px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                <h3 className="text-xl font-bold text-[#C9A36A] mb-3">On-Chain Accounting</h3>
                <p className="text-[rgba(230,230,230,0.7)]">
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
          <Reveal delayMs={300}>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#C9A36A] tracking-[0.08em] mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-[rgba(230,230,230,0.7)] mb-8 max-w-2xl mx-auto">
                Join the decentralized investment revolution. Start with as little as you want, withdraw anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dashboard/strategy"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-[#C9A36A] text-[#121212] font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:bg-[#b8935f] focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/60 focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  Launch App
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-[#C9A36A]/30 text-[#E6E6E6] font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:border-[#C9A36A]/60 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/40 focus:ring-offset-2 focus:ring-offset-[#121212]"
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
