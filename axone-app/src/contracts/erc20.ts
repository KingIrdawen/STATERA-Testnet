import { erc20Abi } from 'viem'

export function erc20Contract(address: string) {
  return {
    address: address as `0x${string}`,
    abi: erc20Abi,
  }
}

