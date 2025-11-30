/**
 * Helper to build contract descriptors from a Strategy
 */
import { ABIS } from './abis';
import type { Strategy } from '@/types/strategy';

export function getStrategyContracts(strategy: Strategy) {
  const {
    chainId,
    vaultAddress,
    handlerAddress,
    coreViewsAddress,
    l1ReadAddress,
  } = strategy.contracts;

  return {
    vault: {
      address: vaultAddress,
      abi: ABIS.vault,
      chainId,
    } as const,
    handler: {
      address: handlerAddress,
      abi: ABIS.handler,
      chainId,
    } as const,
    views: {
      address: coreViewsAddress,
      abi: ABIS.views,
      chainId,
    } as const,
    l1Read: {
      address: l1ReadAddress,
      abi: ABIS.l1Read,
      chainId,
    } as const,
  };
}

