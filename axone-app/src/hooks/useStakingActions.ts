import { useAccount } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import { rewardsHubContract, REWARDS_HUB_ADDRESS } from '@/contracts/rewardsHub';
import { lpTokenAbi } from '@/lib/abi/lpToken';
import { useToast } from '@/components/Toast';
import { useEffect } from 'react';

export function useStakingActions() {
  const { address } = useAccount();
  const { showToast } = useToast();

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, error: txError } = useWaitForTransactionReceipt({
    hash,
  });

  // Show toast on success
  useEffect(() => {
    if (isSuccess && hash) {
      const shortHash = `${hash.slice(0, 6)}...${hash.slice(-4)}`;
      showToast('success', 'Transaction confirmée', hash);
    }
  }, [isSuccess, hash, showToast]);

  // Show toast on error
  useEffect(() => {
    if (writeError || txError) {
      const error = writeError || txError;
      const message = error?.message ?? 'Transaction revert';
      showToast('error', message, hash || undefined);
    }
  }, [writeError, txError, hash, showToast]);

  const deposit = async (pid: number, amount: string, stakeTokenAddress: `0x${string}`, decimals: number = 18) => {
    if (!REWARDS_HUB_ADDRESS || !address) {
      throw new Error('RewardsHub not configured or wallet not connected');
    }

    const amountWei = parseUnits(amount, decimals);

    writeContract({
      ...rewardsHubContract(),
      functionName: 'deposit',
      args: [BigInt(pid), amountWei],
    });
  };

  const unstake = async (pid: number, amount: string, decimals: number = 18) => {
    if (!REWARDS_HUB_ADDRESS || !address) {
      throw new Error('RewardsHub not configured or wallet not connected');
    }

    const amountWei = parseUnits(amount, decimals);

    writeContract({
      ...rewardsHubContract(),
      functionName: 'withdraw',
      args: [BigInt(pid), amountWei],
    });
  };

  const harvest = async (pid: number) => {
    if (!REWARDS_HUB_ADDRESS || !address) {
      throw new Error('RewardsHub not configured or wallet not connected');
    }

    writeContract({
      ...rewardsHubContract(),
      functionName: 'harvest',
      args: [BigInt(pid), address],
    });
  };

  const emergencyWithdraw = async (pid: number) => {
    if (!REWARDS_HUB_ADDRESS || !address) {
      throw new Error('RewardsHub not configured or wallet not connected');
    }

    writeContract({
      ...rewardsHubContract(),
      functionName: 'emergencyWithdraw',
      args: [BigInt(pid)],
    });
  };

  return {
    deposit,
    unstake,
    harvest,
    emergencyWithdraw,
    isPending,
    isConfirming,
    isSuccess,
    lastTxHash: hash,
    error: (writeError || txError) as Error | null,
  };
}

