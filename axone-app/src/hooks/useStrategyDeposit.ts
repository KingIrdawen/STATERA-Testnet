/**
 * Generic hook for depositing into an ERA strategy
 * Includes simulation before sending transaction to show decoded errors
 */
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi';
import { parseEther, formatEther, formatUnits } from 'viem';
import { simulateContract } from 'viem/actions';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { useToast } from '@/components/Toast';

export function useStrategyDeposit(strategy: Strategy | null) {
  const contracts = strategy ? getStrategyContracts(strategy) : null;
  const publicClient = usePublicClient();
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

  const deposit = async (amount: string) => {
    if (!strategy || !contracts || !publicClient || !address) {
      throw new Error('Strategy not configured or wallet not connected');
    }

    const depositIsNative = strategy.contracts.depositIsNative ?? true;

    if (depositIsNative) {
      // Native HYPE deposit (payable)
      const value = parseEther(amount);

      // Preflight health checks: read pps1e18, nav1e18, and oraclePxHype1e8
      try {
        const [ppsResult, navResult, oracleResult] = await Promise.all([
          publicClient.readContract({
            ...contracts.vault,
            functionName: 'pps1e18',
          }),
          publicClient.readContract({
            ...contracts.vault,
            functionName: 'nav1e18',
          }),
          publicClient.readContract({
            ...contracts.views,
            functionName: 'oraclePxHype1e8',
            args: [strategy.contracts.handlerAddress],
          }),
        ]);

        // Check if oracle or vault is not initialized
        const oraclePxHype1e8 = oracleResult as bigint;
        const pps1e18 = ppsResult as bigint;
        const nav1e18 = navResult as bigint;

        if (oraclePxHype1e8 === 0n || pps1e18 === 0n) {
          const warningMessage = 'Oracle price unavailable or vault not initialized. Deposit may fail.';
          showToast('error', warningMessage);
          // Don't throw, just warn - let simulation catch the actual error
        }
      } catch (preflightError) {
        // Preflight checks failed, but continue to simulation which will show better error
        console.warn('[useStrategyDeposit] Preflight checks failed:', preflightError);
      }

      // Simulate the transaction first to catch errors
      try {
        await simulateContract(publicClient, {
          ...contracts.vault,
          functionName: 'deposit',
          args: [],
          value,
          account: address,
        });
      } catch (simError: any) {
        // Extract error message
        let errorMessage = 'Transaction simulation failed';
        
        if (simError?.shortMessage) {
          errorMessage = simError.shortMessage;
        } else if (simError?.cause?.reason) {
          errorMessage = simError.cause.reason;
        } else if (simError?.details) {
          errorMessage = simError.details;
        } else if (simError?.message) {
          errorMessage = simError.message;
        } else if (simError?.metaMessages && simError.metaMessages.length > 0) {
          errorMessage = simError.metaMessages.join(' ');
        }

        // Show toast with decoded error
        const vaultShort = `${contracts.vault.address.slice(0, 6)}...${contracts.vault.address.slice(-4)}`;
        const amountFormatted = `${amount} HYPE`;
        const fullMessage = `Deposit failed: ${errorMessage}\nVault: ${vaultShort}\nAmount: ${amountFormatted}`;
        
        showToast('error', fullMessage);
        throw new Error(errorMessage);
      }

      // If simulation succeeds, proceed with the transaction
      writeContract({
        ...contracts.vault,
        functionName: 'deposit',
        args: [],
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

