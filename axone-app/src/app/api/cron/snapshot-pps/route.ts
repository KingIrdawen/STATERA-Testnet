/**
 * POST /api/cron/snapshot-pps
 *
 * Appelé toutes les heures par Upstash QStash.
 * Lit le PPS actuel de chaque vault v3/v4 via viem et le stocke
 * dans Upstash KV sous la clé `pps:{vaultAddress}` (168 entrées max = 7j).
 *
 * Sécurité : vérification de la signature QStash (QSTASH_CURRENT_SIGNING_KEY
 * + QSTASH_NEXT_SIGNING_KEY). Fallback sur CRON_SECRET Bearer token pour
 * les appels manuels de test.
 */
import { NextResponse } from 'next/server';
import { parseAbi } from 'viem';
import { Receiver } from '@upstash/qstash';
import { getAllStrategies } from '@/lib/strategyRepo';
import { getPublicClient } from '@/lib/publicClient';
import { getKv } from '@/lib/kv';

export const runtime = 'nodejs';

export interface PpsSnapshotEntry {
  timestamp: number;
  pps: string;
}

const SHARE_PRICE_ABI = parseAbi([
  'function sharePriceUsdc8() external view returns (uint256)',
]);

const MAX_ENTRIES = 168; // 7 jours × 24h

// ─── Vérification d'authenticité ─────────────────────────────────────────────
async function isAuthenticated(req: Request): Promise<boolean> {
  // 1. Vérification signature QStash (production)
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (currentKey && nextKey) {
    try {
      const receiver = new Receiver({ currentSigningKey: currentKey, nextSigningKey: nextKey });
      const body = await req.clone().text();
      const signature = req.headers.get('upstash-signature') ?? '';
      const isValid = await receiver.verify({ signature, body });
      if (isValid) return true;
    } catch {
      // Signature invalide — on tombe sur le fallback
    }
  }

  // 2. Fallback CRON_SECRET Bearer (tests manuels)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('Authorization');
    if (auth === `Bearer ${secret}`) return true;
  }

  // 3. Si aucun secret configuré, on autorise (dev local uniquement)
  if (!currentKey && !nextKey && !process.env.CRON_SECRET) return true;

  return false;
}

export async function POST(req: Request) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getPublicClient();
  const kv = getKv();
  const now = Date.now();

  try {
    const strategies = await getAllStrategies();
    const v3Strategies = strategies.filter(
      (s) => s.contracts?.vaultVersion === 'v3' && s.contracts?.vaultAddress
    );

    const results: { vault: string; pps: string; error?: string }[] = [];

    for (const strategy of v3Strategies) {
      const vaultAddress = strategy.contracts.vaultAddress;
      try {
        const raw = await client.readContract({
          address: vaultAddress,
          abi: SHARE_PRICE_ABI,
          functionName: 'sharePriceUsdc8',
        });

        const ppsUsd = (Number(raw) / 1e8).toFixed(6);
        const entry: PpsSnapshotEntry = { timestamp: now, pps: ppsUsd };
        const key = `pps:${vaultAddress.toLowerCase()}`;

        await kv.lpush(key, entry);
        await kv.ltrim(key, 0, MAX_ENTRIES - 1);

        results.push({ vault: vaultAddress, pps: ppsUsd });
        console.log(`[snapshot-pps] ✓ ${strategy.name} → $${ppsUsd}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ vault: vaultAddress, pps: '', error: msg });
        console.error(`[snapshot-pps] ✗ ${strategy.name}:`, msg);
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: now,
      snapshotted: results.filter((r) => !r.error).length,
      total: v3Strategies.length,
      results,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    console.error('[snapshot-pps] Fatal error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET — statut public pour vérifier que l'endpoint est vivant
export async function GET() {
  try {
    const strategies = await getAllStrategies();
    const v3 = strategies.filter(s => s.contracts?.vaultVersion === 'v3');
    return NextResponse.json({
      ok: true,
      message: 'PPS snapshot endpoint is alive. POST to trigger a snapshot (requires QStash signature).',
      v3VaultsConfigured: v3.length,
      vaults: v3.map(s => ({ name: s.name, address: s.contracts.vaultAddress })),
    });
  } catch {
    return NextResponse.json({ ok: true, message: 'Endpoint alive.' });
  }
}
