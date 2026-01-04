// axone-app/src/app/api/strategies/[id]/pps/route.ts
import { NextResponse } from 'next/server';
import { getStrategyById } from '@/lib/strategyRepo';
import { getKv } from '@/lib/kv';
import { isAddress } from 'viem';

export interface PpsEntry {
  timestamp: number; // milliseconds
  pps: string; // PPS value as string (can be 1e18 format or decimal)
  blockNumber?: number;
  txHash?: string;
}

export interface PpsHistoryResponse {
  vaultAddress: string;
  entries: PpsEntry[];
  count: number;
}

export const runtime = 'nodejs';

/**
 * GET /api/strategies/[id]/pps
 * Récupère l'historique PPS pour une stratégie
 * 
 * Paramètres de requête:
 * - limit: nombre maximum d'entrées à retourner (optionnel)
 * 
 * Le paramètre [id] peut être:
 * - Un strategy ID (ex: "ERA_4") - l'adresse du vault sera récupérée depuis la stratégie
 * - Une adresse de vault (ex: "0x...") - utilisée directement
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    // Récupérer le paramètre limit depuis l'URL
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    if (limit !== undefined && (isNaN(limit) || limit < 1)) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }

    // Déterminer l'adresse du vault
    let vaultAddress: string;

    if (isAddress(id)) {
      // Si c'est une adresse, l'utiliser directement
      vaultAddress = id.toLowerCase();
    } else {
      // Sinon, chercher la stratégie par ID
      const strategy = await getStrategyById(id);
      if (!strategy) {
        return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      }
      if (!strategy.contracts?.vaultAddress) {
        return NextResponse.json({ error: 'Strategy vault address not found' }, { status: 404 });
      }
      vaultAddress = strategy.contracts.vaultAddress.toLowerCase();
    }

    // Récupérer l'historique PPS depuis KV
    const kv = getKv();
    const key = `pps:${vaultAddress}`;
    
    try {
      const entries = await kv.lrange<PpsEntry>(key, 0, limit ? limit - 1 : -1);
      
      // Valider et parser les entrées
      const validEntries: PpsEntry[] = [];
      if (Array.isArray(entries)) {
        for (const entry of entries) {
          if (
            entry &&
            typeof entry === 'object' &&
            typeof entry.timestamp === 'number' &&
            typeof entry.pps === 'string'
          ) {
            validEntries.push({
              timestamp: entry.timestamp,
              pps: entry.pps,
              blockNumber: typeof entry.blockNumber === 'number' ? entry.blockNumber : undefined,
              txHash: typeof entry.txHash === 'string' ? entry.txHash : undefined,
            });
          }
        }
      }

      // Trier par timestamp décroissant (plus récent en premier)
      validEntries.sort((a, b) => b.timestamp - a.timestamp);

      return NextResponse.json(
        {
          vaultAddress,
          entries: validEntries,
          count: validEntries.length,
        },
        { status: 200 }
      );
    } catch (kvError) {
      // Si KV n'est pas disponible ou la clé n'existe pas, retourner un tableau vide
      console.warn('[PPS History] KV error or no data:', kvError);
      return NextResponse.json(
        {
          vaultAddress,
          entries: [],
          count: 0,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[PPS History API] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

