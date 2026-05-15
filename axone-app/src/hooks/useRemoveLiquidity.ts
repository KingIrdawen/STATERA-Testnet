/**
 * Hook pour retirer de la liquidité d'un SwapPool.
 * Flow :
 *   1. User choisit % de ses LP tokens à retirer
 *   2. removeLiquidity(lpAmount, userAddress)
 */
import { useEffect, useMemo } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits, formatUnits } from 'viem';
import { swapPool } from '@/contracts/swapContracts';
import { useToast } from '@/components/Toast';

export function useRemoveLiquidity(
  poolAddress: `0x${string}` | undefined,
  lpBalance: bigint | undefined,
  lpTotalSupply: bigint | undefined,
  hypeReserve: bigint | undefined,
  vaultTokenReserve: bigint | undefined,
  percentStr: string,       // "50" = 50%, "100" = tout retirer
  shareDecimals = 18
) {
  const { address } = useAccount();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const percent = Math.max(0, Math.min(100, parseFloat(percentStr) || 0));

  // Montant LP à retirer
  const lpAmountWei = useMemo(() => {
    if (!lpBalance || percent <= 0) return 0n;
    return (lpBalance * BigInt(Math.round(percent * 100))) / 10000n;
  }, [lpBalance, percent]);

  // Preview : HYPE + vault token récupérables
  const previewHype = useMemo(() => {
    if (!lpAmountWei || !lpTotalSupply || lpTotalSupply === 0n || !hypeReserve) return undefined;
    const raw = (hypeReserve * lpAmountWei) / lpTotalSupply;
    return Number(formatUnits(raw, 18));
  }, [lpAmountWei, lpTotalSupply, hypeReserve]);

  const previewVaultToken = useMemo(() => {
    if (!lpAmountWei || !lpTotalSupply || lpTotalSupply === 0n || !vaultTokenReserve) return undefined;
    const raw = (vaultTokenReserve * lpAmountWei) / lpTotalSupply;
    return Number(formatUnits(raw, shareDecimals));
  }, [lpAmountWei, lpTotalSupply, vaultTokenReserve, shareDecimals]);

  // Transaction
  const {
    writeContract,
    data: removeHash,
    isPending: isRemovePending,
    error: removeWriteError,
  } = useWriteContract();

  const { isLoading: isRemoveConfirming, isSuccess: isRemoveSuccess } =
    useWaitForTransactionReceipt({ hash: removeHash });

  useEffect(() => {
    if (isRemoveSuccess && removeHash) {
      showToast('success', 'Liquidité retirée', removeHash);
      queryClient.invalidateQueries();
    }
  }, [isRemoveSuccess, removeHash, showToast, queryClient]);

  useEffect(() => {
    if (removeWriteError) {
      const msg = (removeWriteError as Error)?.message ?? 'Erreur';
      showToast('error', `Remove liquidity échoué: ${msg}`);
    }
  }, [removeWriteError, showToast]);

  const removeLiquidity = () => {
    if (!poolAddress || !address || lpAmountWei === 0n) return;
    writeContract({
      ...swapPool(poolAddress),
      functionName: 'removeLiquidity' as const,
      args: [lpAmountWei, address] as const,
    });
  };

  return {
    lpAmountWei,
    lpAmountFormatted: lpAmountWei ? Number(formatUnits(lpAmountWei, 18)) : 0,
    previewHype,
    previewVaultToken,
    removeLiquidity,
    isPending: isRemovePending || isRemoveConfirming,
    isSuccess: isRemoveSuccess,
    removeHash,
    error: removeWriteError as Error | null,
  };
}
