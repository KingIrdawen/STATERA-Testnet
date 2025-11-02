import { useAccount } from 'wagmi'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { RankingEntry } from '@/types/ranking'

interface RankingData {
  entries: RankingEntry[]
  lastUpdate: string
}

/**
 * Hook pour récupérer le classement des utilisateurs depuis la base de données
 * Le classement est mis à jour toutes les heures depuis le smart contract
 * via une tâche planifiée qui appelle /api/ranking/update
 */
export function useRanking() {
  const { address } = useAccount()
  const [searchQuery, setSearchQuery] = useState('')
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger le ranking depuis l'API
  const fetchRanking = useCallback(async () => {
    // S'assurer que nous sommes côté client
    if (typeof window === 'undefined') {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const baseUrl = window.location.origin
      const apiUrl = `${baseUrl}/api/ranking`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch ranking`)
        }

        const data: RankingData = await response.json()
        setRankingData(data)
        setError(null)
      } catch (fetchErr: any) {
        clearTimeout(timeoutId)
        if (fetchErr.name === 'AbortError') {
          throw new Error('Request timeout: Server did not respond')
        }
        throw fetchErr
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ranking'
      setError(errorMessage)
      console.error('Error fetching ranking:', err)
      // En cas d'erreur, initialiser avec des données vides
      setRankingData({
        entries: [],
        lastUpdate: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Charger le ranking au montage du composant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchRanking()
    }
  }, [fetchRanking])

  // Filtrer le classement selon la recherche
  const filteredRanking = useMemo(() => {
    if (!rankingData) return []

    const entries = rankingData.entries || []

    if (!searchQuery.trim()) {
      return entries
    }

    const query = searchQuery.toLowerCase()
    return entries.filter(
      (entry) =>
        entry.address.toLowerCase().includes(query) ||
        entry.rank.toString().includes(query)
    )
  }, [rankingData, searchQuery])

  // Trouver la position de l'utilisateur connecté
  const userRanking = useMemo(() => {
    if (!address || !rankingData) return null
    return rankingData.entries.find(
      (entry) => entry.address.toLowerCase() === address.toLowerCase()
    ) || null
  }, [rankingData, address])

  // Convertir le timestamp en Date
  const lastUpdate = useMemo(() => {
    if (!rankingData?.lastUpdate) return null
    return new Date(rankingData.lastUpdate)
  }, [rankingData])

  return {
    ranking: filteredRanking,
    userRanking,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    lastUpdate,
  }
}

