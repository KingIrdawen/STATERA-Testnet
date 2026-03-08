'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccount, useChainId, useSwitchChain, useBalance, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { useSwapStrategies, type SwapStrategy } from '@/hooks/useSwapStrategies';
import { useSwapQuote, usePerformSwap, type SwapDirection } from '@/hooks/useSwap';
import { useVaultTokenApproval } from '@/hooks/useVaultTokenApproval';
import { SwapStrategyCard } from '@/components/dashboard/SwapStrategyCard';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { formatUsd } from '@/lib/format';
import { DEMO_SWAP_STRATEGIES } from '@/lib/placeholders';

function SwapTabContent() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  const searchParams = useSearchParams();
  const { swapStrategies, loading, error } = useSwapStrategies();
  const [selected, setSelected] = useState<SwapStrategy | null>(null);
  const [direction, setDirection] = useState<SwapDirection>('HYPE_TO_VAULT');
  const [amountIn, setAmountIn] = useState('');

  // Preselect strategy from query param
  useEffect(() => {
    const strategyId = searchParams?.get('strategyId');
    if (strategyId && swapStrategies.length > 0 && !selected) {
      const found = swapStrategies.find(s => s.strategy.id === strategyId);
      if (found) {
        setSelected(found);
      }
    }
  }, [searchParams, swapStrategies, selected]);

  const quote = useSwapQuote({
    poolAddress: selected?.poolAddress,
    strategy: selected?.strategy,
    direction,
    amountIn,
  });

  const { swap, isPending, isConfirming, isSuccess, error: swapError } = usePerformSwap({
    poolAddress: selected?.poolAddress,
    strategy: selected?.strategy,
    direction,
    amountIn,
    amountOutWei: quote.amountOutWei,
    slippageBps: 100n, // 1% slippage
  });

  // Check approval for VAULT_TO_HYPE swaps
  const { needsApproval, approve, isApproving, isApproved, approveError } = useVaultTokenApproval(
    selected?.strategy || null,
    selected?.poolAddress,
    direction === 'VAULT_TO_HYPE' ? amountIn : ''
  );

  // Get wallet balance for HYPE (native token)
  const { data: hypeBalance } = useBalance({
    address,
    query: { enabled: !!address && isCorrectChain && direction === 'HYPE_TO_VAULT' },
  });

  // Get vault token balance for VAULT_TO_HYPE direction
  const vaultContracts = selected?.strategy ? getStrategyContracts(selected.strategy) : null;
  const shareDecimals = selected?.strategy?.contracts?.shareDecimals ?? 18;
  const { data: vaultTokenBalanceRaw } = useReadContract({
    ...vaultContracts?.vault,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!selected && !!vaultContracts && isCorrectChain && direction === 'VAULT_TO_HYPE',
    },
  });

  // Determine available balance based on direction
  const availableBalance = direction === 'HYPE_TO_VAULT'
    ? (hypeBalance ? Number(formatUnits(hypeBalance.value, 18)) : 0)
    : (vaultTokenBalanceRaw && typeof vaultTokenBalanceRaw === 'bigint' 
        ? Number(formatUnits(vaultTokenBalanceRaw, shareDecimals)) 
        : 0);

  // Reset form on success
  useEffect(() => {
    if (isSuccess && amountIn) {
      setAmountIn('');
    }
  }, [isSuccess, amountIn]);

  const handleSwap = () => {
    if (!isCorrectChain) {
      switchChain({ chainId: EXPECTED_CHAIN_ID });
      return;
    }
    swap();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgba(230,230,230,0.5)] text-lg">Loading swap pools...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
        <p className="text-red-400 text-sm">{error}</p>
        {error.includes('NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS') && (
          <p className="text-red-300 text-xs mt-2">
            Please configure NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS in your environment variables.
          </p>
        )}
      </div>
    );
  }

  // ⚠️  PLACEHOLDER — Mode démo quand aucun pool configuré
  if (swapStrategies.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Banner démo */}
        <div className="bg-[#C9A36A]/8 border border-[#C9A36A]/20 rounded-xl p-4 text-center">
          <p className="text-[#C9A36A]/80 text-xs tracking-[0.1em] uppercase font-semibold mb-1">Demo Mode</p>
          <p className="text-[rgba(230,230,230,0.5)] text-sm">
            {/* ⚠️  PLACEHOLDER — Pools de swap fictifs. À remplacer par les vrais pools quand le contrat SwapPoolFactory est déployé. */}
            Showing placeholder swap pools — live data available after contract deployment.
          </p>
        </div>

        {/* Sélection stratégie démo */}
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.5)] mb-4">Select Strategy</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_SWAP_STRATEGIES.map((pool, i) => (
              <div
                key={pool.id}
                className={`p-4 rounded-xl border cursor-default transition-colors duration-200 ${
                  i === 0
                    ? 'border-[#C9A36A]/35 bg-[#C9A36A]/8'
                    : 'border-[#C9A36A]/15 bg-white/3 hover:border-[#C9A36A]/25'
                }`}
              >
                <p className="text-[#C9A36A] font-semibold text-sm mb-1">{pool.strategyName}</p>
                <p className="text-[rgba(230,230,230,0.4)] text-xs">{pool.description}</p>
                <div className="flex justify-between mt-3">
                  <span className="text-[0.6rem] text-[rgba(230,230,230,0.3)] uppercase tracking-wide">Liquidity</span>
                  <span className="text-[0.7rem] text-[#E6E6E6] font-mono">${pool.liquidity.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire démo (premier pool pré-sélectionné) */}
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-xl p-6">
          <div className="flex gap-2 mb-5">
            <div className="flex-1 px-4 py-2 rounded-lg bg-[#C9A36A] text-[#121212] text-sm font-semibold text-center">
              HYPE → ERA
            </div>
            <div className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-[rgba(230,230,230,0.4)] text-sm font-semibold text-center border border-[#C9A36A]/15">
              ERA → HYPE
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[#E6E6E6] text-sm font-semibold">Amount (HYPE)</label>
              <span className="text-[rgba(230,230,230,0.4)] text-xs">Balance: — HYPE</span>
            </div>
            <input
              type="number"
              placeholder="0.0"
              disabled
              className="w-full px-4 py-2 bg-white/5 border border-[#C9A36A]/20 rounded-lg text-[rgba(230,230,230,0.4)] focus:outline-none [appearance:textfield] cursor-not-allowed"
            />
          </div>

          {/* Quote démo */}
          <div className="mb-5 p-4 bg-white/3 border border-[#C9A36A]/15 rounded-xl">
            <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(230,230,230,0.4)] mb-2">
              {/* ⚠️  PLACEHOLDER — Taux de change démo */}
              Estimated Output
            </p>
            <p className="text-[#E6E6E6] text-lg font-semibold font-mono">
              ≈ {DEMO_SWAP_STRATEGIES[0].priceHypeToVault.toFixed(4)} ERA shares / HYPE
            </p>
            <div className="flex justify-between mt-2">
              <span className="text-[0.6rem] text-[rgba(230,230,230,0.3)]">Vol. 24h</span>
              <span className="text-[0.7rem] text-[rgba(230,230,230,0.4)] font-mono">${DEMO_SWAP_STRATEGIES[0].volume24h.toLocaleString()}</span>
            </div>
          </div>

          <button
            disabled
            className="w-full px-6 py-3 bg-[#C9A36A]/30 text-[#C9A36A]/50 rounded-lg text-sm font-semibold cursor-not-allowed"
          >
            Connect Wallet to Swap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">Swap</h3>

      {/* Network warning */}
      {address && !isCorrectChain && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <p className="text-red-400 text-sm mb-2">Wrong network. Please switch to Chain ID {EXPECTED_CHAIN_ID}</p>
          <button
            onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Switch Network
          </button>
        </div>
      )}

      {/* Strategy selection - Cards grid */}
      <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6">
        <label className="block text-white text-sm font-semibold mb-4">Select Strategy</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {swapStrategies.map((swapStrategy) => (
            <SwapStrategyCard
              key={swapStrategy.strategy.id}
              strategy={swapStrategy.strategy}
              poolAddress={swapStrategy.poolAddress}
              isSelected={selected?.strategy.id === swapStrategy.strategy.id}
              onClick={() => {
                setSelected(swapStrategy);
                setAmountIn(''); // Reset amount when changing strategy
              }}
            />
          ))}
        </div>

        {selected && selected.strategy.description && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-[#5a9a9a] text-sm">{selected.strategy.description}</p>
          </div>
        )}
      </div>

      {/* Swap form */}
      {selected && (
        <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6">
          <h4 className="text-lg font-bold text-white mb-4">Swap</h4>

          {/* Direction toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setDirection('HYPE_TO_VAULT');
                setAmountIn(''); // Reset amount when changing direction
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                direction === 'HYPE_TO_VAULT'
                  ? 'bg-[#C9A36A] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              HYPE → ERA
            </button>
            <button
              onClick={() => {
                setDirection('VAULT_TO_HYPE');
                setAmountIn(''); // Reset amount when changing direction
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                direction === 'VAULT_TO_HYPE'
                  ? 'bg-[#C9A36A] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              ERA → HYPE
            </button>
          </div>

          {/* Amount input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white text-sm font-semibold">
                Amount ({direction === 'HYPE_TO_VAULT' ? 'HYPE' : 'ERA Shares'})
              </label>
              {address && isCorrectChain && availableBalance > 0 && (
                <span className="text-gray-400 text-xs">
                  Available: {availableBalance.toFixed(6)}
                </span>
              )}
            </div>
            <input
              type="number"
              step="0.0001"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#C9A36A] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Quote output */}
          {quote.amountOutFormatted && (
            <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Estimated Output</p>
              <p className="text-white text-lg font-semibold">
                {quote.amountOutFormatted} {direction === 'HYPE_TO_VAULT' ? 'ERA Shares' : 'HYPE'}
              </p>
              {quote.loading && (
                <p className="text-[#5a9a9a] text-xs mt-1">Calculating...</p>
              )}
            </div>
          )}

          {/* Error messages */}
          {quote.error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <p className="text-red-400 text-xs">Quote error: {quote.error.message}</p>
            </div>
          )}

          {swapError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
              <p className="text-red-400 text-xs">Swap error: {swapError.message}</p>
            </div>
          )}

          {/* Error if no quote available */}
          {amountIn && parseFloat(amountIn) > 0 && !quote.loading && !quote.amountOutFormatted && !quote.error && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-yellow-400 text-xs">
                Impossible de calculer la sortie. Vérifiez la liquidité du pool ou réessayez.
              </p>
            </div>
          )}

          {/* Approval button for VAULT_TO_HYPE */}
          {direction === 'VAULT_TO_HYPE' && needsApproval && (
            <div className="mb-4">
              <button
                onClick={approve}
                disabled={isApproving || !address || !isCorrectChain}
                className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApproving
                  ? 'Approving...'
                  : !address
                  ? 'Connect Wallet'
                  : !isCorrectChain
                  ? 'Switch Network'
                  : 'Approve ERA Tokens'}
              </button>
              {approveError && (
                <p className="text-red-400 text-xs mt-2 text-center">
                  Approval error: {approveError.message}
                </p>
              )}
              {isApproved && (
                <p className="text-green-400 text-xs mt-2 text-center">
                  ✓ Approval successful! You can now swap.
                </p>
              )}
            </div>
          )}

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={
              isPending ||
              isConfirming ||
              !amountIn ||
              parseFloat(amountIn) <= 0 ||
              !quote.amountOutFormatted ||
              !quote.amountOutWei ||
              quote.amountOutWei === 0n ||
              !address ||
              !isCorrectChain ||
              (direction === 'VAULT_TO_HYPE' && needsApproval)
            }
            className="w-full px-6 py-3 bg-[#C9A36A] text-black rounded-lg text-sm font-semibold hover:bg-[#b8935f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming
              ? 'Processing...'
              : !address
              ? 'Connect Wallet'
              : !isCorrectChain
              ? 'Switch Network'
              : !quote.amountOutFormatted
              ? 'Calculating...'
              : direction === 'VAULT_TO_HYPE' && needsApproval
              ? 'Approve First'
              : 'Swap'}
          </button>

          {direction === 'VAULT_TO_HYPE' && !needsApproval && (
            <p className="mt-3 text-green-400 text-xs text-center">
              ✓ Pool approved to spend your vault tokens
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function DashboardSwapTab() {
  return (
    <Suspense fallback={<div className="text-center py-12"><p className="text-[rgba(230,230,230,0.5)] text-lg">Loading...</p></div>}>
      <SwapTabContent />
    </Suspense>
  );
}

