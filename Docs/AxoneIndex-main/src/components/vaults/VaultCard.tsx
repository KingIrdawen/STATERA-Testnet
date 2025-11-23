'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Activity,
  AlertTriangle,
  Info,
  Shield,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useChainId,
  useBalance
} from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { formatNumber } from '@/lib/format'

import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { vaultContractAbi } from '@/lib/abi/VaultContract'
import type { VaultDefinition } from '@/types/vaults'
import { useToast } from '@/components/ui/use-toast'

type VaultListItem = VaultDefinition & {
  tokens?: { symbol: string; percentage?: number }[]
  tvlUsd?: number
  userDepositUsd?: number
  performance30d?: number
}

interface VaultCardSummaryProps {
  vault: VaultListItem
  onDeposit?: () => void
  onWithdraw?: () => void
  onInfo?: () => void
}

interface VaultCardActionsProps {
  vault: VaultListItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeposit?: () => void
  onWithdraw?: () => void
}

const statusConfig = {
  open: { label: 'Actif', tone: 'bg-green-400/10 text-green-400' },
  paused: { label: 'En pause', tone: 'bg-yellow-400/10 text-yellow-400' },
  closed: { label: 'Fermé', tone: 'bg-red-400/10 text-red-400' }
} as const

const riskConfig = {
  low: { label: 'Faible', Icon: Shield },
  medium: { label: 'Moyen', Icon: AlertTriangle },
  high: { label: 'Élevé', Icon: Activity }
} as const

const HYPEREVM_CHAIN_ID = 998

