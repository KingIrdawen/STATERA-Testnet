'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useSwapStrategies, type SwapStrategy } from '@/hooks/useSwapStrategies';
import { useSwapQuote, usePerformSwap, type SwapDirection } from '@/hooks/useSwap';
import { useVaultTokenApproval } from '@/hooks/useVaultTokenApproval';
import { SwapStrategyCard } from '@/components/dashboard/SwapStrategyCard';
import { formatUsd } from '@/lib/format';

export function DashboardSwapTab() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  const { swapStrategies, loading, error } = useSwapStrategies();
  const [selected, setSelected] = useState<SwapStrategy | null>(null);
  const [direction, setDirection] = useState<SwapDirection>('HYPE_TO_VAULT');
  const [amountIn, setAmountIn] = useState('');

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
        <p className="text-[#5a9a9a] text-lg">Loading swap pools...</p>
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

  if (swapStrategies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#5a9a9a] text-lg mb-4">No swap pools available</p>
        <p className="text-gray-500 text-sm">No strategies have a swap pool configured yet</p>
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
      <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
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
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
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
                  ? 'bg-[#fab062] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              HYPE → Vault
            </button>
            <button
              onClick={() => {
                setDirection('VAULT_TO_HYPE');
                setAmountIn(''); // Reset amount when changing direction
              }}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                direction === 'VAULT_TO_HYPE'
                  ? 'bg-[#fab062] text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Vault → HYPE
            </button>
          </div>

          {/* Amount input */}
          <div className="mb-4">
            <label className="block text-white text-sm font-semibold mb-2">
              Amount In ({direction === 'HYPE_TO_VAULT' ? 'HYPE' : 'Vault Shares'})
            </label>
            <input
              type="number"
              step="0.0001"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Quote output */}
          {quote.amountOutFormatted && (
            <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-400 text-xs mb-1">Estimated Output</p>
              <p className="text-white text-lg font-semibold">
                {quote.amountOutFormatted} {direction === 'HYPE_TO_VAULT' ? 'Vault Shares' : 'HYPE'}
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
                  : 'Approve Vault Tokens'}
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
            className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

