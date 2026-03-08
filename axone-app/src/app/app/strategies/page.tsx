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
import { DEMO_EXTRA_STRATEGIES } from '@/lib/placeholders';
import { formatUsd } from '@/lib/format';
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
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-gray-400';
  }
}
function getRiskBg(risk: string) {
  switch (risk) {
    case 'low': return 'bg-green-400/20 border-green-400/30';
    case 'medium': return 'bg-yellow-400/20 border-yellow-400/30';
    case 'high': return 'bg-red-400/20 border-red-400/30';
    default: return 'bg-gray-400/20 border-gray-400/30';
  }
}

// ─── Demo card (unchanged) ───────────────────────────────────────────────────
function DemoStrategyCard({ demo }: { demo: typeof DEMO_EXTRA_STRATEGIES[0] }) {
  return (
    <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6 hover:border-[#C9A36A]/35 transition-colors duration-300 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-[#C9A36A] tracking-[0.03em]">{demo.name}</h4>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[0.6rem] font-semibold tracking-[0.1em] uppercase bg-[#C9A36A]/10 text-[#C9A36A]/60 border border-[#C9A36A]/15">Demo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-400/20 text-green-400">{demo.status}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBg(demo.riskLevel)} ${getRiskColor(demo.riskLevel)}`}>{demo.riskLevel}</span>
        </div>
      </div>
      <p className="text-[rgba(230,230,230,0.5)] text-sm mb-4 leading-relaxed">{demo.description}</p>
      <div className="space-y-3 mb-4 flex-1">
        {demo.metrics.apr30d !== null && (
          <div className="flex justify-between items-center py-2 border-b border-[#C9A36A]/10">
            <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">APR (30D)</span>
            <span className="text-green-400 text-sm font-semibold font-mono">+{demo.metrics.apr30d.toFixed(1)}%</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">TVL</span>
          <span className="text-[#E6E6E6] text-sm font-mono font-semibold">{formatUsd(demo.metrics.tvlUsd, 2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">PPS</span>
          <span className="text-[#E6E6E6] text-sm font-mono">{formatUsd(demo.metrics.ppsUsd, 4)}</span>
        </div>
      </div>
      <div className="mt-auto p-3 bg-[#C9A36A]/5 border border-[#C9A36A]/20 rounded-lg text-center">
        <p className="text-[rgba(230,230,230,0.4)] text-xs">Available after contract deployment</p>
      </div>
    </div>
  );
}

// ─── Demo list row ────────────────────────────────────────────────────────────
function DemoListRow({ demo }: { demo: typeof DEMO_EXTRA_STRATEGIES[0] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white/5 border border-[#C9A36A]/15 rounded-lg hover:border-[#C9A36A]/30 transition-colors">
      <div className="flex-1 min-w-[140px]">
        <p className="text-[#C9A36A] font-semibold text-sm">{demo.name}</p>
        <span className="inline-block px-2 py-0.5 rounded text-[0.55rem] font-semibold tracking-[0.1em] uppercase bg-[#C9A36A]/10 text-[#C9A36A]/60 border border-[#C9A36A]/15">Demo</span>
      </div>
      <div className="flex gap-4 text-xs text-[rgba(230,230,230,0.5)] flex-wrap">
        <span>Risk: <span className={`font-semibold ${getRiskColor(demo.riskLevel)}`}>{demo.riskLevel}</span></span>
        {demo.metrics.apr30d !== null && <span>APR: <span className="text-green-400 font-mono">+{demo.metrics.apr30d.toFixed(1)}%</span></span>}
        <span>TVL: <span className="text-[#E6E6E6] font-mono">{formatUsd(demo.metrics.tvlUsd, 2)}</span></span>
        <span>PPS: <span className="text-[#E6E6E6] font-mono">{formatUsd(demo.metrics.ppsUsd, 4)}</span></span>
      </div>
      <button disabled className="px-4 py-2 text-[0.6rem] tracking-[0.12em] uppercase bg-[#C9A36A]/30 text-[#C9A36A]/50 rounded font-semibold cursor-not-allowed shrink-0">
        Invest
      </button>
    </div>
  );
}

// ─── Real strategy list row ────────────────────────────────────────────────────
function StrategyListRow({ strategy }: { strategy: Strategy }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white/5 border border-[#C9A36A]/15 rounded-lg hover:border-[#C9A36A]/30 transition-colors">
      <div className="flex-1 min-w-[140px]">
        <p className="text-[#C9A36A] font-semibold text-sm">{strategy.name}</p>
        <p className="text-[rgba(230,230,230,0.4)] text-[0.6rem] uppercase tracking-wide">{strategy.riskLevel}</p>
      </div>
      <div className="flex gap-4 text-xs text-[rgba(230,230,230,0.5)] flex-wrap">
        <span>Status: <span className={`font-semibold ${strategy.status === 'open' ? 'text-green-400' : 'text-yellow-400'}`}>{strategy.status}</span></span>
      </div>
      <Link
        href={`/dashboard/strategy/${strategy.id}`}
        className="px-4 py-2 text-[0.6rem] tracking-[0.12em] uppercase bg-[#C9A36A] text-[#0A0A0A] rounded font-semibold hover:bg-[#b8935f] transition-colors shrink-0"
      >
        Invest
      </Link>
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

  const validStrategies = strategies.filter(strategy =>
    strategy && strategy.contracts && strategy.contracts.vaultAddress &&
    strategy.contracts.handlerAddress && strategy.contracts.coreViewsAddress
  );

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`w-full ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-0 md:pl-64">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4">
              <span className="text-[#C9A36A]">Market</span>
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
                  {DEMO_EXTRA_STRATEGIES.map(demo => (
                    <div key={demo.id} className="w-full lg:w-[calc(50%-12px)] xl:w-[calc(33.333%-16px)] min-w-0">
                      <DemoStrategyCard demo={demo} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {validStrategies.map(strategy => (
                    <StrategyListRow key={strategy.id} strategy={strategy} />
                  ))}
                  {DEMO_EXTRA_STRATEGIES.map(demo => (
                    <DemoListRow key={demo.id} demo={demo} />
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
