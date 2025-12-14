// FIX: Add approval check and approve function for VAULT_TO_HYPE swaps
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { lpTokenAbi } from '@/lib/abi/lpToken';
import { useTxToasts } from '@/lib/txToasts';
import { useEffect } from 'react';

/**
 * Hook to check allowance and approve vault tokens for swap pool
 * Used for VAULT_TO_HYPE swaps
 */
export function useVaultTokenApproval(
  strategy: Strategy | null,
  poolAddress: `0x${string}` | undefined,
  amountIn: string
) {
  const { address } = useAccount();
  const { showTxToast } = useTxToasts();
  const contracts = strategy ? getStrategyContracts(strategy) : null;
  const vaultAddress = contracts?.vault.address;

  const shareDecimals = strategy?.contracts.shareDecimals ?? 18;

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: vaultAddress,
    abi: lpTokenAbi,
    functionName: 'allowance',
    args: poolAddress && address && vaultAddress ? [address, poolAddress] : undefined,
    query: {
      enabled: !!poolAddress && !!address && !!vaultAddress && !!strategy,
    },
  });

  // Approve transaction
  const { writeContract, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
  const { isLoading: isConfirmingApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Show toast on submitted
  useEffect(() => {
    if (approveHash) {
      showTxToast('submitted', { hash: approveHash, action: 'Approbation token vault' });
    }
  }, [approveHash, showTxToast]);

  // Show toast on success
  useEffect(() => {
    if (isApproved && approveHash) {
      showTxToast('confirmed', { hash: approveHash, action: 'Approbation token vault' });
      refetchAllowance();
    }
  }, [isApproved, approveHash, showTxToast, refetchAllowance]);

  // Show toast on error
  useEffect(() => {
    if (approveError && approveHash) {
      const error = approveError as Error | { message?: string } | null;
      const message = (error && 'message' in error ? error.message : String(approveError)) || 'Approbation échouée';
      showTxToast('failed', { hash: approveHash, error: message, action: 'Approbation token vault' });
    }
  }, [approveError, approveHash, showTxToast]);

  const amountInWei = amountIn && Number(amountIn) > 0 && shareDecimals
    ? parseUnits(amountIn, shareDecimals)
    : 0n;

  const needsApproval = allowance !== undefined && amountInWei > 0n && allowance < amountInWei;

  const approve = () => {
    if (!vaultAddress || !poolAddress) {
      console.error('[useVaultTokenApproval] Missing vault address or pool address');
      return;
    }
    // Approve max amount for convenience
    writeContract({
      address: vaultAddress,
      abi: lpTokenAbi,
      functionName: 'approve',
      args: [poolAddress, maxUint256],
    });
  };

  return {
    allowance,
    needsApproval,
    approve,
    isApproving: isApproving || isConfirmingApproval,
    isApproved,
    approveError,
  };
}

