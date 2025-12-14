'use client';

import { useAccount, useChainId } from 'wagmi';
import { DashboardStakingTab } from '@/components/DashboardStakingTab';
import { DashboardHeader } from '@/components/DashboardHeader';
import Footer from '@/components/Footer';

export default function StakingPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      
      <main className={`${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        {/* Titre Staking avec gradient */}
        <div className="text-center mb-12 px-4 sm:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
            <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
              Staking
            </span>
          </h1>
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-8">
          <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8">
            <DashboardStakingTab />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

