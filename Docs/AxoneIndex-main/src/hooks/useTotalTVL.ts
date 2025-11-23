'use client'

import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { useVaults } from './useVaults'
import { vaultContract } from '@/contracts/vault'

const ONE_E18 = 1000000000000000000n

function toBigint(value: unknown): bigint | undefined {
	return typeof value === 'bigint' ? value : undefined
}

function toNumber(value: unknown): number | undefined {
	return typeof value === 'number' ? value : undefined
}

/**
 * Hook pour calculer le TVL total de tous les vaults
 * @returns { totalTVL: number, isLoading: boolean }
 */
export function useTotalTVL() {
	const { vaults, loading: vaultsLoading } = useVaults()

	// Préparer tous les contrats pour tous les vaults
	const contracts = useMemo(() => {
		return vaults.flatMap((vault) => [
			// Vault totalSupply
			{
				...vaultContract(vault.vaultAddress),
				functionName: 'totalSupply' as const,
			},
			// Vault decimals
			{
				...vaultContract(vault.vaultAddress),
				functionName: 'decimals' as const,
			},
			// Vault PPS (USD 1e18)
			{
				...vaultContract(vault.vaultAddress),
				functionName: 'pps1e18' as const,
			},
		])
	}, [vaults])

	const { data, isLoading: contractsLoading } = useReadContracts({
		contracts,
		query: {
			enabled: vaults.length > 0,
		},
	})

	// Calculer le TVL total
	const totalTVL = useMemo(() => {
		if (!data || vaults.length === 0) return 0

		const contractsPerVault = 3 // totalSupply, decimals, pps1e18
		let sum = 0

		vaults.forEach((_vault, vaultIndex) => {
			const startIndex = vaultIndex * contractsPerVault

			const totalSupplyRaw = toBigint(data[startIndex]?.result) ?? 0n
			const decimals = toNumber(data[startIndex + 1]?.result) ?? 18
			const pps1e18Raw = toBigint(data[startIndex + 2]?.result) ?? 0n

			// Calculer le TVL pour ce vault: (totalSupply * pps1e18) / 10^decimals, puis formatUnits avec 18
			if (pps1e18Raw > 0n && totalSupplyRaw > 0n) {
				// Calculer le TVL en USD: (pps1e18 * totalSupply) / 10^decimals
				const tvlBigInt = (pps1e18Raw * totalSupplyRaw) / BigInt(10 ** decimals)
				const tvl = Number(formatUnits(tvlBigInt, 18))
				sum += tvl
			}
		})

		return sum
	}, [data, vaults])

	const isLoading = vaultsLoading || contractsLoading

	return {
		totalTVL,
		isLoading,
	}
}

