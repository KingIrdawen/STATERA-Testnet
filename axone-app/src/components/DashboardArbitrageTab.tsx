'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useArbitrageOpportunities } from '@/hooks/useArbitrageOpportunities';
import Link from 'next/link';

export function DashboardArbitrageTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  const { opportunities, isLoading, error } = useArbitrageOpportunities();

  // Wrong network
  if (address && !isCorrectChain) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Wrong Network</h3>
          <p className="text-[#5a9a9a] mb-6">
            Please switch to HyperEVM Testnet (Chain ID {EXPECTED_CHAIN_ID}) to view arbitrage opportunities.
          </p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors"
          >
            Switch to HyperEVM Testnet
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#5a9a9a] text-lg">Loading arbitrage opportunities...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">Error loading arbitrage opportunities: {error}</p>
      </div>
    );
  }

  // No opportunities
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">No Arbitrage Opportunities</h3>
          <p className="text-[#5a9a9a] mb-2">
            No arbitrage opportunities available right now.
          </p>
          <p className="text-gray-500 text-sm">
            Make sure vaults have active liquidity pools.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-4">Arbitrage Opportunities</h3>
        <p className="text-[#5a9a9a] text-sm mb-6">
          Compare prices between vault deposits and swap pools. Positive difference means swap is more favorable.
        </p>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">Strategy</th>
                <th className="text-right py-3 px-4 text-gray-400 text-sm font-semibold">Price via Vault</th>
                <th className="text-right py-3 px-4 text-gray-400 text-sm font-semibold">Price via Swap</th>
                <th className="text-right py-3 px-4 text-gray-400 text-sm font-semibold">Difference</th>
                <th className="text-center py-3 px-4 text-gray-400 text-sm font-semibold">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr
                  key={opp.strategy.id}
                  className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors"
                >
                  {/* Strategy */}
                  <td className="py-4 px-4">
                    <Link
                      href={`/dashboard/strategy/${opp.strategy.id}`}
                      className="block hover:text-[#fab062] transition-colors"
                    >
                      <div className="font-semibold text-white">{opp.strategy.name}</div>
                      {opp.strategy.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {opp.strategy.description}
                        </div>
                      )}
                    </Link>
                  </td>

                  {/* Price via Vault */}
                  <td className="py-4 px-4 text-right">
                    {opp.priceViaVaultUsd !== null ? (
                      <div>
                        <div className="text-white font-mono">
                          ${opp.priceViaVaultUsd.toFixed(4)} USD
                        </div>
                        <div className="text-xs text-gray-500">
                          {opp.priceViaVault.toFixed(6)} tokens
                        </div>
                      </div>
                    ) : (
                      <div className="text-white font-mono">
                        {opp.priceViaVault.toFixed(6)} tokens
                      </div>
                    )}
                  </td>

                  {/* Price via Swap */}
                  <td className="py-4 px-4 text-right">
                    {opp.priceViaSwapUsd !== null ? (
                      <div>
                        <div className="text-white font-mono">
                          ${opp.priceViaSwapUsd.toFixed(4)} USD
                        </div>
                        <div className="text-xs text-gray-500">
                          {opp.priceViaSwap.toFixed(6)} tokens
                        </div>
                      </div>
                    ) : (
                      <div className="text-white font-mono">
                        {opp.priceViaSwap.toFixed(6)} tokens
                      </div>
                    )}
                  </td>

                  {/* Difference */}
                  <td className="py-4 px-4 text-right">
                    <div
                      className={`font-mono font-semibold ${
                        opp.recommendation === 'swap'
                          ? 'text-green-400'
                          : opp.recommendation === 'vault'
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {opp.differencePercent >= 0 ? '+' : ''}
                      {opp.differencePercent.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {opp.difference >= 0 ? '+' : ''}
                      {opp.difference.toFixed(6)}
                    </div>
                  </td>

                  {/* Recommendation */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        opp.recommendation === 'swap'
                          ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                          : opp.recommendation === 'vault'
                          ? 'bg-red-400/20 text-red-400 border border-red-400/30'
                          : 'bg-gray-400/20 text-gray-400 border border-gray-400/30'
                      }`}
                    >
                      {opp.recommendation === 'swap' ? 'Use Swap' : opp.recommendation === 'vault' ? 'Use Vault' : 'Neutral'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

