'use client';

import { useAccount, useChainId } from 'wagmi';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { usePoints } from '@/hooks/usePoints';

export default function PointsPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  useWhitelistCheck(); // Check whitelist and redirect if needed
  const { points, isLoading } = usePoints();

  return (
    <div className="min-h-screen bg-[#121212]">
      <DashboardHeader />
      <DashboardSidebar />

      <main className={`flex ${address && !isCorrectChain ? 'pt-[104px] md:pt-[124px]' : 'pt-[60px] md:pt-[80px]'}`}>
        <div className="flex-1 ml-64 min-h-screen bg-[#121212] px-4 sm:px-8 py-8">
          {/* Titre Points avec gradient */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                Points
              </span>
            </h1>
          </div>

          {/* Contenu */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 sm:p-8">
              {!address ? (
                <div className="text-center py-12">
                  <p className="text-[#5a9a9a] text-lg mb-4">Connect your wallet to view your points</p>
                </div>
              ) : isLoading ? (
                <div className="text-center py-12">
                  <p className="text-[#5a9a9a] text-lg">Loading points...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h3 className="text-white text-xl font-bold mb-4">Your Points</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Total Points</span>
                      <span className="text-white text-3xl font-bold">{points || '0'}</span>
                    </div>
                  </div>
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      Points system will be available soon. Check back later for updates.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

