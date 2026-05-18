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
    // Snapshote les vaults v3 ET v4 (les deux exposent sharePriceUsdc8)
    const v3Strategies = strategies.filter(
      (s) => (s.contracts?.vaultVersion === 'v3' || s.contracts?.vaultVersion === 'v4') && s.contracts?.vaultAddress
    );

    // Lecture parallèle pour éviter les timeouts (chaque appel RPC ~1-3s)
    const results = await Promise.all(
      v3Strategies.map(async (strategy) => {
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

          console.log(`[snapshot-pps] ✓ ${strategy.name} → $${ppsUsd}`);
          return { vault: vaultAddress, pps: ppsUsd };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[snapshot-pps] ✗ ${strategy.name}:`, msg);
          return { vault: vaultAddress, pps: '', error: msg };
        }
      })
    );

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

// GET — statut public + diagnostic KV (dernière entrée enregistrée par vault)
export async function GET() {
  try {
    const strategies = await getAllStrategies();
    const vaults = strategies.filter(
      s => (s.contracts?.vaultVersion === 'v3' || s.contracts?.vaultVersion === 'v4') && s.contracts?.vaultAddress
    );
    const kv = getKv();

    const vaultStatus = await Promise.all(
      vaults.map(async (s) => {
        const key = `pps:${s.contracts.vaultAddress.toLowerCase()}`;
        try {
          const entries = await kv.lrange<{ timestamp: number; pps: string }>(key, 0, 0);
          const last = Array.isArray(entries) && entries.length > 0 ? entries[0] : null;
          const count = await kv.llen(key);
          return {
            name: s.name,
            address: s.contracts.vaultAddress,
            version: s.contracts.vaultVersion,
            entriesStored: count ?? 0,
            lastSnapshot: last ? { pps: last.pps, at: new Date(last.timestamp).toISOString() } : null,
          };
        } catch {
          return { name: s.name, address: s.contracts.vaultAddress, version: s.contracts.vaultVersion, entriesStored: 0, lastSnapshot: null };
        }
      })
    );

    return NextResponse.json({
      ok: true,
      message: 'PPS snapshot endpoint is alive. POST to trigger (requires QStash signature).',
      vaultsConfigured: vaults.length,
      vaults: vaultStatus,
    });
  } catch {
    return NextResponse.json({ ok: true, message: 'Endpoint alive.' });
  }
}
