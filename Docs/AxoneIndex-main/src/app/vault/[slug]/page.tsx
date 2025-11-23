'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance, useReadContracts, useReadContract, useChainId } from 'wagmi'
import { parseUnits } from 'viem'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from '@/components/ui'
import { Wallet, Loader2 } from 'lucide-react'
import { useVaultBySlug } from '@/hooks/useVaultBySlug'
import { useVaultCoreData } from '@/hooks/useVaultCoreData'
import type { VaultDefinition } from '@/types/vaults'
import { vaultContract } from '@/contracts/vault'
import { coreInteractionViewsAbi } from '@/lib/abi/coreInteractionViews'
import { formatUnits } from 'viem'
import { CoreBalancesTable } from '@/components/dashboard/CoreBalancesTable'
import { formatNumber, formatHumanBalance } from '@/lib/format'
import { Skeleton } from '@/components/ui'
import { useToast } from '@/components/ui/use-toast'
import { PpsChart } from '@/components/vaults/PpsChart'
import { usePpsHistory } from '@/hooks/usePpsHistory'
import { calculateApr, formatApr } from '@/lib/apr'

function formatUnitsSafe(value: bigint | undefined, decimals: number): string {
	if (value === undefined) return '0'
	try {
		return formatUnits(value, decimals)
	} catch {
		return '0'
	}
}

const PX_DECIMALS = { hype: 8 } as const

function toBigint(value: unknown): bigint | undefined {
	return typeof value === 'bigint' ? value : undefined
}

function toNumber(value: unknown): number | undefined {
	return typeof value === 'number' ? value : undefined
}

export default function VaultBySlugPage() {
	const params = useParams<{ slug: string }>()
	const slug = params?.slug
	const router = useRouter()
	const { vault, loading, error } = useVaultBySlug(slug)

	if (loading) {
		return <main className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></main>
	}
	if (error || !vault) {
		return (
			<main className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-sm text-red-500 mb-2">{error || 'Vault introuvable'}</p>
					<Button onClick={() => router.push('/market')}>Retour au market</Button>
				</div>
			</main>
		)
	}
	return <VaultClient vault={vault} />
}

const HYPEREVM_CHAIN_ID = 998

