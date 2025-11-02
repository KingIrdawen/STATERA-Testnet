// ABI simplifié pour CoreInteractionHandler - à compléter selon votre contrat
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
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'oraclePxHype1e8',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export function coreInteractionHandlerContract(address: string) {
  return {
    address: address as `0x${string}`,
    abi: coreInteractionHandlerAbi,
  }
}

