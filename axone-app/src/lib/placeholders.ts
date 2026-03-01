/**
 * PLACEHOLDER DATA — MODE DÉMO
 *
 * Ces données fictives sont affichées quand les smart contracts ne sont pas encore déployés.
 * ⚠️  À REMPLACER lors du déploiement des contrats :
 *    - PLACEHOLDER_STRATEGIES_DEMO : TVL, PPS, APR par stratégie (viendront de useStrategyData)
 *    - PLACEHOLDER_POINTS : Points utilisateur (viendront de usePoints)
 *    - PLACEHOLDER_LEADERBOARD : Classement (viendra de useLeaderboard)
 *    - PLACEHOLDER_REFERRAL : Statut référral (viendra du contrat ReferralRegistry)
 *    - PLACEHOLDER_STAKING : Pools de staking (viendront de useStakingPools)
 */

// ─── STRATEGIES ──────────────────────────────────────────────────────────────

export interface DemoStrategyMetrics {
  tvlUsd: number;
  ppsUsd: number;
  apr1d: number | null;
  apr7d: number | null;
  apr30d: number | null;
  oracleHypeUsd: number;
  oracleToken1Usd: number;
  token1Symbol: string;
  /** Deposit utilisateur fictif pour la démo (dashboard "My Strategy") */
  demoUserValueUsd: number;
  demoUserShares: number;
}

/**
 * ⚠️  PLACEHOLDER — Métriques démo par ID de stratégie
 * À remplacer par les données on-chain quand les contrats sont déployés.
 */
export const DEMO_STRATEGY_METRICS: Record<string, DemoStrategyMetrics> = {
  // Stratégie existante HYPE/BTC
  '1763313127105': {
    tvlUsd: 1_245_000,
    ppsUsd: 1.0842,
    apr1d: 15.3,
    apr7d: 22.1,
    apr30d: 18.4,
    oracleHypeUsd: 28.45,
    oracleToken1Usd: 103_250,
    token1Symbol: 'BTC',
    demoUserValueUsd: 5_000,
    demoUserShares: 4_612.5,
  },
};

/**
 * ⚠️  PLACEHOLDER — Stratégies démo supplémentaires (UI only, sans contrats)
 * Ces cartes sont purement visuelles pour montrer à quoi ressemblera l'app.
 * À supprimer / remplacer quand les vraies stratégies seront déployées.
 */
export const DEMO_EXTRA_STRATEGIES = [
  {
    id: 'demo-hype-eth',
    name: 'HYPE / ETH Index',
    description: '50% HYPE / 50% ETH — Growth strategy with Ethereum exposure',
    riskLevel: 'medium' as const,
    status: 'open' as const,
    tokens: ['HYPE', 'ETH'],
    allocations: [50, 50],
    metrics: {
      tvlUsd: 890_500,
      ppsUsd: 1.1234,
      apr1d: 19.8,
      apr7d: 28.3,
      apr30d: 24.7,
      oracleHypeUsd: 28.45,
      oracleToken1Usd: 3_180,
    },
  },
  {
    id: 'demo-hype-stable',
    name: 'HYPE Stable',
    description: '80% HYPE / 20% USDC — Conservative strategy with stability',
    riskLevel: 'low' as const,
    status: 'open' as const,
    tokens: ['HYPE', 'USDC'],
    allocations: [80, 20],
    metrics: {
      tvlUsd: 456_200,
      ppsUsd: 1.0312,
      apr1d: 7.5,
      apr7d: 9.1,
      apr30d: 8.2,
      oracleHypeUsd: 28.45,
      oracleToken1Usd: 1.0,
    },
  },
];

// ─── POINTS ──────────────────────────────────────────────────────────────────

/**
 * ⚠️  PLACEHOLDER — Points totaux de l'utilisateur démo
 * À remplacer par usePoints() quand le backend est actif.
 */
export const DEMO_POINTS_TOTAL = 12_450.75;

/**
 * ⚠️  PLACEHOLDER — Répartition des points par catégorie
 * À remplacer par le breakdown de usePoints().
 */
