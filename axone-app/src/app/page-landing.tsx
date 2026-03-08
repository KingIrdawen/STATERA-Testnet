'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import { WhyStateraMarquee } from '@/components/landing/WhyStateraMarquee';
import Link from 'next/link';
import { cinzel } from '@/lib/fonts';

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

// Metallic gold gradient — reproduces the copper/gold sheen of the sphere logo
const goldGradient: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

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

  const topVaults = stats?.vaults.slice(0, 6) || [];

  return (
    <div className={`${cinzel.className} min-h-screen bg-[#0A0A0A] text-white`}>
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0A0A] min-h-screen flex flex-col items-center justify-center">
        {/* Radial copper glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_42%,rgba(160,90,30,0.13),transparent)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-8 lg:px-12 py-28 sm:py-36 w-full max-w-4xl mx-auto">
          <Reveal>
            {/* Title */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[0.22em] mb-4"
              style={goldGradient}
            >
              STATERA
            </h1>

            {/* Subtitle */}
            <p className="text-[0.6rem] sm:text-[0.7rem] tracking-[0.30em] uppercase text-[#C9A36A]/80 mb-8">
              Decentralized Investment Strategies
            </p>

            {/* Description */}
            <p className="text-sm sm:text-base text-[rgba(230,230,230,0.55)] leading-relaxed max-w-2xl mx-auto mb-10 font-light tracking-wide">
              On-chain portfolio strategies with institutional-grade risk management. Transparent,
              non-custodial allocation frameworks designed for disciplined capital deployment.
            </p>

            {/* Sphere logo — centered between description and CTA */}
            <div className="mb-10 sm:mb-12">
              <Image
                src="/logo-hero-detoure.png"
                alt="Statera"
                width={300}
                height={300}
                className="mx-auto drop-shadow-[0_0_64px_rgba(180,110,40,0.40)]"
              />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 sm:mb-20">
              <Link
                href="/dashboard/strategy"
                className="inline-flex items-center justify-center px-8 py-3 border border-[#C9A36A] bg-[#C9A36A] text-[#0A0A0A] font-semibold text-[0.65rem] tracking-[0.20em] uppercase shadow-lg transition-all duration-300 hover:bg-[#b8935f] hover:border-[#b8935f] focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/60"
              >
                Access Platform
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center px-8 py-3 border border-[#C9A36A]/35 text-[#E6E6E6] font-semibold text-[0.65rem] tracking-[0.20em] uppercase shadow-lg transition-all duration-300 hover:border-[#C9A36A] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/40"
              >
                View Documentation
              </Link>
            </div>

            {/* Bottom tagline */}
            <div className="flex flex-wrap items-center justify-center gap-0">
              {['Non-Custodial Architecture', 'Rules-Based Allocation', 'On-Chain Transparency'].map((item, i) => (
                <span key={i} className="flex items-center">
                  {i > 0 && <span className="text-[#C9A36A]/35 mx-4 sm:mx-6 text-xs">•</span>}
                  <span className="text-[0.55rem] sm:text-[0.6rem] tracking-[0.24em] uppercase text-[rgba(230,230,230,0.35)]">
                    {item}
                  </span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── KPI block — below the fold ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Total Deposited', 'Active Vaults', 'Total Unique Deposits'].map((label) => (
                <div key={label} className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[rgba(230,230,230,0.6)] mb-3">{label}</p>
                  <p className="text-3xl sm:text-4xl font-semibold" style={goldGradient}>—</p>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Total Deposited', 'Active Vaults', 'Total Unique Deposits'].map((label) => (
                <div key={label} className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                  <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[rgba(230,230,230,0.6)] mb-3">{label}</p>
                  <p className="text-3xl sm:text-4xl font-semibold" style={goldGradient}>—</p>
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[rgba(230,230,230,0.6)] mb-3">Total Deposited</p>
                <p className="text-3xl sm:text-4xl font-semibold" style={goldGradient}>
                  <AnimatedCounter value={stats.totalDepositedUsd} duration={2000} formatter={(val) => formatUsd(val)} />
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[rgba(230,230,230,0.6)] mb-3">Active Vaults</p>
                <p className="text-3xl sm:text-4xl font-semibold" style={goldGradient}>
                  <AnimatedCounter value={stats.vaultCount} duration={2000} formatter={(val) => Math.floor(val).toString()} />
                </p>
              </div>
              <div className="rounded-xl bg-white/5 border border-[#C9A36A]/15 px-6 py-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                <p className="text-[0.6rem] uppercase tracking-[0.18em] text-[rgba(230,230,230,0.6)] mb-3">Total Unique Deposits</p>
                <p className="text-3xl sm:text-4xl font-semibold" style={goldGradient} title="Number of deposit transactions across all deployed vaults">
                  <AnimatedCounter value={stats.totalDepositCount} duration={2000} formatter={(val) => Math.floor(val).toLocaleString()} />
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── How the protocol works ── */}
      <div className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={0}>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.06em] mb-4 leading-relaxed" style={goldGradient}>
                Web3 investing, simplified and optimized.
              </h2>
              <p className="text-base sm:text-lg text-[rgba(230,230,230,0.6)] max-w-3xl mx-auto font-light tracking-wide">
                Statera turns DeFi complexity into a streamlined, accessible experience.
              </p>
            </div>
          </Reveal>

          <div className="space-y-8 sm:space-y-12 mb-16 sm:mb-20">
            <Reveal delayMs={80}>
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-[0.05em] mb-4" style={goldGradient}>
                  A unified investment experience
                </h3>
                <p className="text-sm sm:text-base text-[rgba(230,230,230,0.6)] leading-relaxed font-light tracking-wide">
                  Statera Index combines DeFi execution with a simple interface. Deposit into strategies that manage positions automatically, providing access to diversified exposure through a single transaction.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={160}>
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-[0.05em] mb-4" style={goldGradient}>
                  An intelligent protocol layer
                </h3>
                <p className="text-sm sm:text-base text-[rgba(230,230,230,0.6)] leading-relaxed font-light tracking-wide">
                  The protocol manages positions automatically according to strategy rules, designed to improve efficiency and manage risk. Rebalancing occurs when allocations deviate from targets, keeping strategies aligned with their intended exposures.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delayMs={220}>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-[0.05em] text-center mb-8 sm:mb-12" style={goldGradient}>
              Why Statera?
            </h3>
          </Reveal>

          <div
            className="w-full px-6 sm:px-8 lg:px-12 relative"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.9) 25%, black 35%, black 65%, rgba(0,0,0,0.9) 75%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.9) 25%, black 35%, black 65%, rgba(0,0,0,0.9) 75%, transparent 100%)',
            }}
          >
            <WhyStateraMarquee />
          </div>
        </div>
      </div>

      {/* ── Vaults Preview ── */}
      {stats && stats.vaults.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <Reveal delayMs={300}>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-[0.06em] mb-4" style={goldGradient}>
                  Available Strategies
                </h2>
                <p className="text-[rgba(230,230,230,0.6)] max-w-2xl mx-auto text-sm font-light tracking-wide">
                  Explore our on-chain investment strategies. Each vault is transparent, non-custodial, and managed by automated rebalancing.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topVaults.map((vault, index) => (
                <Reveal key={vault.id} delayMs={200 + index * 100}>
                  <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 hover:border-[#C9A36A]/35 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-base font-semibold tracking-[0.08em]" style={goldGradient}>{vault.name}</h3>
                      <span className={`px-2 py-1 rounded text-[0.6rem] tracking-[0.12em] font-semibold uppercase ${
                        vault.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                        vault.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {vault.riskLevel}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs tracking-[0.10em]">
                        <span className="text-[rgba(230,230,230,0.6)]">TVL</span>
                        <span className="text-[#E6E6E6] font-semibold">{formatUsd(vault.tvlUsd)}</span>
                      </div>
                      <div className="flex justify-between text-xs tracking-[0.10em]">
                        <span className="text-[rgba(230,230,230,0.6)]">Status</span>
                        <span className={`font-semibold uppercase ${
                          vault.status === 'open' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {vault.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/dashboard/strategy"
                      className="block w-full text-center px-4 py-2 bg-[#C9A36A] text-[#0A0A0A] font-semibold text-[0.65rem] tracking-[0.16em] uppercase hover:bg-[#b8935f] transition-all"
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

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-20 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[0.06em] mb-4" style={goldGradient}>
                How It Works
              </h2>
              <p className="text-[rgba(230,230,230,0.6)] max-w-2xl mx-auto text-sm font-light tracking-wide">
                Statera simplifies DeFi investment through automated, transparent strategies.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: '1', title: 'Deposit', text: 'Deposit HYPE into a strategy vault. Your funds remain in your control—non-custodial and on-chain.' },
              { n: '2', title: 'Vault Shares', text: 'Receive vault shares representing your position. Shares are ERC20 tokens you can transfer or stake.' },
              { n: '3', title: 'Rebalancing', text: 'Strategies automatically rebalance hourly to optimize allocations and capture market opportunities.' },
              { n: '4', title: 'Transparency', text: "All positions, rebalancing, and fees are recorded on-chain. View your strategy's performance in real-time." },
            ].map((item, i) => (
              <Reveal key={item.n} delayMs={200 + i * 100}>
                <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                  <div className="w-11 h-11 rounded-full bg-[#C9A36A] flex items-center justify-center text-[#0A0A0A] font-bold text-base mb-4 tracking-normal">
                    {item.n}
                  </div>
                  <h3 className="text-sm font-semibold tracking-[0.10em] mb-2" style={goldGradient}>{item.title}</h3>
                  <p className="text-[rgba(230,230,230,0.6)] text-xs leading-relaxed font-light tracking-wide">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Smart Rebalancing ── */}
      <section className="py-16 sm:py-20 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[0.06em] mb-4" style={goldGradient}>
                Smart Rebalancing
              </h2>
              <p className="text-[rgba(230,230,230,0.6)] max-w-2xl mx-auto text-sm font-light tracking-wide">
                Automated portfolio management through continuous monitoring and threshold-based execution.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Continuous Monitoring', text: 'Strategies are monitored hourly to track market conditions and portfolio allocations. Real-time data ensures positions remain aligned with target allocations.' },
              { title: 'Threshold-Based Execution', text: 'Rebalancing occurs when allocations deviate beyond predefined thresholds. This approach minimizes unnecessary transactions while maintaining target exposure.' },
              { title: 'Execution Advantages', text: "Leveraging Hyperliquid's decentralized order book and high-performance infrastructure, rebalancing executes with minimal slippage, low fees, and instant settlement." },
            ].map((item, i) => (
              <Reveal key={item.title} delayMs={200 + i * 100}>
                <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[220px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                  <h3 className="text-sm font-semibold tracking-[0.10em] mb-3" style={goldGradient}>{item.title}</h3>
                  <p className="text-[rgba(230,230,230,0.6)] text-xs leading-relaxed font-light tracking-wide">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fees & Transparency ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[0.06em] mb-4" style={goldGradient}>
                Fees & Transparency
              </h2>
              <p className="text-[rgba(230,230,230,0.6)] max-w-2xl mx-auto text-sm font-light tracking-wide">
                Clear fee structure with all costs disclosed upfront.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Vault Fees', sub: 'Deposit, withdrawal, and management fees', text: 'Applied on shares minted and payouts, configurable per vault. Ongoing costs for strategy operation.' },
              { title: 'External Fees', sub: 'Network and execution costs', text: 'Hypercore fees related to Hyperliquid infrastructure. All fees are recorded on-chain and verifiable via block explorer.' },
            ].map((item, i) => (
              <Reveal key={item.title} delayMs={200 + i * 100}>
                <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                  <h3 className="text-sm font-semibold tracking-[0.10em] mb-4" style={goldGradient}>{item.title}</h3>
                  <p className="text-[#E6E6E6] text-xs font-medium mb-2 tracking-wide">{item.sub}</p>
                  <p className="text-[rgba(230,230,230,0.6)] text-xs font-light tracking-wide">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Features ── */}
      <section className="py-16 sm:py-20 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[0.06em] mb-4" style={goldGradient}>
                App Features
              </h2>
              <p className="text-[rgba(230,230,230,0.6)] max-w-2xl mx-auto text-sm font-light tracking-wide">
                Core functionality available in the Statera application.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Strategies', text: 'Users deposit into on-chain vaults implementing predefined strategies. Vaults manage exposure and rebalancing automatically. Performance and risk are strategy-dependent.' },
              { title: 'Dashboard', text: 'Central interface to monitor deposits, NAV, performance, and positions. Real-time on-chain data and strategy metrics provide full transparency.' },
              { title: 'Swap', text: 'Interface to swap supported assets. Used to enter or rebalance positions within the ecosystem.' },
              { title: 'Arbitrage', text: 'Automated arbitrage execution designed to capture price discrepancies across venues when opportunities arise.' },
              { title: 'Staking', text: 'Stake protocol-related tokens. Earn rewards as defined by the protocol mechanics.' },
              { title: 'Referral', text: 'Referral system allowing users to invite others. Rewards or benefits follow the rules defined in the referral contracts.' },
            ].map((item, i) => (
              <Reveal key={item.title} delayMs={200 + i * 50}>
                <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[200px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                  <h3 className="text-sm font-semibold tracking-[0.10em] mb-3" style={goldGradient}>{item.title}</h3>
                  <p className="text-[rgba(230,230,230,0.6)] text-xs leading-relaxed font-light tracking-wide">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Transparency ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={300}>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[0.06em] mb-4" style={goldGradient}>
                Security & Transparency
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'Non-Custodial', text: 'Your funds never leave your wallet. Vault shares are ERC20 tokens you control. Withdraw at any time.' },
              { title: 'On-Chain Accounting', text: 'All deposits, withdrawals, and rebalancing operations are recorded on-chain. Verify everything via block explorer.' },
            ].map((item, i) => (
              <Reveal key={item.title} delayMs={200 + i * 100}>
                <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 min-h-[180px] flex flex-col items-center justify-start text-center hover:border-[#C9A36A]/35 transition-colors duration-300">
                  <h3 className="text-sm font-semibold tracking-[0.10em] mb-3" style={goldGradient}>{item.title}</h3>
                  <p className="text-[rgba(230,230,230,0.6)] text-xs leading-relaxed font-light tracking-wide">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 sm:py-20 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <Reveal delayMs={300}>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[0.06em] mb-6" style={goldGradient}>
                Ready to Get Started?
              </h2>
              <p className="text-[rgba(230,230,230,0.6)] mb-8 max-w-2xl mx-auto text-sm font-light tracking-wide">
                Join the decentralized investment revolution. Start with as little as you want, withdraw anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dashboard/strategy"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#C9A36A] text-[#0A0A0A] font-semibold text-[0.65rem] tracking-[0.20em] uppercase shadow-lg transition-all duration-300 hover:bg-[#b8935f] focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/60 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
                >
                  Launch App
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center px-8 py-4 border border-[#C9A36A]/30 text-[#E6E6E6] font-semibold text-[0.65rem] tracking-[0.20em] uppercase shadow-lg transition-all duration-300 hover:border-[#C9A36A]/60 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/40 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]"
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
