/**
 * Generic hook for withdrawing from an ERA strategy
 */
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useEffect } from 'react';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { useToast } from '@/components/Toast';

export function useStrategyWithdraw(strategy: Strategy | null) {
  const contracts = strategy ? getStrategyContracts(strategy) : null;
  const { address } = useAccount();
  const { showToast } = useToast();

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

  // Show single toast on final outcome only
  useEffect(() => {
    if (isConfirmed && txHash) {
      showToast('success', 'Retrait confirmé', txHash);
    }
  }, [isConfirmed, txHash, showToast]);

  useEffect(() => {
    if ((writeError || receiptError) && txHash) {
      const error = writeError || receiptError;
      const message = error instanceof Error ? error.message : String(error) || 'Transaction échouée';
      showToast('error', `Retrait échoué: ${message}`, txHash);
    }
  }, [writeError, receiptError, txHash, showToast]);

  const withdraw = async (shares: string) => {
    if (!strategy || !contracts || !address) {
      throw new Error('Strategy not configured or wallet not connected');
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
