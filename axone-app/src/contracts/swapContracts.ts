import { type Address } from 'viem';
import { swapPoolFactoryAbi } from '@/lib/abi/swapPoolFactory';
import { swapPoolAbi } from '@/lib/abi/swapPool';
import { lpTokenAbi } from '@/lib/abi/lpToken';

// Adresse de la SwapPoolFactory (testnet chainId 998)
const DEFAULT_FACTORY = '0x69Bb934011ca1cdbDf35A39816D9e194FD86F9Eb' as Address;

export const SWAP_POOL_FACTORY_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS as Address | undefined) ?? DEFAULT_FACTORY;

export const swapPoolFactory = {
  address: SWAP_POOL_FACTORY_ADDRESS,
  abi: swapPoolFactoryAbi,
} as const;

/**
 * Pools connus hardcodés (testnet chainId 998).
 * Ces pools s'affichent TOUJOURS dans l'onglet Swap, même si la stratégie
 * n'est pas encore dans Vercel KV.
 * Clé : vaultAddress lowercase
 */
export interface KnownPool {
  poolAddress: Address;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const KNOWN_POOLS: Record<string, KnownPool> = {
  '0x533abf396c20e241f8100a8640cbb5414b0f8873': {
    poolAddress: '0x250fbaF854787626dd793a8E85deeE6608Ce5EB4',
    name: 'HYPE / SOVY / ZIGG (v4)',
    description: '33% HYPE / 33% SOVY / 34% ZIGG — RebalancingVault v4 — Symbol: sV4',
    riskLevel: 'medium',
  },
};

export const swapPool = (address: Address) =>
  ({
    address,
    abi: swapPoolAbi,
  } as const);

export const lpToken = (address: Address) =>
  ({
    address,
    abi: lpTokenAbi,
  } as const);
