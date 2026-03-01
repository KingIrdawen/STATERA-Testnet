'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useArbitrageOpportunities } from '@/hooks/useArbitrageOpportunities';
import Link from 'next/link';
import { DEMO_ARBITRAGE_OPPORTUNITIES } from '@/lib/placeholders';

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
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-8 max-w-md text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Wrong Network</h3>
          <p className="text-[#5a9a9a] mb-6">
            Please switch to HyperEVM Testnet (Chain ID {EXPECTED_CHAIN_ID}) to view arbitrage opportunities.
          </p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="w-full px-6 py-3 bg-[#C9A36A] text-black rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors"
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
        <p className="text-[rgba(230,230,230,0.5)] text-lg">Loading arbitrage opportunities...</p>
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

  // No opportunities — mode démo
  // ⚠️  PLACEHOLDER — Opportunités d'arbitrage fictives. À remplacer par useArbitrageOpportunities() quand les contrats sont déployés.
  if (!opportunities || opportunities.length === 0) {
    return (
      <div className="space-y-6">
        {/* Banner démo */}
        <div className="bg-[#C9A36A]/8 border border-[#C9A36A]/20 rounded-xl p-4 text-center">
          <p className="text-[#C9A36A]/80 text-xs tracking-[0.1em] uppercase font-semibold mb-1">Demo Mode</p>
          <p className="text-[rgba(230,230,230,0.5)] text-sm">
            Showing placeholder arbitrage opportunities — live data available after contract deployment.
          </p>
        </div>

        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#C9A36A] tracking-[0.04em] mb-2">Arbitrage Opportunities</h3>
          <p className="text-[rgba(230,230,230,0.4)] text-sm mb-6">
            Compare prices between vault deposits and swap pools. Positive difference means swap is more favorable.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C9A36A]/15">
                  <th className="text-left py-3 px-4 text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)]">Strategy</th>
                  <th className="text-right py-3 px-4 text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)]">Via Vault</th>
                  <th className="text-right py-3 px-4 text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)]">Via Swap</th>
                  <th className="text-right py-3 px-4 text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)]">Δ%</th>
                  <th className="text-center py-3 px-4 text-[0.65rem] uppercase tracking-[0.12em] text-[rgba(230,230,230,0.4)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_ARBITRAGE_OPPORTUNITIES.map((opp) => (
                  <tr key={opp.id} className="border-t border-[#C9A36A]/8 hover:bg-white/2 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-[#E6E6E6] font-semibold text-sm">{opp.strategyName}</p>
                      <p className="text-[rgba(230,230,230,0.3)] text-xs mt-0.5">⚠️ Demo data</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[#E6E6E6] font-mono text-sm">${opp.priceViaVault.toFixed(4)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[#E6E6E6] font-mono text-sm">${opp.priceViaSwap.toFixed(4)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-mono font-semibold text-sm ${
                        opp.recommendation === 'swap' ? 'text-green-400' :
                        opp.recommendation === 'vault' ? 'text-red-400' :
                        'text-[rgba(230,230,230,0.4)]'
                      }`}>
                        {opp.differencePercent >= 0 ? '+' : ''}{opp.differencePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {opp.recommendation === 'swap' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-400 border border-green-400/30">
                          Use Swap
                        </span>
                      ) : opp.recommendation === 'vault' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-400/20 text-red-400 border border-red-400/30">
                          Use Vault
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A36A]/10 text-[#C9A36A]/60 border border-[#C9A36A]/20">
                          Neutral
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Résumé opportunité */}
          <div className="mt-6 pt-4 border-t border-[#C9A36A]/15">
            <div className="flex items-center justify-between">
              <p className="text-[rgba(230,230,230,0.4)] text-xs">Best opportunity (demo)</p>
              <p className="text-green-400 text-sm font-semibold font-mono">
                {/* ⚠️  PLACEHOLDER — Profit potentiel */}
                +$32.80 via HYPE/ETH Swap
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6">
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
                      className="block hover:text-[#C9A36A] transition-colors"
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
                    {opp.recommendation === 'swap' ? (
                      <Link
                        href={`/dashboard/swap?strategyId=${opp.strategy.id}`}
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30 transition-colors"
                      >
                        Use Swap
                      </Link>
                    ) : opp.recommendation === 'vault' ? (
                      <Link
                        href={`/dashboard/strategy/${opp.strategy.id}`}
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-400/20 text-red-400 border border-red-400/30 hover:bg-red-400/30 transition-colors"
                      >
                        Use Vault
                      </Link>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-400/20 text-gray-400 border border-gray-400/30">
                        Neutral
                      </span>
                    )}
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

