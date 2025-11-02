import { formatUnits } from 'viem'

export function formatUnitsSafe(value: bigint | undefined, decimals: number): string {
  if (value === undefined || value === null) return '0'
  try {
    return formatUnits(value, decimals)
  } catch {
    return '0'
  }
}

export function formatCoreBalance(
  raw: bigint,
  weiDecimals: number,
  szDecimals: number
): string {
  const diff = weiDecimals - szDecimals
  let adjusted: bigint = raw
  
  if (diff !== 0) {
    if (diff > 0) {
      adjusted = raw * 10n ** BigInt(diff)
    } else {
      const divisor = 10n ** BigInt(Math.abs(diff))
      if (divisor !== 0n) {
        adjusted = raw / divisor
      }
    }
  }
  
  return formatUnitsSafe(adjusted, szDecimals)
}

