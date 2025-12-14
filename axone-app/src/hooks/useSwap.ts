import { useMemo, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { swapPool } from '@/contracts/swapContracts';
import type { Strategy } from '@/types/strategy';
import { useToast } from '@/components/Toast';

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
  const { showToast } = useToast();

  const shareDecimals = strategy?.contracts.shareDecimals ?? 18;
  const hypeDecimals = 18;

  // Show single toast on final outcome only
  useEffect(() => {
    if (isSuccess && hash) {
      showToast('success', 'Swap confirmé', hash);
    }
  }, [isSuccess, hash, showToast]);

  useEffect(() => {
    if ((writeError || txError) && hash) {
      const error = writeError || txError;
      const message = error?.message ?? 'Transaction revert';
      showToast('error', `Swap échoué: ${message}`, hash);
    }
  }, [writeError, txError, hash, showToast]);

  function swap() {
    if (!poolAddress || !address || !amountIn || !strategy) return;

    const decimalsIn = direction === 'HYPE_TO_VAULT' ? hypeDecimals : shareDecimals;

    try {
      const amountInWei = parseUnits(amountIn, decimalsIn);
      
      if (direction === 'HYPE_TO_VAULT') {
        // Swap HYPE -> vault: hypeIn = amountInWei, msg.value = amountInWei
        writeContract({
          ...swapPool(poolAddress),
          functionName: 'swapHypeForVaultToken' as const,
          args: [amountInWei, address] as const,
          value: amountInWei, // msg.value must equal hypeIn
        });
      } else {
        // Swap vault -> HYPE: requires approval
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
