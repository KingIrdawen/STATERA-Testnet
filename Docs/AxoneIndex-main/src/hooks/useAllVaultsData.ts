import { useAccount, useReadContracts } from 'wagmi'
import { useVaults } from './useVaults'
import { vaultContract } from '@/contracts/vault'
import { formatUnitsSafe, formatNumber } from '@/lib/format'

export type VaultPortfolioData = {
  vault: {
    id: string
    slug: string
    displayName: string
    description?: string
    vaultAddress: `0x${string}`
    handlerAddress: `0x${string}`
  }
  userShares: string
  userSharesRaw: bigint
  totalSupply: string
  totalSupplyRaw: bigint
  pps: string
  ppsRaw: bigint
  valueUsd: string
  percentage: string
  decimals: number
}

export function useAllVaultsData() {
  const { address } = useAccount()
  const { vaults, loading: vaultsLoading } = useVaults()

  // Préparer tous les contrats pour tous les vaults
  const contracts = vaults.flatMap((vault) => {
    if (!address) return []
    return [
      // Vault balance de l'utilisateur
      {
        ...vaultContract(vault.vaultAddress),
        functionName: 'balanceOf',
        args: [address],
      },
      // Vault totalSupply
      {
        ...vaultContract(vault.vaultAddress),
        functionName: 'totalSupply',
      },
      // Vault decimals
      {
        ...vaultContract(vault.vaultAddress),
        functionName: 'decimals',
      },
      // Vault PPS (USD 1e18)
      {
        ...vaultContract(vault.vaultAddress),
        functionName: 'pps1e18',
      },
    ]
  })

  const { data, isLoading: contractsLoading, isError, error } = useReadContracts({
    contracts,
    query: {
      enabled: !!address && vaults.length > 0,
    },
  })

  // Traiter les données pour chaque vault
  const portfolioData: VaultPortfolioData[] = []
  
  if (data && vaults.length > 0) {
    const contractsPerVault = 4 // balanceOf, totalSupply, decimals, pps1e18
    
    vaults.forEach((vault, vaultIndex) => {
      const startIndex = vaultIndex * contractsPerVault
      
      const userSharesRaw = data[startIndex]?.result as bigint | undefined
      const totalSupplyRaw = data[startIndex + 1]?.result as bigint | undefined
      const decimals = (data[startIndex + 2]?.result as number | undefined) ?? 18
      const ppsRaw = data[startIndex + 3]?.result as bigint | undefined

      const userShares = formatUnitsSafe(userSharesRaw, decimals)
      const totalSupply = formatUnitsSafe(totalSupplyRaw, decimals)
      const pps = formatUnitsSafe(ppsRaw, 18)

      // Calculer la valeur en USD : parts * PPS
      const userSharesNum = parseFloat(userShares)
      const ppsNum = parseFloat(pps)
      const valueUsd = formatNumber((userSharesNum * ppsNum).toString(), { decimals: 2 })

      // Calculer le pourcentage : (parts / totalSupply) * 100
      const totalSupplyNum = parseFloat(totalSupply)
      const percentage = totalSupplyNum > 0 
        ? formatNumber(((userSharesNum / totalSupplyNum) * 100).toString(), { decimals: 2 })
        : '0'

      // Ne garder que les vaults où l'utilisateur a des parts > 0
      if (userSharesRaw && userSharesRaw > 0n) {
        portfolioData.push({
          vault: {
            id: vault.id,
            slug: vault.slug,
            displayName: vault.displayName,
            description: vault.description,
            vaultAddress: vault.vaultAddress,
            handlerAddress: vault.handlerAddress,
          },
          userShares,
          userSharesRaw: userSharesRaw ?? 0n,
          totalSupply,
          totalSupplyRaw: totalSupplyRaw ?? 0n,
          pps,
          ppsRaw: ppsRaw ?? 0n,
          valueUsd,
          percentage,
          decimals,
        })
      }
    })
  }

  // Calculer le total investi (somme des valeurs USD)
  const totalInvested = portfolioData.reduce((sum, item) => {
    return sum + parseFloat(item.valueUsd || '0')
  }, 0)

  return {
    portfolioData,
    totalInvested: formatNumber(totalInvested.toString(), { decimals: 2 }),
    activeVaultsCount: portfolioData.length,
    isLoading: vaultsLoading || contractsLoading,
    isError,
    error,
  }
}

