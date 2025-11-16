import { useReadContract } from 'wagmi'
import { parseUnits } from 'viem'
import { useState, useMemo } from 'react'
import { Index } from '@/types/index'
import { vaultContract } from '@/contracts/vault'

/**
 * Hook pour prévisualiser les frais de retrait
 * @param strategy La stratégie contenant l'adresse du vault
 * @returns État et fonction pour gérer le simulateur de frais
 */
export function useWithdrawFeePreview(strategy: Index | null) {
  const [amountUsdStr, setAmountUsdStr] = useState<string>('')

  // Convertir le montant USD en uint256 (1e18)
  const amount1e18 = useMemo(() => {
    if (!amountUsdStr || amountUsdStr.trim() === '') return undefined
    try {
      const parsed = parseFloat(amountUsdStr)
      if (isNaN(parsed) || parsed <= 0) return undefined
      return parseUnits(amountUsdStr, 18)
    } catch {
      return undefined
    }
  }, [amountUsdStr])

  // Lire les frais depuis le contrat (déclenché automatiquement quand amount1e18 change)
  const { data: bpsData, isLoading, error } = useReadContract({
    ...vaultContract(strategy?.vaultAddress || '0x0'),
    functionName: 'getWithdrawFeeBpsForAmount',
    args: amount1e18 ? [amount1e18] : undefined,
    query: {
      enabled: !!strategy?.vaultAddress && !!amount1e18,
    },
  })

  // Calculer les valeurs formatées à partir des données actuelles
  const result = useMemo(() => {
    if (error) {
      return { error: error as Error }
    }

    if (bpsData !== undefined) {
      const bps = Number(bpsData)
      const percent = bps / 10000 * 100
      return { bps, percent }
    }

    return {}
  }, [bpsData, error])

  return {
    setAmountUsdStr,
    amountUsdStr,
    result,
    isLoading,
    error: error as Error | undefined,
  }
}

