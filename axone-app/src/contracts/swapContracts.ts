import { type Address } from 'viem';
import { swapPoolFactoryAbi } from '@/lib/abi/swapPoolFactory';
import { swapPoolAbi } from '@/lib/abi/swapPool';
import { lpTokenAbi } from '@/lib/abi/lpToken';

export const SWAP_POOL_FACTORY_ADDRESS = process.env
  .NEXT_PUBLIC_SWAP_POOL_FACTORY_ADDRESS as Address | undefined;

export const swapPoolFactory = SWAP_POOL_FACTORY_ADDRESS
  ? {
      address: SWAP_POOL_FACTORY_ADDRESS,
      abi: swapPoolFactoryAbi,
    } as const
  : null;

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

