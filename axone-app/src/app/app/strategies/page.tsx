'use client';

import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import Link from 'next/link';
import { useStrategies } from '@/hooks/useStrategies';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { useVaultPerf24h } from '@/hooks/useVaultPerf24h';
import { formatUsd } from '@/lib/format';
import { cinzel } from '@/lib/fonts';
import type { Strategy } from '@/types/strategy';

type ViewMode = 'list' | 'card';

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="4" x2="13" y2="4" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <line x1="3" y1="12" x2="13" y2="12" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </svg>
  );
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'low': return 'text-green-400 bg-green-400/15 border-green-400/25';
    case 'medium': return 'text-yellow-400 bg-yellow-400/15 border-yellow-400/25';
    case 'high': return 'text-red-400 bg-red-400/15 border-red-400/25';
    default: return 'text-gray-400 bg-gray-400/15 border-gray-400/25';
  }
}

// ─── Vue liste enrichie avec données on-chain ─────────────────────────────────
function StrategyListRow({ strategy }: { strategy: Strategy }) {
  const data = useStrategyData(strategy);
  const perf = useVaultPerf24h(strategy.contracts.vaultAddress);

  return (
    <div className="landing-card rounded-xl p-5 hover:border-[#C9A36A]/30 transition-colors">
      {/* Ligne principale : nom + badges + bouton */}
      <div className="flex flex-wrap items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-[#C9A36A] font-semibold text-sm">{strategy.name}</p>
            {strategy.status && (
              <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase border ${
                strategy.status === 'open'
                  ? 'text-green-400 bg-green-400/15 border-green-400/25'
                  : 'text-yellow-400 bg-yellow-400/15 border-yellow-400/25'
              }`}>
                {strategy.status}
              </span>
            )}
            <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase border ${getRiskColor(strategy.riskLevel)}`}>
              {strategy.riskLevel}
            </span>
          </div>
          {strategy.description && (
            <p className="text-[rgba(230,230,230,0.45)] text-xs leading-relaxed">{strategy.description}</p>
          )}
        </div>
        <Link
          href={`/dashboard/strategy/${strategy.id}`}
          className="shrink-0 px-4 py-2 text-[0.6rem] tracking-[0.12em] uppercase bg-[#C9A36A] text-[#0A0A0A] rounded font-semibold hover:bg-[#b8935f] transition-colors"
        >
          Invest
        </Link>
      </div>

      {/* Métriques on-chain */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-1.5 pt-3 border-t border-[#C9A36A]/10">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-0.5">TVL</p>
          <p className="text-[#E6E6E6] text-xs font-mono font-semibold">
            {data.loading ? '…' : data.tvlUsd !== undefined ? formatUsd(data.tvlUsd, 2) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-0.5">Your Deposit</p>
          <p className="text-[#E6E6E6] text-xs font-mono">
            {data.loading ? '…' : data.userValueUsd !== undefined ? formatUsd(data.userValueUsd, 2) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-0.5">PPS</p>
          <p className="text-[#E6E6E6] text-xs font-mono">
            {data.loading ? '…' : data.ppsUsd !== undefined ? formatUsd(data.ppsUsd, 4) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-0.5">Your Shares</p>
          <p className="text-[#E6E6E6] text-xs font-mono">
            {data.loading ? '…' : data.userShares !== undefined ? data.userShares.toFixed(4) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-0.5">Perf 24h</p>
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

export default function StrategiesPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { strategies, loading } = useStrategies();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  useWhitelistCheck();

  // v1 requiert handlerAddress + coreViewsAddress ; v3 (RebalancingVault) n'en a pas besoin
  const validStrategies = strategies.filter(strategy =>
    strategy && strategy.contracts && strategy.contracts.vaultAddress
  );

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${cinzel.className}`}>
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`w-full ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pr-8 py-8 pl-0 md:pl-52">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4" style={{ background: 'linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Market
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">
              Automated · Diversified · Rebalanced
            </p>
            <span className="title-glow-line" />
            <span className="title-glow-blur" />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[rgba(230,230,230,0.5)] text-lg">Loading strategies...</p>
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex justify-end mb-6">
                <div className="flex gap-1 bg-white/5 border border-[#C9A36A]/15 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#C9A36A] text-black' : 'text-[rgba(230,230,230,0.5)] hover:text-white'}`}
                    title="List view"
                  >
                    <ListIcon />
                  </button>
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'card' ? 'bg-[#C9A36A] text-black' : 'text-[rgba(230,230,230,0.5)] hover:text-white'}`}
                    title="Card view"
                  >
                    <GridIcon />
                  </button>
                </div>
              </div>

              {viewMode === 'card' ? (
                <div className="flex flex-wrap justify-center gap-6">
                  {validStrategies.map(strategy => (
                    <div key={strategy.id} className="w-full lg:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] min-w-0">
                      <StrategyCardEra strategy={strategy} showWithdraw={false} showViewMore={true} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {validStrategies.map(strategy => (
                    <StrategyListRow key={strategy.id} strategy={strategy} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