function VaultClient({ vault }: { vault: VaultDefinition }) {
	const { address, isConnected } = useAccount()
	const chainId = useChainId()
	const { writeContract, isPending, data: hash, error: writeError } = useWriteContract()
	const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()

	const [depositAmount, setDepositAmount] = useState('')
	const [withdrawAmount, setWithdrawAmount] = useState('')
	const [depositError, setDepositError] = useState<string | null>(null)
	const [withdrawError, setWithdrawError] = useState<string | null>(null)

	const { data: hypeNative } = useBalance({ address, query: { enabled: !!address } })

	// Utiliser l'adresse du vault si définie, sinon fallback sur la variable d'environnement
	const coreViewsAddress = (vault.coreViewsAddress || process.env.NEXT_PUBLIC_CORE_VIEWS_ADDRESS) as `0x${string}` | undefined
	
	// Avertir si la variable d'environnement est manquante
	useEffect(() => {
		if (!coreViewsAddress && process.env.NODE_ENV === 'development') {
			console.warn('[VaultPage] NEXT_PUBLIC_CORE_VIEWS_ADDRESS n\'est pas défini. Les prix oracle ne seront pas récupérés via l\'appel direct.')
		}
	}, [coreViewsAddress])
	
	const contracts = useMemo(() => {
		return [
			{ ...vaultContract(vault.vaultAddress), functionName: 'balanceOf' as const, args: address ? [address] as const : undefined },
			{ ...vaultContract(vault.vaultAddress), functionName: 'decimals' as const },
			{ ...vaultContract(vault.vaultAddress), functionName: 'totalSupply' as const },
			{ ...vaultContract(vault.vaultAddress), functionName: 'pps1e18' as const },
			{ ...vaultContract(vault.vaultAddress), functionName: 'depositFeeBps' as const },
			{ ...vaultContract(vault.vaultAddress), functionName: 'withdrawFeeBps' as const },
			// Note: Le prix oracle est récupéré via useVaultCoreData, cet appel est un fallback
			...(coreViewsAddress ? [{
				address: coreViewsAddress,
				abi: coreInteractionViewsAbi,
				functionName: 'oraclePxHype1e8' as const,
				args: [vault.handlerAddress] as const,
			}] : []),
		]
	}, [vault, address, coreViewsAddress])

	// Charger les données publiques du vault même sans wallet connecté
	const { data: contractData, refetch, isError: isContractDataError } = useReadContracts({
		contracts,
		query: { enabled: !!vault?.vaultAddress },
	})

	const decimalsResult = contractData?.[1]?.result
	const vaultDecimals = toNumber(decimalsResult) ?? 18
	const hypeBalance = formatUnitsSafe(hypeNative?.value, hypeNative?.decimals ?? 18)
	const vaultShares = formatUnitsSafe(toBigint(contractData?.[0]?.result), vaultDecimals)
	const vaultTotalSupply = formatUnitsSafe(toBigint(contractData?.[2]?.result), vaultDecimals)
	const pps = formatUnitsSafe(toBigint(contractData?.[3]?.result), 18)
	const depositFeeBps = toNumber(contractData?.[4]?.result) ?? 0
	const withdrawFeeBpsDefault = toNumber(contractData?.[5]?.result) ?? 0
	
	// Calculer l'index dynamiquement : le contrat oracle est à l'index 6 seulement si coreViewsAddress est défini
	const oraclePriceIndex = coreViewsAddress ? 6 : -1
	// Vérifier les erreurs pour le contrat oracle
	const oracleContractError = oraclePriceIndex >= 0 ? contractData?.[oraclePriceIndex]?.error : undefined
	const oraclePxHype1e8Str = formatUnitsSafe(
		oraclePriceIndex >= 0 && !oracleContractError ? toBigint(contractData?.[oraclePriceIndex]?.result) : undefined,
		PX_DECIMALS.hype
	)

	const ppsRaw = toBigint(contractData?.[3]?.result) ?? 0n
	const totalSupplyRaw = toBigint(contractData?.[2]?.result) ?? 0n

	const { data: vaultCash } = useBalance({ address: vault.vaultAddress, query: { enabled: !!vault.vaultAddress } })
	const vaultCashHypeStr = formatUnitsSafe(vaultCash?.value, vaultCash?.decimals ?? 18)

	// Récupérer les données core du vault (balances Hypercore, oracles, core equity)
	const coreDataHook = useVaultCoreData(vault)
	const coreData = coreDataHook.data
	const isLoadingCoreData = coreDataHook.isLoading

	// Utiliser le prix oracle depuis coreData en priorité, sinon depuis l'appel direct
	const pxHype1e8Raw = (() => {
		// Priorité 1: coreData (via useVaultCoreData)
		if (coreData?.oraclePxHype && parseFloat(coreData.oraclePxHype) > 0) {
			try {
				return parseUnits(coreData.oraclePxHype, PX_DECIMALS.hype)
			} catch {
				// Fallback si erreur de parsing
			}
		}
		// Priorité 2: appel direct (si pas d'erreur)
		if (oraclePriceIndex >= 0 && !oracleContractError) {
			const raw = toBigint(contractData?.[oraclePriceIndex]?.result)
			if (raw && raw > 0n) return raw
		}
		return 0n
	})()

	// Récupérer l'historique PPS pour calculer l'APR
	const { data: ppsHistoryData, loading: isLoadingPpsHistory } = usePpsHistory(vault.vaultAddress, 200)

	// Calculer l'APR sur 30 jours
	const apr = useMemo(() => {
		if (!ppsHistoryData?.entries || ppsHistoryData.entries.length < 2) {
			return null
		}
		return calculateApr(ppsHistoryData.entries, 30)
	}, [ppsHistoryData])

	// Log de diagnostic pour les prix oracle
	useEffect(() => {
		if (process.env.NODE_ENV === 'development') {
			const oracleFromCoreData = coreData?.oraclePxHype
			const oracleFromDirectCall = oraclePxHype1e8Str
			const hasCoreData = !!oracleFromCoreData && parseFloat(oracleFromCoreData) > 0
			const hasDirectCall = !!oracleFromDirectCall && parseFloat(oracleFromDirectCall) > 0
			
			console.log('[VaultPage] Diagnostic prix oracle:', {
				vault: vault?.slug,
				coreViewsAddress: coreViewsAddress || 'NON DÉFINI',
				oracleFromCoreData: oracleFromCoreData || '0',
				oracleFromDirectCall: oracleFromDirectCall || '0',
				oracleContractError: oracleContractError?.message || null,
				pxHype1e8Raw: pxHype1e8Raw.toString(),
				hasCoreData,
				hasDirectCall,
				usingSource: hasCoreData ? 'coreData' : (hasDirectCall ? 'directCall' : 'none'),
				coreDataError: coreDataHook.error ? String(coreDataHook.error) : null,
				contractDataError: isContractDataError,
			})
			
			// Avertir si aucun prix oracle n'est disponible
			if (!hasCoreData && !hasDirectCall) {
				console.warn('[VaultPage] Aucun prix oracle disponible:', {
					coreViewsAddressDefined: !!coreViewsAddress,
					coreDataLoading: isLoadingCoreData,
					coreDataError: coreDataHook.error,
					oracleContractError: oracleContractError,
				})
			}
		}
	}, [
		coreData?.oraclePxHype,
		coreData?.oraclePxToken1,
		isLoadingCoreData,
		coreDataHook.error,
		oraclePxHype1e8Str,
		oracleContractError,
		coreViewsAddress,
		vault?.slug,
		pxHype1e8Raw,
		isContractDataError,
	])

	const coreBalanceRows = coreData?.coreBalances ? [
		{
			token: coreData.coreBalances.usdc.name || 'USDC',
			tokenId: coreData.coreBalances.usdc.tokenId.toString(),
			balance: coreData.coreBalances.usdc.balance,
			valueUsd: (() => {
				// Utiliser la valeur brute normalisée au lieu de la balance formatée
				const balanceRaw = coreData.coreBalances.usdc.normalized ?? 0n
				const weiDecimals = coreData.coreBalances.usdc.decimals.weiDecimals ?? 8
				const balanceNum = parseFloat(formatUnitsSafe(balanceRaw, weiDecimals))
				// USDC: 1 USDC = 1 USD
				return formatHumanBalance(balanceNum.toString(), { minDecimals: 0, maxDecimals: 2, compact: true })
			})(),
		},
		{
			token: coreData.coreBalances.hype.name || 'HYPE',
			tokenId: coreData.coreBalances.hype.tokenId.toString(),
			balance: coreData.coreBalances.hype.balance,
			valueUsd: (() => {
				// Utiliser la valeur brute normalisée au lieu de la balance formatée
				const balanceRaw = coreData.coreBalances.hype.normalized ?? 0n
				const weiDecimals = coreData.coreBalances.hype.decimals.weiDecimals ?? 8
				const balanceNum = parseFloat(formatUnitsSafe(balanceRaw, weiDecimals))
				const priceNum = parseFloat(coreData.oraclePxHype || '0')
				// HYPE: balance × oracle price
				return formatHumanBalance((balanceNum * priceNum).toString(), { minDecimals: 0, maxDecimals: 2, compact: true })
			})(),
		},
		{
			token: coreData.coreBalances.token1.name || 'TOKEN1',
			tokenId: coreData.coreBalances.token1.tokenId.toString(),
			balance: coreData.coreBalances.token1.balance,
			valueUsd: (() => {
				// Utiliser la valeur brute normalisée au lieu de la balance formatée
				const balanceRaw = coreData.coreBalances.token1.normalized ?? 0n
				const weiDecimals = coreData.coreBalances.token1.decimals.weiDecimals ?? 10
				const balanceNum = parseFloat(formatUnitsSafe(balanceRaw, weiDecimals))
				const priceNum = parseFloat(coreData.oraclePxToken1 || '0')
				// TOKEN1: balance × oracle price
				return formatHumanBalance((balanceNum * priceNum).toString(), { minDecimals: 0, maxDecimals: 2, compact: true })
			})(),
		},
	] : []

	useEffect(() => {
		if (isSuccess) {
			toast({
				title: 'Transaction réussie',
				description: 'Votre transaction a été confirmée avec succès.',
			})
			refetch()
			setDepositAmount('')
			setWithdrawAmount('')
			setDepositError(null)
			setWithdrawError(null)
		}
	}, [isSuccess, refetch, toast])

	// Gestion des erreurs de writeContract
	useEffect(() => {
		if (writeError) {
			console.error('Erreur writeContract:', writeError)
			const errorMessage = writeError instanceof Error ? writeError.message : String(writeError)
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
			
			toast({
				title: 'Erreur de transaction',
				description: friendlyMessage,
			})
			setDepositError(friendlyMessage)
			setWithdrawError(friendlyMessage)
		}
	}, [writeError, toast])

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

	const handleDeposit = () => {
		setDepositError(null)
		
		// Vérifications préalables
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
		const balanceFloat = parseFloat(hypeBalance || '0')
		
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
			const value = parseUnits(depositAmount, hypeNative?.decimals ?? 18)
			console.log('Envoi transaction deposit:', {
				vaultAddress: vault.vaultAddress,
				value: value.toString(),
				amount: depositAmount,
				chainId,
			})
			
			writeContract({
				...vaultContract(vault.vaultAddress),
				functionName: 'deposit',
				args: [],
				value,
			})
		} catch (error) {
			console.error('Erreur lors de la préparation de la transaction:', error)
			const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la préparation de la transaction.'
			setDepositError(errorMessage)
			toast({
				title: 'Erreur',
				description: errorMessage,
			})
		}
	}

	const handleWithdraw = () => {
		setWithdrawError(null)
		
		// Vérifications préalables
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

		const withdrawAmountFloat = parseFloat(withdrawAmount)
		const sharesFloat = parseFloat(vaultShares || '0')
		
		if (withdrawAmountFloat > sharesFloat) {
			const errorMsg = 'Montant supérieur à vos parts disponibles.'
			setWithdrawError(errorMsg)
			toast({
				title: 'Parts insuffisantes',
				description: errorMsg,
			})
			console.error('Withdraw error: Insufficient shares', { withdrawAmount: withdrawAmountFloat, shares: sharesFloat })
			return
		}

		try {
			const shares = parseUnits(withdrawAmount, vaultDecimals)
			console.log('Envoi transaction withdraw:', {
				vaultAddress: vault.vaultAddress,
				shares: shares.toString(),
				amount: withdrawAmount,
				chainId,
			})
			
			writeContract({
				...vaultContract(vault.vaultAddress),
				functionName: 'withdraw',
				args: [shares],
			})
		} catch (error) {
			console.error('Erreur lors de la préparation de la transaction:', error)
			const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la préparation de la transaction.'
			setWithdrawError(errorMessage)
			toast({
				title: 'Erreur',
				description: errorMessage,
			})
		}
	}

	const depositEstimate = (() => {
		if (!depositAmount) return null
		let amount1e18: bigint
		try { amount1e18 = parseUnits(depositAmount, hypeNative?.decimals ?? 18) } catch { return null }
		if (amount1e18 <= 0n || pxHype1e8Raw === 0n) return null
		const ONE_E18 = 1000000000000000000n
		const scaleShares = 10n ** BigInt(vaultDecimals)
		
		// Logique conforme au contrat ERA_2 : frais prélevés sur le montant HYPE déposé
		const feeBpsClamped = Math.min(Math.max(depositFeeBps, 0), 10000)
		const feeHype = (amount1e18 * BigInt(feeBpsClamped)) / 10000n
		const netAmount = amount1e18 - feeHype
		
		// USD notional calculé sur le montant net (après frais)
		const depositUsd1e18 = (netAmount * pxHype1e8Raw) / BigInt(10 ** PX_DECIMALS.hype)
		
		// Parts calculées sur la base de l'USD notional du montant net
		let sharesMint: bigint
		if (totalSupplyRaw === 0n || ppsRaw === 0n) {
			sharesMint = (depositUsd1e18 * scaleShares) / ONE_E18
		} else {
			// navPre = ppsRaw * totalSupplyRaw / ONE_E18
			const navPre = (ppsRaw * totalSupplyRaw) / ONE_E18
			sharesMint = (depositUsd1e18 * totalSupplyRaw) / navPre
		}
		
		return {
			usdFormatted: formatUnitsSafe(depositUsd1e18, 18),
			sharesFormatted: formatUnitsSafe(sharesMint, vaultDecimals),
		}
	})()

	const withdrawArgs = useMemo(() => {
		const sharesStr = withdrawAmount || '0'
		const shares = sharesStr ? parseUnits(sharesStr, vaultDecimals) : 0n
		if (shares <= 0n || ppsRaw === 0n || pxHype1e8Raw === 0n) return undefined
		const dueUsd1e18 = (shares * ppsRaw) / 1000000000000000000n
		const grossHype = (dueUsd1e18 * BigInt(10 ** PX_DECIMALS.hype)) / pxHype1e8Raw
		return [grossHype] as const
	}, [withdrawAmount, vaultDecimals, ppsRaw, pxHype1e8Raw])

	const { data: feeBpsForAmount } = useReadContract({
		...vaultContract(vault.vaultAddress),
		functionName: 'getWithdrawFeeBpsForAmount',
		args: withdrawArgs,
		query: { enabled: Boolean(vault?.vaultAddress && withdrawArgs) }
	})

	const withdrawEstimate = (() => {
		const sharesStr = withdrawAmount || '0'
		const shares = sharesStr ? parseUnits(sharesStr, vaultDecimals) : 0n
		if (shares <= 0n || ppsRaw === 0n || pxHype1e8Raw === 0n) return null
		const dueUsd1e18 = (shares * ppsRaw) / 1000000000000000000n
		const grossHype1e18 = (dueUsd1e18 * BigInt(10 ** PX_DECIMALS.hype)) / pxHype1e8Raw
		const appliedFeeBps = (typeof feeBpsForAmount === 'number' ? feeBpsForAmount : undefined) ?? withdrawFeeBpsDefault
		const fee = (grossHype1e18 * BigInt(appliedFeeBps)) / 10000n
		const net = grossHype1e18 - fee
		const cash = vaultCash?.value ?? 0n
		const likelyQueued = grossHype1e18 > cash
		return { grossHype1e18, netHype1e18: net, feeBps: appliedFeeBps, likelyQueued }
	})()

	return (
		<main className="min-h-screen hero-gradient">
			<div className="relative">
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-vault-brand/5 to-transparent pointer-events-none" />
				<div className="relative z-10 container-custom py-8" style={{ paddingTop: '10rem' }}>
					<div className="mb-8 text-center w-full">
						<h1 className="text-3xl font-bold mb-1">{vault.displayName}</h1>
						<p className="text-vault-muted max-w-2xl mx-auto">{vault.description}</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
						<Card>
							<CardHeader className="pb-2"><CardTitle className="text-base">Parts du Vault</CardTitle></CardHeader>
							<CardContent><p className="text-2xl font-bold">{formatHumanBalance(vaultShares, { minDecimals: 0, maxDecimals: 4, compact: true })}</p></CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2"><CardTitle className="text-base">PPS (USD)</CardTitle></CardHeader>
							<CardContent><p className="text-2xl font-bold">{formatHumanBalance(pps, { minDecimals: 0, maxDecimals: 4, compact: true })}</p></CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2"><CardTitle className="text-base">NAV (USD)</CardTitle></CardHeader>
							<CardContent><p className="text-2xl font-bold">{(() => {
								const ONE_E18 = 1000000000000000000n
								const nav1e18 = (ppsRaw * totalSupplyRaw) / ONE_E18
								return formatHumanBalance(formatUnitsSafe(nav1e18, 18), { minDecimals: 0, maxDecimals: 2, compact: true })
							})()}</p></CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2"><CardTitle className="text-base">APR (30j)</CardTitle></CardHeader>
							<CardContent>
								{isLoadingPpsHistory ? (
									<Skeleton className="h-8 w-24" />
								) : (
									<p
										className={`text-2xl font-bold ${
											apr === null
												? 'text-muted-foreground'
												: apr >= 0
													? 'text-green-600 dark:text-green-400'
													: 'text-red-600 dark:text-red-400'
										}`}
									>
										{formatApr(apr)}
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Graphique d'évolution de la PPS */}
					<div className="mb-8">
						<PpsChart vaultAddress={vault.vaultAddress} />
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<Card className="w-full">
							<CardHeader>
								<CardTitle>Déposer HYPE (natif)</CardTitle>
								<CardDescription>Déposez des HYPE dans le vault et recevez des parts.</CardDescription>
							</CardHeader>
							<CardContent>
								{!isConnected ? (
									<div className="flex flex-col items-center justify-center py-8">
										<Wallet className="h-8 w-8 text-muted-foreground mb-2" />
										<p className="text-sm text-muted-foreground text-center">Connectez votre wallet pour déposer</p>
									</div>
								) : (
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="depositAmount">Montant (HYPE)</Label>
											<Input id="depositAmount" type="number" step="0.0001" placeholder="0.0000" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} disabled={isPending || isConfirming} />
											<p className="text-sm text-muted-foreground">Balance: {formatHumanBalance(hypeBalance, { minDecimals: 0, maxDecimals: 4, compact: true })} HYPE</p>
											{depositEstimate && (
												<div className="text-xs text-muted-foreground">
													<div>Prix HYPE estimé: ~{formatHumanBalance(
														coreData?.oraclePxHype && parseFloat(coreData.oraclePxHype) > 0 
															? coreData.oraclePxHype 
															: (oraclePxHype1e8Str && parseFloat(oraclePxHype1e8Str) > 0 
																? oraclePxHype1e8Str 
																: '0'), 
														{ minDecimals: 0, maxDecimals: 2, compact: true }
													)} USD</div>
													<div>Montant USD estimé: ~{formatHumanBalance(depositEstimate.usdFormatted, { minDecimals: 0, maxDecimals: 2, compact: true })} USD</div>
													<div>Parts estimées nettes (après {depositFeeBps} bps): ~{formatHumanBalance(depositEstimate.sharesFormatted, { minDecimals: 0, maxDecimals: 4, compact: true })}</div>
												</div>
											)}
										</div>
										<Button onClick={handleDeposit} disabled={!depositAmount || isPending || isConfirming || parseFloat(depositAmount || '0') <= 0 || parseFloat(depositAmount) > parseFloat(hypeBalance || '0') || chainId !== HYPEREVM_CHAIN_ID} className="w-full">
											{isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
											Déposer
										</Button>
										{chainId !== HYPEREVM_CHAIN_ID && isConnected && (
											<p className="text-sm text-red-500">Veuillez basculer sur HyperEVM Testnet (ID 998)</p>
										)}
										{parseFloat(depositAmount || '0') > parseFloat(hypeBalance || '0') && depositAmount && (
											<p className="text-sm text-red-500">Montant supérieur à votre balance HYPE</p>
										)}
										{depositError && (
											<p className="text-sm text-red-500">{depositError}</p>
										)}
									</div>
								)}
							</CardContent>
						</Card>
						<Card className="w-full">
							<CardHeader>
								<CardTitle>Retirer</CardTitle>
								<CardDescription>Échangez vos parts contre des HYPE.</CardDescription>
							</CardHeader>
							<CardContent>
								{!isConnected ? (
									<div className="flex flex-col items-center justify-center py-8">
										<Wallet className="h-8 w-8 text-muted-foreground mb-2" />
										<p className="text-sm text-muted-foreground text-center">Connectez votre wallet pour retirer</p>
									</div>
								) : (
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="withdrawAmount">Parts à retirer</Label>
											<Input id="withdrawAmount" type="number" step="0.000001" placeholder="0.000000" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} disabled={isPending || isConfirming} />
											<p className="text-sm text-muted-foreground">Parts disponibles : {formatHumanBalance(vaultShares, { minDecimals: 0, maxDecimals: 4, compact: true })}</p>
											<div className="text-xs text-muted-foreground">
												<button type="button" className="underline" onClick={() => setWithdrawAmount(vaultShares || '0')} disabled={isPending || isConfirming}>Max</button>
											</div>
										</div>
										<Button onClick={handleWithdraw} disabled={!withdrawAmount || isPending || isConfirming || parseFloat(withdrawAmount) > parseFloat(vaultShares) || chainId !== HYPEREVM_CHAIN_ID} className="w-full">
											{isPending || isConfirming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
											Retirer
										</Button>
										{chainId !== HYPEREVM_CHAIN_ID && isConnected && (
											<p className="text-sm text-red-500">Veuillez basculer sur HyperEVM Testnet (ID 998)</p>
										)}
										{parseFloat(withdrawAmount) > parseFloat(vaultShares) && withdrawAmount && (
											<p className="text-sm text-red-500">Montant supérieur à vos parts disponibles</p>
										)}
										{withdrawError && (
											<p className="text-sm text-red-500">{withdrawError}</p>
										)}
										{withdrawEstimate && (
											<div className="text-xs text-muted-foreground space-y-1">
												<div>Frais estimés: {withdrawEstimate.feeBps} bps</div>
													<div>Montant brut (HYPE): ~{formatHumanBalance(formatUnitsSafe(withdrawEstimate.grossHype1e18, 18), { minDecimals: 0, maxDecimals: 4, compact: true })}</div>
													<div>Montant net (HYPE): ~{formatHumanBalance(formatUnitsSafe(withdrawEstimate.netHype1e18, 18), { minDecimals: 0, maxDecimals: 4, compact: true })}</div>
												<div>Trésorerie EVM: {formatHumanBalance(vaultCashHypeStr, { minDecimals: 0, maxDecimals: 4, compact: true })} HYPE</div>
												{withdrawEstimate.likelyQueued ? (
													<div className="text-amber-500">Ce retrait pourrait être mis en file d&apos;attente.</div>
												) : (
													<div className="text-green-500">Retrait probablement immédiat.</div>
												)}
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					<Card className="mt-6">
						<CardHeader>
							<CardTitle>Balances Hypercore (Handler)</CardTitle>
							<CardDescription>
								Soldes USDC, HYPE et TOKEN1 sur Hypercore convertis selon les décimales natives.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="mb-6">
								<CoreBalancesTable balances={coreBalanceRows} isLoading={isLoadingCoreData} />
							</div>
							{!coreViewsAddress && (
								<div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
									<p className="text-sm text-amber-600 dark:text-amber-400">
										⚠️ Variable d&apos;environnement <code className="font-mono text-xs">NEXT_PUBLIC_CORE_VIEWS_ADDRESS</code> non définie. Les prix oracle peuvent ne pas être disponibles.
									</p>
								</div>
							)}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-4 shadow-sm">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
										Oracle {coreData?.coreBalances?.token1?.name || 'TOKEN1'} (USD)
									</p>
									<div className="mt-2 text-lg font-mono text-[var(--text-secondary)]">
										{isLoadingCoreData ? (
											<Skeleton className="h-6 w-28" />
										) : (
											formatNumber(
												coreData?.oraclePxToken1 && parseFloat(coreData.oraclePxToken1) > 0 
													? coreData.oraclePxToken1 
													: '0', 
												{ decimals: 2 }
											)
										)}
									</div>
								</div>
								<div className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-4 shadow-sm">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
										Oracle {coreData?.coreBalances?.hype?.name || 'HYPE'} (USD)
									</p>
									<div className="mt-2 text-lg font-mono text-[var(--text-secondary)]">
										{isLoadingCoreData ? (
											<Skeleton className="h-6 w-28" />
										) : (
											formatNumber(
												coreData?.oraclePxHype && parseFloat(coreData.oraclePxHype) > 0 
													? coreData.oraclePxHype 
													: (oraclePxHype1e8Str && parseFloat(oraclePxHype1e8Str) > 0 
														? oraclePxHype1e8Str 
														: '0'), 
												{ decimals: 2 }
											)
										)}
									</div>
								</div>
								<div className="rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-4 shadow-sm">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Core Equity (USD)</p>
									<div className="mt-2 text-lg font-mono text-[var(--text-secondary)]">
										{isLoadingCoreData ? (
											<Skeleton className="h-6 w-28" />
										) : (
											`$${formatNumber(coreData?.coreEquityDisplay || coreData?.coreEquityUsd || '0', { decimals: 2, compact: true })}`
										)}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="mt-6">
						<CardHeader><CardTitle>Informations</CardTitle></CardHeader>
						<CardContent>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Total Supply</span>
									<span className="font-mono">{formatHumanBalance(vaultTotalSupply, { minDecimals: 0, maxDecimals: 4, compact: true })}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Prix HYPE (oracle)</span>
									<span className="font-mono">
										{formatNumber(
											coreData?.oraclePxHype && parseFloat(coreData.oraclePxHype) > 0 
												? coreData.oraclePxHype 
												: (oraclePxHype1e8Str && parseFloat(oraclePxHype1e8Str) > 0 
													? oraclePxHype1e8Str 
													: '0'), 
											{ decimals: 2 }
										)} USD
										{!coreViewsAddress && (
											<span className="text-xs text-amber-500 ml-2" title="NEXT_PUBLIC_CORE_VIEWS_ADDRESS non défini">
												⚠️
											</span>
										)}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-muted-foreground">Adresse du Vault</span>
									<span className="font-mono text-xs">{vault.vaultAddress}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	)
}


