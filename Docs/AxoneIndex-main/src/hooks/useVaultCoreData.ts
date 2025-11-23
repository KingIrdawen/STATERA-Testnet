import { useReadContracts } from 'wagmi'
import { l1readContract } from '@/contracts/l1read'
import { coreInteractionViewsAbi } from '@/lib/abi/coreInteractionViews'
import { formatUnitsSafe, formatCoreBalance } from '@/lib/format'
import type { VaultDefinition } from '@/types/vaults'

// Conversions de décimales Hyperliquid ↔ EVM
const PX_DECIMALS = {
  token1: 8,   // TOKEN1 prix normalisé en 1e8 (ex: 4500000000 = 45000 USD)
  hype: 8,  // HYPE prix normalisé en 1e8 (ex: 500000000 = 50 USD)
} as const

const CORE_TOKEN_DEFAULTS = {
  usdc: { szDecimals: 8, weiDecimals: 8 },
  hype: { szDecimals: 6, weiDecimals: 8 },
  token1: { szDecimals: 4, weiDecimals: 10 },
} as const

type SpotBalanceResult = {
  total: bigint
  hold: bigint
  entryNtl: bigint
}

type TokenInfoResult = {
  name: string
  spots: bigint[]
  deployerTradingFeeShare: bigint
  deployer: `0x${string}`
  evmContract: `0x${string}`
  szDecimals: number
  weiDecimals: number
  evmExtraWeiDecimals: number
}

type CoreBalanceData = {
  tokenId: number
  name: string
  balance: string
  raw: bigint
  normalized: bigint
  decimals: {
    szDecimals: number
    weiDecimals: number
    adjustmentPower: number
    isInferred: boolean
  }
}