export const DEMO_POINTS_BREAKDOWN = {
  swapPoints: 4_200,
  lpPoints: 3_150,
  vaultPoints: 4_800,
  referralPoints: 300.75,
};

/**
 * ⚠️  PLACEHOLDER — Classement leaderboard (top 10 démo)
 * À remplacer par useLeaderboard() quand le backend est actif.
 */
export const DEMO_LEADERBOARD = [
  { rank: 1, address: '0x3A4F2d8c91E5B7a6D0F3C8e2B1A9d4E7f6C2b8a1', points: 45_230.50 },
  { rank: 2, address: '0x7B2E9f1c4D6A8b3E5F0C7d2A4B8e1F3c6D9a0b2', points: 38_150.25 },
  { rank: 3, address: '0xC1D4a8E2F5B7c3A0E6d9F1B4c7E2a5D8f0C3b6e', points: 31_890.00 },
  { rank: 4, address: '0x5F0E7b3A1D4c6B8f2E9a3C1D5e7B0F4a2C6d8e1', points: 28_500.75 },
  { rank: 5, address: '0x9A3C2f8E1D5b7A4c6F0e2B8d1C4a7E3f5B0c9d6', points: 24_750.50 },
  { rank: 6, address: '0x2B6D4e0F8A3c1E7b5D9f2A6c8B4e0F7a3C5d1e8', points: 19_320.25 },
  { rank: 7, address: '0x8C1A5f3D7E2b0F4c6A9e1D3c7B5f2E0a4C8d6b3', points: 15_680.00 },
  { rank: 8, address: '0x4E7b2A9f1D5c8E0F3a6B4d2e9C1f7A5b3E6d0c8', points: 12_450.75 },
  { rank: 9, address: '0x6F3D8b1C4E7a2F0e5B9d3A1c6E4f8D2b7C0a5e3', points: 9_870.50 },
  { rank: 10, address: '0x1A4E9c6F2B7d3E8f0C5a1D4b8E2c6F9a3B7d0e5', points: 7_230.25 },
];

/** ⚠️  PLACEHOLDER — Rang de l'utilisateur démo dans le leaderboard */
export const DEMO_USER_RANK = 8;

// ─── REFERRAL ─────────────────────────────────────────────────────────────────

/**
 * ⚠️  PLACEHOLDER — Statut référral démo
 * À remplacer par les lectures du contrat ReferralRegistry.
 */
export const DEMO_REFERRAL = {
  isWhitelisted: true,
  referrer: '0x8C1A...6b3', // ⚠️  PLACEHOLDER adresse du référant
  codesCreated: 2,
  codesAvailable: 3,
  codesQuota: 5,
  /** ⚠️  PLACEHOLDER — Codes référral démo (générés par le contrat) */
  unusedCodes: ['ERA9C3L6', 'STA7X2M4'],
};

// ─── STAKING ──────────────────────────────────────────────────────────────────

/**
 * ⚠️  PLACEHOLDER — Pools de staking démo
 * À remplacer par useStakingPools() quand le contrat StakingSystem est déployé.
 */
export const DEMO_STAKING_POOLS = [
  {
    pid: 0,
    symbol: 'ERA-BTC/HYPE',
    weight: 60,
    totalStakedUsd: 523_000,
    aprPercent: 42.5,
    rewardToken: 'STA',
  },
  {
    pid: 1,
    symbol: 'ERA-ETH/HYPE',
    weight: 30,
    totalStakedUsd: 247_500,
    aprPercent: 28.3,
    rewardToken: 'STA',
  },
  {
    pid: 2,
    symbol: 'ERA-STABLE',
    weight: 10,
    totalStakedUsd: 89_200,
    aprPercent: 12.1,
    rewardToken: 'STA',
  },
];

export const DEMO_STAKING_TOTAL_STAKED_USD = 859_700;
export const DEMO_STAKING_PENDING_REWARDS = 324.75; // STA tokens

// ─── UTILITAIRES ─────────────────────────────────────────────────────────────

/** Formate une adresse wallet en version courte pour l'affichage */
export function formatDemoAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
