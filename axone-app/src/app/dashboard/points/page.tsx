'use client';

import { useAccount } from 'wagmi';
import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useWhitelistCheck } from '@/hooks/useWhitelistCheck';
import { usePoints, useLeaderboard, useUserRank } from '@/hooks/usePoints';
import { ExternalLink, Copy, Check } from 'lucide-react';
import type { Address } from 'viem';

const EXPLORER_URL = 'https://hyperscan-testnet.hyperliquid.xyz';

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-[#EF9B13] hover:bg-[#D36A03] text-white rounded-lg transition-colors text-sm font-medium"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy Link
        </>
      )}
    </button>
  );
}

export default function PointsPage() {
  const { address } = useAccount();
  useWhitelistCheck();
  const { points, isLoading: pointsLoading } = usePoints();
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard(100, 0);
  const { rank, isLoading: rankLoading } = useUserRank(address);
  const [activeTab, setActiveTab] = useState<'my' | 'leaderboard'>('my');

  // Build referral link (if referral system exists)
  const referralLink = address
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/referral?ref=${address}`
    : '';

  // Calculate daily earning (simplified - would need actual calculation)
  const dailyEarning = 0; // TODO: Calculate from recent days

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

          {/* Two horizontal info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-2">Earning Points Per Day</h3>
              <p className="text-3xl font-bold text-[#EF9B13]">{dailyEarning.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-2">Referrals</h3>
              {address ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">No referrals yet</p>
                  {referralLink && <CopyButton text={referralLink} />}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Connect wallet to get referral link</p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'text-[#EF9B13] border-b-2 border-[#EF9B13]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              My Points
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'leaderboard'
                  ? 'text-[#EF9B13] border-b-2 border-[#EF9B13]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'my' ? (
            <div className="bg-gray-800/50 border border-white/10 rounded-lg p-6">
              {!address ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Connect your wallet to view your points</p>
                </div>
              ) : pointsLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">Loading points...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-4">Total Points</h3>
                    <p className="text-4xl font-bold text-[#EF9B13]">
                      {points.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  {rank !== null && (
                    <div>
                      <h3 className="text-white font-semibold mb-4">Your Rank</h3>
                      <p className="text-3xl font-bold text-white">#{rank}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
