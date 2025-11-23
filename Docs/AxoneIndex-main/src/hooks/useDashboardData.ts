/**
 * @deprecated Ce hook est déprécié. Utilisez useAllVaultsData() pour le dashboard
 * et useVaultCoreData() pour les données spécifiques d'un vault.
 * 
 * Ce hook était utilisé pour récupérer les données d'un seul vault (le premier).
 * Il a été remplacé par useAllVaultsData() qui récupère les données de tous les vaults
 * pour afficher une vue synthétique dans le dashboard.
 */
import { useAccount, useReadContracts, useBalance } from 'wagmi'
import { useVaultConfig } from './useVaultConfig'
import { erc20Contract } from '@/contracts/erc20'
import { vaultContract } from '@/contracts/vault'
import { l1readContract } from '@/contracts/l1read'
import { coreInteractionViewsAbi } from '@/lib/abi/coreInteractionViews'
import { formatUnitsSafe, formatCoreBalance } from '@/lib/format'

// Conversions de décimales Hyperliquid ↔ EVM
// Les oracles oraclePxHype1e8()/oraclePxToken11e8() renvoient un prix normalisé en 1e8 (USD 1e8)
// - TOKEN1: ex. 4500000000 = 45000 USD
// - HYPE: ex. 500000000 = 50 USD
// Pour convertir vers USD 1e18, on monte d'un facteur 1e10 si nécessaire
// Pour convertir un montant HYPE 1e18 en USD 1e18: usd1e18 = (hype1e18 * px1e8) / 1e8
// Pour convertir USD 1e18 en HYPE 1e18: hype1e18 = (usd1e18 * 1e8) / px1e8
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

