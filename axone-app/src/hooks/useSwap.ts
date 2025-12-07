import { useMemo } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { swapPool } from '@/contracts/swapContracts';
import type { Strategy } from '@/types/strategy';

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
    loading: isLoading,
    error: error as Error | null,
  };
}

interface UsePerformSwapParams {
  poolAddress?: `0x${string}`;
  strategy?: Strategy | null;
  direction: SwapDirection;
  amountIn: string;
  minOut?: string;
}

export function usePerformSwap({ poolAddress, strategy, direction, amountIn, minOut }: UsePerformSwapParams) {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, error: txError } = useWaitForTransactionReceipt({ hash });

  const shareDecimals = strategy?.contracts.shareDecimals ?? 18;
  const hypeDecimals = 18;

  function swap() {
    if (!poolAddress || !address || !amountIn || !strategy) return;

    const decimalsIn = direction === 'HYPE_TO_VAULT' ? hypeDecimals : shareDecimals;
    const decimalsOut = direction === 'HYPE_TO_VAULT' ? shareDecimals : hypeDecimals;

    try {
      const amountInWei = parseUnits(amountIn, decimalsIn);
      const minOutWei = minOut ? parseUnits(minOut, decimalsOut) : 0n;

      if (direction === 'HYPE_TO_VAULT') {
        // Swap HYPE -> vault, native value
        writeContract({
          ...swapPool(poolAddress),
          functionName: 'swapHypeForVaultToken',
          args: [minOutWei, address],
          value: amountInWei,
        });
      } else {
        // Swap vault -> HYPE
        writeContract({
          ...swapPool(poolAddress),
          functionName: 'swapVaultTokenForHype',
          args: [amountInWei, minOutWei, address],
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
    isSuccess: !!hash && !isPending && !isConfirming && !txError,
    error: (writeError || txError) as Error | null,
  };
}

