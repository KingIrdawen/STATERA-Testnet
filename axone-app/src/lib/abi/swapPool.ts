// FIX: corrected swapVaultTokenForHype ABI to (vaultTokenIn, to)
// ABI for SwapPool contract
export const swapPoolAbi = [
  {
    type: 'function',
    name: 'getReserves',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'reserveHype', type: 'uint256' },
      { name: 'reserveVault', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getAmountOut',
    stateMutability: 'view',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'hypeIn', type: 'bool' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'swapHypeForVaultToken',
    stateMutability: 'payable',
    inputs: [
      { name: 'hypeIn', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'swapVaultTokenForHype',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'vaultTokenIn', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [
      { name: 'amountOut', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'addLiquidity',
    stateMutability: 'payable',
    inputs: [{ name: 'minLpOut', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'removeLiquidity',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'lpAmount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [],
  },
] as const;