export function VaultCardSummary({
  vault,
  onDeposit,
  onWithdraw,
  onInfo
}: VaultCardSummaryProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false)
  const performance = vault.performance30d ?? 0
  const isPositive = performance >= 0
  const userDeposit = vault.userDepositUsd ?? 0
  const hasDeposit = userDeposit > 0
  const RiskIcon = riskConfig[vault.risk].Icon
  const composition = vault.tokens?.length
    ? vault.tokens.map(token => `${token.symbol}${typeof token.percentage === 'number' ? ` ${token.percentage}%` : ''}`).join(' • ')
    : vault.tags?.join(' • ')
  const tvl = vault.tvlUsd ?? 0

  return (
    <>
      <Card className="hover-vault-card vault-surface border border-vault shadow-vault-sm h-full max-w-md mx-auto">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-vault-primary">
              {vault.displayName}
            </CardTitle>
            <div className="flex flex-shrink-0 items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${statusConfig[vault.status].tone}`}
              >
                {statusConfig[vault.status].label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-vault px-2 py-1 text-xs font-medium text-vault-muted">
                <RiskIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {riskConfig[vault.risk].label}
              </span>
            </div>
          </div>

          {composition && (
            <p className="mt-3 text-sm text-vault-muted">
              {composition}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-vault-muted">TVL</span>
            <span className="text-2xl font-semibold text-vault-primary">
              {tvl > 0 ? `$${formatNumber(tvl, { decimals: 2 })}` : '–'}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg vault-surface-alt px-4 py-3">
            <div>
              <p className="text-sm text-vault-muted">Performance 30 jours</p>
              <p
                className={`text-lg font-semibold ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isPositive ? '+' : ''}
                {formatNumber(performance, { decimals: 2 })}%
              </p>
            </div>
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-400" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" aria-hidden="true" />
            )}
          </div>

          {hasDeposit && (
            <div className="rounded-lg border border-vault bg-vault-brand-muted px-4 py-3">
              <p className="text-xs text-vault-muted">Mon dépôt</p>
              <p className="text-sm font-semibold text-vault-primary">
                ${formatNumber(userDeposit, { decimals: 2 })} USDC
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center gap-3 border-t border-vault p-6 pt-4">
          <button
            type="button"
            onClick={() => setIsActionsOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-vault bg-vault-muted px-4 py-2 text-sm font-medium text-vault-primary transition-colors hover:border-vault-strong"
          >
            Gérer
          </button>
          <button
            type="button"
            onClick={onInfo}
            className="inline-flex items-center justify-center rounded-lg border border-vault px-3 py-2 text-sm text-vault-muted transition-colors hover:border-vault-strong hover:text-vault-primary"
            aria-label="Plus d'informations"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
          </button>
        </CardFooter>
      </Card>

      <VaultCardActions
        vault={vault}
        open={isActionsOpen}
        onOpenChange={setIsActionsOpen}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
      />
    </>
  )
}

export function VaultCardActions({
  vault,
  open,
  onOpenChange,
  onDeposit,
  onWithdraw
}: VaultCardActionsProps) {
  const { address: userAddress, isConnected } = useAccount()
  const chainId = useChainId()
  const { toast } = useToast()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  const vaultAddress = vault.vaultAddress as `0x${string}` | undefined

  const { data: userShares } = useReadContract({
    abi: vaultContractAbi,
    address: vaultAddress,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: Boolean(vaultAddress && userAddress) }
  })

  const { data: hypeNative } = useBalance({ 
    address: userAddress, 
    query: { enabled: !!userAddress } 
  })

  const { writeContractAsync, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash: txHash })
  const isBusy = isPending || isConfirming
  const canInteract = useMemo(() => Boolean(vaultAddress), [vaultAddress])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const { style } = document.body
    const previousOverflow = style.overflow
    style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      style.overflow = previousOverflow
    }
  }, [open, onOpenChange])

  // Gestion du succès de transaction
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Transaction réussie',
        description: 'Votre transaction a été confirmée avec succès.',
      })
      setDepositAmount('')
      setWithdrawAmount('')
      setDepositError(null)
      setWithdrawError(null)
    }
  }, [isSuccess, toast])

  // Gestion des erreurs de receipt
  useEffect(() => {
    if (receiptError) {
      console.error('Erreur transaction receipt:', receiptError)
      
      // Extraire le message d'erreur avec plus de détails
      let errorMessage = 'La transaction a échoué lors de la confirmation.'
      let errorDetails = ''
      
      if (receiptError instanceof Error) {
        errorDetails = receiptError.message
        const errorStr = errorDetails.toLowerCase()
        
        // Messages d'erreur spécifiques selon les raisons de revert possibles
        if (errorStr.includes('execution reverted')) {
          // Essayer d'extraire la raison du revert
          const revertMatch = errorDetails.match(/execution reverted[:\s]+([^(\n]+)/i)
          if (revertMatch && revertMatch[1]) {
            const revertReason = revertMatch[1].trim()
            errorMessage = `La transaction a été rejetée: ${revertReason}`
            
            // Messages spécifiques selon les raisons connues du contrat
            if (revertReason.includes('amount=0')) {
              errorMessage = 'Montant invalide. Le montant doit être supérieur à 0.'
            } else if (revertReason.includes('feeVault')) {
              errorMessage = 'Erreur de configuration: feeVault non défini.'
            } else if (revertReason.includes('fee send fail')) {
              errorMessage = 'Échec de l\'envoi des frais. Veuillez réessayer.'
            } else if (revertReason.includes('handler')) {
              errorMessage = 'Erreur de configuration: handler non défini.'
            } else if (revertReason.includes('views')) {
              errorMessage = 'Erreur de configuration: coreViews non défini.'
            } else if (revertReason.includes('px')) {
              errorMessage = 'Erreur d\'oracle: prix HYPE non disponible ou invalide.'
            } else if (revertReason.includes('paused')) {
              errorMessage = 'Le vault est actuellement en pause.'
            } else if (revertReason.includes('reentrant')) {
              errorMessage = 'Erreur de sécurité: tentative de réentrance détectée.'
            }
          } else {
            errorMessage = 'La transaction a été rejetée par le contrat. Vérifiez que le vault n\'est pas en pause et que tous les paramètres sont corrects.'
          }
        } else if (errorStr.includes('replaced') || errorStr.includes('replacement')) {
          errorMessage = 'La transaction a été remplacée par une autre transaction.'
        } else if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
          errorMessage = 'Le délai d\'attente de confirmation a été dépassé. La transaction peut toujours être en attente.'
        } else if (errorStr.includes('network') || errorStr.includes('connection')) {
          errorMessage = 'Erreur réseau lors de la confirmation de la transaction.'
        }
      }
      
      // Logger les détails complets pour le debugging
      if (errorDetails) {
        console.error('Détails de l\'erreur de receipt:', {
          message: errorDetails,
          error: receiptError,
        })
      }
      
      toast({
        title: 'Erreur de confirmation',
        description: errorMessage,
      })
      setDepositError(errorMessage)
      setWithdrawError(errorMessage)
    }
  }, [receiptError, toast])

  const handleDepositInternal = async () => {
    setDepositError(null)
    
    // Vérifications préalables
    if (!canInteract || !userAddress) {
      const errorMsg = 'Veuillez connecter votre wallet.'
      setDepositError(errorMsg)
      toast({
        title: 'Wallet non connecté',
        description: errorMsg,
      })
      console.error('Deposit error: Wallet not connected or cannot interact')
      return
    }

    if (!isConnected) {
      const errorMsg = 'Veuillez connecter votre wallet.'
      setDepositError(errorMsg)
      toast({
        title: 'Wallet non connecté',
        description: errorMsg,
      })
      console.error('Deposit error: Wallet not connected')
      return
    }

    if (chainId !== HYPEREVM_CHAIN_ID) {
      const errorMsg = 'Veuillez vous connecter au réseau HyperEVM Testnet (ID 998).'
      setDepositError(errorMsg)
      toast({
        title: 'Mauvais réseau',
        description: errorMsg,
      })
      console.error('Deposit error: Wrong chain', { currentChainId: chainId, expectedChainId: HYPEREVM_CHAIN_ID })
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      const errorMsg = 'Veuillez entrer un montant valide.'
      setDepositError(errorMsg)
      console.error('Deposit error: Invalid amount', { depositAmount })
      return
    }

    const depositAmountFloat = parseFloat(depositAmount)
    const balanceFloat = parseFloat(formatUnits(hypeNative?.value || 0n, hypeNative?.decimals || 18))
    
    if (depositAmountFloat > balanceFloat) {
      const errorMsg = 'Montant supérieur à votre balance HYPE.'
      setDepositError(errorMsg)
      toast({
        title: 'Balance insuffisante',
        description: errorMsg,
      })
      console.error('Deposit error: Insufficient balance', { depositAmount: depositAmountFloat, balance: balanceFloat })
      return
    }

    try {
      const value = parseUnits(depositAmount, 18)
      if (value <= 0n) {
        const errorMsg = 'Montant invalide.'
        setDepositError(errorMsg)
        console.error('Deposit error: Invalid value', { value: value.toString() })
        return
      }

      console.log('Envoi transaction deposit:', {
        vaultAddress: vaultAddress,
        value: value.toString(),
        amount: depositAmount,
        chainId,
      })

      await writeContractAsync({
        abi: vaultContractAbi,
        address: vaultAddress!,
        functionName: 'deposit',
        args: [],
        value
      })
      setDepositAmount('')
    } catch (error) {
      console.error('Erreur lors de la transaction deposit:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      let friendlyMessage = 'La transaction a échoué.'
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        friendlyMessage = 'Transaction rejetée par l&apos;utilisateur.'
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        friendlyMessage = 'Fonds insuffisants pour effectuer cette transaction.'
      } else if (errorMessage.includes('chain mismatch') || errorMessage.includes('wrong network') || errorMessage.includes('Unsupported chain')) {
        friendlyMessage = 'Mauvais réseau. Veuillez basculer sur HyperEVM Testnet (ID 998).'
      } else if (errorMessage.includes('execution reverted')) {
        friendlyMessage = 'La transaction a été rejetée par le contrat. Vérifiez que le vault n&apos;est pas en pause.'
      } else {
        friendlyMessage = `Erreur: ${errorMessage}`
      }
      
      setDepositError(friendlyMessage)
      toast({
        title: 'Erreur de transaction',
        description: friendlyMessage,
      })
    }
  }

  const handleWithdrawInternal = async () => {
    setWithdrawError(null)
    
    // Vérifications préalables
    if (!canInteract || !userAddress) {
      const errorMsg = 'Veuillez connecter votre wallet.'
      setWithdrawError(errorMsg)
      toast({
        title: 'Wallet non connecté',
        description: errorMsg,
      })
      console.error('Withdraw error: Wallet not connected or cannot interact')
      return
    }

    if (!isConnected) {
      const errorMsg = 'Veuillez connecter votre wallet.'
      setWithdrawError(errorMsg)
      toast({
        title: 'Wallet non connecté',
        description: errorMsg,
      })
      console.error('Withdraw error: Wallet not connected')
      return
    }

    if (chainId !== HYPEREVM_CHAIN_ID) {
      const errorMsg = 'Veuillez vous connecter au réseau HyperEVM Testnet (ID 998).'
      setWithdrawError(errorMsg)
      toast({
        title: 'Mauvais réseau',
        description: errorMsg,
      })
      console.error('Withdraw error: Wrong chain', { currentChainId: chainId, expectedChainId: HYPEREVM_CHAIN_ID })
      return
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      const errorMsg = 'Veuillez entrer un montant valide.'
      setWithdrawError(errorMsg)
      console.error('Withdraw error: Invalid amount', { withdrawAmount })
      return
    }

    try {
      const enteredShares = parseUnits(withdrawAmount || '0', 18)
      if (enteredShares <= 0n) {
        const errorMsg = 'Montant invalide.'
        setWithdrawError(errorMsg)
        console.error('Withdraw error: Invalid shares', { enteredShares: enteredShares.toString() })
        return
      }
      
      const maxShares = (userShares as bigint) || 0n
      const sharesToBurn = enteredShares > maxShares ? maxShares : enteredShares
      if (sharesToBurn <= 0n) {
        const errorMsg = 'Montant invalide.'
        setWithdrawError(errorMsg)
        console.error('Withdraw error: Invalid shares to burn', { sharesToBurn: sharesToBurn.toString() })
        return
      }

      console.log('Envoi transaction withdraw:', {
        vaultAddress: vaultAddress,
        shares: sharesToBurn.toString(),
        amount: withdrawAmount,
        chainId,
      })

      await writeContractAsync({
        abi: vaultContractAbi,
        address: vaultAddress!,
        functionName: 'withdraw',
        args: [sharesToBurn]
      })
      setWithdrawAmount('')
    } catch (error) {
      console.error('Erreur lors de la transaction withdraw:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      let friendlyMessage = 'La transaction a échoué.'
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        friendlyMessage = 'Transaction rejetée par l&apos;utilisateur.'
      } else if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
        friendlyMessage = 'Fonds insuffisants pour effectuer cette transaction.'
      } else if (errorMessage.includes('chain mismatch') || errorMessage.includes('wrong network') || errorMessage.includes('Unsupported chain')) {
        friendlyMessage = 'Mauvais réseau. Veuillez basculer sur HyperEVM Testnet (ID 998).'
      } else if (errorMessage.includes('execution reverted')) {
        friendlyMessage = 'La transaction a été rejetée par le contrat. Vérifiez que le vault n&apos;est pas en pause.'
      } else {
        friendlyMessage = `Erreur: ${errorMessage}`
      }
      
      setWithdrawError(friendlyMessage)
      toast({
        title: 'Erreur de transaction',
        description: friendlyMessage,
      })
    }
  }

  if (!isMounted || !open) {
    return null
  }

  const sharesRaw = formatUnits(((userShares as bigint) || 0n), 18)
  const formattedShares = formatNumber(sharesRaw, { decimals: 2 })

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-6 md:items-center">
      <div
        className="absolute inset-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <Card
        className="relative z-10 w-full max-w-lg vault-surface border border-vault shadow-vault-sm"
        role="dialog"
        aria-modal="true"
        aria-label={`Actions pour ${vault.displayName}`}
      >
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-vault-primary">
              Gérer {vault.displayName}
            </CardTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-vault p-2 text-vault-muted transition-colors hover:border-vault-strong hover:text-vault-primary"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-sm text-vault-muted">
            Effectuez vos dépôts et retraits directement depuis cette interface.
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-vault-primary" htmlFor={`deposit-${vault.id}`}>
              Dépôt
            </label>
            <Input
              id={`deposit-${vault.id}`}
              type="number"
              min="0"
              placeholder="Montant à déposer (HYPE)"
              value={depositAmount}
              onChange={event => setDepositAmount(event.target.value)}
            />
            <p className="text-xs text-vault-dim">
              Disponible uniquement si l&apos;adresse du contrat est renseignée.
            </p>
            {chainId !== HYPEREVM_CHAIN_ID && isConnected && (
              <p className="text-xs text-red-500">Veuillez basculer sur HyperEVM Testnet (ID 998)</p>
            )}
            {depositError && (
              <p className="text-xs text-red-500">{depositError}</p>
            )}
            <button
              type="button"
              onClick={onDeposit ? onDeposit : handleDepositInternal}
              className="inline-flex w-full items-center justify-center rounded-lg bg-vault-brand px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-vault-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={vault.status === 'closed' || !canInteract || isBusy || chainId !== HYPEREVM_CHAIN_ID}
            >
              Déposer
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-vault-primary" htmlFor={`withdraw-${vault.id}`}>
              Retrait
            </label>
            <Input
              id={`withdraw-${vault.id}`}
              type="number"
              min="0"
              placeholder="Montant à retirer (shares)"
              value={withdrawAmount}
              onChange={event => setWithdrawAmount(event.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-vault-dim">
              <span>Max: {formattedShares}</span>
              <button
                type="button"
                className="text-vault-muted underline-offset-2 hover:underline"
                onClick={() => setWithdrawAmount(sharesRaw)}
              >
                Tout retirer
              </button>
            </div>
            {chainId !== HYPEREVM_CHAIN_ID && isConnected && (
              <p className="text-xs text-red-500">Veuillez basculer sur HyperEVM Testnet (ID 998)</p>
            )}
            {withdrawError && (
              <p className="text-xs text-red-500">{withdrawError}</p>
            )}
            <button
              type="button"
              onClick={onWithdraw ? onWithdraw : handleWithdrawInternal}
              className="inline-flex w-full items-center justify-center rounded-lg border border-vault px-4 py-2 text-sm font-semibold text-vault-primary transition-colors hover:border-vault-strong disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canInteract || isBusy || chainId !== HYPEREVM_CHAIN_ID}
            >
              Retirer
            </button>
          </div>

          {!canInteract && (
            <p className="text-xs text-vault-dim">
              Renseignez l&apos;adresse du smart contract pour activer les actions on-chain.
            </p>
          )}
        </CardContent>
      </Card>
    </div>,
    document.body
  )
}

export { VaultCardSummary as VaultCard }
