import { useAccount, useReadContract } from 'wagmi'
import { useMemo } from 'react'

/**
 * Hook pour récupérer les points de l'utilisateur connecté
 * TODO: À configurer avec le smart contract une fois déployé
 */
export function usePoints() {
  const { address } = useAccount()

  // TODO: Remplacer par l'appel réel au smart contract
  // Exemple de structure future :
  // const { data: pointsData, isLoading, error } = useReadContract({
  //   address: POINTS_CONTRACT_ADDRESS,
  //   abi: pointsContractAbi,
  //   functionName: 'getUserPoints',
  //   args: [address],
  // })

  const points = useMemo(() => {
    // Pour l'instant, retourner 0 en attendant le smart contract
    return '0'
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

