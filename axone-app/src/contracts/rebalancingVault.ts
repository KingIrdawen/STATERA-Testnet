/**
 * ABI for RebalancingVault v3
 * Architecture simplifiée : pas de handler/views/l1Read séparés
 * Fonctions principales : deposit, requestRedeem, claimBatch
 * Lectures : sharePriceUsdc8, grossAssets, totalSupply, balanceOf
 */
export const rebalancingVaultAbi = [
  // ── Reads ──
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    // Price per share in USDC, 8 decimals (e.g. $1.90 → 190000000)
    name: 'sharePriceUsdc8',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    // Total assets under management in USDC, 6 decimals
    name: 'grossAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  // ── Writes ──
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'requestRedeem',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ name: 'batchId', type: 'uint64' }],
  },
  {
    name: 'claimBatch',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'batchId', type: 'uint64' }],
    outputs: [],
  },
  // ── Events ──
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amountHype', type: 'uint256', indexed: false },
      { name: 'sharesMinted', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RedeemRequested',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'shares', type: 'uint256', indexed: false },
      { name: 'batchId', type: 'uint64', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'BatchClaimed',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'batchId', type: 'uint64', indexed: false },
      { name: 'amountHype', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const;

export function rebalancingVaultContract(address: `0x${string}`) {
  return {
    address,
    abi: rebalancingVaultAbi,
  };
}
