'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useStrategies } from '@/hooks/useStrategies';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { usePpsHistory } from '@/hooks/usePpsHistory';
import { useSwapStrategies, type SwapStrategy } from '@/hooks/useSwapStrategies';
import { useSwapPool } from '@/hooks/useSwapPool';
import { useVaultPerf24h } from '@/hooks/useVaultPerf24h';
import { formatUsd } from '@/lib/format';
import Link from 'next/link';
import type { Strategy } from '@/types/strategy';
import { cinzel } from '@/lib/fonts';

// ─── Données agrégées pour une seule stratégie ────────────────────────────────
interface StrategyPortfolioData {
  valueUsd: number;
  shares: number;
  ppsUsd: number;
  pps24hAgo: number | null; // null si pas d'historique encore
}

// ─── Tracker silencieux : lit les données on-chain + historique PPS ───────────
function StrategyPortfolioTracker({
  strategy,
  onData,
}: {
  strategy: Strategy;
  onData: (id: string, data: StrategyPortfolioData) => void;
}) {
  const d = useStrategyData(strategy);
  const { data: history } = usePpsHistory(strategy.contracts.vaultAddress);

  useEffect(() => {
    if (d.userValueUsd === undefined || d.userShares === undefined || d.ppsUsd === undefined) return;

    // Cherche l'entrée la plus récente qui a au moins 24h
    const h24ago = Date.now() - 24 * 60 * 60 * 1000;
    const entry = history?.entries?.find(e => e.timestamp <= h24ago) ?? null;
    const pps24hAgo = entry ? parseFloat(entry.pps) : null;

    onData(strategy.id, {
      valueUsd: d.userValueUsd,
      shares: d.userShares,
      ppsUsd: d.ppsUsd,
      pps24hAgo,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy.id, d.userValueUsd, d.userShares, d.ppsUsd, history]);

  return null;
}

// ─── Portfolio Overview — valeurs on-chain + 24h PnL/Return ──────────────────
function PortfolioOverview({ strategies }: { strategies: Strategy[] }) {
  const { address } = useAccount();
  const [data, setData] = useState<Record<string, StrategyPortfolioData>>({});

  const handleData = useCallback((id: string, d: StrategyPortfolioData) => {
    setData(prev => ({ ...prev, [id]: d }));
  }, []);

  const totalValue = useMemo(
    () => Object.values(data).reduce((sum, d) => sum + d.valueUsd, 0),
    [data]
  );
  const activePositions = useMemo(
    () => Object.values(data).filter(d => d.valueUsd > 0).length,
    [data]
  );

  // 24h PnL = Σ(shares × (ppsActuel - pps24hAgo))
  const pnl24h = useMemo(() => {
    let total = 0;
    let hasHistory = false;
    for (const d of Object.values(data)) {
      if (d.pps24hAgo !== null && d.shares > 0) {
        total += d.shares * (d.ppsUsd - d.pps24hAgo);
        hasHistory = true;
      }
    }
    return hasHistory ? total : null;
  }, [data]);

  // 24h Return = pnl24h / valeur_portfolio_hier × 100
  const return24h = useMemo(() => {
    if (pnl24h === null || totalValue <= 0) return null;
    const valueYesterday = totalValue - pnl24h;
    if (valueYesterday <= 0) return null;
    return (pnl24h / valueYesterday) * 100;
  }, [pnl24h, totalValue]);

  if (!address) {
    return (
      <div className="landing-card rounded-xl p-5 mb-10 text-center">
        <p className="text-[rgba(230,230,230,0.4)] text-sm">Connect your wallet to see your portfolio.</p>
      </div>
    );
  }

  return (
    <>
      {/* Trackers silencieux — un par stratégie */}
      {strategies.map(s => (
        <StrategyPortfolioTracker key={s.id} strategy={s} onData={handleData} />
      ))}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {/* Total Portfolio Value */}
        <div className="landing-card rounded-xl p-5 transition-colors duration-300 flex flex-col items-center justify-center text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
            Total Portfolio Value
          </p>
          <p className="text-3xl font-semibold text-[#C9A36A] font-mono">
            {totalValue > 0 ? formatUsd(totalValue, 2) : '—'}
          </p>
          <p className="text-[0.65rem] text-[rgba(230,230,230,0.25)] mt-1 tracking-[0.08em] uppercase">
            {activePositions > 0 ? `${activePositions} vault${activePositions > 1 ? 's' : ''}` : 'Live on-chain'}
          </p>
        </div>

        {/* 24h PnL */}
        <div className="landing-card rounded-xl p-5 transition-colors duration-300 flex flex-col items-center justify-center text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
            24h PnL
          </p>
          {pnl24h !== null ? (
            <p className={`text-3xl font-semibold font-mono ${pnl24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnl24h >= 0 ? '+' : ''}{formatUsd(pnl24h, 2)}
            </p>
          ) : (
            <p className="text-3xl font-semibold text-[rgba(230,230,230,0.3)] font-mono">—</p>
          )}
          <p className="text-[0.65rem] text-[rgba(230,230,230,0.25)] mt-1 tracking-[0.08em] uppercase">
            {pnl24h !== null ? 'On-chain' : 'Collecting history…'}
          </p>
        </div>

        {/* 24h Return */}
        <div className="landing-card rounded-xl p-5 transition-colors duration-300 flex flex-col items-center justify-center text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
            24h Return
          </p>
          {return24h !== null ? (
            <p className={`text-3xl font-semibold font-mono ${return24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {return24h >= 0 ? '+' : ''}{return24h.toFixed(2)}%
            </p>
          ) : (
            <p className="text-3xl font-semibold text-[rgba(230,230,230,0.3)] font-mono">—</p>
          )}
          <p className="text-[0.65rem] text-[rgba(230,230,230,0.25)] mt-1 tracking-[0.08em] uppercase">
            {return24h !== null ? 'On-chain' : 'Collecting history…'}
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Icônes toggle ────────────────────────────────────────────────────────────
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="4" x2="13" y2="4" /><line x1="3" y1="8" x2="13" y2="8" /><line x1="3" y1="12" x2="13" y2="12" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" />
    </svg>
  );
}

// ─── Carte/ligne d'un pool actif ──────────────────────────────────────────────
function ActivePoolCard({ swapStrategy, viewMode }: { swapStrategy: SwapStrategy; viewMode: 'card' | 'list' }) {
  const { strategy, poolAddress } = swapStrategy;
  const poolData = useSwapPool(poolAddress, strategy.contracts?.shareDecimals ?? 18);

  const hasLp = poolData.lpBalanceFormatted !== undefined && poolData.lpBalanceFormatted > 0;
  if (!hasLp) return null;

  const lpPct = poolData.lpShare !== undefined ? (poolData.lpShare * 100).toFixed(2) : '—';
  const hype = poolData.hypeReserveFormatted?.toFixed(4) ?? '—';
  const vault = poolData.vaultTokenReserveFormatted?.toFixed(4) ?? '—';
  const lpBal = poolData.lpBalanceFormatted?.toFixed(6) ?? '—';
  const withdrawHype = poolData.withdrawableHype?.toFixed(4) ?? '—';
  const withdrawVault = poolData.withdrawableVaultToken?.toFixed(4) ?? '—';

  if (viewMode === 'list') {
    return (
      <div className="landing-card rounded-xl p-5 hover:border-[#C9A36A]/30 transition-colors">
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[#C9A36A] font-semibold text-sm mb-0.5">{strategy.name}</p>
            {strategy.description && (
              <p className="text-[rgba(230,230,230,0.4)] text-xs">{strategy.description}</p>
            )}
          </div>
          <Link
            href="/dashboard/swap"
            className="shrink-0 px-4 py-2 text-[0.6rem] tracking-[0.12em] uppercase bg-[#C9A36A] text-[#0A0A0A] rounded font-semibold hover:bg-[#b8935f] transition-colors"
          >
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-1.5 pt-3 border-t border-[#C9A36A]/10">
          {[
            { label: 'Your LP', value: lpBal },
            { label: 'Pool Share', value: `${lpPct}%` },
            { label: 'Withdrawable HYPE', value: withdrawHype },
            { label: `Withdrawable Vault`, value: withdrawVault },
            { label: 'Fee', value: '0.5%' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-[#E6E6E6] text-xs font-mono font-semibold">{poolData.loading ? '…' : value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="landing-card rounded-xl p-5 flex flex-col transition-colors hover:border-[#C9A36A]/30">
      <div className="mb-3">
        <p className="text-[#C9A36A] font-semibold text-sm mb-1">{strategy.name}</p>
        {strategy.description && (
          <p className="text-[rgba(230,230,230,0.4)] text-[0.65rem] leading-relaxed">{strategy.description}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-[#C9A36A]/10 mb-4">
        {[
          { label: 'Your LP', value: lpBal },
          { label: 'Pool Share', value: `${lpPct}%` },
          { label: 'HYPE Reserve', value: hype },
          { label: 'Vault Reserve', value: vault },
          { label: 'Withdrawable HYPE', value: withdrawHype },
          { label: 'Withdrawable Vault', value: withdrawVault },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-[#E6E6E6] text-xs font-mono font-semibold">{poolData.loading ? '…' : value}</p>
          </div>
        ))}
      </div>
      <Link
        href="/dashboard/swap"
        className="mt-auto w-full text-center px-4 py-2 text-[0.6rem] tracking-[0.12em] uppercase bg-[#C9A36A] text-[#0A0A0A] rounded font-semibold hover:bg-[#b8935f] transition-colors"
      >
        Manage →
      </Link>
    </div>
  );
}

// ─── Section Active Pools ─────────────────────────────────────────────────────
function ActivePoolsSection({ viewMode }: { viewMode: 'card' | 'list' }) {
  const { address } = useAccount();
  const { swapStrategies, loading } = useSwapStrategies();

  if (!address) return null;

  return (
    <div className="mt-12">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] uppercase">Active Pools</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-[rgba(230,230,230,0.4)] text-sm">Loading pools…</p>
        </div>
      ) : swapStrategies.length === 0 ? (
        <div className="landing-card rounded-xl p-8 text-center">
          <p className="text-[rgba(230,230,230,0.4)] text-sm mb-4">No liquidity pools available.</p>
          <Link href="/dashboard/swap" className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A36A]/15 border border-[#C9A36A]/30 text-[#C9A36A] rounded-lg text-xs font-semibold hover:bg-[#C9A36A]/25 transition-colors">
            Go to Swap →
          </Link>
        </div>
      ) : (
        <>
          <div className={viewMode === 'card'
            ? 'flex flex-wrap justify-center gap-6'
            : 'flex flex-col gap-3'
          }>
            {swapStrategies.map((s) => (
              <div key={s.strategy.id} className={viewMode === 'card' ? 'w-full lg:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] min-w-0' : undefined}>
                <ActivePoolCard swapStrategy={s} viewMode={viewMode} />
              </div>
            ))}
          </div>
          {/* Message si aucune position active */}
          <_NoActivePools swapStrategies={swapStrategies} />
        </>
      )}
    </div>
  );
}

function _NoActivePools({ swapStrategies }: { swapStrategies: SwapStrategy[] }) {
  // Ce composant est rendu APRES les cartes — si elles retournent toutes null,
  // on affiche un message d'encouragement
  const [allNull, setAllNull] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAllNull(true), 3000);
    return () => clearTimeout(timer);
  }, [swapStrategies]);

  if (!allNull) return null;

  return (
    <div className="mt-4 text-center">
      <p className="text-[rgba(230,230,230,0.3)] text-xs">
        No active LP positions — add liquidity in{' '}
        <Link href="/dashboard/swap" className="text-[#C9A36A] hover:underline">Swap</Link>.
      </p>
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

// ─── Grille/liste des stratégies actives ─────────────────────────────────────
function ActiveStrategiesGrid({ strategies, loading, viewMode }: { strategies: Strategy[]; loading: boolean; viewMode: 'card' | 'list' }) {
  const validStrategies = strategies.filter(s => s?.contracts?.vaultAddress);

  if (loading) {
    return <div className="text-center py-12"><p className="text-[rgba(230,230,230,0.5)]">Loading strategies...</p></div>;
  }

  if (validStrategies.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-[rgba(230,230,230,0.5)] mb-6">No active strategies yet.</p>
        <Link href="/app/strategies" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A36A]/20 border border-[#C9A36A]/40 text-[#C9A36A] rounded-lg font-semibold text-sm hover:bg-[#C9A36A]/30 transition-colors">
          Go to Market →
        </Link>
      </div>
    );
  }

  return viewMode === 'card' ? (
    <div className="flex flex-wrap justify-center gap-6">
      {validStrategies.map(strategy => (
        <div key={strategy.id} className="w-full lg:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] min-w-0">
          <StrategyCardEra strategy={strategy} showWithdraw={true} showViewMore={true} />
        </div>
      ))}
    </div>
  ) : (
    <div className="flex flex-col gap-3">
      {validStrategies.map(strategy => (
        <StrategyListRow key={strategy.id} strategy={strategy} />
      ))}
    </div>
  );
}

// ─── Vue liste d'une stratégie ────────────────────────────────────────────────
function StrategyListRow({ strategy }: { strategy: Strategy }) {
  const data = useStrategyData(strategy);
  const perf = useVaultPerf24h(strategy.contracts.vaultAddress);
  return (
    <div className="landing-card rounded-xl p-5 hover:border-[#C9A36A]/30 transition-colors">
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[#C9A36A] font-semibold text-sm mb-0.5">{strategy.name}</p>
          {strategy.description && <p className="text-[rgba(230,230,230,0.4)] text-xs">{strategy.description}</p>}
        </div>
        <Link href={`/dashboard/strategy/${strategy.id}`} className="shrink-0 px-4 py-2 text-[0.6rem] tracking-[0.12em] uppercase bg-[#C9A36A] text-[#0A0A0A] rounded font-semibold hover:bg-[#b8935f] transition-colors">
          View →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-1.5 pt-3 border-t border-[#C9A36A]/10">
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">TVL</p>
          <p className="text-[#E6E6E6] text-xs font-mono font-semibold">{data.loading ? '…' : data.tvlUsd !== undefined ? formatUsd(data.tvlUsd, 2) : '—'}</p>
        </div>
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">Your Deposit</p>
          <p className="text-[#E6E6E6] text-xs font-mono font-semibold">{data.loading ? '…' : data.userValueUsd !== undefined ? formatUsd(data.userValueUsd, 2) : '—'}</p>
        </div>
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">PPS</p>
          <p className="text-[#E6E6E6] text-xs font-mono font-semibold">{data.loading ? '…' : data.ppsUsd !== undefined ? formatUsd(data.ppsUsd, 4) : '—'}</p>
        </div>
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">Your Shares</p>
          <p className="text-[#E6E6E6] text-xs font-mono font-semibold">{data.loading ? '…' : data.userShares !== undefined ? data.userShares.toFixed(4) : '—'}</p>
        </div>
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">Perf 24h</p>
          {perf.loading ? (
            <p className="text-[rgba(230,230,230,0.4)] text-xs font-mono">…</p>
          ) : perf.perf24h !== null ? (
            <p className={`text-xs font-mono font-semibold ${perf.perf24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {perf.perf24h >= 0 ? '+' : ''}{perf.perf24h.toFixed(2)}%
            </p>
          ) : (
            <p className="text-[rgba(230,230,230,0.3)] text-xs font-mono">—</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StrategyPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { strategies, loading } = useStrategies();
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  useWhitelistCheck();

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${cinzel.className}`}>
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`w-full ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pr-8 py-8 pl-0 md:pl-52">
          {/* Titre + toggle global */}
          <div className="relative text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4" style={{ background: 'linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Dashboard
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">
              Your active positions
            </p>
            <span className="title-glow-line" />
            <span className="title-glow-blur" />
            {/* Toggle unique — positionné en haut à droite */}
            <div className="absolute right-0 top-0 flex items-center gap-1 p-1 bg-white/5 border border-[#C9A36A]/15 rounded-lg">
              <button
                onClick={() => setViewMode('card')}
                title="Vue cartes"
                className={`p-1.5 rounded transition-colors ${viewMode === 'card' ? 'bg-[#C9A36A] text-[#121212]' : 'text-[rgba(230,230,230,0.5)] hover:text-[#E6E6E6]'}`}
              >
                <GridIcon />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Vue liste"
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#C9A36A] text-[#121212]' : 'text-[rgba(230,230,230,0.5)] hover:text-[#E6E6E6]'}`}
              >
                <ListIcon />
              </button>
            </div>
          </div>

          <PortfolioOverview strategies={strategies} />

          {/* Section Active Strategies */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] uppercase">Active Strategies</h2>
          </div>
          <ActiveStrategiesGrid strategies={strategies} loading={loading} viewMode={viewMode} />

          {/* Section Active Pools */}
          <ActivePoolsSection viewMode={viewMode} />

          <StakingSummarySection />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
