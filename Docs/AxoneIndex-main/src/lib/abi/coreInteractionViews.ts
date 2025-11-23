export const coreInteractionViewsAbi = [
  {
    type: 'function',
    name: 'equitySpotUsd1e18',
    stateMutability: 'view',
    inputs: [{ name: 'handler', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'oraclePxHype1e8',
    stateMutability: 'view',
    inputs: [{ name: 'handler', type: 'address' }],
    outputs: [{ name: '', type: 'uint64' }]
  },
  {
    type: 'function',
    name: 'oraclePxToken11e8',
    stateMutability: 'view',
    inputs: [{ name: 'handler', type: 'address' }],
    outputs: [{ name: '', type: 'uint64' }]
  }
] as const;


