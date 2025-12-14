'use client';

import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { useStrategyToken1Meta } from '@/hooks/useStrategyToken1Meta';
import type { Strategy } from '@/types/strategy';
import { formatUsd } from '@/lib/format';

interface SwapStrategyCardProps {
  strategy: Strategy;
  poolAddress: `0x${string}`;
  isSelected: boolean;
  onClick: () => void;
}

export function SwapStrategyCard({ strategy, poolAddress, isSelected, onClick }: SwapStrategyCardProps) {
  const strategyData = useStrategyData(strategy);
  const { symbol: token1Symbol, name: token1Name } = useStrategyToken1Meta(strategy);
  const displayToken1 = token1Symbol || token1Name || 'TOKEN1';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
        isSelected
          ? 'border-[#fab062] bg-[#fab062]/10 shadow-lg scale-[1.02]'
          : 'border-gray-700 bg-[#001a1f] hover:border-[#fab062]/50 hover:bg-[#001a1f]/80'
      }`}
    >
      {/* Strategy name */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-white truncate pr-2">{strategy.name}</h4>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#fab062] flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Loading state */}
      {strategyData.loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      ) : strategyData.error ? (
        <div className="text-red-400 text-xs py-2">
          Error loading data
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* TVL */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">TVL</span>
            <span className="text-white text-sm font-semibold">
              {strategyData.tvlUsd !== undefined ? formatUsd(strategyData.tvlUsd, 2) : '-'}
            </span>
          </div>

          {/* Total Shares */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Shares</span>
            <span className="text-white text-sm font-semibold">
              {strategyData.totalShares !== undefined 
                ? strategyData.totalShares >= 1000 
                  ? `${(strategyData.totalShares / 1000).toFixed(2)}K`
                  : strategyData.totalShares.toFixed(2)
                : '-'}
            </span>
          </div>

          {/* Tokens and prices */}
          <div className="pt-2 border-t border-gray-700 space-y-1.5">
            {/* HYPE */}
            {strategyData.oracleHypeUsd !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">HYPE</span>
                <span className="text-white text-xs font-mono">
                  {formatUsd(strategyData.oracleHypeUsd, 2)}
                </span>
              </div>
            )}

            {/* TOKEN1 */}
            {strategyData.oracleToken1Usd !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs truncate mr-2">{displayToken1}</span>
                <span className="text-white text-xs font-mono flex-shrink-0">
                  {formatUsd(strategyData.oracleToken1Usd, 2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pool address hint */}
      <div className="mt-3 pt-2 border-t border-gray-700">
        <p className="text-gray-500 text-xs font-mono truncate" title={poolAddress}>
          {poolAddress.slice(0, 6)}...{poolAddress.slice(-4)}
        </p>
      </div>
    </button>
  );
}

