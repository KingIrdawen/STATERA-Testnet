/**
 * POST /api/cron/snapshot-pps
 *
 * Lit le PPS actuel de chaque vault v3 (sharePriceUsdc8) via viem et le stocke
 * dans Upstash KV sous la clé `pps:{vaultAddress}` (liste LIFO, 168 entrées max = 7j).
 *
 * Appelé automatiquement toutes les heures par GitHub Actions.
 * Protégé par la variable d'environnement CRON_SECRET.
 *
 * ─── Portabilité mainnet ────────────────────────────────────────────────────
 * Cet endpoint fonctionne sur n'importe quel serveur Next.js (Vercel, Railway,
 * VPS, etc.). Pour le mainnet, il suffit de :
 *   1. Mettre à jour NEXT_PUBLIC_HYPEREVM_RPC_URL vers le RPC mainnet
 *   2. Mettre à jour l'URL dans les secrets GitHub Actions (VERCEL_APP_URL)
 *   3. Ou remplacer le cron GitHub par un cron systemd / pm2-cron local
 */
import { NextResponse } from 'next/server';
import { parseAbi } from 'viem';
import { getAllStrategies } from '@/lib/strategyRepo';
import { getPublicClient } from '@/lib/publicClient';
import { getKv } from '@/lib/kv';

export const runtime = 'nodejs';

// PPS history entry
export interface PpsSnapshotEntry {
  timestamp: number; // ms since epoch
  pps: string;       // USD value as decimal string (ex: "1.923400")
}

// ABI minimal : juste sharePriceUsdc8 (présente sur v3 et v4)
const SHARE_PRICE_ABI = parseAbi([
  'function sharePriceUsdc8() external view returns (uint256)',
]);

// Garde 7 jours d'historique horaire (7 × 24 = 168 entrées)
const MAX_ENTRIES = 168;

export async function POST(req: Request) {
  // ─── Authentification ────────────────────────────────────────────────────
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const client = getPublicClient();
  const kv = getKv();
  const now = Date.now();

  try {
    const strategies = await getAllStrategies();

    // Filtre : seulement les vaults v3/v4 qui ont sharePriceUsdc8
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

        // sharePriceUsdc8 retourne un uint256 avec 8 décimales → diviser par 1e8 pour obtenir l'USD
        const ppsUsd = (Number(raw) / 1e8).toFixed(6);
        const entry: PpsSnapshotEntry = { timestamp: now, pps: ppsUsd };

        const key = `pps:${vaultAddress.toLowerCase()}`;
        await kv.lpush(key, entry);
        // Limite à MAX_ENTRIES (7 jours horaires)
        await kv.ltrim(key, 0, MAX_ENTRIES - 1);

        results.push({ vault: vaultAddress, pps: ppsUsd });
        console.log(`[snapshot-pps] ✓ ${strategy.name} → $${ppsUsd}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ vault: vaultAddress, pps: '', error: msg });
        console.error(`[snapshot-pps] ✗ ${strategy.name}:`, msg);
      }
    }

    const succeeded = results.filter((r) => !r.error).length;
    return NextResponse.json({
      ok: true,
      timestamp: now,
      snapshotted: succeeded,
      total: v3Strategies.length,
      results,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    console.error('[snapshot-pps] Fatal error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * GET — pour tester manuellement dans le navigateur (même protection)
 */
export async function GET(req: Request) {
  return POST(req);
}
