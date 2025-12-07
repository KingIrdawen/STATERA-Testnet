'use client';

import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useSwapStrategies, type SwapStrategy } from '@/hooks/useSwapStrategies';
import { useSwapQuote, usePerformSwap, type SwapDirection } from '@/hooks/useSwap';
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
    minOut: quote.amountOutFormatted,
  });

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

      {/* Strategy selection */}
      <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
        <label className="block text-white text-sm font-semibold mb-2">Select Strategy</label>
        <select
          value={selected?.strategy.id || ''}
          onChange={(e) => {
            const strategy = swapStrategies.find(s => s.strategy.id === e.target.value);
            setSelected(strategy || null);
            setAmountIn(''); // Reset amount when changing strategy
          }}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-[#fab062] focus:outline-none"
        >
          <option value="">-- Select a strategy --</option>
          {swapStrategies.map((swapStrategy) => (
            <option key={swapStrategy.strategy.id} value={swapStrategy.strategy.id}>
              {swapStrategy.strategy.name}
            </option>
          ))}
        </select>

        {selected && (
          <div className="mt-4 space-y-2">
            <p className="text-[#5a9a9a] text-sm">
              <span className="text-gray-400">Pool address: </span>
              <span className="font-mono text-xs">{selected.poolAddress.slice(0, 6)}...{selected.poolAddress.slice(-4)}</span>
            </p>
            {selected.strategy.description && (
              <p className="text-[#5a9a9a] text-sm">{selected.strategy.description}</p>
            )}
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

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={
              isPending ||
              isConfirming ||
              !amountIn ||
              parseFloat(amountIn) <= 0 ||
              !quote.amountOutFormatted ||
              !address ||
              !isCorrectChain
            }
            className="w-full px-6 py-3 bg-[#fab062] text-black rounded-lg text-sm font-semibold hover:bg-[#e89a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending || isConfirming
              ? 'Processing...'
              : !address
              ? 'Connect Wallet'
              : !isCorrectChain
              ? 'Switch Network'
              : 'Swap'}
          </button>

          {direction === 'VAULT_TO_HYPE' && (
            <p className="mt-3 text-yellow-400 text-xs text-center">
              ⚠️ Make sure you have approved the pool to spend your vault tokens
            </p>
          )}
        </div>
      )}
    </div>
  );
}

