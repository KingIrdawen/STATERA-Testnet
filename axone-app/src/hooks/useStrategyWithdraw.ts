/**
 * Generic hook for withdrawing from a strategy
 * v1 : appel direct vault.withdraw(shares)
 * v3 : appel vault.requestRedeem(shares) — premier pas du flux 2 étapes
 */
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { useEffect } from 'react';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { useToast } from '@/components/Toast';

export function useStrategyWithdraw(strategy: Strategy | null) {
  const { vault, isV3 } = strategy ? getStrategyContracts(strategy) : { vault: null, isV3: false };
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
    data: receipt,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConfirmed && txHash) {
      const msg = isV3
        ? 'Demande de retrait envoyée — en attente de settlement'
        : 'Retrait confirmé';
      showToast('success', msg, txHash);
    }
  }, [isConfirmed, txHash, showToast, isV3]);

  useEffect(() => {
    if ((writeError || receiptError) && txHash) {
      const error = writeError || receiptError;
      const message = error instanceof Error ? error.message : String(error) || 'Transaction échouée';
      showToast('error', `Retrait échoué: ${message}`, txHash);
    }
  }, [writeError, receiptError, txHash, showToast]);

  const withdraw = async (shares: string) => {
    if (!strategy || !vault || !address) {
      throw new Error('Strategy not configured or wallet not connected');
    }
    if (!strategy.contracts) {
      throw new Error('Strategy contracts not available');
    }

    const shareDecimals = strategy.contracts.shareDecimals ?? 18;
    const sharesAmount = parseUnits(shares, shareDecimals);

    if (isV3) {
      // v3 : step 1 — requestRedeem
      writeContract({
        ...(vault as any),
        functionName: 'requestRedeem',
        args: [sharesAmount],
      });
    } else {
      // v1 : single step withdraw
      writeContract({
        ...(vault as any),
        functionName: 'withdraw',
        args: [sharesAmount],
      });
    }
  };

  return {
    withdraw,
    txHash,
    receipt,
    isPending,
    isConfirming,
    isConfirmed,
    isSuccess: isConfirmed,
    isV3,
    error: writeError || receiptError,
  };
}
