'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { useEffect, useState, useMemo } from 'react'
import { Index } from '@/types/index'
import { vaultContract } from '@/contracts/vault'

const STORAGE_PREFIX = 'strategy_pps_'
const MAX_STORAGE_AGE_MS = 24 * 60 * 60 * 1000 // 1 jour en millisecondes

interface StoredPpsData {
  pps: number
  timestamp: number
}

/**
 * Hook pour estimer l'APY d'une stratégie basé sur l'évolution du PPS (Price Per Share)
 * @param strategy La stratégie contenant l'adresse du vault
 * @returns Objet avec apy (en %), loading, et error
 */
export function useStrategyApy(strategy: Index | null) {
  const [apy, setApy] = useState<number | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Lire le PPS actuel depuis le contrat
  const { data: ppsData, isLoading, error: ppsError } = useReadContract({
    ...vaultContract(strategy?.vaultAddress || '0x0'),
    functionName: 'pps1e18',
    query: {
      enabled: !!strategy?.vaultAddress,
      // Refetch toutes les 5 minutes pour mettre à jour l'APY
      refetchInterval: 5 * 60 * 1000,
    },
  })

  // Clé de stockage basée sur l'ID de la stratégie
  const storageKey = useMemo(() => {
    if (!strategy?.id) return null
    return `${STORAGE_PREFIX}${strategy.id}`
  }, [strategy?.id])

  useEffect(() => {
    if (!ppsData || !storageKey) {
      setApy(null)
      return
    }

    try {
      const ppsNow = Number(formatUnits(ppsData as bigint, 18))
      
      // Vérifier que le PPS est valide
      if (isNaN(ppsNow) || ppsNow <= 0) {
        setApy(null)
        return
      }

      const now = Date.now()

      // Récupérer les données précédentes depuis localStorage
      let prevData: StoredPpsData | null = null
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          prevData = JSON.parse(stored) as StoredPpsData
          
          // Vérifier si les données sont trop anciennes (> 1 jour)
          const age = now - prevData.timestamp
          if (age > MAX_STORAGE_AGE_MS) {
            // Reset si trop ancien
            prevData = null
            localStorage.removeItem(storageKey)
          }
        }
      } catch (e) {
        // Erreur de parsing, on ignore
        prevData = null
      }

      // Calculer l'APY si on a des données précédentes
      if (prevData && prevData.pps > 0) {
        const deltaDays = (now - prevData.timestamp) / (1000 * 60 * 60 * 24)
        
        // Nécessite au moins 1 heure de données pour un calcul fiable
        if (deltaDays > 0 && deltaDays < 365) {
          const growth = (ppsNow - prevData.pps) / prevData.pps
          
          // Éviter les valeurs aberrantes (croissance > 100% par jour)
          if (Math.abs(growth) < 1) {
            // Annualiser: (1 + growth)^(365/deltaDays) - 1
            const apyCalc = (Math.pow(1 + growth, 365 / deltaDays) - 1) * 100
            
            // Limiter l'APY à une plage raisonnable (-99% à +9999%)
            if (apyCalc >= -99 && apyCalc <= 9999) {
              setApy(apyCalc)
            } else {
              setApy(null)
            }
          } else {
            setApy(null)
          }
        } else {
          setApy(null)
        }
      } else {
        // Pas de données précédentes, on ne peut pas calculer l'APY
        setApy(null)
      }

      // Sauvegarder le PPS actuel pour la prochaine fois
      const newData: StoredPpsData = {
        pps: ppsNow,
        timestamp: now,
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(newData))
      } catch (e) {
        // Erreur de stockage (quota dépassé, etc.), on ignore
        console.warn('[useStrategyApy] Failed to save PPS to localStorage:', e)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      setApy(null)
    }
  }, [ppsData, storageKey])

  // Gérer les erreurs du contrat
  useEffect(() => {
    if (ppsError) {
      setError(ppsError as Error)
    } else {
      setError(null)
    }
  }, [ppsError])

  return {
    apy,
    loading: isLoading,
    error,
  }
}

