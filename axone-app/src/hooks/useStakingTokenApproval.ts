import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import { lpTokenAbi } from '@/lib/abi/lpToken';
import { REWARDS_HUB_ADDRESS } from '@/contracts/rewardsHub';
import { useTxToasts } from '@/lib/txToasts';
import { useEffect } from 'react';

/**
 * Hook to check allowance and approve stake tokens for RewardsHub
 */
export function useStakingTokenApproval(
  stakeTokenAddress: `0x${string}` | undefined,
  amountIn: string,
  decimals: number = 18
) {
  const { address } = useAccount();
  const { showTxToast } = useTxToasts();

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stakeTokenAddress,
    abi: lpTokenAbi,
    functionName: 'allowance',
    args: stakeTokenAddress && address && REWARDS_HUB_ADDRESS ? [address, REWARDS_HUB_ADDRESS] : undefined,
    query: {
      enabled: !!stakeTokenAddress && !!address && !!REWARDS_HUB_ADDRESS,
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
      showTxToast('submitted', { hash: approveHash, action: 'Approbation token staking' });
    }
  }, [approveHash, showTxToast]);

  // Show toast on success
  useEffect(() => {
    if (isApproved && approveHash) {
      showTxToast('confirmed', { hash: approveHash, action: 'Approbation token staking' });
      refetchAllowance();
    }
  }, [isApproved, approveHash, showTxToast, refetchAllowance]);

  // Show toast on error
  useEffect(() => {
    if (approveError && approveHash) {
      const error = approveError as Error | { message?: string } | null;
      const message = (error && 'message' in error ? error.message : String(approveError)) || 'Approbation échouée';
      showTxToast('failed', { hash: approveHash, error: message, action: 'Approbation token staking' });
    }
  }, [approveError, approveHash, showTxToast]);

  const amountInWei = amountIn && Number(amountIn) > 0 && decimals
    ? parseUnits(amountIn, decimals)
    : 0n;

  const needsApproval = allowance !== undefined && amountInWei > 0n && allowance < amountInWei;

  const approve = () => {
    if (!stakeTokenAddress || !REWARDS_HUB_ADDRESS) {
      console.error('[useStakingTokenApproval] Missing stake token address or RewardsHub address');
      return;
    }
    // Approve max amount for convenience
    writeContract({
      address: stakeTokenAddress,
      abi: lpTokenAbi,
      functionName: 'approve',
      args: [REWARDS_HUB_ADDRESS, maxUint256],
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


