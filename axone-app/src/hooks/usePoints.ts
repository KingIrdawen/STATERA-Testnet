import { useAccount, useReadContract } from 'wagmi'
import { useMemo, useEffect, useState } from 'react'

/**
 * Hook pour récupérer les points de l'utilisateur connecté
 * TODO: À configurer avec le smart contract une fois déployé
 * 
 * Note: Une fois le smart contract configuré, les points se mettront à jour automatiquement
 * via useReadContract qui se rafraîchit automatiquement avec Wagmi
 */
export function usePoints() {
  const { address } = useAccount()
  const [refreshKey, setRefreshKey] = useState(0)

  // TODO: Remplacer par l'appel réel au smart contract
  // Exemple de structure future :
  // const { data: pointsData, isLoading, error } = useReadContract({
  //   address: POINTS_CONTRACT_ADDRESS,
  //   abi: pointsContractAbi,
  //   functionName: 'getUserPoints',
  //   args: [address],
  //   query: {
  //     enabled: !!address,
  //     refetchInterval: 60 * 60 * 1000, // Rafraîchir toutes les heures
  //   },
  // })

  const points = useMemo(() => {
    // Pour l'instant, retourner 0 en attendant le smart contract
    return '0'
  }, [])

  // Rafraîchir automatiquement toutes les heures (une fois le smart contract configuré)
  useEffect(() => {
    if (!address) return

    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 60 * 60 * 1000) // 1 heure

    return () => clearInterval(interval)
  }, [address])

  const isLoading = false
  const error = null

  return {
    points,
    isLoading,
    error,
    address,
  }
}

