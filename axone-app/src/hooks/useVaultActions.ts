import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { Index } from '@/types/index'
import { vaultContract } from '@/contracts/vault'

/**
 * Hook pour gérer les actions sur le vault (deposit, withdraw)
 * Les dépôts se font en HYPE natif (payable), pas besoin d'approbation
 */
export function useVaultActions(strategy: Index | null) {
  const { writeContractAsync, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Déposer des HYPE natifs dans le vault
   * Le hook s'adapte automatiquement aux adresses de la stratégie
   * @param amount Montant en HYPE (string, ex: "100.50")
   * @param decimals Nombre de décimales pour HYPE (par défaut 18)
   */
  const deposit = async (amount: string, decimals: number = 18) => {
    if (!strategy?.vaultAddress) {
      throw new Error('Strategy vault address not configured. Please ensure the vault address is set in the strategy.')
    }

    try {
      // Convertir le montant en bigint avec les décimales appropriées
      const amountInWei = parseUnits(amount, decimals)
      
      // Le dépôt est payable - le montant est envoyé via value
      // Utiliser writeContractAsync pour obtenir une promesse
      await writeContractAsync({
        ...vaultContract(strategy.vaultAddress),
        functionName: 'deposit',
        args: [],
        value: amountInWei, // HYPE natif envoyé via value
      })
    } catch (err) {
      console.error('Error depositing HYPE:', err)
      throw err
    }
  }

  /**
   * Retirer des parts du vault
   * Le hook s'adapte automatiquement aux adresses de la stratégie
   * @param shares Nombre de shares à retirer (string, ex: "10.5")
   * @param decimals Nombre de décimales pour les shares (par défaut 18)
   */
  const withdraw = async (shares: string, decimals: number = 18) => {
    if (!strategy?.vaultAddress) {
      throw new Error('Strategy vault address not configured. Please ensure the vault address is set in the strategy.')
    }

    try {
      // Convertir les shares en bigint avec les décimales appropriées
      const sharesInWei = parseUnits(shares, decimals)
      
      // Utiliser writeContractAsync pour obtenir une promesse
      await writeContractAsync({
        ...vaultContract(strategy.vaultAddress),
        functionName: 'withdraw',
        args: [sharesInWei],
      })
    } catch (err) {
      console.error('Error withdrawing:', err)
      throw err
    }
  }

  return {
    deposit,
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

