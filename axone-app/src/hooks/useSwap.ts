// FIX: swap hypeIn/value consistency + tx toast notifications
import { useMemo, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { swapPool } from '@/contracts/swapContracts';
import type { Strategy } from '@/types/strategy';
import { useTxToasts } from '@/lib/txToasts';

export type SwapDirection = 'HYPE_TO_VAULT' | 'VAULT_TO_HYPE';

interface UseSwapQuoteParams {
  poolAddress?: `0x${string}`;
  strategy?: Strategy | null;
  direction: SwapDirection;
  amountIn: string;
}

export function useSwapQuote({ poolAddress, strategy, direction, amountIn }: UseSwapQuoteParams) {
  const amountInValid = amountIn && Number(amountIn) > 0 && poolAddress && strategy;

  const shareDecimals = strategy?.contracts.shareDecimals ?? 18;
  const hypeDecimals = 18;

  const amountInWei = useMemo(() => {
    if (!amountInValid) return undefined;
    const decimals = direction === 'HYPE_TO_VAULT' ? hypeDecimals : shareDecimals;
    try {
      return parseUnits(amountIn, decimals);
    } catch {
      return undefined;
    }
  }, [amountIn, amountInValid, direction, hypeDecimals, shareDecimals]);

  const { data, isLoading, error } = useReadContract({
    ...(poolAddress ? swapPool(poolAddress) : swapPool('0x0000000000000000000000000000000000000000')),
    functionName: 'getAmountOut',
    args: amountInWei ? [amountInWei, direction === 'HYPE_TO_VAULT'] : undefined,
    query: {
      enabled: !!poolAddress && !!amountInWei,
    },
  });


  const amountOutFormatted = useMemo(() => {
    if (!data || !strategy) return '';
    const decimals = direction === 'HYPE_TO_VAULT' ? shareDecimals : hypeDecimals;
    return formatUnits(data as bigint, decimals);
  }, [data, direction, shareDecimals, hypeDecimals, strategy]);

  return {
    amountOutFormatted,
    amountOutWei: data as bigint | undefined,
    loading: isLoading,
    error: error as Error | null,
  };
}

interface UsePerformSwapParams {
  poolAddress?: `0x${string}`;
  strategy?: Strategy | null;
  direction: SwapDirection;
  amountIn: string;
  amountOutWei?: bigint; // Raw quote from getAmountOut
  slippageBps?: bigint; // Slippage in basis points (default: 100 = 1%)
}

export function usePerformSwap({ poolAddress, strategy, direction, amountIn, amountOutWei, slippageBps = 100n }: UsePerformSwapParams) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: txError } = useWaitForTransactionReceipt({ hash });
  const { showTxToast } = useTxToasts();

  const shareDecimals = strategy?.contracts.shareDecimals ?? 18;
  const hypeDecimals = 18;

  // Show toast on submitted
  useEffect(() => {
    if (hash) {
      showTxToast('submitted', { hash, action: 'Swap' });
    }
  }, [hash, showTxToast]);

  // Show toast on success
  useEffect(() => {
    if (isSuccess && hash) {
      showTxToast('confirmed', { hash, action: 'Swap' });
    }
  }, [isSuccess, hash, showTxToast]);

  // Show toast on error
  useEffect(() => {
    if (writeError || txError) {
      const error = writeError || txError;
      const message = error?.message ?? 'Transaction revert';
      showTxToast('failed', { hash: hash || undefined, error: message, action: 'Swap' });
    }
  }, [writeError, txError, hash, showTxToast]);

  function swap() {
    if (!poolAddress || !address || !amountIn || !strategy) return;

    const decimalsIn = direction === 'HYPE_TO_VAULT' ? hypeDecimals : shareDecimals;

    try {
      const amountInWei = parseUnits(amountIn, decimalsIn);
      
      if (direction === 'HYPE_TO_VAULT') {
        // Swap HYPE -> vault: hypeIn = amountInWei, msg.value = amountInWei
        // The contract expects: swapHypeForVaultToken(uint256 hypeIn, address to)
        // where hypeIn must equal msg.value
        writeContract({
          ...swapPool(poolAddress),
          functionName: 'swapHypeForVaultToken' as const,
          args: [amountInWei, address] as const,
          value: amountInWei, // msg.value must equal hypeIn
        });
      } else {
        // FIX: swapVaultTokenForHype expects (vaultTokenIn, to). No minAmountOut in ABI.
        // Swap vault -> HYPE: requires approval
        // The contract expects: swapVaultTokenForHype(uint256 vaultTokenIn, address to)
        // Note: getAmountOut is used only for display, not as a parameter
        writeContract({
          ...swapPool(poolAddress),
          functionName: 'swapVaultTokenForHype' as const,
          args: [amountInWei, address] as const,
        });
      }
    } catch (err) {
      console.error('[usePerformSwap] Error preparing swap:', err);
    }
  }

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess: isSuccess,
    error: (writeError || txError) as Error | null,
  };
}

