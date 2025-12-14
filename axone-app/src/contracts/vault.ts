// ABI pour VaultContract - dépôts en HYPE natif
// Includes custom errors for better revert decoding
export const vaultAbi = [
  // Functions
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
    name: 'pps1e18',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'nav1e18',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'deposits',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getWithdrawFeeBpsForAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'amount1e18', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint16' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'depositFeeBps',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint16' }],
  },
  {
    name: 'withdrawFeeBps',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint16' }],
  },
  {
    name: 'handler',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  // Custom errors for better revert decoding
  {
    type: 'error',
    name: 'ContractPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'HandlerNotSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ViewsNotSet',
    inputs: [],
  },
  {
    type: 'error',
    name: 'PriceZero',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FeeVaultZero',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AmountZero',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FeeSendFail',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NativePayFail',
    inputs: [],
  },
  {
    type: 'error',
    name: 'EmptyVault',
    inputs: [],
  },
] as const

export function vaultContract(address: string) {
  return {
    address: address as `0x${string}`,
    abi: vaultAbi,
  }
}

