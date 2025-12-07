// FIX: swap minOut calculation - use raw bigint from quote with slippage instead of formatted string
import { useMemo, useEffect } from 'react';
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

  // Debug logging for quote (temporary - remove after validation)
  useEffect(() => {
    if (amountInWei && poolAddress && data) {
      console.log('[SwapDebug] getAmountOut result', {
        poolAddress,
        amountInWei: amountInWei.toString(),
        hypeIn: direction === 'HYPE_TO_VAULT',
        amountOutWei: (data as bigint).toString(),
        direction,
      });
    }
  }, [amountInWei, poolAddress, data, direction]);

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
  const { isLoading: isConfirming, error: txError } = useWaitForTransactionReceipt({ hash });

  const shareDecimals = strategy?.contracts.shareDecimals ?? 18;
  const hypeDecimals = 18;

  function swap() {
    if (!poolAddress || !address || !amountIn || !strategy) return;

    const decimalsIn = direction === 'HYPE_TO_VAULT' ? hypeDecimals : shareDecimals;

    try {
      const amountInWei = parseUnits(amountIn, decimalsIn);
      
      // Calculate minAmountOut with slippage protection
      let minOutWei: bigint;
      if (amountOutWei && amountOutWei > 0n) {
        // Apply slippage: minOut = amountOut * (10000 - slippageBps) / 10000
        minOutWei = (amountOutWei * (10_000n - slippageBps)) / 10_000n;
      } else {
        // No quote available - use 0 (no slippage protection) for debugging
        // TODO: In production, should prevent swap or show error
        console.warn('[usePerformSwap] No quote available, using minOut = 0 (no slippage protection)');
        minOutWei = 0n;
      }

      // Debug logging
      console.log('[SwapDebug] Preparing swap', {
        poolAddress,
        direction,
        amountIn,
        amountInWei: amountInWei.toString(),
        amountOutWei: amountOutWei?.toString() || 'undefined',
        minOutWei: minOutWei.toString(),
        slippageBps: slippageBps.toString(),
        recipient: address,
        willCallFunction: direction === 'HYPE_TO_VAULT' ? 'swapHypeForVaultToken' : 'swapVaultTokenForHype',
        willSendValue: direction === 'HYPE_TO_VAULT' ? amountInWei.toString() : '0',
      });

      if (direction === 'HYPE_TO_VAULT') {
        // Swap HYPE -> vault, native value
        const contractCall = {
          ...swapPool(poolAddress),
          functionName: 'swapHypeForVaultToken' as const,
          args: [minOutWei, address] as const,
          value: amountInWei,
        };
        console.log('[SwapDebug] Calling swapHypeForVaultToken with:', {
          poolAddress,
          minOutWei: minOutWei.toString(),
          recipient: address,
          value: amountInWei.toString(),
        });
        writeContract(contractCall);
      } else {
        // Swap vault -> HYPE
        const contractCall = {
          ...swapPool(poolAddress),
          functionName: 'swapVaultTokenForHype' as const,
          args: [amountInWei, minOutWei, address] as const,
        };
        console.log('[SwapDebug] Calling swapVaultTokenForHype with:', {
          poolAddress,
          amountInWei: amountInWei.toString(),
          minOutWei: minOutWei.toString(),
          recipient: address,
          value: '0 (not payable)',
        });
        writeContract(contractCall);
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

