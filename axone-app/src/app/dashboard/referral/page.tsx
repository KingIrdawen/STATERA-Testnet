'use client';

import { useAccount, useChainId } from 'wagmi';
import { DashboardReferralTab } from '@/components/DashboardReferralTab';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function ReferralPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

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
                Referral
              </span>
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">
              Invite · Earn · Grow
            </p>
          </div>

          {/* Contenu */}
          <DashboardReferralTab />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
