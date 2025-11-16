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

/**
 * Formate une valeur en USD
 * @param v Valeur numérique (peut être undefined)
 * @param d Nombre de décimales (par défaut 2)
 * @returns String formatée comme "$X.XX" ou "-" si undefined
 */
export function formatUsd(v?: number, d: number = 2): string {
  if (v == null || isNaN(v)) return '-'
  return `$${v.toFixed(d)}`
}

/**
 * Formate des basis points (bps) en bps et pourcentage
 * @param bps Valeur en basis points (peut être undefined)
 * @returns String formatée comme "X bps (Y.YY%)" ou "-" si undefined
 */
export function formatBps(bps?: number): string {
  if (bps == null || isNaN(bps)) return '-'
  const percent = (bps / 10000 * 100).toFixed(2) // Convertir bps en pourcentage (10000 bps = 100%)
  return `${bps} bps (${percent}%)`
}

