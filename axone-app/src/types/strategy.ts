/**
 * Generic Strategy type for ERA (v1) and RebalancingVault (v3) contracts
 * v1 : handler + views + l1Read séparés
 * v3 : vault auto-suffisant (RebalancingVault), pas de handler/views/l1Read
 */

export type VaultVersion = 'v1' | 'v3' | 'v4';

export interface StrategyContracts {
  chainId: number; // e.g. 998 for HyperEVM Testnet
  vaultVersion?: VaultVersion; // 'v1' (ERA, défaut) ou 'v3' (RebalancingVault)
  vaultAddress: `0x${string}`;
  // v1 uniquement (ERA) — optionnels pour v3
  handlerAddress?: `0x${string}`;
  coreViewsAddress?: `0x${string}`; // CoreInteractionViews
  l1ReadAddress?: `0x${string}`;
  coreWriterAddress?: `0x${string}`;
  usdcAddress?: `0x${string}`; // optional, for future ERC20 interactions
  shareDecimals?: number; // default 18
  hypeDecimals?: number; // default 18
  usdcDecimals?: number; // default 6
  depositIsNative?: boolean; // default true
}

export interface StrategyMeta {
  id: string;
  name: string; // e.g. "ERA BTC/HYPE 50/50"
  description?: string; // free-text description, can include "BTC/HYPE 50/50" and other details
  riskLevel: 'low' | 'medium' | 'high';
  status?: 'open' | 'paused' | 'closed';
}

export interface Strategy extends StrategyMeta {
  contracts: StrategyContracts;
}

export type StrategyInput = Omit<Strategy, 'id'> & { id?: string };

