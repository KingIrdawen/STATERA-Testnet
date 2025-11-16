import { useAccount, useReadContracts, useBalance } from 'wagmi'
import { Index } from '@/types/index'
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
    .filter((token) => {
      if (!token.tokenId || token.tokenId.trim() === '') return false;
      // Vérifier si c'est un nombre valide (décimal ou hexadécimal)
      const tokenIdStr = token.tokenId.trim();
      // Si c'est en hexadécimal (commence par 0x), convertir en décimal
      if (tokenIdStr.startsWith('0x')) {
        try {
          BigInt(tokenIdStr);
          return true;
        } catch {
          return false;
        }
      }
      // Sinon, vérifier si c'est un nombre
      return !isNaN(parseInt(tokenIdStr));
    })
    .map((token) => {
      const tokenIdStr = token.tokenId.trim();
      // Convertir hexadécimal en décimal si nécessaire
      let tokenId: string;
      if (tokenIdStr.startsWith('0x')) {
        try {
          tokenId = BigInt(tokenIdStr).toString();
        } catch {
          tokenId = tokenIdStr;
        }
      } else {
        tokenId = tokenIdStr;
      }
      return {
        symbol: token.symbol,
        tokenId,
      };
    }) || []

  // Extraire les tokenIds pour les tokens connus (pour les oracles spécifiques)
  const getTokenId = (symbol: string): string | undefined => {
    return strategy?.tokens.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase())?.tokenId
  }

  const usdcTokenId = getTokenId('USDC')
  const hypeTokenId = getTokenId('HYPE')
  const btcTokenId = getTokenId('BTC')

  // Récupérer le solde HYPE natif du wallet
  const { data: hypeBalance, isLoading: isLoadingHype } = useBalance({
    address,
    query: { enabled: !!address },
  })

  // Récupérer le solde HYPE natif du vault (pour calculer le total HYPE déposé)
  const { data: vaultHypeBalance } = useBalance({
    address: strategy?.vaultAddress as `0x${string}` | undefined,
    query: { enabled: !!strategy?.vaultAddress },
  })

  const isConfigured =
    !!strategy &&
    !!strategy.vaultAddress &&
    !!strategy.handlerAddress &&
    !!strategy.l1ReadAddress &&
    !!address

  // Préparer les contrats pour les lectures
  const contracts = isConfigured
    ? [
        // Vault balance de l'utilisateur (parts)
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'balanceOf' as const,
          args: [address],
        },
        // Vault totalSupply (parts totales)
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'totalSupply' as const,
        },
        // Vault decimals (généralement 18)
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'decimals' as const,
        },
        // Dépôts cumulés de l'utilisateur en HYPE (1e18)
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'deposits' as const,
          args: [address],
        },
        // NAV totale du vault en USD (1e18)
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'nav1e18' as const,
        },
        // Vault PPS (prix par share en USD 1e18)
        {
          ...vaultContract(strategy.vaultAddress),
          functionName: 'pps1e18' as const,
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
        // Oracle BTC (1e8) - retourne uint64
        {
          ...coreInteractionHandlerContract(strategy.handlerAddress),
          functionName: 'oraclePxBtc1e8' as const,
        },
        // Oracle HYPE (1e8) - retourne uint64
        {
          ...coreInteractionHandlerContract(strategy.handlerAddress),
          functionName: 'oraclePxHype1e8' as const,
        },
      ]
    : []

  const { data, isLoading, isError, error } = useReadContracts({
    contracts,
    query: {
      enabled: isConfigured,
      retry: 0, // Pas de retry pour accélérer - si ça échoue, on réessaiera au prochain render
      staleTime: 300000, // 5 minutes - augmenté pour réduire les appels
      gcTime: 600000, // 10 minutes de cache - augmenté pour garder les données plus longtemps
      refetchOnWindowFocus: false, // Ne pas refetch quand on revient sur la fenêtre
      refetchOnReconnect: false, // Ne pas refetch automatiquement après reconnexion
    },
  })

  // Formater les données
  let contractIndex = 0
  const vaultShares = data?.[contractIndex++]?.result as bigint | undefined
  const vaultTotalSupply = data?.[contractIndex++]?.result as bigint | undefined
  const vaultDecimals = (data?.[contractIndex++]?.result as number | undefined) ?? 18
  const userDepositsHype = data?.[contractIndex++]?.result as bigint | undefined // Dépôts cumulés utilisateur en HYPE (1e18)
  const navUsd1e18 = data?.[contractIndex++]?.result as bigint | undefined // NAV totale en USD (1e18)
  const ppsRaw = data?.[contractIndex++]?.result as bigint | undefined // Prix par share en USD (1e18)

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

  // Calculer le total HYPE déposé dans le vault
  // Le vault stocke du HYPE natif (address(this).balance) et a aussi de l'equity Core
  // Total HYPE = HYPE natif du vault + HYPE équivalent de l'equity Core
  const oraclePxHype1e8 = oraclePxHypeRaw ? BigInt(oraclePxHypeRaw) : 0n
  const vaultHypeBalanceRaw = vaultHypeBalance?.value || 0n // HYPE natif dans le vault (1e18)
  const coreEquityHype = coreEquityUsdRaw && oraclePxHype1e8 > 0n
    ? (coreEquityUsdRaw * 10n ** 8n) / oraclePxHype1e8 // Convertir Core Equity USD en HYPE
    : 0n
  const totalHypeDeposited = vaultHypeBalanceRaw + coreEquityHype

  // Calculer les dépôts de l'utilisateur en HYPE (déjà en 1e18)
  const userDepositsHypeFormatted = formatUnitsSafe(userDepositsHype, 18)

  // Calculer la part de l'utilisateur (shares / totalSupply)
  const userShare = vaultShares && vaultTotalSupply && vaultTotalSupply > 0n
    ? Number(vaultShares) / Number(vaultTotalSupply)
    : 0

  const formattedData = isConfigured
    ? {
        // Solde HYPE natif du wallet
        hypeBalance: formatUnitsSafe(hypeBalance?.value, hypeBalance?.decimals ?? 18),
        hypeBalanceRaw: hypeBalance?.value,
        // Parts du vault de l'utilisateur
        vaultShares: formatUnitsSafe(vaultShares, vaultDecimals),
        vaultSharesRaw: vaultShares,
        // Total des parts émises
        vaultTotalSupply: formatUnitsSafe(vaultTotalSupply, vaultDecimals),
        vaultTotalSupplyRaw: vaultTotalSupply,
        vaultDecimals,
        // Dépôts cumulés de l'utilisateur en HYPE
        userDepositsHype: userDepositsHypeFormatted,
        userDepositsHypeRaw: userDepositsHype,
        // Total HYPE déposé dans le vault
        totalHypeDeposited: formatUnitsSafe(totalHypeDeposited, 18),
        totalHypeDepositedRaw: totalHypeDeposited,
        // Part de l'utilisateur (ratio)
        userShare,
        // NAV et PPS
        navUsd1e18: formatUnitsSafe(navUsd1e18, 18),
        navUsd1e18Raw: navUsd1e18,
        ppsRaw,
        pps: formatUnitsSafe(ppsRaw, 18),
        // Core balances
        coreBalances,
        coreEquityUsdRaw,
        coreEquityUsd: formatUnitsSafe(coreEquityUsdRaw, 18),
        // Oracles
        oraclePxBtc: formatUnitsSafe(oraclePxBtcRaw ? BigInt(oraclePxBtcRaw) : 0n, PX_DECIMALS.btc),
        oraclePxHype: formatUnitsSafe(oraclePxHypeRaw ? BigInt(oraclePxHypeRaw) : 0n, PX_DECIMALS.hype),
        oraclePxHypeRaw: oraclePxHypeRaw ? BigInt(oraclePxHypeRaw) : 0n,
      }
    : null

  // Log de débogage désactivé pour réduire le bruit dans la console
  // Décommenter si nécessaire pour le débogage
  // if (isConfigured && data && formattedData) {
  //   console.log('[useStrategyData] Debug:', {
  //     vaultAddress: strategy?.vaultAddress,
  //     userAddress: address,
  //     vaultSharesRaw: formattedData.vaultSharesRaw?.toString(),
  //     vaultSharesFormatted: formattedData.vaultShares,
  //     vaultTotalSupplyRaw: formattedData.vaultTotalSupplyRaw?.toString(),
  //     vaultTotalSupplyFormatted: formattedData.vaultTotalSupply,
  //     ppsRaw: formattedData.ppsRaw?.toString(),
  //     ppsFormatted: formattedData.pps,
  //     vaultDecimals: formattedData.vaultDecimals,
  //     calculatedDeposits: (parseFloat(formattedData.vaultShares) * parseFloat(formattedData.pps)).toFixed(6),
  //   })
  // }

  return {
    data: formattedData,
    isLoading: isLoading || isLoadingHype,
    isError,
    error,
    isConfigured,
    address,
  }
}