export function useDashboardData() {
  const { address } = useAccount()
  const { config, isConfigured } = useVaultConfig()

  // Solde natif HYPE (1e18)
  const { data: hypeNative, isLoading: isLoadingNative } = useBalance({
    address,
    query: { enabled: !!address },
  })

  // Utiliser l'adresse du vault si définie, sinon fallback sur la variable d'environnement
  const coreViewsAddress = (config?.coreViewsAddress || process.env.NEXT_PUBLIC_CORE_VIEWS_ADDRESS) as `0x${string}` | undefined

  // Préparer les contrats pour les lectures
  const contracts = config && address ? [
    // USDC balance de l'utilisateur
    {
      ...erc20Contract(config.usdcAddress),
      functionName: 'balanceOf',
      args: [address],
    },
    // USDC decimals
    {
      ...erc20Contract(config.usdcAddress),
      functionName: 'decimals',
    },
    // Vault balance de l'utilisateur
    {
      ...vaultContract(config.vaultAddress),
      functionName: 'balanceOf',
      args: [address],
    },
    // Vault totalSupply
    {
      ...vaultContract(config.vaultAddress),
      functionName: 'totalSupply',
    },
    // Vault decimals
    {
      ...vaultContract(config.vaultAddress),
      functionName: 'decimals',
    },
    // Core USDC balance
    {
      ...l1readContract(config.l1ReadAddress),
      functionName: 'spotBalance',
      args: [config.handlerAddress, BigInt(config.coreTokenIds.usdc)],
    },
    // Core USDC token info
    {
      ...l1readContract(config.l1ReadAddress),
      functionName: 'tokenInfo',
      args: [BigInt(config.coreTokenIds.usdc)],
    },
    // Core HYPE balance
    {
      ...l1readContract(config.l1ReadAddress),
      functionName: 'spotBalance',
      args: [config.handlerAddress, BigInt(config.coreTokenIds.hype)],
    },
    // Core HYPE token info
    {
      ...l1readContract(config.l1ReadAddress),
      functionName: 'tokenInfo',
      args: [BigInt(config.coreTokenIds.hype)],
    },
    // Core TOKEN1 balance
    {
      ...l1readContract(config.l1ReadAddress),
      functionName: 'spotBalance',
      args: [config.handlerAddress, BigInt(config.coreTokenIds.token1)],
    },
    // Core TOKEN1 token info
    {
      ...l1readContract(config.l1ReadAddress),
      functionName: 'tokenInfo',
      args: [BigInt(config.coreTokenIds.token1)],
    },
    // Vault PPS (USD 1e18)
    {
      ...vaultContract(config.vaultAddress),
      functionName: 'pps1e18',
    },
    // Handler core equity (USD 1e18) via CoreInteractionViews
    ...(coreViewsAddress ? [{
      address: coreViewsAddress,
      abi: coreInteractionViewsAbi,
      functionName: 'equitySpotUsd1e18',
      args: [config.handlerAddress],
    }] : []),
    // Oracle TOKEN1 (1e8) via CoreInteractionViews
    ...(coreViewsAddress ? [{
      address: coreViewsAddress,
      abi: coreInteractionViewsAbi,
      functionName: 'oraclePxToken11e8',
      args: [config.handlerAddress],
    }] : []),
    // Oracle HYPE (1e8) via CoreInteractionViews
    ...(coreViewsAddress ? [{
      address: coreViewsAddress,
      abi: coreInteractionViewsAbi,
      functionName: 'oraclePxHype1e8',
      args: [config.handlerAddress],
    }] : []),
  ] : []

  const { data, isLoading, isError, error } = useReadContracts({
    contracts,
    query: {
      enabled: isConfigured && !!address,
    },
  })

  // Formater les données
  // Helper de normalisation défensive: si une valeur 1e18 paraît sur-échelle, on corrige visuellement
  const normalize1e18 = (raw: bigint | undefined, decimals: number = 18): string => {
    if (raw === undefined) return '0'
    const v = formatUnitsSafe(raw, decimals)
    const n = Number.parseFloat(v)
    if (!Number.isFinite(n)) return v
    // Gardes: PPS ne devrait pas dépasser 1e9, Equity global ne devrait pas dépasser 1e15 USD côté testnet
    // Si dépassement, on assume un double-scaling en amont et on réapplique une division 1e18 (affichage uniquement)
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

  // Calculer les indices dynamiquement en fonction de la présence de coreViewsAddress
  // Les 11 premiers contrats sont toujours présents (USDC, Vault, Core balances/info, PPS)
  // Les indices 12, 13, 14 sont conditionnels (equity, token1 price, hype price)
  const baseIndex = 11
  const equityIndex = coreViewsAddress ? baseIndex + 1 : -1
  const token1PriceIndex = coreViewsAddress ? baseIndex + 2 : -1
  const hypePriceIndex = coreViewsAddress ? baseIndex + 3 : -1

  const formattedData = data ? {
    usdcBalance: formatUnitsSafe(
      data[0]?.result as bigint,
      ((data[1]?.result as number) ?? 8)
    ),
    usdcDecimals: ((data[1]?.result as number) ?? 8),
    vaultShares: formatUnitsSafe(data[2]?.result as bigint, (data[4]?.result as number) || 18),
    vaultTotalSupply: formatUnitsSafe(data[3]?.result as bigint, (data[4]?.result as number) || 18),
    vaultDecimals: (data[4]?.result as number) || 18,
    coreBalances: {
      usdc: buildCoreBalance(
        config?.coreTokenIds.usdc,
        data[5]?.result as SpotBalanceResult | undefined,
        data[6]?.result as TokenInfoResult | undefined,
        CORE_TOKEN_DEFAULTS.usdc
      ),
      hype: buildCoreBalance(
        config?.coreTokenIds.hype,
        data[7]?.result as SpotBalanceResult | undefined,
        data[8]?.result as TokenInfoResult | undefined,
        CORE_TOKEN_DEFAULTS.hype
      ),
      token1: buildCoreBalance(
        config?.coreTokenIds.token1,
        data[9]?.result as SpotBalanceResult | undefined,
        data[10]?.result as TokenInfoResult | undefined,
        CORE_TOKEN_DEFAULTS.token1
      ),
    },
    // Brutes - utiliser les indices calculés dynamiquement
    coreEquityUsdRaw: equityIndex >= 0 ? (data[equityIndex]?.result as bigint | undefined) : undefined,
    ppsRaw: data[baseIndex]?.result as bigint | undefined,
    // Formatées standard 1e18
    coreEquityUsd: formatUnitsSafe(equityIndex >= 0 ? (data[equityIndex]?.result as bigint | undefined) : undefined, 18),
    // CORRECTION: Utiliser les pxDecimals réels Hyperliquid au lieu de 1e8 fixe
    // Utiliser les indices calculés dynamiquement
    oraclePxToken1: formatUnitsSafe(token1PriceIndex >= 0 ? (data[token1PriceIndex]?.result as bigint | undefined) : undefined, PX_DECIMALS.token1),
    oraclePxHype: formatUnitsSafe(hypePriceIndex >= 0 ? (data[hypePriceIndex]?.result as bigint | undefined) : undefined, PX_DECIMALS.hype),
    pps: formatUnitsSafe(data[baseIndex]?.result as bigint, 18),
    // Affichages normalisés (garde visuelle anti double-scaling)
    coreEquityDisplay: normalize1e18(equityIndex >= 0 ? (data[equityIndex]?.result as bigint | undefined) : undefined, 18),
    ppsDisplay: normalize1e18(data[baseIndex]?.result as bigint | undefined, 18),
    hypeNativeBalance: formatUnitsSafe(hypeNative?.value as bigint | undefined, hypeNative?.decimals ?? 18),
  } : null

  return {
    data: formattedData,
    isLoading: isLoading || isLoadingNative,
    isError,
    error,
    isConfigured,
    address,
    config,
  }
}