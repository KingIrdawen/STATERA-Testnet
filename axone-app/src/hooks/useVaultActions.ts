import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { Index } from '@/types/index'
import { erc20Contract } from '@/contracts/erc20'
import { vaultContract } from '@/contracts/vault'

/**
 * Hook pour gérer les actions sur le vault (deposit, withdraw)
 */
export function useVaultActions(strategy: Index | null) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Approuver le vault pour dépenser les USDC
   * @param amount Montant en USDC (string, ex: "100.50")
   * @param decimals Nombre de décimales pour USDC (par défaut 6, mais peut varier)
   */
  const approveUSDC = async (amount: string, decimals: number = 6) => {
    if (!strategy?.usdcAddress || !strategy?.vaultAddress) {
      throw new Error('Strategy addresses not configured')
    }

    try {
      // Convertir le montant en bigint avec les décimales appropriées
      const amountInWei = parseUnits(amount, decimals)
      
      writeContract({
        ...erc20Contract(strategy.usdcAddress),
        functionName: 'approve',
        args: [strategy.vaultAddress as `0x${string}`, amountInWei],
      })
    } catch (err) {
      console.error('Error approving USDC:', err)
      throw err
    }
  }

  /**
   * Déposer des USDC dans le vault
   * Le hook s'adapte automatiquement aux adresses de la stratégie
   * Note: L'approbation doit être faite avant avec approveUSDC
   * @param amount Montant en USDC (string, ex: "100.50")
   * @param decimals Nombre de décimales pour USDC (par défaut 6, mais peut varier)
   */
  const deposit = async (amount: string, decimals: number = 6) => {
    if (!strategy?.usdcAddress || !strategy?.vaultAddress) {
      throw new Error('Strategy addresses not configured. Please ensure all contract addresses are set in the strategy.')
    }

    try {
      // Convertir le montant en bigint avec les décimales appropriées
      const amountInWei = parseUnits(amount, decimals)
      
      writeContract({
        ...vaultContract(strategy.vaultAddress),
        functionName: 'deposit',
        args: [amountInWei],
      })
    } catch (err) {
      console.error('Error depositing USDC:', err)
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
      
      writeContract({
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
    approveUSDC,
    deposit,
    withdraw,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

