import { formatUnits, parseUnits } from 'viem'

export function formatUnitsSafe(
  value: bigint | string | number | undefined,
  decimals: number
): string {
  if (!value) return '0'
  
  try {
    const bigintValue = typeof value === 'bigint' 
      ? value 
      : BigInt(value.toString())
    
    return formatUnits(bigintValue, decimals)
  } catch {
    return '0'
  }
}

export function parseUnitsSafe(
  value: string | number,
  decimals: number
): bigint {
  try {
    return parseUnits(value.toString(), decimals)
  } catch {
    return 0n
  }
}

export function formatNumber(
  value: string | number,
  options?: {
    decimals?: number
    compact?: boolean
  }
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return '0'
  
  if (options?.compact && num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  } else if (options?.compact && num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  }
  
  const decimals = options?.decimals ?? 2
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  })
}

export function truncateAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Formate une balance de manière lisible pour les humains
 * - Utilise la notation compacte (K, M, B) pour les grandes valeurs
 * - Ajuste le nombre de décimales selon la taille de la valeur
 * - Utilise les séparateurs de milliers
 */
export function formatHumanBalance(
  value: string | number,
  options?: {
    minDecimals?: number
    maxDecimals?: number
    compact?: boolean
  }
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num) || num === 0) return '0'
  
  const minDecimals = options?.minDecimals ?? 0
  const maxDecimals = options?.maxDecimals ?? 8
  const useCompact = options?.compact ?? true
  
  // Notation compacte pour les très grandes valeurs
  if (useCompact) {
    if (Math.abs(num) >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toLocaleString('fr-FR', {
        minimumFractionDigits: Math.min(minDecimals, 2),
        maximumFractionDigits: Math.min(maxDecimals, 2)
      })}B`
    } else if (Math.abs(num) >= 1_000_000) {
      return `${(num / 1_000_000).toLocaleString('fr-FR', {
        minimumFractionDigits: Math.min(minDecimals, 2),
        maximumFractionDigits: Math.min(maxDecimals, 2)
      })}M`
    } else if (Math.abs(num) >= 1_000) {
      return `${(num / 1_000).toLocaleString('fr-FR', {
        minimumFractionDigits: Math.min(minDecimals, 2),
        maximumFractionDigits: Math.min(maxDecimals, 2)
      })}K`
    }
  }
  
  // Pour les valeurs normales, ajuster les décimales selon la taille
  let decimals = maxDecimals
  if (Math.abs(num) >= 1) {
    decimals = Math.min(maxDecimals, 4)
  } else if (Math.abs(num) >= 0.01) {
    decimals = Math.min(maxDecimals, 6)
  } else if (Math.abs(num) >= 0.0001) {
    decimals = Math.min(maxDecimals, 8)
  }
  
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: decimals
  })
}

export function formatCoreBalance(
  value: bigint | number | undefined,
  weiDecimals: number
): string {
  if (value === undefined) return '0'

  const bigintValue = typeof value === 'bigint' ? value : BigInt(value)
  
  // CORRECTION: Ne pas faire de conversion ici car la valeur est déjà normalisée
  // par adjustByDecimals() dans useDashboardData.ts
  // La valeur reçue est déjà en weiDecimals
  const formatted = formatUnitsSafe(bigintValue, weiDecimals)
  return formatHumanBalance(formatted, { minDecimals: 0, maxDecimals: 6, compact: true })
}
