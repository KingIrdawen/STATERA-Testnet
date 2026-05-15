/**
 * Hook pour ajouter de la liquidité dans un SwapPool.
 * Flow :
 *   1. Approve vault token pour le pool (si nécessaire)
 *   2. addLiquidity{value: hypeAmount}(hypeAmount, vaultTokenAmount)
 */
import { useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits, maxUint256 } from 'viem';
import { swapPool } from '@/contracts/swapContracts';
import { lpTokenAbi } from '@/lib/abi/lpToken';
import { useToast } from '@/components/Toast';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';

export function useAddLiquidity(
  strategy: Strategy | null,
  poolAddress: `0x${string}` | undefined,
  hypeAmountStr: string,
  vaultAmountStr: string
) {
  const { address } = useAccount();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const contracts = strategy ? getStrategyContracts(strategy) : null;
  const vaultAddress = contracts?.vault.address;
  const shareDecimals = strategy?.contracts.shareDecimals ?? 18;

  // ─── Approval du vault token ─────────────────────────────────────────────
  const vaultAmountWei = useMemo(() => {
    if (!vaultAmountStr || Number(vaultAmountStr) <= 0) return 0n;
    try { return parseUnits(vaultAmountStr, shareDecimals); } catch { return 0n; }
  }, [vaultAmountStr, shareDecimals]);

  const hypeAmountWei = useMemo(() => {
    if (!hypeAmountStr || Number(hypeAmountStr) <= 0) return 0n;
    try { return parseUnits(hypeAmountStr, 18); } catch { return 0n; }
  }, [hypeAmountStr]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: vaultAddress,
    abi: lpTokenAbi,
    functionName: 'allowance',
    args: poolAddress && address && vaultAddress ? [address, poolAddress] : undefined,
    query: { enabled: !!poolAddress && !!address && !!vaultAddress },
  });

  const needsApproval = allowance !== undefined && vaultAmountWei > 0n && allowance < vaultAmountWei;

  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveWriteError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    if (isApproved && approveHash) {
      showToast('success', 'Approbation confirmée', approveHash);
      refetchAllowance();
    }
  }, [isApproved, approveHash, showToast, refetchAllowance]);

  const approve = () => {
    if (!vaultAddress || !poolAddress) return;
    writeApprove({ address: vaultAddress, abi: lpTokenAbi, functionName: 'approve', args: [poolAddress, maxUint256] });
  };

  // ─── Add Liquidity ───────────────────────────────────────────────────────
  const {
    writeContract: writeAdd,
    data: addHash,
    isPending: isAddPending,
    error: addWriteError,
  } = useWriteContract();

  const { isLoading: isAddConfirming, isSuccess: isAddSuccess } = useWaitForTransactionReceipt({ hash: addHash });

  useEffect(() => {
    if (isAddSuccess && addHash) {
      showToast('success', 'Liquidité ajoutée', addHash);
      // Invalide tout le cache on-chain pour rafraîchir la balance LP immédiatement
      queryClient.invalidateQueries();
    }
  }, [isAddSuccess, addHash, showToast, queryClient]);

  useEffect(() => {
    if (addWriteError) {
      const msg = (addWriteError as Error)?.message ?? 'Erreur';
      showToast('error', `Add liquidity échoué: ${msg}`);
    }
  }, [addWriteError, showToast]);

  const addLiquidity = () => {
    if (!poolAddress || !address || hypeAmountWei === 0n || vaultAmountWei === 0n) return;
    writeAdd({
      ...swapPool(poolAddress),
      functionName: 'addLiquidity' as const,
      args: [hypeAmountWei, vaultAmountWei] as const,
      value: hypeAmountWei,
    });
  };

  return {
    needsApproval,
    approve,
    isApproving: isApprovePending || isApproveConfirming,
    isApproved,
    approveError: approveWriteError as Error | null,
    addLiquidity,
    isAddPending: isAddPending || isAddConfirming,
    isAddSuccess,
    addHash,
    addError: addWriteError as Error | null,
    hypeAmountWei,
    vaultAmountWei,
  };
}
