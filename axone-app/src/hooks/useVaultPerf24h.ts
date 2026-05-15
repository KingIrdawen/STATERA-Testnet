/**
 * Calcule la performance 24h d'un vault à partir de l'historique PPS stocké en KV.
 * Retourne le % de variation : (ppsNow - pps24hAgo) / pps24hAgo × 100
 *
 * Indépendant de l'utilisateur — affichable sur toutes les cartes vault.
 */
import { useMemo } from 'react';
import { usePpsHistory } from './usePpsHistory';

export interface VaultPerf24h {
  loading: boolean;
  perf24h: number | null;        // % de variation (ex: +1.23 ou -0.45)
  ppsNow: number | null;         // PPS le plus récent en KV
  pps24hAgo: number | null;      // PPS d'il y a ~24h
  hasHistory: boolean;           // false si pas encore assez de données
}

export function useVaultPerf24h(vaultAddress: string | undefined): VaultPerf24h {
  const { data, loading } = usePpsHistory(vaultAddress, 48); // 48 entrées max = 2j d'historique horaire

  return useMemo(() => {
    if (loading) return { loading: true, perf24h: null, ppsNow: null, pps24hAgo: null, hasHistory: false };
    if (!data?.entries?.length) return { loading: false, perf24h: null, ppsNow: null, pps24hAgo: null, hasHistory: false };

    const entries = data.entries; // triées du plus récent au plus ancien (lpush)
    const ppsNow = parseFloat(entries[0].pps);

    const h24ago = Date.now() - 24 * 60 * 60 * 1000;
    const entry24h = entries.find(e => e.timestamp <= h24ago) ?? null;

    if (!entry24h) {
      // Pas encore 24h d'historique
      return { loading: false, perf24h: null, ppsNow, pps24hAgo: null, hasHistory: false };
    }

    const pps24hAgo = parseFloat(entry24h.pps);
    const perf24h = pps24hAgo > 0 ? ((ppsNow - pps24hAgo) / pps24hAgo) * 100 : null;

    return { loading: false, perf24h, ppsNow, pps24hAgo, hasHistory: true };
  }, [data, loading]);
}
