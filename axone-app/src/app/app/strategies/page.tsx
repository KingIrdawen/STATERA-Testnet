'use client';

import { useAccount, useChainId } from 'wagmi';
import { useStrategies } from '@/hooks/useStrategies';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import type { Strategy } from '@/types/strategy';

export default function StrategiesPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const { strategies, loading } = useStrategies();
  useWhitelistCheck(); // Check whitelist and redirect if needed

  // Filtrer les stratégies valides
  const validStrategies = strategies.filter(strategy =>
    strategy &&
    strategy.contracts &&
    strategy.contracts.vaultAddress &&
    strategy.contracts.handlerAddress &&
    strategy.contracts.coreViewsAddress
  );

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`flex ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="flex-1 ml-64 min-h-screen bg-black px-4 sm:px-8 py-8">
          {/* Titre Strategies avec gradient */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                Strategies
              </span>
            </h1>
          </div>

          {/* Contenu */}
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-[#5a9a9a] text-lg">Loading strategies...</p>
              </div>
            ) : validStrategies.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#5a9a9a] text-lg mb-4">No strategies available</p>
                <p className="text-gray-500 text-sm">Strategies will appear here once deployed</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {validStrategies.map(strategy => (
                  <StrategyCardEra key={strategy.id} strategy={strategy} showWithdraw={false} showViewMore={true} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

