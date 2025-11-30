/**
 * Generic Strategy type for ERA contracts
 * All token IDs and spot IDs are managed on-chain by the handler
 */

export interface StrategyContracts {
  chainId: number; // e.g. 998 for HyperEVM Testnet
  vaultAddress: `0x${string}`;
  handlerAddress: `0x${string}`;
  coreViewsAddress: `0x${string}`; // CoreInteractionViews
  l1ReadAddress: `0x${string}`;
  coreWriterAddress: `0x${string}`;
  usdcAddress?: `0x${string}`; // optional, for future ERC20 interactions
  shareDecimals?: number; // default 18
  hypeDecimals?: number; // default 18
  usdcDecimals?: number; // default 6
  depositIsNative?: boolean; // default true for ERA
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

