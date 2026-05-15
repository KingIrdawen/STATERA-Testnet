'use client';

import { useStrategyData } from '@/hooks/useStrategyDataEra';
import { useSwapPool } from '@/hooks/useSwapPool';
import type { Strategy } from '@/types/strategy';
import { formatUsd } from '@/lib/format';

interface SwapStrategyCardProps {
  strategy: Strategy;
  poolAddress: `0x${string}`;
  isSelected: boolean;
  viewMode: 'card' | 'list';
  onClick: () => void;
}

function getRiskColor(risk: string) {
  switch (risk) {
    case 'low':    return 'text-green-400 bg-green-400/15 border-green-400/25';
    case 'medium': return 'text-yellow-400 bg-yellow-400/15 border-yellow-400/25';
    case 'high':   return 'text-red-400 bg-red-400/15 border-red-400/25';
    default:       return 'text-gray-400 bg-gray-400/15 border-gray-400/25';
  }
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[#E6E6E6] text-xs font-mono font-semibold">{value}</p>
    </div>
  );
}

export function SwapStrategyCard({
  strategy,
  poolAddress,
  isSelected,
  viewMode,
  onClick,
}: SwapStrategyCardProps) {
  const strategyData = useStrategyData(strategy);
  const poolData = useSwapPool(poolAddress, strategy.contracts?.shareDecimals ?? 18);

  const hypeReserve = poolData.hypeReserveFormatted;
  const vaultReserve = poolData.vaultTokenReserveFormatted;
  const lpBalanceFmt = poolData.lpBalanceFormatted;
  const lpSharePct = poolData.lpShare !== undefined ? (poolData.lpShare * 100).toFixed(2) : undefined;
  const tvl = strategyData.tvlUsd;

  // ─── Vue Liste ────────────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left landing-card rounded-xl p-5 transition-colors duration-200 ${
          isSelected ? 'border-[#C9A36A]/60 bg-[#C9A36A]/5' : 'hover:border-[#C9A36A]/30'
        }`}
      >
        {/* Ligne principale : nom + badges + indicateur sélection */}
        <div className="flex flex-wrap items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-[#C9A36A] flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <p className="text-[#C9A36A] font-semibold text-sm">{strategy.name}</p>
              <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase border ${getRiskColor(strategy.riskLevel)}`}>
                {strategy.riskLevel}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase border text-[#C9A36A]/70 bg-[#C9A36A]/10 border-[#C9A36A]/20">
                0.5% fee
              </span>
            </div>
            {strategy.description && (
              <p className="text-[rgba(230,230,230,0.45)] text-xs leading-relaxed">{strategy.description}</p>
            )}
          </div>
          <span className="shrink-0 px-4 py-2 text-[0.6rem] tracking-[0.12em] uppercase bg-[#C9A36A] text-[#0A0A0A] rounded font-semibold">
            {isSelected ? '✓ Sélectionné' : 'Sélectionner'}
          </span>
        </div>

        {/* Métriques on-chain */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-1.5 pt-3 border-t border-[#C9A36A]/10">
          <MetricItem label="TVL Vault" value={tvl !== undefined ? formatUsd(tvl, 2) : poolData.loading ? '…' : '—'} />
          <MetricItem label="HYPE Reserve" value={hypeReserve !== undefined ? hypeReserve.toFixed(4) : poolData.loading ? '…' : '—'} />
          <MetricItem label="Vault Reserve" value={vaultReserve !== undefined ? vaultReserve.toFixed(4) : poolData.loading ? '…' : '—'} />
          <MetricItem label="Your LP" value={lpBalanceFmt !== undefined ? lpBalanceFmt.toFixed(6) : poolData.loading ? '…' : '—'} />
          <MetricItem label="Your Share" value={lpSharePct !== undefined ? `${lpSharePct}%` : '—'} />
        </div>
      </button>
    );
  }

  // ─── Vue Carte ────────────────────────────────────────────────────────────
  return (
    <button
      onClick={onClick}
      className={`w-full text-left landing-card rounded-xl p-5 transition-all duration-200 flex flex-col ${
        isSelected ? 'border-[#C9A36A]/60 bg-[#C9A36A]/5 shadow-lg' : 'hover:border-[#C9A36A]/30'
      }`}
    >
      {/* Header : nom + check */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-[#C9A36A] font-semibold text-sm leading-tight mb-1">{strategy.name}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase border ${getRiskColor(strategy.riskLevel)}`}>
              {strategy.riskLevel}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[0.55rem] font-bold uppercase border text-[#C9A36A]/70 bg-[#C9A36A]/10 border-[#C9A36A]/20">
              0.5% fee
            </span>
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#C9A36A] flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {strategy.description && (
        <p className="text-[rgba(230,230,230,0.4)] text-[0.65rem] leading-relaxed mb-3">{strategy.description}</p>
      )}

      {/* Métriques pool */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-[#C9A36A]/10 mt-auto">
        <MetricItem label="TVL Vault" value={tvl !== undefined ? formatUsd(tvl, 2) : poolData.loading ? '…' : '—'} />
        <MetricItem label="Fee" value="0.5%" />
        <MetricItem label="HYPE Reserve" value={hypeReserve !== undefined ? hypeReserve.toFixed(4) : poolData.loading ? '…' : '—'} />
        <MetricItem label="Vault Reserve" value={vaultReserve !== undefined ? vaultReserve.toFixed(4) : poolData.loading ? '…' : '—'} />
        <MetricItem
          label="Your LP"
          value={lpBalanceFmt !== undefined && lpBalanceFmt > 0 ? `${lpBalanceFmt.toFixed(6)} (${lpSharePct}%)` : '—'}
        />
        <MetricItem
          label="Pool address"
          value={`${poolAddress.slice(0, 6)}…${poolAddress.slice(-4)}`}
        />
      </div>
    </button>
  );
}
