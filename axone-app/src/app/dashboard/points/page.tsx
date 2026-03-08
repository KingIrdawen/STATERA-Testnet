'use client';

import { useAccount } from 'wagmi';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { cinzel } from '@/lib/fonts';
import { usePoints, useLeaderboard, useUserRank } from '@/hooks/usePoints';
import { ExternalLink } from 'lucide-react';
import {
  DEMO_POINTS_TOTAL,
  DEMO_POINTS_BREAKDOWN,
  DEMO_LEADERBOARD,
  DEMO_USER_RANK,
  formatDemoAddress,
} from '@/lib/placeholders';

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

  const today = new Date().toISOString().split('T')[0];
  const todayPoints = daily?.[today];

  // ─── Mode démo : afficher les données placeholder quand le backend est inactif ───
  // ⚠️  PLACEHOLDER — À remplacer par les vraies données quand le backend points est actif
  const isPointsEmpty = !pointsLoading && points === 0;
  const isLeaderboardEmpty = !leaderboardLoading && leaderboard.length === 0;

  const displayPoints = isPointsEmpty ? DEMO_POINTS_TOTAL : points;
  const displayLeaderboard = isLeaderboardEmpty ? DEMO_LEADERBOARD : leaderboard;
  const displayRank = (!rank && isLeaderboardEmpty) ? DEMO_USER_RANK : rank;
  const isDemoMode = isPointsEmpty || isLeaderboardEmpty;

  return (
    <div className={`min-h-screen bg-[#0A0A0A] ${cinzel.className}`}>
      <DashboardHeader />
      <DashboardSidebar />

      <main className="w-full pt-[60px] md:pt-[80px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pl-0 md:pl-52">
          {/* Titre */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.04em] mb-4" style={{ background: 'linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Points
            </h1>
            <p className="text-[rgba(230,230,230,0.5)] text-sm tracking-[0.1em] uppercase">Epoch 0</p>
            {isDemoMode && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-[0.65rem] font-semibold tracking-[0.12em] uppercase bg-[#C9A36A]/10 text-[#C9A36A]/60 border border-[#C9A36A]/20">
                Demo Mode — Placeholder data
              </span>
            )}
            <span className="title-glow-line" />
            <span className="title-glow-blur" />
          </div>

          {/* Total points */}
          <div className="text-center mb-10">
            <div className="text-6xl sm:text-7xl md:text-8xl font-bold text-[#C9A36A] mb-2 font-mono tracking-tight">
              {pointsLoading ? '...' : displayPoints.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[rgba(230,230,230,0.4)] text-sm">total points earned</p>
            {!address && (
              <p className="text-[rgba(230,230,230,0.4)] text-sm mt-2">Connect wallet to view your real points</p>
            )}
          </div>

          {/* Points breakdown */}
          <div className="mb-10">
            <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6 max-w-2xl mx-auto hover:border-[#C9A36A]/25 transition-colors duration-300">
              <h3 className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-5 text-center">
                Points Breakdown
                {/* ⚠️  PLACEHOLDER — Données provenant de DEMO_POINTS_BREAKDOWN */}
              </h3>
              {pointsLoading ? (
                <p className="text-[rgba(230,230,230,0.4)] text-sm text-center">Loading breakdown...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    { label: 'Swap', value: (todayPoints?.swapPoints ?? DEMO_POINTS_BREAKDOWN.swapPoints) },
                    { label: 'LP', value: (todayPoints?.lpPoints ?? DEMO_POINTS_BREAKDOWN.lpPoints) },
                    { label: 'Vault', value: (todayPoints?.vaultPoints ?? DEMO_POINTS_BREAKDOWN.vaultPoints) },
                    { label: 'Referral', value: (todayPoints?.referralPoints ?? DEMO_POINTS_BREAKDOWN.referralPoints) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)] mb-2">{label}</p>
                      <p className="text-[#E6E6E6] text-lg font-semibold font-mono">
                        {value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Votre rang */}
          {(displayRank || rankLoading) && (
            <div className="mb-8 text-center">
              <div className="inline-block bg-white/5 border border-[#C9A36A]/15 rounded-xl px-8 py-4">
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-1">Your Rank</p>
                <p className="text-3xl font-bold text-[#C9A36A] font-mono">
                  {rankLoading ? '...' : `#${displayRank}`}
                </p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-[0.04em] mb-6 text-center uppercase text-sm" style={{ background: 'linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Leaderboard
            </h2>
            <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl overflow-hidden">
              {leaderboardLoading ? (
                <div className="text-center py-12">
                  <p className="text-[rgba(230,230,230,0.4)]">Loading leaderboard...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-[#C9A36A]/15">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)]">Rank</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)]">Wallet</th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)]">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayLeaderboard.map((entry) => {
                          const isUser = address && entry.address.toLowerCase() === address.toLowerCase();
                          return (
                            <tr
                              key={entry.address}
                              id={`rank-${entry.rank}`}
                              className={`border-t border-[#C9A36A]/8 transition-colors ${
                                isUser
                                  ? 'bg-[#C9A36A]/8'
                                  : 'hover:bg-white/3'
                              }`}
                            >
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <span className={`font-semibold text-sm ${
                                  entry.rank === 1 ? 'text-yellow-400' :
                                  entry.rank === 2 ? 'text-gray-300' :
                                  entry.rank === 3 ? 'text-amber-600' :
                                  'text-[rgba(230,230,230,0.6)]'
                                }`}>
                                  #{entry.rank}
                                </span>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[#E6E6E6] font-mono text-sm">
                                    {formatAddress(entry.address)}
                                  </span>
                                  {!isDemoMode && (
                                    <a
                                      href={`${EXPLORER_URL}/address/${entry.address}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#C9A36A]/50 hover:text-[#C9A36A] transition-colors"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  {isUser && (
                                    <span className="text-[0.6rem] text-[#C9A36A] bg-[#C9A36A]/10 px-1.5 py-0.5 rounded font-semibold">You</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                                <span className="text-[#E6E6E6] font-semibold font-mono text-sm">
                                  {entry.points.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {address && !isDemoMode && (
                    <div className="p-6 border-t border-[#C9A36A]/15">
                      <button
                        onClick={() => {
                          const userEntry = leaderboard.find((e) => e.address.toLowerCase() === address.toLowerCase());
                          if (userEntry) {
                            document.getElementById(`rank-${userEntry.rank}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="w-full px-6 py-3 bg-[#C9A36A] text-black rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors"
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
