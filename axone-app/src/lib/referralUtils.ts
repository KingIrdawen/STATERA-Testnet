import { keccak256, toBytes } from 'viem';

export const HYPEREVM_CHAIN_ID = 998;

export function getCodeHash(code: string): `0x${string}` {
  return keccak256(toBytes(code));
}


