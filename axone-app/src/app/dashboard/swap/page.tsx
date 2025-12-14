'use client';

import { useAccount, useChainId } from 'wagmi';
import { DashboardSwapTab } from '@/components/DashboardSwapTab';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';

export default function SwapPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  useWhitelistCheck(); // Check whitelist and redirect if needed

  return (
    <div className="min-h-screen bg-[#121212]">
      <DashboardHeader />
      <DashboardSidebar />
      
      <main className={`flex ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="flex-1 ml-64 min-h-screen bg-[#121212] px-4 sm:px-8 py-8">
          {/* Titre Swap avec gradient */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                Swap
              </span>
            </h1>
          </div>

          {/* Contenu */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8">
              <DashboardSwapTab />
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}

