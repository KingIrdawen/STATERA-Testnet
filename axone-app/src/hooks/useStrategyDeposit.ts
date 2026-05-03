/**
 * Generic hook for depositing into an ERA strategy
 * Routes through swap pool if available, otherwise uses direct vault.deposit()
 */
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { useEffect } from 'react';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { swapPool } from '@/contracts/swapContracts';
import { useStrategyPoolAddress } from './useStrategyPoolAddress';
import { useToast } from '@/components/Toast';

export function useStrategyDeposit(strategy: Strategy | null) {
  const contracts = strategy ? getStrategyContracts(strategy) : null;
  const { address } = useAccount();
  const { showToast } = useToast();
  const { poolAddress } = useStrategyPoolAddress(strategy);

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
      showToast('success', 'Dépôt confirmé', txHash);
    }
  }, [isConfirmed, txHash, showToast]);

  useEffect(() => {
    if ((writeError || receiptError) && txHash) {
      const error = writeError || receiptError;
      const message = error instanceof Error ? error.message : String(error) || 'Transaction échouée';
      showToast('error', `Dépôt échoué: ${message}`, txHash);
    }
  }, [writeError, receiptError, txHash, showToast]);

  const deposit = async (amount: string) => {
    if (!strategy || !contracts || !address) {
      throw new Error('Strategy not configured or wallet not connected');
    }

    // Defensive check for contracts
    if (!strategy.contracts) {
      throw new Error('Strategy contracts not available');
    }

    const depositIsNative = strategy.contracts.depositIsNative ?? true;

    if (depositIsNative) {
      const value = parseEther(amount);

      // Route through swap pool if available (more reliable for ERA4)
      if (poolAddress) {
        // Use the same call as Swap HYPE -> Vault
        writeContract({
          ...swapPool(poolAddress),
          functionName: 'swapHypeForVaultToken',
          args: [value, address],
          value, // msg.value must equal hypeIn
        });
      } else {
        // Fallback to direct vault.deposit() for strategies without swap pool
        writeContract({
          ...(contracts.vault as any),
          functionName: 'deposit',
          args: [],
          value,
        });
      }
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
