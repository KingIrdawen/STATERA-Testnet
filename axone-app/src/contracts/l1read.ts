// ABI simplifié pour L1Read - à compléter selon votre contrat
export const l1readAbi = [
  {
    name: 'spotBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'total', type: 'uint256' },
          { name: 'hold', type: 'uint256' },
          { name: 'entryNtl', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'tokenInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'spots', type: 'uint256[]' },
          { name: 'deployerTradingFeeShare', type: 'uint256' },
          { name: 'deployer', type: 'address' },
          { name: 'evmContract', type: 'address' },
          { name: 'szDecimals', type: 'uint8' },
          { name: 'weiDecimals', type: 'uint8' },
          { name: 'evmExtraWeiDecimals', type: 'uint8' },
        ],
      },
    ],
  },
] as const

export function l1readContract(address: string) {
  return {
    address: address as `0x${string}`,
    abi: l1readAbi,
  }
}

