import { useAccount, useReadContracts, useBalance } from 'wagmi'
import { Index } from '@/types/index'
import { erc20Contract } from '@/contracts/erc20'
import { vaultContract } from '@/contracts/vault'
import { l1readContract } from '@/contracts/l1read'
import { coreInteractionHandlerContract } from '@/contracts/coreInteractionHandler'
import { formatUnitsSafe, formatCoreBalance } from '@/lib/format'

const PX_DECIMALS = {
  btc: 8,
  hype: 8,
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

function adjustByDecimals(value: bigint, weiDecimals: number, szDecimals: number) {
  const diff = weiDecimals - szDecimals
  if (diff === 0) return value
  if (diff > 0) {
    return value * 10n ** BigInt(diff)
  }

  const divisor = 10n ** BigInt(Math.abs(diff))
  if (divisor === 0n) return value
  return value / divisor
}

function buildCoreBalance(
  tokenId: number | undefined,
  spot: SpotBalanceResult | undefined,
  info: TokenInfoResult | undefined
): CoreBalanceData {
  const total = spot?.total ?? 0n
  const szDecimals = typeof info?.szDecimals === 'number' ? info.szDecimals : undefined
  const weiDecimals = typeof info?.weiDecimals === 'number' ? info.weiDecimals : undefined

  const fallbackWeiDecimals = weiDecimals ?? 8
  const fallbackSzDecimals = szDecimals ?? fallbackWeiDecimals
  const normalized = adjustByDecimals(total, fallbackWeiDecimals, fallbackSzDecimals)

  return {
    tokenId: tokenId ?? 0,
    balance: formatCoreBalance(total, fallbackWeiDecimals, fallbackSzDecimals),
    raw: total,
    normalized,
    decimals: {
      szDecimals: fallbackSzDecimals,
      weiDecimals: fallbackWeiDecimals,
      adjustmentPower: fallbackWeiDecimals - fallbackSzDecimals,
      isInferred: typeof weiDecimals !== 'number' || typeof szDecimals !== 'number',
    },
  }
}

export function useStrategyData(strategy: Index | null) {
  const { address } = useAccount()

  // Extraire tous les tokens avec un tokenId valide de la stratégie
  const tokensWithIds = strategy?.tokens
    .filter((token) => token.tokenId && token.tokenId.trim() !== '')
    .map((token) => ({
      symbol: token.symbol,
      tokenId: token.tokenId,
    })) || []

  // Extraire les tokenIds pour les tokens connus (pour les oracles spécifiques)
  const getTokenId = (symbol: string): string | undefined => {
    return strategy?.tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase())?.tokenId
  }

  const usdcTokenId = getTokenId('USDC')
  const hypeTokenId = getTokenId('HYPE')
  const btcTokenId = getTokenId('BTC')

  const isConfigured =
    !!strategy &&
    !!strategy.usdcAddress &&
    !!strategy.vaultAddress &&
    !!strategy.handlerAddress &&
    !!strategy.l1ReadAddress &&
    !!address

  // Préparer les contrats pour les lectures
  const contracts = isConfigured
    ? [
        // USDC balance de l'utilisateur
        {
          ...erc20Contract(strategy.usdcAddress),
          functionName: 'balanceOf' as const,
          args: [address],
        },
        // USDC decimals
        {
          ...erc20Contract(strategy.usdcAddress),
          functionName: 'decimals' as const,
        },
        // Vault balance de l'utilisateur
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'balanceOf' as const,
          args: [address],
        },
        // Vault totalSupply
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'totalSupply' as const,
        },
        // Vault decimals
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'decimals' as const,
        },
        // Core balances pour TOUS les tokens de la stratégie avec un tokenId
        ...tokensWithIds.flatMap((token) => [
          {
            ...l1readContract(strategy.l1ReadAddress),
            functionName: 'spotBalance' as const,
            args: [strategy.handlerAddress as `0x${string}`, BigInt(token.tokenId)],
          },
          {
            ...l1readContract(strategy.l1ReadAddress),
            functionName: 'tokenInfo' as const,
            args: [BigInt(token.tokenId)],
          },
        ]),
        // Handler core equity (USD 1e18)
        {
          ...coreInteractionHandlerContract(strategy.handlerAddress),
          functionName: 'equitySpotUsd1e18' as const,
        },
        // Oracle BTC (1e8)
        {
          ...coreInteractionHandlerContract(strategy.handlerAddress),
          functionName: 'oraclePxBtc1e8' as const,
        },
        // Oracle HYPE (1e8)
        {
          ...coreInteractionHandlerContract(strategy.handlerAddress),
          functionName: 'oraclePxHype1e8' as const,
        },
        // Vault PPS (USD 1e18)
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'pps1e18' as const,
        },
      ]
    : []

  const { data, isLoading, isError, error } = useReadContracts({
    contracts,
    query: {
      enabled: isConfigured,
    },
  })

  // Formater les données
  let contractIndex = 0
  const usdcBalance = data?.[contractIndex++]?.result as bigint | undefined
  const usdcDecimalsResult = data?.[contractIndex++]?.result as number | undefined
  const usdcDecimals = usdcDecimalsResult ?? 8
  const vaultShares = data?.[contractIndex++]?.result as bigint | undefined
  const vaultTotalSupply = data?.[contractIndex++]?.result as bigint | undefined
  const vaultDecimals = (data?.[contractIndex++]?.result as number | undefined) ?? 18

  // Core balances pour TOUS les tokens de la stratégie (dynamiques)
  const coreBalances: Record<string, CoreBalanceData> = {}

  tokensWithIds.forEach((token) => {
    const spot = data?.[contractIndex++]?.result as SpotBalanceResult | undefined
    const info = data?.[contractIndex++]?.result as TokenInfoResult | undefined
    coreBalances[token.symbol.toLowerCase()] = buildCoreBalance(
      parseInt(token.tokenId),
      spot,
      info
    )
  })

  const coreEquityUsdRaw = data?.[contractIndex++]?.result as bigint | undefined
  const oraclePxBtcRaw = data?.[contractIndex++]?.result as bigint | undefined
  const oraclePxHypeRaw = data?.[contractIndex++]?.result as bigint | undefined
  const ppsRaw = data?.[contractIndex++]?.result as bigint | undefined

  const formattedData = isConfigured
    ? {
        usdcBalance: formatUnitsSafe(usdcBalance, usdcDecimals),
        usdcDecimals,
        vaultShares: formatUnitsSafe(vaultShares, vaultDecimals),
        vaultTotalSupply: formatUnitsSafe(vaultTotalSupply, vaultDecimals),
        vaultDecimals,
        coreBalances,
        coreEquityUsdRaw,
        coreEquityUsd: formatUnitsSafe(coreEquityUsdRaw, 18),
        oraclePxBtc: formatUnitsSafe(oraclePxBtcRaw, PX_DECIMALS.btc),
        oraclePxHype: formatUnitsSafe(oraclePxHypeRaw, PX_DECIMALS.hype),
        ppsRaw,
        pps: formatUnitsSafe(ppsRaw, 18),
      }
    : null

  return {
    data: formattedData,
    isLoading,
    isError,
    error,
    isConfigured,
    address,
  }
}

