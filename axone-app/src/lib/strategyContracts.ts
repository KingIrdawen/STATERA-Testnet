/**
 * Helper to build contract descriptors from a Strategy
 * Supporte v1 (ERA) et v3 (RebalancingVault)
 */
import { ABIS } from './abis';
import type { Strategy } from '@/types/strategy';

export function getStrategyContracts(strategy: Strategy) {
  const { chainId, vaultAddress, vaultVersion } = strategy.contracts;
  const isV3 = vaultVersion === 'v3';

  const vault = isV3
    ? { address: vaultAddress, abi: ABIS.rebalancingVault, chainId } as const
    : { address: vaultAddress, abi: ABIS.vault, chainId } as const;

  // v1 only
  const handlerAddress = strategy.contracts.handlerAddress;
  const coreViewsAddress = strategy.contracts.coreViewsAddress;
  const l1ReadAddress = strategy.contracts.l1ReadAddress;

  const handler = handlerAddress
    ? ({ address: handlerAddress, abi: ABIS.handler, chainId } as const)
    : null;

  const views = coreViewsAddress
    ? ({ address: coreViewsAddress, abi: ABIS.views, chainId } as const)
    : null;

  const l1Read = l1ReadAddress
    ? ({ address: l1ReadAddress, abi: ABIS.l1Read, chainId } as const)
    : null;

  return { vault, handler, views, l1Read, isV3 };
}

