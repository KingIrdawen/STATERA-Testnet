/**
 * ABI for CoreInteractionViews ERA
 * Provides view functions for equity and oracle prices
 */
export const coreInteractionViewsAbi = [
  {
    name: 'equitySpotUsd1e18',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'handler', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'oraclePxHype1e8',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'handler', type: 'address' }],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'oraclePxToken11e8',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'handler', type: 'address' }],
    outputs: [{ name: '', type: 'uint64' }],
  },
] as const;

export function coreInteractionViewsContract(address: string) {
  return {
    address: address as `0x${string}`,
    abi: coreInteractionViewsAbi,
  };
}

