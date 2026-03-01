'use client';

import { useAccount, useChainId } from 'wagmi';
import { useStrategies } from '@/hooks/useStrategies';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { DEMO_EXTRA_STRATEGIES } from '@/lib/placeholders';
import { formatUsd } from '@/lib/format';

/** Carte démo (UI uniquement, pas de hooks blockchain) */
function DemoStrategyCard({ demo }: { demo: typeof DEMO_EXTRA_STRATEGIES[0] }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-400/20 border-green-400/30';
      case 'medium': return 'bg-yellow-400/20 border-yellow-400/30';
      case 'high': return 'bg-red-400/20 border-red-400/30';
      default: return 'bg-gray-400/20 border-gray-400/30';
    }
  };

  return (
    <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6 hover:border-[#C9A36A]/35 transition-colors duration-300 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-[#C9A36A] to-[#5a9a9a] bg-clip-text text-transparent">
            {demo.name}
          </h4>
          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[0.6rem] font-semibold tracking-[0.1em] uppercase bg-[#C9A36A]/10 text-[#C9A36A]/60 border border-[#C9A36A]/15">
            Demo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-400/20 text-green-400">
            {demo.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBg(demo.riskLevel)} ${getRiskColor(demo.riskLevel)}`}>
            {demo.riskLevel}
          </span>
        </div>
      </div>

      <p className="text-[rgba(230,230,230,0.5)] text-sm mb-4 leading-relaxed">{demo.description}</p>

      {/* Metrics */}
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
        <div className="flex justify-between items-center">
          <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">HYPE</span>
          <span className="text-[#E6E6E6] text-sm font-mono">{formatUsd(demo.metrics.oracleHypeUsd, 2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">{demo.tokens[1]}</span>
          <span className="text-[#E6E6E6] text-sm font-mono">{formatUsd(demo.metrics.oracleToken1Usd, 2)}</span>
        </div>
      </div>

      <div className="mt-auto p-3 bg-[#C9A36A]/5 border border-[#C9A36A]/20 rounded-lg">
        <p className="text-[rgba(230,230,230,0.5)] text-xs text-center">
          Available after contract deployment
        </p>
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
  useWhitelistCheck();

  const validStrategies = strategies.filter(strategy =>
    strategy &&
    strategy.contracts &&
    strategy.contracts.vaultAddress &&
    strategy.contracts.handlerAddress &&
    strategy.contracts.coreViewsAddress
  );

  return (
    <div className="min-h-screen bg-[#121212]">
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`w-full ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-0 md:pl-64">
          {/* Titre */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A36A] to-[#b8935f]">
                Strategies
              </span>
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">
              Automated · Diversified · Rebalanced
            </p>
          </div>

          {/* Grille de stratégies */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[rgba(230,230,230,0.5)] text-lg">Loading strategies...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Stratégies réelles */}
              {validStrategies.map(strategy => (
                <StrategyCardEra
                  key={strategy.id}
                  strategy={strategy}
                  showWithdraw={false}
                  showViewMore={true}
                />
              ))}

              {/* Cartes démo supplémentaires */}
              {DEMO_EXTRA_STRATEGIES.map(demo => (
                <DemoStrategyCard key={demo.id} demo={demo} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
