/**
 * Generic hook for depositing into an ERA strategy
 * Includes simulation before sending transaction to show decoded errors
 */
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi';
import { parseEther, formatEther, formatUnits } from 'viem';
import { simulateContract } from 'viem/actions';
import { useEffect } from 'react';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { useTxToasts } from '@/lib/txToasts';

export function useStrategyDeposit(strategy: Strategy | null) {
  const contracts = strategy ? getStrategyContracts(strategy) : null;
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { showTxToast } = useTxToasts();

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

  // Show toast on transaction submitted
  useEffect(() => {
    if (txHash) {
      showTxToast('submitted', { hash: txHash, action: 'Dépôt' });
    }
  }, [txHash, showTxToast]);

  // Show toast on transaction confirmed or failed
  useEffect(() => {
    if (isConfirmed && txHash) {
      showTxToast('confirmed', { hash: txHash, action: 'Dépôt' });
    }
    if (receiptError && txHash) {
      const errorMsg = receiptError instanceof Error ? receiptError.message : String(receiptError);
      showTxToast('failed', { hash: txHash, error: errorMsg, action: 'Dépôt' });
    }
  }, [isConfirmed, receiptError, txHash, showTxToast]);

  const deposit = async (amount: string) => {
    if (!strategy || !contracts || !publicClient || !address) {
      throw new Error('Strategy not configured or wallet not connected');
    }

    const depositIsNative = strategy.contracts.depositIsNative ?? true;

    if (depositIsNative) {
      // Native HYPE deposit (payable)
      const value = parseEther(amount);

      // Preflight health checks: read comprehensive vault state
      let pps1e18: bigint | undefined;
      let nav1e18: bigint | undefined;
      let oraclePxHype1e8: bigint | undefined;
      let paused: boolean | undefined;
      let depositFeeBps: number | undefined;
      let withdrawFeeBps: number | undefined;
      let handlerAddress: `0x${string}` | undefined;
      let blockNumber: bigint | undefined;
      
      try {
        // Get block number first
        blockNumber = await publicClient.getBlockNumber();

        // Read all relevant state in parallel
        const [
          ppsResult,
          navResult,
          oracleResult,
          pausedResult,
          depositFeeBpsResult,
          withdrawFeeBpsResult,
          handlerResult,
        ] = await Promise.allSettled([
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
          publicClient.readContract({
            ...contracts.vault,
            functionName: 'paused',
          }).catch(() => null),
          publicClient.readContract({
            ...contracts.vault,
            functionName: 'depositFeeBps',
          }).catch(() => null),
          publicClient.readContract({
            ...contracts.vault,
            functionName: 'withdrawFeeBps',
          }).catch(() => null),
          publicClient.readContract({
            ...contracts.vault,
            functionName: 'handler',
          }).catch(() => null),
        ]);

        pps1e18 = ppsResult.status === 'fulfilled' ? (ppsResult.value as bigint) : undefined;
        nav1e18 = navResult.status === 'fulfilled' ? (navResult.value as bigint) : undefined;
        oraclePxHype1e8 = oracleResult.status === 'fulfilled' ? (oracleResult.value as bigint) : undefined;
        paused = pausedResult.status === 'fulfilled' ? (pausedResult.value as boolean) : undefined;
        depositFeeBps = depositFeeBpsResult.status === 'fulfilled' ? Number(depositFeeBpsResult.value) : undefined;
        withdrawFeeBps = withdrawFeeBpsResult.status === 'fulfilled' ? Number(withdrawFeeBpsResult.value) : undefined;
        handlerAddress = handlerResult.status === 'fulfilled' ? (handlerResult.value as `0x${string}`) : strategy.contracts.handlerAddress;

        // Log comprehensive diagnostics with actual values
        console.log('[useStrategyDeposit] Preflight diagnostics:', {
          chainId: strategy.contracts.chainId,
          vaultAddress: contracts.vault.address,
          userAddress: address,
          amountInWei: value.toString(),
          blockNumber: blockNumber.toString(),
          pps1e18: pps1e18?.toString() ?? 'N/A',
          nav1e18: nav1e18?.toString() ?? 'N/A',
          depositFeeBps: depositFeeBps ?? 'N/A',
          withdrawFeeBps: withdrawFeeBps ?? 'N/A',
          handlerAddress: handlerAddress ?? 'N/A',
          oraclePxHype1e8: oraclePxHype1e8?.toString() ?? 'N/A',
          paused: paused ?? 'N/A',
        });

        if (oraclePxHype1e8 === 0n || pps1e18 === 0n) {
          console.warn('[useStrategyDeposit] Oracle or vault not initialized');
        }
        if (paused === true) {
          console.warn('[useStrategyDeposit] Vault is paused');
        }
      } catch (preflightError) {
        console.warn('[useStrategyDeposit] Preflight checks failed:', preflightError);
      }

      // Simulate the transaction first to catch errors (first attempt)
      let simError: any = null;
      try {
        await simulateContract(publicClient, {
          ...contracts.vault,
          functionName: 'deposit',
          args: [],
          value,
          account: address,
        });
      } catch (firstSimError: any) {
        simError = firstSimError;
        
        // Second chance: refetch oracle/pps and retry with blockTag='latest'
        try {
          console.log('[useStrategyDeposit] First simulation failed, retrying with latest block...');
          
          // Refetch oracle and pps
          const [newPpsResult, newOracleResult] = await Promise.all([
            publicClient.readContract({
              ...contracts.vault,
              functionName: 'pps1e18',
              blockTag: 'latest',
            }),
            publicClient.readContract({
              ...contracts.views,
              functionName: 'oraclePxHype1e8',
              args: [strategy.contracts.handlerAddress],
              blockTag: 'latest',
            }),
          ]);
          
          const newOraclePxHype1e8 = newOracleResult as bigint;
          const newPps1e18 = newPpsResult as bigint;
          
          console.log('[useStrategyDeposit] Refetched values:', {
            newPps1e18: newPps1e18.toString(),
            newOraclePxHype1e8: newOraclePxHype1e8.toString(),
          });
          
          // Retry simulation with latest block
          await simulateContract(publicClient, {
            ...contracts.vault,
            functionName: 'deposit',
            args: [],
            value,
            account: address,
            blockTag: 'latest',
          });
          
          // If retry succeeds, clear simError and continue
          simError = null;
        } catch (retryError: any) {
          // Both attempts failed, use the retry error
          simError = retryError;
        }
      }
      
      // If simulation failed after retry, handle error
      if (simError) {
        // Extract error name and message
        let errorName: string | undefined;
        let errorMessage = 'Transaction simulation failed';
        
        // viem exposes custom errors in different ways depending on version
        // Try multiple paths to extract error name
        const extractErrorName = (err: any): string | undefined => {
          // Path 1: direct errorName
          if (err?.errorName) return err.errorName;
          
          // Path 2: data.errorName
          if (err?.data?.errorName) return err.data.errorName;
          
          // Path 3: cause chain
          if (err?.cause) {
            const causeName = extractErrorName(err.cause);
            if (causeName) return causeName;
          }
          
          // Path 4: Check if it's a ContractFunctionRevertedError
          if (err?.name === 'ContractFunctionRevertedError') {
            if (err.data?.errorName) return err.data.errorName;
            if (err.errorName) return err.errorName;
          }
          
          // Path 5: Check shortMessage for error selector patterns
          if (err?.shortMessage) {
            // Sometimes viem includes error name in shortMessage like "The contract function "deposit" reverted with error: PriceZero()."
            const match = err.shortMessage.match(/(\w+)\(\)/);
            if (match) return match[1];
          }
          
          return undefined;
        };
        
        errorName = extractErrorName(simError);
        
        // Map error names to friendly French messages
        const errorMessages: Record<string, string> = {
          'ContractPaused': 'Le vault est en pause (dépôts désactivés).',
          'PriceZero': 'Oracle HYPE indisponible (prix à 0).',
          'FeeVaultZero': 'FeeVault non configuré côté handler.',
          'HandlerNotSet': 'Handler non configuré sur ce vault.',
          'ViewsNotSet': 'Core views non configuré sur ce vault.',
          'AmountZero': 'Montant invalide.',
          'FeeSendFail': 'Échec de l\'envoi des frais.',
          'NativePayFail': 'Échec du paiement natif.',
          'EmptyVault': 'Vault vide (NAV = 0).',
        };
        
        // Use friendly message if error name is known
        if (errorName && errorMessages[errorName]) {
          errorMessage = errorMessages[errorName];
        } else {
          // Fallback to extracting from error object
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
        }

        // Build full message with error name if available
        const vaultShort = `${contracts.vault.address.slice(0, 6)}...${contracts.vault.address.slice(-4)}`;
        const amountFormatted = `${amount} HYPE`;
        let fullMessage = `Dépôt échoué: ${errorMessage}`;
        if (errorName) {
          fullMessage += ` (${errorName})`;
        }
        fullMessage += `\nVault: ${vaultShort}\nMontant: ${amountFormatted}`;
        
        // Add contextual diagnostics
        fullMessage += `\n\nDiagnostics:\n`;
        fullMessage += `Vault: ${vaultShort}\n`;
        fullMessage += `ChainId: ${strategy.contracts.chainId}\n`;
        if (blockNumber !== undefined) fullMessage += `Block: ${blockNumber.toString()}\n`;
        if (pps1e18 !== undefined) fullMessage += `PPS: ${pps1e18.toString()}\n`;
        if (nav1e18 !== undefined) fullMessage += `NAV: ${nav1e18.toString()}\n`;
        if (oraclePxHype1e8 !== undefined) fullMessage += `Oracle HYPE: ${oraclePxHype1e8.toString()}\n`;
        if (paused !== undefined) fullMessage += `Paused: ${paused}\n`;
        if (depositFeeBps !== undefined) fullMessage += `DepositFeeBps: ${depositFeeBps}\n`;
        if (withdrawFeeBps !== undefined) fullMessage += `WithdrawFeeBps: ${withdrawFeeBps}\n`;
        if (handlerAddress) fullMessage += `Handler: ${handlerAddress.slice(0, 6)}...${handlerAddress.slice(-4)}\n`;
        
        showTxToast('failed', { error: fullMessage, action: 'Dépôt' });
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

