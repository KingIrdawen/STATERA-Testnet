/**
 * Generic hook for withdrawing from an ERA strategy
 * Includes simulation before sending transaction to show decoded errors
 */
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { simulateContract } from 'viem/actions';
import { useEffect } from 'react';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { useTxToasts } from '@/lib/txToasts';

export function useStrategyWithdraw(strategy: Strategy | null) {
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
      showTxToast('submitted', { hash: txHash, action: 'Retrait' });
    }
  }, [txHash, showTxToast]);

  // Show toast on transaction confirmed or failed
  useEffect(() => {
    if (isConfirmed && txHash) {
      showTxToast('confirmed', { hash: txHash, action: 'Retrait' });
    }
    if (receiptError && txHash) {
      const errorMsg = receiptError instanceof Error ? receiptError.message : String(receiptError);
      showTxToast('failed', { hash: txHash, error: errorMsg, action: 'Retrait' });
    }
  }, [isConfirmed, receiptError, txHash, showTxToast]);

  const withdraw = async (shares: string) => {
    if (!strategy || !contracts || !publicClient || !address) {
      throw new Error('Strategy not configured or wallet not connected');
    }

    const shareDecimals = strategy.contracts.shareDecimals ?? 18;
    const sharesAmount = parseUnits(shares, shareDecimals);

    // Preflight diagnostics
    let pps1e18: bigint | undefined;
    let nav1e18: bigint | undefined;
    let oraclePxHype1e8: bigint | undefined;

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

      oraclePxHype1e8 = oracleResult as bigint;
      pps1e18 = ppsResult as bigint;
      nav1e18 = navResult as bigint;

      // Log comprehensive diagnostics with actual values (structured for readability)
      const diagnostics = {
        chainId: strategy.contracts.chainId,
        vaultAddress: contracts.vault.address,
        userAddress: address,
        sharesAmount: sharesAmount.toString(),
        sharesFormatted: `${shares} shares`,
        pps1e18: pps1e18.toString(),
        nav1e18: nav1e18.toString(),
        oraclePxHype1e8: oraclePxHype1e8.toString(),
      };
      
      // Use console.table for better readability, fallback to console.log with JSON
      if (console.table) {
        console.table(diagnostics);
      } else {
        console.log('[useStrategyWithdraw] Preflight diagnostics:', JSON.stringify(diagnostics, null, 2));
      }
      
      // Also log individual values for easier debugging
      console.log('[useStrategyWithdraw] Preflight values:', 
        `chainId=${diagnostics.chainId}`,
        `vault=${diagnostics.vaultAddress}`,
        `user=${diagnostics.userAddress}`,
        `shares=${diagnostics.sharesFormatted}`,
        `pps=${diagnostics.pps1e18}`,
        `nav=${diagnostics.nav1e18}`,
        `oracle=${diagnostics.oraclePxHype1e8}`
      );
    } catch (preflightError) {
      console.warn('[useStrategyWithdraw] Preflight checks failed:', preflightError);
    }

    // Simulate the transaction first (with retry)
    let simError: any = null;
    try {
      await simulateContract(publicClient, {
        ...contracts.vault,
        functionName: 'withdraw',
        args: [sharesAmount],
        account: address,
      });
    } catch (firstSimError: any) {
      simError = firstSimError;

      // Second chance: refetch and retry with blockTag='latest'
      try {
        console.log('[useStrategyWithdraw] First simulation failed, retrying with latest block...');

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

        console.log('[useStrategyWithdraw] Refetched values:', {
          newPps1e18: (newPpsResult as bigint).toString(),
          newOraclePxHype1e8: (newOracleResult as bigint).toString(),
        });

        await simulateContract(publicClient, {
          ...contracts.vault,
          functionName: 'withdraw',
          args: [sharesAmount],
          account: address,
          blockTag: 'latest',
        });

        simError = null;
      } catch (retryError: any) {
        simError = retryError;
      }
    }

    // If simulation failed, handle error
    if (simError) {
      // Log full error for debugging
      console.error('[useStrategyWithdraw] Simulation error:', simError);
      console.error('[useStrategyWithdraw] Error details:', {
        name: simError?.name,
        message: simError?.message,
        shortMessage: simError?.shortMessage,
        cause: simError?.cause,
        data: simError?.data,
        metaMessages: simError?.metaMessages,
      });
      
      const extractErrorName = (err: any): string | undefined => {
        // Path 1: direct errorName
        if (err?.errorName) return err.errorName;
        
        // Path 2: data.errorName
        if (err?.data?.errorName) return err.data.errorName;
        
        // Path 3: cause chain (recursive)
        if (err?.cause) {
          const causeName = extractErrorName(err.cause);
          if (causeName) return causeName;
        }
        
        // Path 4: Check if it's a ContractFunctionRevertedError
        if (err?.name === 'ContractFunctionRevertedError' || err?.name === 'ContractFunctionExecutionError') {
          if (err.data?.errorName) return err.data.errorName;
          if (err.errorName) return err.errorName;
          // Check data.args for error name
          if (err.data?.args && Array.isArray(err.data.args) && err.data.args.length > 0) {
            const firstArg = err.data.args[0];
            if (typeof firstArg === 'string') return firstArg;
          }
        }
        
        // Path 5: Check shortMessage for error selector patterns
        if (err?.shortMessage) {
          const match = err.shortMessage.match(/(\w+)\(\)/);
          if (match) return match[1];
          // Also try matching "reverted with error: ErrorName"
          const match2 = err.shortMessage.match(/reverted with error:\s*(\w+)/i);
          if (match2) return match2[1];
        }
        
        // Path 6: Check metaMessages
        if (err?.metaMessages && Array.isArray(err.metaMessages)) {
          for (const msg of err.metaMessages) {
            const match = String(msg).match(/(\w+)\(\)/);
            if (match) return match[1];
          }
        }
        
        return undefined;
      };

      const errorName = extractErrorName(simError);
      const errorMessages: Record<string, string> = {
        'ContractPaused': 'Le vault est en pause (retraits désactivés).',
        'PriceZero': 'Oracle HYPE indisponible (prix à 0).',
        'HandlerNotSet': 'Handler non configuré sur ce vault.',
        'ViewsNotSet': 'Core views non configuré sur ce vault.',
        'EmptyVault': 'Vault vide (NAV = 0).',
      };

      let errorMessage = errorName && errorMessages[errorName]
        ? errorMessages[errorName]
        : (simError?.shortMessage || simError?.message || 'Transaction simulation failed');

      const vaultShort = `${contracts.vault.address.slice(0, 6)}...${contracts.vault.address.slice(-4)}`;
      let fullMessage = `Retrait échoué: ${errorMessage}`;
      if (errorName) {
        fullMessage += ` (${errorName})`;
      }
      fullMessage += `\nVault: ${vaultShort}\nShares: ${shares}`;

      if (pps1e18 !== undefined || oraclePxHype1e8 !== undefined) {
        fullMessage += `\n\nDiagnostics:\n`;
        if (pps1e18 !== undefined) fullMessage += `PPS: ${pps1e18.toString()}\n`;
        if (nav1e18 !== undefined) fullMessage += `NAV: ${nav1e18.toString()}\n`;
        if (oraclePxHype1e8 !== undefined) fullMessage += `Oracle HYPE: ${oraclePxHype1e8.toString()}\n`;
      }

      showTxToast('failed', { error: fullMessage, action: 'Retrait' });
      throw new Error(errorMessage);
    }

    // If simulation succeeds, proceed with the transaction
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

