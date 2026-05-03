'use client';

import { useAccount, useChainId } from 'wagmi';
import { useStrategies } from '@/hooks/useStrategies';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { DEMO_STRATEGY_METRICS } from '@/lib/placeholders';
import { formatUsd } from '@/lib/format';
import Link from 'next/link';
import type { Strategy } from '@/types/strategy';
import { cinzel } from '@/lib/fonts';

// ─── Portfolio Overview (démo) ────────────────────────────────────────────────
function DemoPortfolioOverview() {
  // ⚠️  PLACEHOLDER — Données portfolio démo. À remplacer par les vraies valeurs on-chain.
  const demoTotalValue = 5_000;
  const demoDailyPnl = +127.50;
  const demoDailyPct = +2.55;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <div className="landing-card rounded-xl p-5 transition-colors duration-300 flex flex-col items-center justify-center text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
          Total Portfolio Value
        </p>
        <p className="text-3xl font-semibold text-[#C9A36A] font-mono">
          {formatUsd(demoTotalValue, 2)}
        </p>
        <p className="text-[0.65rem] text-[rgba(230,230,230,0.25)] mt-1 tracking-[0.08em] uppercase">Demo data</p>
      </div>
      <div className="landing-card rounded-xl p-5 transition-colors duration-300 flex flex-col items-center justify-center text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
          24h PnL
        </p>
        <p className="text-3xl font-semibold text-green-400 font-mono">
          +{formatUsd(demoDailyPnl, 2)}
        </p>
        <p className="text-[0.65rem] text-[rgba(230,230,230,0.25)] mt-1 tracking-[0.08em] uppercase">Demo data</p>
      </div>
      <div className="landing-card rounded-xl p-5 transition-colors duration-300 flex flex-col items-center justify-center text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
          24h Return
        </p>
        <p className="text-3xl font-semibold text-green-400 font-mono">
          +{demoDailyPct.toFixed(2)}%
        </p>
        <p className="text-[0.65rem] text-[rgba(230,230,230,0.25)] mt-1 tracking-[0.08em] uppercase">Demo data</p>
      </div>
    </div>
  );
}

// ─── Staking Summary (below active strategies) ─────────────────────────────
function StakingSummarySection() {
  // ⚠️ PLACEHOLDER — Replace with real on-chain staking data when contracts are deployed
  const eraStaking = [
    { pid: 0, symbol: 'ERA', aprPercent: 42, stakedAmount: '—', pendingRewards: '—', rewardToken: 'STA' },
    { pid: 1, symbol: 'ERA-LP', aprPercent: 28, stakedAmount: '—', pendingRewards: '—', rewardToken: 'STA' },
  ];
  const staStaking = [
    { pid: 0, symbol: 'STA', aprPercent: 18, stakedAmount: '—', pendingRewards: '—', rewardToken: 'HYPE' },
  ];

  const StakingRow = ({ label, pools, href }: { label: string; pools: typeof eraStaking; href: string }) => (
    <div className="landing-card rounded-xl p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#C9A36A] tracking-[0.08em] uppercase">{label}</h3>
        <Link href={href} className="text-[0.6rem] tracking-[0.12em] uppercase text-[rgba(230,230,230,0.4)] hover:text-[#C9A36A] transition-colors">View All →</Link>
      </div>
      {pools.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[rgba(230,230,230,0.4)] text-xs mb-4">No active staking positions.</p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A36A]/15 border border-[#C9A36A]/30 text-[#C9A36A] rounded-lg text-xs font-semibold hover:bg-[#C9A36A]/25 transition-colors"
          >
            Start Staking →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pools.map(pool => (
            <div key={pool.pid} className="flex flex-wrap items-center gap-3 py-2 border-t border-[#C9A36A]/10 first:border-0 first:pt-0">
              <div className="flex-1 min-w-[100px]">
                <p className="text-sm text-white font-semibold">Pool #{pool.pid} — {pool.symbol}</p>
                <p className="text-[0.6rem] text-green-400 font-mono">APR: {pool.aprPercent}%</p>
              </div>
              <div className="flex gap-4 text-xs text-[rgba(230,230,230,0.5)]">
                <span>Staked: <span className="text-white font-mono">{pool.stakedAmount}</span></span>
                <span>Rewards: <span className="text-green-400 font-mono">{pool.pendingRewards} {pool.rewardToken}</span></span>
              </div>
              <button
                disabled
                className="px-3 py-1.5 text-[0.6rem] tracking-[0.10em] uppercase bg-[#C9A36A]/30 text-[#C9A36A]/50 rounded font-semibold cursor-not-allowed"
                title="Available after contract deployment"
              >
                Claim
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-12">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] uppercase">Active Staking</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StakingRow label="ERA Staking" pools={eraStaking} href="/dashboard/staking" />
        <StakingRow label="STA Staking" pools={staStaking} href="/dashboard/staking-sta" />
      </div>
    </div>
  );
}

// ─── Grille des stratégies actives ───────────────────────────────────────────
function ActiveStrategiesGrid({ strategies, loading }: { strategies: Strategy[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(230,230,230,0.5)]">Loading strategies...</p>
      </div>
    );
  }

  const validStrategies = strategies.filter(strategy =>
    strategy?.contracts?.vaultAddress
  );

  if (!loading && validStrategies.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[rgba(230,230,230,0.5)] mb-6">No active strategies yet.</p>
        <Link
          href="/app/strategies"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A36A]/20 border border-[#C9A36A]/40 text-[#C9A36A] rounded-lg font-semibold text-sm hover:bg-[#C9A36A]/30 transition-colors"
        >
          Go to Market →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {validStrategies.map(strategy => (
        <div key={strategy.id} className="w-full lg:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] min-w-0">
          <StrategyCardEra
            strategy={strategy}
            showWithdraw={true}
            showViewMore={true}
          />
        </div>
      ))}
    </div>
  );
}

export default function StrategyPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { strategies, loading } = useStrategies();
  useWhitelistCheck();

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${cinzel.className}`}>
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`w-full ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pr-8 py-8 pl-0 md:pl-52">
          {/* Titre */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4" style={{ background: 'linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Dashboard
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">
              Your active positions
            </p>
            <span className="title-glow-line" />
            <span className="title-glow-blur" />
          </div>

          {/* ⚠️  PLACEHOLDER — Portfolio overview. À remplacer par les vraies valeurs on-chain. */}
          <DemoPortfolioOverview />

          {/* Section titre stratégies */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] uppercase">
              Active Strategies
            </h2>
          </div>

          {/* Grille des stratégies */}
          <ActiveStrategiesGrid strategies={strategies} loading={loading} />

          <StakingSummarySection />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