export function useVaultCoreData(vault: VaultDefinition | undefined) {
  // Utiliser l'adresse du vault si définie, sinon fallback sur la variable d'environnement
  const coreViewsAddress = (vault?.coreViewsAddress || process.env.NEXT_PUBLIC_CORE_VIEWS_ADDRESS) as `0x${string}` | undefined

  // Préparer les contrats pour les lectures
  const contracts = vault && vault.handlerAddress ? [
    // Core USDC balance
    {
      ...l1readContract(vault.l1ReadAddress),
      functionName: 'spotBalance',
      args: [vault.handlerAddress, BigInt(vault.coreTokenIds.usdc)],
    },
    // Core USDC token info
    {
      ...l1readContract(vault.l1ReadAddress),
      functionName: 'tokenInfo',
      args: [BigInt(vault.coreTokenIds.usdc)],
    },
    // Core HYPE balance
    {
      ...l1readContract(vault.l1ReadAddress),
      functionName: 'spotBalance',
      args: [vault.handlerAddress, BigInt(vault.coreTokenIds.hype)],
    },
    // Core HYPE token info
    {
      ...l1readContract(vault.l1ReadAddress),
      functionName: 'tokenInfo',
      args: [BigInt(vault.coreTokenIds.hype)],
    },
    // Core TOKEN1 balance
    {
      ...l1readContract(vault.l1ReadAddress),
      functionName: 'spotBalance',
      args: [vault.handlerAddress, BigInt(vault.coreTokenIds.token1)],
    },
    // Core TOKEN1 token info
    {
      ...l1readContract(vault.l1ReadAddress),
      functionName: 'tokenInfo',
      args: [BigInt(vault.coreTokenIds.token1)],
    },
    // Handler core equity (USD 1e18) via CoreInteractionViews
    ...(coreViewsAddress ? [{
      address: coreViewsAddress,
      abi: coreInteractionViewsAbi,
      functionName: 'equitySpotUsd1e18',
      args: [vault.handlerAddress],
    }] : []),
    // Oracle TOKEN1 (1e8) via CoreInteractionViews
    ...(coreViewsAddress ? [{
      address: coreViewsAddress,
      abi: coreInteractionViewsAbi,
      functionName: 'oraclePxToken11e8',
      args: [vault.handlerAddress],
    }] : []),
    // Oracle HYPE (1e8) via CoreInteractionViews
    ...(coreViewsAddress ? [{
      address: coreViewsAddress,
      abi: coreInteractionViewsAbi,
      functionName: 'oraclePxHype1e8',
      args: [vault.handlerAddress],
    }] : []),
  ] : []

  const { data, isLoading, isError, error } = useReadContracts({
    contracts,
    query: {
      enabled: !!vault && !!vault.handlerAddress,
    },
  })

  // Calculer les indices dynamiquement en fonction de la présence de coreViewsAddress
  // Les 6 premiers contrats sont toujours présents (balances et tokenInfo pour USDC, HYPE, TOKEN1)
  const baseIndex = 6
  const equityIndex = coreViewsAddress ? baseIndex : -1
  const token1PriceIndex = coreViewsAddress ? baseIndex + 1 : -1
  const hypePriceIndex = coreViewsAddress ? baseIndex + 2 : -1

  // Log pour diagnostiquer les problèmes de récupération des prix oracle
  if (process.env.NODE_ENV === 'development') {
    if (!coreViewsAddress) {
      console.warn('[useVaultCoreData] NEXT_PUBLIC_CORE_VIEWS_ADDRESS n\'est pas défini. Les prix oracle ne seront pas récupérés.')
    } else if (data) {
      console.log('[useVaultCoreData] Diagnostic des prix oracle:', {
        contractsLength: contracts.length,
        dataLength: data.length,
        equityIndex,
        token1PriceIndex,
        hypePriceIndex,
        coreViewsAddress,
        handlerAddress: vault?.handlerAddress,
      })

      // Vérifier les erreurs avec les indices calculés dynamiquement
      if (equityIndex >= 0) {
        if (data[equityIndex]?.error) {
          console.error('[useVaultCoreData] Erreur lors de la récupération de equitySpotUsd1e18 (index', equityIndex, '):', data[equityIndex].error)
        } else {
          const equityResult = data[equityIndex]?.result
          console.log('[useVaultCoreData] equitySpotUsd1e18 (index', equityIndex, '):', {
            result: equityResult?.toString(),
            type: typeof equityResult,
            isBigInt: typeof equityResult === 'bigint',
          })
        }
      }

      if (token1PriceIndex >= 0) {
        if (data[token1PriceIndex]?.error) {
          console.error('[useVaultCoreData] Erreur lors de la récupération de oraclePxToken11e8 (index', token1PriceIndex, '):', data[token1PriceIndex].error)
        } else {
          const token1Result = data[token1PriceIndex]?.result
          console.log('[useVaultCoreData] oraclePxToken11e8 (index', token1PriceIndex, '):', {
            result: token1Result?.toString(),
            type: typeof token1Result,
            isBigInt: typeof token1Result === 'bigint',
            isNumber: typeof token1Result === 'number',
            formatted: token1Result ? formatUnitsSafe(BigInt(token1Result), PX_DECIMALS.token1) : 'N/A',
          })
        }
      }

      if (hypePriceIndex >= 0) {
        if (data[hypePriceIndex]?.error) {
          console.error('[useVaultCoreData] Erreur lors de la récupération de oraclePxHype1e8 (index', hypePriceIndex, '):', data[hypePriceIndex].error)
        } else {
          const hypeResult = data[hypePriceIndex]?.result
          console.log('[useVaultCoreData] oraclePxHype1e8 (index', hypePriceIndex, '):', {
            result: hypeResult?.toString(),
            type: typeof hypeResult,
            isBigInt: typeof hypeResult === 'bigint',
            isNumber: typeof hypeResult === 'number',
            formatted: hypeResult ? formatUnitsSafe(BigInt(hypeResult), PX_DECIMALS.hype) : 'N/A',
          })
        }
      }

      // Afficher tous les résultats pour debug
      console.log('[useVaultCoreData] Tous les résultats:', data.map((item, idx) => {
        const resultStr = item?.result?.toString()
        const resultLength = resultStr?.length ?? 0
        return {
          index: idx,
          hasResult: !!item?.result,
          hasError: !!item?.error,
          resultType: typeof item?.result,
          result: resultStr ? resultStr.substring(0, 20) + (resultLength > 20 ? '...' : '') : '',
          error: item?.error?.message || item?.error,
        }
      }))
    }

    if (isError) {
      console.error('[useVaultCoreData] Erreur globale useReadContracts:', error)
    }
  }

  // Helper de normalisation défensive
  const normalize1e18 = (raw: bigint | undefined, decimals: number = 18): string => {
    if (raw === undefined) return '0'
    const v = formatUnitsSafe(raw, decimals)
    const n = Number.parseFloat(v)
    if (!Number.isFinite(n)) return v
    // Gardes: PPS ne devrait pas dépasser 1e9, Equity global ne devrait pas dépasser 1e15 USD côté testnet
    if ((decimals === 18 && n > 1_000_000_000) || n > 1_000_000_000_000_000) {
      return formatUnitsSafe(raw, decimals + 18)
    }
    return v
  }

  const adjustByDecimals = (value: bigint, weiDecimals: number, szDecimals: number) => {
    const diff = weiDecimals - szDecimals
    if (diff === 0) return value
    if (diff > 0) {
      return value * 10n ** BigInt(diff)
    }

    const divisor = 10n ** BigInt(Math.abs(diff))
    if (divisor === 0n) return value
    return value / divisor
  }

  const buildCoreBalance = (
    tokenId: number | undefined,
    spot: SpotBalanceResult | undefined,
    info: TokenInfoResult | undefined,
    defaults?: { szDecimals: number; weiDecimals: number }
  ): CoreBalanceData => {
    const total = spot?.total ?? 0n
    const szDecimals = typeof info?.szDecimals === 'number' ? info.szDecimals : undefined
    const weiDecimals = typeof info?.weiDecimals === 'number' ? info.weiDecimals : undefined
    const tokenName = typeof info?.name === 'string' ? info.name : 'Unknown'

    const defaultWeiDecimals = defaults?.weiDecimals ?? 8
    const defaultSzDecimals = defaults?.szDecimals ?? defaultWeiDecimals

    const fallbackWeiDecimals = weiDecimals ?? defaultWeiDecimals
    const fallbackSzDecimals = szDecimals ?? defaultSzDecimals
    
    // CORRECTION: spotBalance.total est déjà en weiDecimals selon CoreHandlerLib.sol
    // Ne PAS faire de conversion szDecimals → weiDecimals car cela multiplierait incorrectement
    // Si total est déjà en weiDecimals, on l'utilise directement
    const normalized = total

    return {
      tokenId: tokenId ?? 0,
      name: tokenName,
      balance: formatCoreBalance(normalized, fallbackWeiDecimals),
      raw: total,
      normalized,
      decimals: {
        szDecimals: fallbackSzDecimals,
        weiDecimals: fallbackWeiDecimals,
        adjustmentPower: 0, // Plus d'ajustement car total est déjà en weiDecimals
        isInferred: typeof weiDecimals !== 'number' || typeof szDecimals !== 'number',
      },
    }
  }

  // Helper pour convertir un résultat en bigint (gère number, bigint, string)
  const toBigintSafe = (value: unknown): bigint | undefined => {
    if (value === null || value === undefined) return undefined
    if (typeof value === 'bigint') return value
    if (typeof value === 'number') {
      // Vérifier que le nombre est un entier
      if (!Number.isInteger(value)) return undefined
      return BigInt(value)
    }
    if (typeof value === 'string') {
      try {
        return BigInt(value)
      } catch {
        return undefined
      }
    }
    return undefined
  }

  // Extraire les résultats oracle avec conversion sécurisée
  const equityRaw = equityIndex >= 0 ? toBigintSafe(data?.[equityIndex]?.result) : undefined
  const token1PriceRaw = token1PriceIndex >= 0 ? toBigintSafe(data?.[token1PriceIndex]?.result) : undefined
  const hypePriceRaw = hypePriceIndex >= 0 ? toBigintSafe(data?.[hypePriceIndex]?.result) : undefined

  const formattedData = data ? {
    coreBalances: {
      usdc: buildCoreBalance(
        vault?.coreTokenIds.usdc,
        data[0]?.result as SpotBalanceResult | undefined,
        data[1]?.result as TokenInfoResult | undefined,
        CORE_TOKEN_DEFAULTS.usdc
      ),
      hype: buildCoreBalance(
        vault?.coreTokenIds.hype,
        data[2]?.result as SpotBalanceResult | undefined,
        data[3]?.result as TokenInfoResult | undefined,
        CORE_TOKEN_DEFAULTS.hype
      ),
      token1: buildCoreBalance(
        vault?.coreTokenIds.token1,
        data[4]?.result as SpotBalanceResult | undefined,
        data[5]?.result as TokenInfoResult | undefined,
        CORE_TOKEN_DEFAULTS.token1
      ),
    },
    // Brutes - utiliser les indices calculés dynamiquement avec conversion sécurisée
    coreEquityUsdRaw: equityRaw,
    // Formatées standard 1e18
    coreEquityUsd: formatUnitsSafe(equityRaw, 18),
    // CORRECTION: Utiliser les pxDecimals réels Hyperliquid au lieu de 1e8 fixe
    // Utiliser les indices calculés dynamiquement avec conversion sécurisée
    oraclePxToken1: formatUnitsSafe(token1PriceRaw, PX_DECIMALS.token1),
    oraclePxHype: formatUnitsSafe(hypePriceRaw, PX_DECIMALS.hype),
    // Affichages normalisés (garde visuelle anti double-scaling)
    coreEquityDisplay: normalize1e18(equityRaw, 18),
  } : null

  return {
    data: formattedData,
    isLoading,
    isError,
    error,
  }
}

