'use client';

import { useAccount, useChainId } from 'wagmi';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { DEMO_STRATEGY_METRICS } from '@/lib/placeholders';
import { formatUsd } from '@/lib/format';
import type { Strategy } from '@/types/strategy';

// Composant wrapper pour une stratégie avec vérification de dépôt
function StrategyWithDepositCheck({ strategy }: { strategy: Strategy }) {
  const data = useStrategyData(strategy);
  const demoMetrics = DEMO_STRATEGY_METRICS[strategy.id];
  const hasRealDeposit = (data.userShares ?? 0) > 0 || (data.userValueUsd ?? 0) > 0;
  // En mode démo, on affiche toujours la carte si demoMetrics existe
  const isDemoMode = !data.loading && (data.error || data.tvlUsd === 0 || data.tvlUsd === undefined) && !!demoMetrics;

  if (!hasRealDeposit && !isDemoMode) {
    return null;
  }

  return <StrategyCardEra strategy={strategy} showWithdraw={true} showViewMore={true} />;
}

// ─── Portfolio Overview (démo) ────────────────────────────────────────────────
function DemoPortfolioOverview() {
  // ⚠️  PLACEHOLDER — Données portfolio démo. À remplacer par les vraies valeurs on-chain.
  const demoTotalValue = 5_000;
  const demoDailyPnl = +127.50;
  const demoDailyPct = +2.55;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-5 hover:border-[#C9A36A]/35 transition-colors duration-300">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
          Total Portfolio Value
        </p>
        <p className="text-3xl font-semibold text-[#C9A36A] font-mono">
          {formatUsd(demoTotalValue, 2)}
        </p>
        <p className="text-[0.7rem] text-[rgba(230,230,230,0.3)] mt-1 tracking-[0.08em]">DEMO DATA</p>
      </div>
      <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-5 hover:border-[#C9A36A]/35 transition-colors duration-300">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
          24h PnL
        </p>
        <p className="text-3xl font-semibold text-green-400 font-mono">
          +{formatUsd(demoDailyPnl, 2)}
        </p>
        <p className="text-[0.7rem] text-[rgba(230,230,230,0.3)] mt-1 tracking-[0.08em]">DEMO DATA</p>
      </div>
      <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-5 hover:border-[#C9A36A]/35 transition-colors duration-300">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-2">
          24h Return
        </p>
        <p className="text-3xl font-semibold text-green-400 font-mono">
          +{demoDailyPct.toFixed(2)}%
        </p>
        <p className="text-[0.7rem] text-[rgba(230,230,230,0.3)] mt-1 tracking-[0.08em]">DEMO DATA</p>
      </div>
    </div>
  );
}

// Composant pour les stratégies avec dépôts
function StrategiesWithDeposits({ strategies, loading }: { strategies: Strategy[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(230,230,230,0.5)] text-lg">Loading strategies...</p>
      </div>
    );
  }

  const validStrategies = strategies.filter(strategy =>
    strategy &&
    strategy.contracts &&
    strategy.contracts.vaultAddress &&
    strategy.contracts.handlerAddress &&
    strategy.contracts.coreViewsAddress
  );

  if (validStrategies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(230,230,230,0.5)] text-lg mb-4">No deposited strategies yet</p>
        <p className="text-[rgba(230,230,230,0.3)] text-sm">Deposit funds in strategies to see them here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {validStrategies.map(strategy => (
        <StrategyWithDepositCheck key={strategy.id} strategy={strategy} />
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
    <div className="min-h-screen bg-[#121212]">
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`w-full ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-0 md:pl-64">
          {/* Titre */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A36A] to-[#b8935f]">
                My Strategy
              </span>
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">
              Your active positions
            </p>
          </div>

          {/* Portfolio overview démo */}
          <DemoPortfolioOverview />

          {/* Stratégies */}
          <StrategiesWithDeposits strategies={strategies} loading={loading} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
