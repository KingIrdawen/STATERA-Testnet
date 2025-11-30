import { useAccount, useReadContracts, useBalance } from 'wagmi'
import { Index } from '@/types/index'
import { vaultContract } from '@/contracts/vault'
import { l1readContract } from '@/contracts/l1read'
import { coreInteractionHandlerContract } from '@/contracts/coreInteractionHandler'
import { formatUnitsSafe, formatCoreBalance } from '@/lib/format'

const PX_DECIMALS = {
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

  // Token IDs pour référence future (actuellement non utilisés dans les appels)
  const _usdcTokenId = getTokenId('USDC')
  const _hypeTokenId = getTokenId('HYPE')
  const _btcTokenId = getTokenId('BTC')

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

  // Debug: vérifier la configuration
  if (strategy && address) {
    console.log('[useStrategyData] Configuration Check:', {
      strategyName: strategy.name,
      vaultAddress: strategy.vaultAddress,
      handlerAddress: strategy.handlerAddress,
      l1ReadAddress: strategy.l1ReadAddress,
      userAddress: address,
      tokensWithIdsCount: tokensWithIds.length,
      tokensWithIds: tokensWithIds,
      isConfigured,
    })
  }

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
        ...tokensWithIds.flatMap((token) => {
          const tokenIdNum = parseInt(token.tokenId)
          // Vérifier que le tokenId est valide
          if (isNaN(tokenIdNum) || tokenIdNum < 0 || tokenIdNum > Number.MAX_SAFE_INTEGER) {
            console.warn(`[useStrategyData] Invalid tokenId for ${token.symbol}: ${token.tokenId}`)
            return []
          }
          // spotBalance utilise uint64, tokenInfo utilise uint32
          return [
            {
              ...l1readContract(strategy.l1ReadAddress),
              functionName: 'spotBalance' as const,
              args: [strategy.handlerAddress as `0x${string}`, BigInt(tokenIdNum)],
            },
            {
              ...l1readContract(strategy.l1ReadAddress),
              functionName: 'tokenInfo' as const,
              args: [BigInt(tokenIdNum)],
            },
          ]
        }),
        // Handler core equity (USD 1e18)
        {
          ...coreInteractionHandlerContract(strategy.handlerAddress),
          functionName: 'equitySpotUsd1e18' as const,
        },
        // Oracle TOKEN1 (utilisé pour toutes les stratégies ERA)
        {
          ...coreInteractionHandlerContract(strategy.handlerAddress),
          functionName: 'oraclePxToken11e8' as const,
        },
        // Oracle HYPE (1e8) - retourne uint64 (commun aux deux stratégies)
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

  // Debug: vérifier les contrats et leur état
  if (isConfigured) {
    console.log('[useStrategyData] Contracts Check:', {
      contractsCount: contracts.length,
      contractsPreview: contracts.slice(0, 5).map((c, i) => ({
        index: i,
        address: c.address,
        functionName: c.functionName,
        args: 'args' in c ? c.args : undefined,
      })),
      isLoading,
      isError,
      error: error?.message,
      dataLength: data?.length,
      enabled: isConfigured,
    })
  }

  // Formater les données
  let contractIndex = 0
  const vaultShares = data?.[contractIndex++]?.result as bigint | undefined
  const vaultTotalSupply = data?.[contractIndex++]?.result as bigint | undefined
  const vaultDecimals = (data?.[contractIndex++]?.result as number | undefined) ?? 18
  const userDepositsHype = data?.[contractIndex++]?.result as bigint | undefined // Dépôts cumulés utilisateur en HYPE (1e18)
  const navUsd1e18 = data?.[contractIndex++]?.result as bigint | undefined // NAV totale en USD (1e18)
  const ppsRaw = data?.[contractIndex++]?.result as bigint | undefined // Prix par share en USD (1e18)

  // Debug: vérifier les données brutes et les erreurs individuelles
  if (isConfigured && data) {
    const detailedResults = data.map((d, i) => {
      const contract = contracts[i]
      return {
        index: i,
        contractAddress: contract?.address,
        functionName: contract?.functionName,
        args: contract && 'args' in contract ? contract.args : undefined,
        status: d.status,
        result: d.result?.toString() || 'null',
        error: d.error ? {
          message: d.error.message,
          name: d.error.name,
          cause: d.error.cause,
          stack: d.error.stack,
        } : null,
      }
    })
    
    console.log('[useStrategyData] Raw Data Check:', {
      dataLength: data.length,
      contractsLength: contracts.length,
      vaultSharesRaw: vaultShares?.toString(),
      vaultTotalSupplyRaw: vaultTotalSupply?.toString(),
      userDepositsHypeRaw: userDepositsHype?.toString(),
      navUsd1e18Raw: navUsd1e18?.toString(),
      ppsRaw: ppsRaw?.toString(),
      detailedResults,
      errorsCount: data.filter(d => d.error).length,
      successCount: data.filter(d => d.status === 'success').length,
      failureCount: data.filter(d => d.status === 'failure').length,
    })
  }

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
  // Oracle TOKEN1
  const oraclePxToken1Raw = data?.[contractIndex++]?.result as bigint | undefined
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
        // Oracle TOKEN1
        oraclePxToken1: formatUnitsSafe(oraclePxToken1Raw ? BigInt(oraclePxToken1Raw) : 0n, 8),
        oraclePxToken1Raw: oraclePxToken1Raw ? BigInt(oraclePxToken1Raw) : 0n,
        oraclePxHype: formatUnitsSafe(oraclePxHypeRaw ? BigInt(oraclePxHypeRaw) : 0n, PX_DECIMALS.hype),
        oraclePxHypeRaw: oraclePxHypeRaw ? BigInt(oraclePxHypeRaw) : 0n,
        // Valeurs formatées en USD (Number)
        ppsUsd: ppsRaw ? Number(formatUnitsSafe(ppsRaw, 18)) : undefined,
        oracleHypeUsd: oraclePxHypeRaw ? Number(oraclePxHypeRaw) / 1e8 : undefined,
        oracleToken1Usd: oraclePxToken1Raw 
          ? Number(oraclePxToken1Raw) / 1e8 
          : undefined,
      }
    : null

  // Log de débogage pour diagnostiquer les problèmes
  if (isConfigured && data && formattedData) {
    console.log('[useStrategyData] Debug Info:', {
      strategyName: strategy?.name,
      vaultAddress: strategy?.vaultAddress,
      handlerAddress: strategy?.handlerAddress,
      l1ReadAddress: strategy?.l1ReadAddress,
      userAddress: address,
      isConfigured,
      isLoading,
      isError,
      error: error?.message,
      contractsCount: contracts.length,
      dataResultsCount: data?.length || 0,
      vaultSharesRaw: formattedData.vaultSharesRaw?.toString(),
      vaultSharesFormatted: formattedData.vaultShares,
      vaultTotalSupplyRaw: formattedData.vaultTotalSupplyRaw?.toString(),
      vaultTotalSupplyFormatted: formattedData.vaultTotalSupply,
      navUsd1e18Raw: formattedData.navUsd1e18Raw?.toString(),
      navUsd1e18Formatted: formattedData.navUsd1e18,
      ppsRaw: formattedData.ppsRaw?.toString(),
      ppsFormatted: formattedData.pps,
      vaultDecimals: formattedData.vaultDecimals,
      vaultHypeBalanceRaw: vaultHypeBalance?.value?.toString(),
      vaultHypeBalanceFormatted: formatUnitsSafe(vaultHypeBalance?.value, 18),
      coreEquityUsdRaw: formattedData.coreEquityUsdRaw?.toString(),
      coreEquityUsdFormatted: formattedData.coreEquityUsd,
      oraclePxHypeRaw: formattedData.oraclePxHypeRaw?.toString(),
      oraclePxHypeFormatted: formattedData.oraclePxHype,
      totalHypeDepositedRaw: formattedData.totalHypeDepositedRaw?.toString(),
      totalHypeDepositedFormatted: formattedData.totalHypeDeposited,
      userDepositsHypeRaw: formattedData.userDepositsHypeRaw?.toString(),
      userDepositsHypeFormatted: formattedData.userDepositsHype,
      userShare: formattedData.userShare,
      tokensWithIds: tokensWithIds.map(t => ({ symbol: t.symbol, tokenId: t.tokenId })),
    })
  }

  return {
    data: formattedData,
    isLoading: isLoading || isLoadingHype,
    isError,
    error,
    isConfigured,
    address,
  }
}

