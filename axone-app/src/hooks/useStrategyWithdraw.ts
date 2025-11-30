/**
 * Generic hook for withdrawing from an ERA strategy
 */
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';

export function useStrategyWithdraw(strategy: Strategy | null) {
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

  const withdraw = async (shares: string) => {
    if (!strategy || !contracts) {
      throw new Error('Strategy not configured');
    }

    const shareDecimals = strategy.contracts.shareDecimals ?? 18;
    const sharesAmount = parseUnits(shares, shareDecimals);

    writeContract({
      ...contracts.vault,
      functionName: 'withdraw',
      args: [sharesAmount],
    });
  };

  return {
    withdraw,
    txHash,
    isPending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    error: writeError || receiptError,
  };
}

