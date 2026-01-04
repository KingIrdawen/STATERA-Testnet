'use client';

import { useAccount } from 'wagmi';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { usePoints, useLeaderboard, useUserRank } from '@/hooks/usePoints';
import { ExternalLink } from 'lucide-react';

const EXPLORER_URL = 'https://hyperscan-testnet.hyperliquid.xyz';

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function PointsPage() {
  const { address } = useAccount();
  useWhitelistCheck();
  const { points, daily, isLoading: pointsLoading } = usePoints();
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard(100, 0);
  const { rank, isLoading: rankLoading } = useUserRank(address);

  // Get today's points breakdown if available
  const today = new Date().toISOString().split('T')[0];
  const todayPoints = daily?.[today];

  return (
    <div className="min-h-screen bg-[#121212]">
      <DashboardHeader />
      <DashboardSidebar />

      <main className="w-full pt-[60px] md:pt-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-0 md:pl-64">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EF9B13] to-[#FAB062]">
                Points
              </span>
            </h1>
            <p className="text-white/70 text-sm">Epoch 0</p>
          </div>

          {/* Big number: user total points */}
          <div className="text-center mb-8">
            <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-2">
              {pointsLoading ? '...' : points.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {!address && (
              <p className="text-gray-400 text-sm mt-2">Connect wallet to view your points</p>
            )}
          </div>

          {/* Points breakdown (smaller text) */}
          {address && (todayPoints || pointsLoading) && (
            <div className="mb-8">
              <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4 max-w-2xl mx-auto">
                <h3 className="text-white/70 text-sm font-semibold mb-3 text-center">Points Breakdown</h3>
                {pointsLoading ? (
                  <p className="text-gray-400 text-sm text-center">Loading breakdown...</p>
                ) : todayPoints ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Swap</p>
                      <p className="text-white text-sm font-medium">{todayPoints.swapPoints.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">LP</p>
                      <p className="text-white text-sm font-medium">{todayPoints.lpPoints.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Vault</p>
                      <p className="text-white text-sm font-medium">{todayPoints.vaultPoints.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Referral</p>
                      <p className="text-white text-sm font-medium">{todayPoints.referralPoints.toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center">No points breakdown available yet</p>
                )}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Leaderboard</h2>
            <div className="bg-gray-800/50 border border-white/10 rounded-lg overflow-hidden">
              {leaderboardLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No leaderboard data available</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Rank</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-white">Wallet</th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-white">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry) => (
                          <tr
                            key={entry.address}
                            id={`rank-${entry.rank}`}
                            className="border-t border-white/10 hover:bg-gray-900/30 transition-colors"
                          >
                            <td className="px-6 py-4 text-white font-medium">#{entry.rank}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-mono text-sm">
                                  {formatAddress(entry.address)}
                                </span>
                                <a
                                  href={`${EXPLORER_URL}/address/${entry.address}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#EF9B13] hover:text-[#FAB062] transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right text-white font-semibold">
                              {entry.points.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {address && (
                    <div className="p-6 border-t border-white/10">
                      <button
                        onClick={() => {
                          // Scroll to user's rank in leaderboard
                          const userEntry = leaderboard.find((e) => e.address.toLowerCase() === address.toLowerCase());
                          if (userEntry) {
                            const element = document.getElementById(`rank-${userEntry.rank}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="w-full px-6 py-3 bg-[#EF9B13] hover:bg-[#D36A03] text-white rounded-lg transition-colors font-semibold"
                      >
                        Show My Rank
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
