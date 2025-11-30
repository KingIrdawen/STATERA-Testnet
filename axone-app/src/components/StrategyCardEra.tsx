/**
 * Generic Strategy Card component for ERA strategies
 * Uses the new generic hooks
 */
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import type { Strategy } from '@/types/strategy';
import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { useStrategyDeposit } from '@/hooks/useStrategyDeposit';
import { useStrategyWithdraw } from '@/hooks/useStrategyWithdraw';
import { formatUsd } from '@/lib/format';

interface StrategyCardEraProps {
  strategy: Strategy;
  showWithdraw?: boolean;
}

export function StrategyCardEra({ strategy, showWithdraw = false }: StrategyCardEraProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const strategyData = useStrategyData(strategy);
  const { deposit, isPending: isDepositPending, isConfirmed: isDepositConfirmed, error: depositError } = useStrategyDeposit(strategy);
  const { withdraw, isPending: isWithdrawPending, isConfirmed: isWithdrawConfirmed, error: withdrawError } = useStrategyWithdraw(strategy);

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const isCorrectChain = chainId === strategy.contracts.chainId;
  const EXPECTED_CHAIN_ID = strategy.contracts.chainId;

  // Reset form on success
  useEffect(() => {
    if (isDepositConfirmed) {
      setDepositAmount('');
    }
  }, [isDepositConfirmed]);

  useEffect(() => {
    if (isWithdrawConfirmed) {
      setWithdrawAmount('');
    }
  }, [isWithdrawConfirmed]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      return;
    }
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
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      return;
    }
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
    <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 hover:border-[#fab062]/50 transition-colors h-full flex flex-col">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-xl font-bold bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
          {strategy.name}
        </h4>
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
        <p className="text-[#5a9a9a] text-sm mb-4">{strategy.description}</p>
      )}

      {/* Description (may contain composition info) */}
      {strategy.description && (
        <div className="mb-4">
          <p className="text-[#5a9a9a] text-sm">{strategy.description}</p>
        </div>
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
          <p className="text-[#5a9a9a] text-sm">Loading...</p>
        </div>
      ) : strategyData.error ? (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-sm">Error: {strategyData.error.message}</p>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Total dans le contrat (TVL)</span>
            <span className="text-white text-sm font-mono">
              {strategyData.tvlUsd !== undefined ? formatUsd(strategyData.tvlUsd, 2) : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Votre dépôt</span>
            <span className="text-white text-sm font-mono">
              {strategyData.userValueUsd !== undefined ? formatUsd(strategyData.userValueUsd, 2) : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">PPS (Price per Share)</span>
            <span className="text-white text-sm font-mono">
              {strategyData.ppsUsd !== undefined ? formatUsd(strategyData.ppsUsd, 4) : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Vos parts</span>
            <span className="text-white text-sm font-mono">
              {strategyData.userShares !== undefined ? strategyData.userShares.toFixed(6) : '-'}
            </span>
          </div>
          {strategyData.oracleHypeUsd !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">HYPE (oracle)</span>
              <span className="text-white text-sm font-mono">
                {formatUsd(strategyData.oracleHypeUsd, 2)}
              </span>
            </div>
          )}
          {strategyData.oracleToken1Usd !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">TOKEN1 (oracle)</span>
              <span className="text-white text-sm font-mono">
                {formatUsd(strategyData.oracleToken1Usd, 2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Deposit/Withdraw Controls */}
      {address && isCorrectChain && (
        <div className="mt-auto space-y-3">
          {/* Deposit */}
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Deposit (HYPE)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.0001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.0"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none"
              />
              <button
                onClick={handleDeposit}
                disabled={isDepositPending || !depositAmount || parseFloat(depositAmount) <= 0}
                className="px-4 py-2 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDepositPending ? 'Depositing...' : 'Deposit'}
              </button>
            </div>
            {depositError && (
              <p className="text-red-400 text-xs mt-1">{depositError.message}</p>
            )}
          </div>

          {/* Withdraw */}
          {showWithdraw && (
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Withdraw (Shares)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-[#fab062] focus:outline-none"
                />
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawPending || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isWithdrawPending ? 'Withdrawing...' : 'Withdraw'}
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
        <div className="mt-auto p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-sm text-center">Connect wallet to deposit</p>
        </div>
      )}
    </div>
  );
}

