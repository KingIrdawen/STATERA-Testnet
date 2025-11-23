'use client'

import { useEffect, useState } from 'react'
import type { PpsEntry } from '@/server/ppsStore'

export interface PpsHistoryResponse {
	vaultAddress: string
	entries: PpsEntry[]
	count: number
}

export function usePpsHistory(vaultAddress: string | undefined, limit?: number) {
	const [data, setData] = useState<PpsHistoryResponse | null>(null)
	const [loading, setLoading] = useState<boolean>(!!vaultAddress)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!vaultAddress) {
			setLoading(false)
			setData(null)
			return
		}

		let cancelled = false
		setLoading(true)
		setError(null)

		;(async () => {
			try {
				const url = new URL(`/api/vaults/${encodeURIComponent(vaultAddress)}/pps`, window.location.origin)
				if (limit) {
					url.searchParams.set('limit', limit.toString())
				}

				const res = await fetch(url.toString(), { cache: 'no-store' })
				if (!res.ok) {
					const body = (await res.json().catch(() => ({}))) as { error?: string }
					throw new Error(body.error || 'Erreur lors du chargement de l\'historique PPS')
				}

				const responseData = (await res.json()) as PpsHistoryResponse
				if (!cancelled) {
					setData(responseData)
					setError(null)
				}
			} catch (e) {
				if (!cancelled) {
					setError(e instanceof Error ? e.message : 'Erreur de chargement')
					setData(null)
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		})()

		return () => {
			cancelled = true
		}
	}, [vaultAddress, limit])

	return { data, loading, error }
}

