'use client';

import { useAccount, useChainId } from 'wagmi';
import { useStrategies } from '@/hooks/useStrategies';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { StrategyCardEra } from '@/components/StrategyCardEra';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import Footer from '@/components/Footer';
import type { Strategy } from '@/types/strategy';

// Composant wrapper pour une stratégie avec vérification de dépôt
function StrategyWithDepositCheck({ strategy }: { strategy: Strategy }) {
  const data = useStrategyData(strategy);
  const hasDeposit = (data.userShares ?? 0) > 0 || (data.userValueUsd ?? 0) > 0;

  if (!hasDeposit) {
    return null;
  }

  return <StrategyCardEra strategy={strategy} showWithdraw={true} showViewMore={true} />;
}

// Composant pour filtrer les stratégies avec dépôts
function StrategiesWithDeposits({ strategies, loading }: { strategies: Strategy[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#5a9a9a] text-lg">Loading strategies...</p>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#5a9a9a] text-lg mb-4">No deposited strategies yet</p>
        <p className="text-gray-500 text-sm">Deposit funds in strategies to see them here</p>
      </div>
    );
  }

  // Filtrer les stratégies invalides
  const validStrategies = strategies.filter(strategy => 
    strategy && 
    strategy.contracts && 
    strategy.contracts.vaultAddress &&
    strategy.contracts.handlerAddress &&
    strategy.contracts.coreViewsAddress
  );

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

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <DashboardSidebar />
      
      <main className={`flex ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="flex-1 ml-64 min-h-screen bg-black px-4 sm:px-8 py-8">
          {/* Titre Strategy avec gradient */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                Strategy
              </span>
            </h1>
          </div>

          {/* Contenu */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8">
              <StrategiesWithDeposits strategies={strategies} loading={loading} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
