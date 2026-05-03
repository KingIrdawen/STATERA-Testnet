/**
 * Generic Strategy Card component for ERA strategies
 * Uses the new generic hooks
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import type { Strategy } from '@/types/strategy';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { useStrategyDeposit } from '@/hooks/useStrategyDeposit';
import { useStrategyWithdraw } from '@/hooks/useStrategyWithdraw';
import { useStrategyToken1Meta } from '@/hooks/useStrategyToken1Meta';
import { formatUsd } from '@/lib/format';
import { DEMO_STRATEGY_METRICS } from '@/lib/placeholders';

interface StrategyCardEraProps {
  strategy: Strategy;
  showWithdraw?: boolean;
  showViewMore?: boolean; // Show "View more" button for dashboard tab
}

export function StrategyCardEra({ strategy, showWithdraw = false, showViewMore = false }: StrategyCardEraProps) {
  // Vérification de sécurité
  if (!strategy || !strategy.contracts) {
    return null;
  }

  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const strategyData = useStrategyData(strategy);
  const { deposit, isPending: isDepositPending, isConfirmed: isDepositConfirmed, error: depositError } = useStrategyDeposit(strategy);
  const { withdraw, isPending: isWithdrawPending, isConfirmed: isWithdrawConfirmed, error: withdrawError } = useStrategyWithdraw(strategy);
  const { symbol: token1Symbol, name: token1Name } = useStrategyToken1Meta(strategy);
  const displayToken1 = token1Symbol || token1Name || 'TOKEN1';

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const isCorrectChain = chainId === strategy.contracts.chainId;
  const EXPECTED_CHAIN_ID = strategy.contracts.chainId;

  // Récupérer le solde HYPE natif du wallet
  const { data: hypeBalance } = useBalance({
    address,
    query: { enabled: !!address && isCorrectChain },
  });

  // Calculer les montants max
  const maxDeposit = hypeBalance ? Number(formatUnits(hypeBalance.value, 18)) : 0;
  const maxWithdraw = strategyData.userShares ?? 0;

  // ─── Mode démo : utiliser les données placeholder quand on-chain est vide ───
  const demoMetrics = DEMO_STRATEGY_METRICS[strategy.id];
  const isDataEmpty = !strategyData.loading && (
    strategyData.error || strategyData.tvlUsd === 0 || strategyData.tvlUsd === undefined
  );
  const isDemoMode = isDataEmpty && !!demoMetrics;

  const displayTvl = isDemoMode ? demoMetrics.tvlUsd : strategyData.tvlUsd;
  const displayPps = isDemoMode ? demoMetrics.ppsUsd : strategyData.ppsUsd;
  const displayUserValue = isDemoMode ? demoMetrics.demoUserValueUsd : strategyData.userValueUsd;
  const displayUserShares = isDemoMode ? demoMetrics.demoUserShares : strategyData.userShares;
  const displayHypePrice = isDemoMode ? demoMetrics.oracleHypeUsd : strategyData.oracleHypeUsd;
  const displayToken1Price = isDemoMode ? demoMetrics.oracleToken1Usd : strategyData.oracleToken1Usd;
  const displayToken1Name = isDemoMode ? demoMetrics.token1Symbol : displayToken1;

  // Reset form on success
  useEffect(() => {
    if (isDepositConfirmed) setDepositAmount('');
  }, [isDepositConfirmed]);

  useEffect(() => {
    if (isWithdrawConfirmed) setWithdrawAmount('');
  }, [isWithdrawConfirmed]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    if (!isCorrectChain) {
      await switchChain({ chainId: EXPECTED_CHAIN_ID });
      return;
    }
    try {
      await deposit(depositAmount);
    } catch (error) {
      console.error('Deposit error:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    if (!isCorrectChain) {
      await switchChain({ chainId: EXPECTED_CHAIN_ID });
      return;
    }
    try {
      await withdraw(withdrawAmount);
    } catch (error) {
      console.error('Withdraw error:', error);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-400/20 border-green-400/30';
      case 'medium': return 'bg-yellow-400/20 border-yellow-400/30';
      case 'high': return 'bg-red-400/20 border-red-400/30';
      default: return 'bg-gray-400/20 border-gray-400/30';
    }
  };

  return (
    <div className="landing-card rounded-xl p-6 transition-colors duration-300 h-full flex flex-col overflow-hidden">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-[#C9A36A] tracking-[0.03em]">
            {strategy.name}
          </h4>
          {isDemoMode && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[0.6rem] font-semibold tracking-[0.1em] uppercase bg-[#C9A36A]/10 text-[#C9A36A]/60 border border-[#C9A36A]/15">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {strategy.status && (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              strategy.status === 'open' ? 'bg-green-400/20 text-green-400' :
              strategy.status === 'paused' ? 'bg-yellow-400/20 text-yellow-400' :
              'bg-red-400/20 text-red-400'
            }`}>
              {strategy.status}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBgColor(strategy.riskLevel)} ${getRiskColor(strategy.riskLevel)}`}>
            {strategy.riskLevel}
          </span>
        </div>
      </div>

      {/* Description */}
      {strategy.description && (
        <p className="text-[rgba(230,230,230,0.5)] text-sm mb-4 leading-relaxed">{strategy.description}</p>
      )}

      {/* Network warning */}
      {address && !isCorrectChain && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-sm mb-2">Wrong network. Please switch to Chain ID {EXPECTED_CHAIN_ID}</p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Switch Network
          </button>
        </div>
      )}

      {/* Strategy Data */}
      {strategyData.loading ? (
        <div className="text-center py-4">
          <p className="text-[rgba(230,230,230,0.5)] text-sm">Loading...</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {/* APR rapide (démo uniquement) */}
          {isDemoMode && demoMetrics.apr30d !== null && (
            <div className="flex justify-between items-center py-2 border-b border-[#C9A36A]/10">
              <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">APR (30D)</span>
              <span className="text-green-400 text-sm font-semibold font-mono">
                +{demoMetrics.apr30d.toFixed(1)}%
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">TVL</span>
            <span className="text-[#E6E6E6] text-sm font-mono font-semibold">
              {displayTvl !== undefined ? formatUsd(displayTvl, 2) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">Your Deposit</span>
            <span className="text-[#E6E6E6] text-sm font-mono">
              {displayUserValue !== undefined ? formatUsd(displayUserValue, 2) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">PPS</span>
            <span className="text-[#E6E6E6] text-sm font-mono">
              {displayPps !== undefined ? formatUsd(displayPps, 4) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">Your Shares</span>
            <span className="text-[#E6E6E6] text-sm font-mono">
              {displayUserShares !== undefined ? displayUserShares.toFixed(4) : '—'}
            </span>
          </div>
          {displayHypePrice !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">HYPE</span>
              <span className="text-[#E6E6E6] text-sm font-mono">{formatUsd(displayHypePrice, 2)}</span>
            </div>
          )}
          {displayToken1Price !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.5)]">{displayToken1Name}</span>
              <span className="text-[#E6E6E6] text-sm font-mono">{formatUsd(displayToken1Price, 2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Deposit/Withdraw Controls */}
      {address && isCorrectChain && (
        <div className="mt-auto space-y-3">
          {/* Deposit */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[#E6E6E6] text-sm font-semibold">Deposit (HYPE)</label>
              {maxDeposit > 0 && (
                <button
                  onClick={() => setDepositAmount(maxDeposit.toString())}
                  className="text-xs text-[#C9A36A] hover:text-[#b8935f] transition-colors font-medium"
                >
                  MAX: {maxDeposit.toFixed(6)}
                </button>
              )}
            </div>
            <div className="flex gap-2 min-w-0">
              <input
                type="number"
                step="0.0001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white text-sm focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={handleDeposit}
                disabled={isDepositPending || !depositAmount || parseFloat(depositAmount) <= 0}
                className="shrink-0 px-4 py-2 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositPending ? '...' : 'Deposit'}
              </button>
            </div>
            {strategyData.ppsUsd !== undefined && strategyData.ppsUsd === 0 && !isDemoMode && (
              <p className="text-yellow-400 text-xs mt-1">⚠️ Oracle unavailable or vault not initialized.</p>
            )}
            {strategyData.oracleHypeUsd !== undefined && strategyData.oracleHypeUsd === 0 && !isDemoMode && (
              <p className="text-yellow-400 text-xs mt-1">⚠️ HYPE oracle price unavailable.</p>
            )}
            {depositError && (
              <p className="text-red-400 text-xs mt-1">{depositError.message}</p>
            )}
          </div>

          {/* Withdraw */}
          {showWithdraw && (
            <div>
              {strategyData.userSharesStaked !== undefined && strategyData.userSharesStaked > 0 && (
                <div className="mb-3 p-2 bg-white/5 rounded-lg border border-[#C9A36A]/15">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[rgba(230,230,230,0.5)]">Staked shares:</span>
                    <span className="text-[#E6E6E6] font-mono">{strategyData.userSharesStaked.toFixed(6)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[#E6E6E6] text-sm font-semibold">Withdraw (Shares)</label>
                {maxWithdraw > 0 && (
                  <button
                    onClick={() => setWithdrawAmount(maxWithdraw.toString())}
                    className="text-xs text-[#C9A36A] hover:text-[#b8935f] transition-colors font-medium"
                  >
                    MAX: {maxWithdraw.toFixed(6)}
                  </button>
                )}
              </div>
              <div className="flex gap-2 min-w-0">
                <input
                  type="number"
                  step="0.0001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white text-sm focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawPending || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="shrink-0 px-4 py-2 bg-red-600/80 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWithdrawPending ? '...' : 'Withdraw'}
                </button>
              </div>
              {withdrawError && (
                <p className="text-red-400 text-xs mt-1">{withdrawError.message}</p>
              )}
            </div>
          )}
        </div>
      )}

      {!address && (
        <div className="mt-auto p-3 bg-[#C9A36A]/5 border border-[#C9A36A]/20 rounded-lg">
          <p className="text-[rgba(230,230,230,0.6)] text-sm text-center">Connect wallet to deposit</p>
        </div>
      )}

      {/* View More button */}
      {showViewMore && (
        <div className="mt-4 pt-4 border-t border-[#C9A36A]/15">
          {strategy.id ? (
            <Link
              href={`/dashboard/strategy/${strategy.id}`}
              className="block w-full text-center text-xs text-[#5a9a9a] hover:text-[#C9A36A] transition-colors"
            >
              View more →
            </Link>
          ) : (
            <div className="block w-full text-center text-xs text-[rgba(230,230,230,0.2)] cursor-not-allowed">
              View more (ID missing)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
