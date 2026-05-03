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
    case 'low': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

// ─── Real strategy list row ────────────────────────────────────────────────────
function StrategyListRow({ strategy }: { strategy: Strategy }) {
  return (
    <div className="landing-card flex flex-wrap items-center gap-3 p-4 rounded-lg hover:border-[#C9A36A]/30 transition-colors">
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
