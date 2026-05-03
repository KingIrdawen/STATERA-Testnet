/**
 * Hook pour le flux de retrait v3 (RebalancingVault) :
 * Step 1 — requestRedeem(shares) → batchId stocké en localStorage
 * Step 2 — claimBatch(batchId) → HYPE récupéré après settlement du keeper
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { decodeEventLog } from 'viem';
import type { Strategy } from '@/types/strategy';
import { getStrategyContracts } from '@/lib/strategyContracts';
import { useToast } from '@/components/Toast';
import { rebalancingVaultAbi } from '@/contracts/rebalancingVault';

export interface PendingRedemption {
  batchId: string;      // bigint stringifié
  vaultAddress: string;
  shares: string;       // montant en unités décimales (affiché)
  requestedAt: number;  // timestamp ms
  txHash: string;
}

const STORAGE_KEY = 'statera:pending_redemptions';

function loadPending(): PendingRedemption[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePending(list: PendingRedemption[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function useRebalancingRedeem(strategy: Strategy | null) {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [pendingRedemptions, setPendingRedemptions] = useState<PendingRedemption[]>([]);

  const isV3 = strategy?.contracts?.vaultVersion === 'v3';
  const vaultAddress = strategy?.contracts?.vaultAddress;

  // Charger les redemptions en attente au montage
  useEffect(() => {
    if (!vaultAddress || !isV3) return;
    const all = loadPending();
    setPendingRedemptions(
      all.filter(r => r.vaultAddress.toLowerCase() === vaultAddress.toLowerCase())
    );
  }, [vaultAddress, isV3]);

  // ── claimBatch ────────────────────────────────────────────────────────────
  const {
    writeContract: writeClaim,
    data: claimHash,
    isPending: isClaimPending,
    error: claimWriteError,
  } = useWriteContract();

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
    error: claimReceiptError,
  } = useWaitForTransactionReceipt({ hash: claimHash });

  useEffect(() => {
    if (isClaimConfirmed && claimHash) {
      showToast('success', 'Retrait réclamé avec succès', claimHash);
    }
  }, [isClaimConfirmed, claimHash, showToast]);

  useEffect(() => {
    if ((claimWriteError || claimReceiptError) && claimHash) {
      const err = claimWriteError || claimReceiptError;
      const msg = err instanceof Error ? err.message : String(err) || 'Transaction échouée';
      showToast('error', `Claim échoué: ${msg}`, claimHash);
    }
  }, [claimWriteError, claimReceiptError, claimHash, showToast]);

  const claimBatch = useCallback(
    (batchId: string) => {
      if (!strategy || !address || !isV3) return;
      const { vault } = getStrategyContracts(strategy);
      writeClaim({
        ...(vault as any),
        functionName: 'claimBatch',
        args: [BigInt(batchId)],
      });
    },
    [strategy, address, isV3, writeClaim]
  );

  const removePending = useCallback(
    (batchId: string) => {
      if (!vaultAddress) return;
      const all = loadPending().filter(
        r => !(r.vaultAddress.toLowerCase() === vaultAddress.toLowerCase() && r.batchId === batchId)
      );
      savePending(all);
      setPendingRedemptions(
        all.filter(r => r.vaultAddress.toLowerCase() === vaultAddress.toLowerCase())
      );
    },
    [vaultAddress]
  );

  // Supprimer la redemption du storage une fois claimée
  useEffect(() => {
    if (isClaimConfirmed && claimHash) {
      // On ne peut pas savoir quel batchId a été claimé ici sans paramètre supplémentaire.
      // La page doit appeler removePending après confirmation.
    }
  }, [isClaimConfirmed, claimHash]);

  // ── Ajouter une redemption après requestRedeem confirmé ───────────────────
  const addPendingFromReceipt = useCallback(
    (txHash: string, receipt: any, sharesDisplay: string) => {
      if (!vaultAddress) return;
      let batchId: string | undefined;

      // Essai de lecture de l'event RedeemRequested dans les logs
      try {
        for (const log of receipt?.logs ?? []) {
          try {
            const decoded = decodeEventLog({
              abi: rebalancingVaultAbi,
              eventName: 'RedeemRequested',
              data: log.data,
              topics: log.topics,
            });
            if (decoded?.args) {
              batchId = String((decoded.args as any).batchId);
              break;
            }
          } catch {
            // log non pertinent, continuer
          }
        }
      } catch {
        // ignore
      }

      const entry: PendingRedemption = {
        batchId: batchId ?? 'unknown',
        vaultAddress,
        shares: sharesDisplay,
        requestedAt: Date.now(),
        txHash,
      };

      const all = loadPending();
      all.push(entry);
      savePending(all);
      setPendingRedemptions(prev => [...prev, entry]);
    },
    [vaultAddress]
  );

  return {
    pendingRedemptions,
    claimBatch,
    removePending,
    addPendingFromReceipt,
    claimHash,
    isClaimPending,
    isClaimConfirming,
    isClaimConfirmed,
    claimError: claimWriteError || claimReceiptError,
  };
}
