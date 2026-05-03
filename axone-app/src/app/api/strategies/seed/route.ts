/**
 * POST /api/strategies/seed
 * Ajoute les 3 vaults v3 déployés le 2026-04-30 si absents du KV.
 * Appeler une seule fois depuis l'admin ou via curl.
 */
import { NextResponse } from 'next/server';
import { getAllStrategies, saveStrategy } from '@/lib/strategyRepo';
import type { StrategyInput } from '@/types/strategy';

const V3_VAULTS: StrategyInput[] = [
  {
    name: 'HYPE / SOVY (équilibré)',
    description: '48% HYPE / 48% SOVY / 4% USDC — RebalancingVault v3 — Symbol: stHSOVY3',
    riskLevel: 'medium',
    status: 'open',
    contracts: {
      chainId: 998,
      vaultVersion: 'v3',
      vaultAddress: '0xb9E15DC17a8133f0cdB778097D0169c2Ba284a77',
      shareDecimals: 18,
      hypeDecimals: 18,
      usdcDecimals: 6,
      depositIsNative: true,
    },
  },
  {
    name: 'HYPE / UETH (résilience HL)',
    description: '48% HYPE / 48% UETH / 4% USDC — RebalancingVault v3 — Symbol: UETH3',
    riskLevel: 'medium',
    status: 'open',
    contracts: {
      chainId: 998,
      vaultVersion: 'v3',
      vaultAddress: '0x3e93bde3Aa75761AdB010088230f4d7C8F659a22',
      shareDecimals: 18,
      hypeDecimals: 18,
      usdcDecimals: 6,
      depositIsNative: true,
    },
  },
  {
    name: 'HYPE / UNIT (asymétrique 30/70)',
    description: '30% HYPE / 70% UNIT / 0% USDC — RebalancingVault v3 — Symbol: stHUNIT3',
    riskLevel: 'high',
    status: 'open',
    contracts: {
      chainId: 998,
      vaultVersion: 'v3',
      vaultAddress: '0xcdcdc574d4f13f510ec2d12bcfd23003cb330f9a',
      shareDecimals: 18,
      hypeDecimals: 18,
      usdcDecimals: 6,
      depositIsNative: true,
    },
  },
];

export async function POST() {
  try {
    const existing = await getAllStrategies();
    const existingAddresses = new Set(
      existing.map((s) => s.contracts.vaultAddress.toLowerCase())
    );

    const added: string[] = [];
    for (const vault of V3_VAULTS) {
      const addr = vault.contracts.vaultAddress.toLowerCase();
      if (!existingAddresses.has(addr)) {
        await saveStrategy(vault);
        added.push(vault.name);
      }
    }

    return NextResponse.json({
      message: added.length > 0
        ? `${added.length} vault(s) ajouté(s) : ${added.join(', ')}`
        : 'Tous les vaults v3 sont déjà présents.',
      added,
    });
  } catch (error) {
    console.error('[seed] Error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
