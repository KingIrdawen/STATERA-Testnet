'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount, useChainId, useSwitchChain, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { useSwapStrategies, type SwapStrategy } from '@/hooks/useSwapStrategies';
import { useSwapQuote, usePerformSwap, type SwapDirection } from '@/hooks/useSwap';
import { useVaultTokenApproval } from '@/hooks/useVaultTokenApproval';
import { useSwapPool } from '@/hooks/useSwapPool';
import { useAddLiquidity } from '@/hooks/useAddLiquidity';
import { useRemoveLiquidity } from '@/hooks/useRemoveLiquidity';
import { SwapStrategyCard } from '@/components/dashboard/SwapStrategyCard';
import { getStrategyContracts } from '@/lib/strategyContracts';

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = 'swap' | 'add' | 'remove';
type ViewMode = 'card' | 'list';

// ─── Icônes toggle ────────────────────────────────────────────────────────────
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="4" x2="13" y2="4" /><line x1="3" y1="8" x2="13" y2="8" /><line x1="3" y1="12" x2="13" y2="12" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="2" width="5" height="5" /><rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" /><rect x="9" y="9" width="5" height="5" />
    </svg>
  );
}

// ─── Composant interne — sélection de pool ────────────────────────────────────
function StrategySelector({
  strategies,
  selected,
  onSelect,
}: {
  strategies: SwapStrategy[];
  selected: SwapStrategy | null;
  onSelect: (s: SwapStrategy) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  return (
    <div className="landing-card rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)]">
          Select a Pool
        </p>
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-[#C9A36A]/15 rounded-lg">
          <button
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'card' ? 'bg-[#C9A36A] text-[#121212]' : 'text-[rgba(230,230,230,0.5)] hover:text-[#E6E6E6]'}`}
            title="Vue cartes"
          >
            <GridIcon />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-[#C9A36A] text-[#121212]' : 'text-[rgba(230,230,230,0.5)] hover:text-[#E6E6E6]'}`}
            title="Vue liste"
          >
            <ListIcon />
          </button>
        </div>
      </div>

      {/* Grille ou liste */}
      <div className={viewMode === 'card' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
        {strategies.map((s) => (
          <SwapStrategyCard
            key={s.strategy.id}
            strategy={s.strategy}
            poolAddress={s.poolAddress}
            isSelected={selected?.strategy.id === s.strategy.id}
            viewMode={viewMode}
            onClick={() => onSelect(s)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Panel info pool ──────────────────────────────────────────────────────────
function PoolInfoPanel({
  poolData,
  selected,
}: {
  poolData: ReturnType<typeof useSwapPool>;
  selected: SwapStrategy;
}) {
  const hasReserves =
    poolData.hypeReserveFormatted !== undefined &&
    poolData.vaultTokenReserveFormatted !== undefined;

  return (
    <div className="landing-card rounded-xl p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-4">
        Pool Info — {selected.strategy.name}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">HYPE Reserve</p>
          <p className="text-[#E6E6E6] text-sm font-mono font-semibold">
            {poolData.loading ? '…' : hasReserves ? poolData.hypeReserveFormatted!.toFixed(4) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">Vault Reserve</p>
          <p className="text-[#E6E6E6] text-sm font-mono font-semibold">
            {poolData.loading ? '…' : hasReserves ? poolData.vaultTokenReserveFormatted!.toFixed(4) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">Your LP</p>
          <p className="text-[#E6E6E6] text-sm font-mono font-semibold">
            {poolData.loading ? '…' : poolData.lpBalanceFormatted !== undefined ? poolData.lpBalanceFormatted.toFixed(6) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[0.6rem] text-[rgba(230,230,230,0.4)] uppercase tracking-wide mb-0.5">Fee</p>
          <p className="text-[#C9A36A] text-sm font-semibold">0.5%</p>
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Swap ──────────────────────────────────────────────────────────────
function SwapPanel({
  selected,
  address,
  isCorrectChain,
  switchChain,
}: {
  selected: SwapStrategy;
  address: `0x${string}` | undefined;
  isCorrectChain: boolean;
  switchChain: (args: { chainId: number }) => void;
}) {
  const EXPECTED_CHAIN_ID = 998;
  const [direction, setDirection] = useState<SwapDirection>('HYPE_TO_VAULT');
  const [amountIn, setAmountIn] = useState('');

  const shareDecimals = selected.strategy.contracts?.shareDecimals ?? 18;

  const quote = useSwapQuote({ poolAddress: selected.poolAddress, strategy: selected.strategy, direction, amountIn });

  const { swap, isPending, isConfirming, isSuccess, error: swapError } = usePerformSwap({
    poolAddress: selected.poolAddress,
    strategy: selected.strategy,
    direction,
    amountIn,
    amountOutWei: quote.amountOutWei,
    slippageBps: 100n,
  });

  const { needsApproval, approve, isApproving, isApproved, approveError } = useVaultTokenApproval(
    selected.strategy,
    selected.poolAddress,
    direction === 'VAULT_TO_HYPE' ? amountIn : ''
  );

  const { data: hypeBalance } = useBalance({
    address,
    query: { enabled: !!address && isCorrectChain && direction === 'HYPE_TO_VAULT' },
  });

  const vaultContracts = getStrategyContracts(selected.strategy);
  const vaultForRead = vaultContracts?.vault as any;
  const { data: vaultTokenBalanceRaw } = useReadContract({
    ...vaultForRead,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!vaultContracts && isCorrectChain && direction === 'VAULT_TO_HYPE' },
  });

  const availableBalance = direction === 'HYPE_TO_VAULT'
    ? (hypeBalance ? Number(formatUnits(hypeBalance.value, 18)) : 0)
    : (vaultTokenBalanceRaw && typeof vaultTokenBalanceRaw === 'bigint'
        ? Number(formatUnits(vaultTokenBalanceRaw, shareDecimals)) : 0);

  useEffect(() => { if (isSuccess) setAmountIn(''); }, [isSuccess]);

  const handleSwap = () => {
    if (!isCorrectChain) { switchChain({ chainId: EXPECTED_CHAIN_ID }); return; }
    swap();
  };

  return (
    <div className="landing-card rounded-xl p-6 space-y-5">
      {/* Direction toggle */}
      <div className="flex gap-2">
        {(['HYPE_TO_VAULT', 'VAULT_TO_HYPE'] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => { setDirection(dir); setAmountIn(''); }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              direction === dir
                ? 'bg-[#C9A36A] text-[#121212]'
                : 'bg-white/5 text-[rgba(230,230,230,0.5)] border border-[#C9A36A]/15 hover:border-[#C9A36A]/30'
            }`}
          >
            {dir === 'HYPE_TO_VAULT' ? 'HYPE → Vault' : 'Vault → HYPE'}
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[#E6E6E6] text-sm font-semibold">
            Amount ({direction === 'HYPE_TO_VAULT' ? 'HYPE' : 'Vault shares'})
          </label>
          {address && isCorrectChain && availableBalance > 0 && (
            <button
              onClick={() => setAmountIn(availableBalance.toFixed(6))}
              className="text-[#C9A36A] text-xs hover:underline"
            >
              Max: {availableBalance.toFixed(4)}
            </button>
          )}
        </div>
        <input
          type="number"
          step="0.0001"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          placeholder="0.0"
          className="w-full px-4 py-3 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Quote */}
      {(quote.amountOutFormatted || quote.loading) && amountIn && parseFloat(amountIn) > 0 && (
        <div className="p-4 bg-white/3 border border-[#C9A36A]/15 rounded-xl">
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-1">
            Estimated Output
          </p>
          {quote.loading ? (
            <p className="text-[rgba(230,230,230,0.4)] text-sm">Calculating…</p>
          ) : (
            <>
              <p className="text-[#E6E6E6] text-lg font-semibold font-mono">
                {parseFloat(quote.amountOutFormatted).toFixed(6)}{' '}
                <span className="text-sm text-[rgba(230,230,230,0.5)]">
                  {direction === 'HYPE_TO_VAULT' ? 'shares' : 'HYPE'}
                </span>
              </p>
              <p className="text-[0.6rem] text-[rgba(230,230,230,0.3)] mt-1">Fee: 0.5% (0.25% LP + 0.25% protocol)</p>
            </>
          )}
        </div>
      )}

      {/* No quote warning */}
      {amountIn && parseFloat(amountIn) > 0 && !quote.loading && !quote.amountOutFormatted && !quote.error && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-xs">Impossible de calculer — pool vide ou liquidité insuffisante.</p>
        </div>
      )}

      {/* Errors */}
      {(quote.error || swapError) && (
        <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-xs">{(quote.error || swapError)?.message}</p>
        </div>
      )}

      {/* Approve (vault → HYPE) */}
      {direction === 'VAULT_TO_HYPE' && needsApproval && (
        <div>
          <button
            onClick={approve}
            disabled={isApproving || !address}
            className="w-full px-6 py-3 bg-[#C9A36A]/20 border border-[#C9A36A]/40 text-[#C9A36A] rounded-lg text-sm font-semibold hover:bg-[#C9A36A]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? 'Approving…' : 'Approve Vault Tokens'}
          </button>
          {approveError && <p className="text-red-400 text-xs mt-1 text-center">{approveError.message}</p>}
        </div>
      )}

      {/* Swap button */}
      <button
        onClick={handleSwap}
        disabled={
          isPending || isConfirming || !amountIn || parseFloat(amountIn) <= 0 ||
          !quote.amountOutFormatted || !quote.amountOutWei || quote.amountOutWei === 0n ||
          !address || !isCorrectChain || (direction === 'VAULT_TO_HYPE' && needsApproval)
        }
        className="w-full px-6 py-3 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending || isConfirming ? 'Processing…'
          : !address ? 'Connect Wallet'
          : !isCorrectChain ? 'Switch Network'
          : !quote.amountOutFormatted ? 'Enter Amount'
          : direction === 'VAULT_TO_HYPE' && needsApproval ? 'Approve First'
          : 'Swap'}
      </button>

      {direction === 'VAULT_TO_HYPE' && !needsApproval && address && (
        <p className="text-green-400 text-xs text-center">✓ Pool approved</p>
      )}
      {isApproved && <p className="text-green-400 text-xs text-center">✓ Approval confirmed — you can now swap</p>}
    </div>
  );
}

// ─── Onglet Add Liquidity ─────────────────────────────────────────────────────
function AddLiquidityPanel({
  selected,
  poolData,
  address,
  isCorrectChain,
}: {
  selected: SwapStrategy;
  poolData: ReturnType<typeof useSwapPool>;
  address: `0x${string}` | undefined;
  isCorrectChain: boolean;
}) {
  const [hypeAmount, setHypeAmount] = useState('');
  const [vaultAmount, setVaultAmount] = useState('');

  const isFirstDeposit =
    poolData.lpTotalSupply !== undefined && poolData.lpTotalSupply === 0n;

  // Auto-suggest le second montant selon le ratio réserves
  const handleHypeChange = (val: string) => {
    setHypeAmount(val);
    if (!isFirstDeposit && poolData.hypeReserveFormatted && poolData.vaultTokenReserveFormatted && poolData.hypeReserveFormatted > 0) {
      const ratio = poolData.vaultTokenReserveFormatted / poolData.hypeReserveFormatted;
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        setVaultAmount((num * ratio).toFixed(6));
      } else {
        setVaultAmount('');
      }
    }
  };

  const handleVaultChange = (val: string) => {
    setVaultAmount(val);
    if (!isFirstDeposit && poolData.hypeReserveFormatted && poolData.vaultTokenReserveFormatted && poolData.vaultTokenReserveFormatted > 0) {
      const ratio = poolData.hypeReserveFormatted / poolData.vaultTokenReserveFormatted;
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        setHypeAmount((num * ratio).toFixed(6));
      } else {
        setHypeAmount('');
      }
    }
  };

  const {
    needsApproval, approve, isApproving, isApproved, approveError,
    addLiquidity, isAddPending, isAddSuccess, addError,
  } = useAddLiquidity(selected.strategy, selected.poolAddress, hypeAmount, vaultAmount);

  useEffect(() => { if (isAddSuccess) { setHypeAmount(''); setVaultAmount(''); } }, [isAddSuccess]);

  return (
    <div className="landing-card rounded-xl p-6 space-y-5">
      {isFirstDeposit && (
        <div className="p-4 bg-[#C9A36A]/10 border border-[#C9A36A]/30 rounded-xl">
          <p className="text-[#C9A36A] text-xs font-semibold mb-1">⚠️ First deposit — initial price</p>
          <p className="text-[rgba(230,230,230,0.5)] text-xs">
            Le ratio HYPE / Vault tokens que tu entres fixe le prix initial de la pool. Vérifie bien tes montants.
          </p>
        </div>
      )}

      {/* HYPE input */}
      <div>
        <label className="text-[#E6E6E6] text-sm font-semibold block mb-2">HYPE</label>
        <input
          type="number"
          step="0.0001"
          value={hypeAmount}
          onChange={(e) => handleHypeChange(e.target.value)}
          placeholder="0.0"
          className="w-full px-4 py-3 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      {/* Vault token input */}
      <div>
        <label className="text-[#E6E6E6] text-sm font-semibold block mb-2">
          {selected.strategy.name} (vault shares)
        </label>
        <input
          type="number"
          step="0.0001"
          value={vaultAmount}
          onChange={(e) => handleVaultChange(e.target.value)}
          placeholder="0.0"
          className="w-full px-4 py-3 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-white focus:border-[#C9A36A]/60 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {!isFirstDeposit && (
          <p className="text-[rgba(230,230,230,0.3)] text-xs mt-1">Auto-ajusté selon le ratio du pool.</p>
        )}
      </div>

      {(addError || approveError) && (
        <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-xs">{(addError || approveError)?.message}</p>
        </div>
      )}

      {/* Approve */}
      {needsApproval && (
        <button
          onClick={approve}
          disabled={isApproving || !address}
          className="w-full px-6 py-3 bg-[#C9A36A]/20 border border-[#C9A36A]/40 text-[#C9A36A] rounded-lg text-sm font-semibold hover:bg-[#C9A36A]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApproving ? 'Approving…' : `Approve ${selected.strategy.name} tokens`}
        </button>
      )}

      {/* Add button */}
      <button
        onClick={addLiquidity}
        disabled={
          isAddPending || !address || !isCorrectChain ||
          !hypeAmount || parseFloat(hypeAmount) <= 0 ||
          !vaultAmount || parseFloat(vaultAmount) <= 0 ||
          needsApproval
        }
        className="w-full px-6 py-3 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAddPending ? 'Adding…' : !address ? 'Connect Wallet' : needsApproval ? 'Approve First' : 'Add Liquidity'}
      </button>

      {isApproved && <p className="text-green-400 text-xs text-center">✓ Approval confirmed</p>}
      {isAddSuccess && <p className="text-green-400 text-xs text-center">✓ Liquidity added successfully</p>}
    </div>
  );
}

// ─── Onglet Remove Liquidity ──────────────────────────────────────────────────
function RemoveLiquidityPanel({
  selected,
  poolData,
  address,
  isCorrectChain,
}: {
  selected: SwapStrategy;
  poolData: ReturnType<typeof useSwapPool>;
  address: `0x${string}` | undefined;
  isCorrectChain: boolean;
}) {
  const [percentStr, setPercentStr] = useState('50');
  const shareDecimals = selected.strategy.contracts?.shareDecimals ?? 18;

  const {
    previewHype, previewVaultToken,
    removeLiquidity, isPending, isSuccess, error,
  } = useRemoveLiquidity(
    selected.poolAddress,
    poolData.lpBalance,
    poolData.lpTotalSupply,
    poolData.hypeReserve,
    poolData.vaultTokenReserve,
    percentStr,
    shareDecimals
  );

  useEffect(() => { if (isSuccess) setPercentStr('50'); }, [isSuccess]);

  const hasLp = poolData.lpBalanceFormatted !== undefined && poolData.lpBalanceFormatted > 0;

  if (!hasLp) {
    return (
      <div className="landing-card rounded-xl p-6 text-center">
        <p className="text-[rgba(230,230,230,0.4)] text-sm">Tu n'as pas de LP tokens dans ce pool.</p>
      </div>
    );
  }

  return (
    <div className="landing-card rounded-xl p-6 space-y-5">
      {/* LP balance */}
      <div className="p-4 bg-white/3 border border-[#C9A36A]/15 rounded-xl">
        <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-1">Your LP balance</p>
        <p className="text-[#E6E6E6] text-lg font-mono font-semibold">
          {poolData.lpBalanceFormatted!.toFixed(6)}
          {poolData.lpShare !== undefined && (
            <span className="text-[rgba(230,230,230,0.4)] text-sm ml-2">
              ({(poolData.lpShare * 100).toFixed(2)}% of pool)
            </span>
          )}
        </p>
      </div>

      {/* Percent slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[#E6E6E6] text-sm font-semibold">Amount to remove</label>
          <span className="text-[#C9A36A] text-sm font-semibold">{percentStr}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={percentStr}
          onChange={(e) => setPercentStr(e.target.value)}
          className="w-full accent-[#C9A36A]"
        />
        <div className="relative h-6 mt-1">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => setPercentStr(String(p))}
              style={{
                left: `${p}%`,
                transform: p === 100 ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
              className={`absolute text-xs px-2 py-0.5 rounded transition-colors ${
                percentStr === String(p)
                  ? 'bg-[#C9A36A] text-[#121212] font-semibold'
                  : 'text-[rgba(230,230,230,0.5)] hover:text-[#C9A36A]'
              }`}
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      {(previewHype !== undefined || previewVaultToken !== undefined) && (
        <div className="p-4 bg-white/3 border border-[#C9A36A]/15 rounded-xl">
          <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-3">You will receive</p>
          <div className="flex justify-between">
            <div>
              <p className="text-[rgba(230,230,230,0.4)] text-xs mb-0.5">HYPE</p>
              <p className="text-[#E6E6E6] font-mono text-sm">{previewHype?.toFixed(6) ?? '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[rgba(230,230,230,0.4)] text-xs mb-0.5">{selected.strategy.name}</p>
              <p className="text-[#E6E6E6] font-mono text-sm">{previewVaultToken?.toFixed(6) ?? '—'}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-xs">{error.message}</p>
        </div>
      )}

      <button
        onClick={removeLiquidity}
        disabled={isPending || !address || !isCorrectChain}
        className="w-full px-6 py-3 bg-[#C9A36A] text-[#121212] rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Removing…' : !address ? 'Connect Wallet' : 'Remove Liquidity'}
      </button>

      {isSuccess && <p className="text-green-400 text-xs text-center">✓ Liquidity removed successfully</p>}
    </div>
  );
}

// ─── Contenu principal ────────────────────────────────────────────────────────
function SwapTabContent() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  const searchParams = useSearchParams();
  const { swapStrategies, loading, error } = useSwapStrategies();
  const [selected, setSelected] = useState<SwapStrategy | null>(null);
  const [tab, setTab] = useState<TabId>('swap');

  // Preselect depuis query param
  useEffect(() => {
    const strategyId = searchParams?.get('strategyId');
    if (strategyId && swapStrategies.length > 0 && !selected) {
      const found = swapStrategies.find((s) => s.strategy.id === strategyId);
      if (found) setSelected(found);
    }
  }, [searchParams, swapStrategies, selected]);

  // Reset tab quand on change de pool
  const handleSelect = (s: SwapStrategy) => {
    setSelected(s);
    setTab('swap');
  };

  const poolData = useSwapPool(
    selected?.poolAddress,
    selected?.strategy.contracts?.shareDecimals ?? 18
  );

  // ─── États de chargement / erreur ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(230,230,230,0.5)]">Loading swap pools…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-6">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (swapStrategies.length === 0) {
    return (
      <div className="landing-card rounded-xl p-8 text-center">
        <p className="text-[#C9A36A] font-semibold mb-2">No active swap pools</p>
        <p className="text-[rgba(230,230,230,0.4)] text-sm">
          Aucun pool disponible pour les stratégies configurées.
        </p>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'swap',   label: 'Swap' },
    { id: 'add',    label: 'Add Liquidity' },
    { id: 'remove', label: 'Remove Liquidity' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wrong network banner */}
      {address && !isCorrectChain && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 flex items-center justify-between">
          <p className="text-red-400 text-sm">Wrong network — switch to HyperEVM Testnet (998)</p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Switch
          </button>
        </div>
      )}

      {/* Sélection pool */}
      <StrategySelector strategies={swapStrategies} selected={selected} onSelect={handleSelect} />

      {/* Pool info + onglets */}
      {selected && (
        <>
          <PoolInfoPanel poolData={poolData} selected={selected} />

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-white/5 border border-[#C9A36A]/15 rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? 'bg-[#C9A36A] text-[#121212]'
                    : 'text-[rgba(230,230,230,0.5)] hover:text-[#E6E6E6]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Panneau actif */}
          {tab === 'swap' && (
            <SwapPanel
              selected={selected}
              address={address}
              isCorrectChain={isCorrectChain}
              switchChain={switchChain}
            />
          )}
          {tab === 'add' && (
            <AddLiquidityPanel
              selected={selected}
              poolData={poolData}
              address={address}
              isCorrectChain={isCorrectChain}
            />
          )}
          {tab === 'remove' && (
            <RemoveLiquidityPanel
              selected={selected}
              poolData={poolData}
              address={address}
              isCorrectChain={isCorrectChain}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function DashboardSwapTab() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <p className="text-[rgba(230,230,230,0.5)]">Loading…</p>
        </div>
      }
    >
      <SwapTabContent />
    </Suspense>
  );
}
