import { type Address } from 'viem';
import { swapPoolFactoryAbi } from '@/lib/abi/swapPoolFactory';
import { swapPoolAbi } from '@/lib/abi/swapPool';
import { lpTokenAbi } from '@/lib/abi/lpToken';

// Adresse de la nouvelle SwapPoolFactory (testnet chainId 998)
// Peut être surchargée via NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS
const DEFAULT_FACTORY = '0x69Bb934011ca1cdbDf35A39816D9e194FD86F9Eb' as Address;

export const SWAP_POOL_FACTORY_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS as Address | undefined) ?? DEFAULT_FACTORY;

export const swapPoolFactory = {
  address: SWAP_POOL_FACTORY_ADDRESS,
  abi: swapPoolFactoryAbi,
} as const;

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
