/**
 * Generic hook for depositing into an ERA strategy
 */
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';

export function useStrategyDeposit(strategy: Strategy | null) {
  const contracts = strategy ? getStrategyContracts(strategy) : null;

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const deposit = async (amount: string) => {
    if (!strategy || !contracts) {
      throw new Error('Strategy not configured');
    }

    const depositIsNative = strategy.contracts.depositIsNative ?? true;

    if (depositIsNative) {
      // Native HYPE deposit (payable)
      const value = parseEther(amount);
      writeContract({
        ...contracts.vault,
        functionName: 'deposit',
        value,
      });
    } else {
      // TODO: ERC20-based deposit (approve + deposit)
      throw new Error('ERC20 deposits not yet implemented');
    }
  };

  return {
    deposit,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    error: writeError || receiptError,
  };
}

