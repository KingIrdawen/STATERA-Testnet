// ABI pour L1Read - correspond au contrat réel
export const l1readAbi = [
  {
    name: 'spotBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'uint64' }, // Le contrat utilise uint64, pas uint256
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'total', type: 'int128' }, // Le contrat retourne int128, pas uint256
          { name: 'hold', type: 'int128' },
          { name: 'entryNtl', type: 'int128' },
        ],
      },
    ],
  },
  {
    name: 'tokenInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'uint32' }], // Le contrat utilise uint32, pas uint256
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'spots', type: 'uint64[]' }, // Le contrat utilise uint64[], pas uint256[]
          { name: 'deployerTradingFeeShare', type: 'uint64' },
          { name: 'deployer', type: 'address' },
          { name: 'evmContract', type: 'address' },
          { name: 'szDecimals', type: 'uint8' },
          { name: 'weiDecimals', type: 'uint8' },
          { name: 'evmExtraWeiDecimals', type: 'int8' }, // Le contrat utilise int8, pas uint8
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

