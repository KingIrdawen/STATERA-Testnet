// ABI pour CoreInteractionHandler - correspond au contrat réel
// Supporte STRATEGY_1 (oraclePxBtc1e8) et ERA_2 (oraclePxToken11e8)
export const coreInteractionHandlerAbi = [
  {
    name: 'equitySpotUsd1e18',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'oraclePxBtc1e8',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'oraclePxToken11e8',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
  {
    name: 'oraclePxHype1e8',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
  },
] as const

export function coreInteractionHandlerContract(address: string) {
  return {
    address: address as `0x${string}`,
    abi: coreInteractionHandlerAbi,
  }
}

