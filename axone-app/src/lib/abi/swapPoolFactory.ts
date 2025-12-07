// ABI for SwapPoolFactory contract
export const swapPoolFactoryAbi = [
  {
    type: 'function',
    name: 'getPool',
    stateMutability: 'view',
    inputs: [{ name: 'vaultToken', type: 'address' }],
    outputs: [{ name: 'pool', type: 'address' }],
  },
  {
    type: 'function',
    name: 'swapFeeBps',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'feeBps', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'feeRecipient',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'recipient', type: 'address' }],
  },
] as const;

