'use client';

import { useAccount, useChainId } from 'wagmi';
import { DashboardStakingTab } from '@/components/DashboardStakingTab';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';

export default function StakingStaPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  useWhitelistCheck();

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`w-full ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-0 md:pl-52">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4">
              <span className="text-[#C9A36A]">STA Staking</span>
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">
              Stake STA · Earn Rewards · Compound
            </p>
            <span className="title-glow-line" />
            <span className="title-glow-blur" />
          </div>

          <DashboardStakingTab variant="STA" />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
