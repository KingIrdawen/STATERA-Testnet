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
              const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 secondes timeout (réduit pour accélérer)

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'force-cache', // Utiliser le cache pour accélérer le chargement
          next: { revalidate: 300 }, // Revalider toutes les 5 minutes
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch ranking`)
        }

        const data: RankingData = await response.json()
        setRankingData(data)
        setError(null)
      } catch (fetchErr) {
        clearTimeout(timeoutId)
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          throw new Error('Request timeout: Server did not respond')
        }
        throw fetchErr
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch ranking'
      setError(errorMessage)
      // Ne logger l'erreur que si c'est une erreur critique (pas juste un timeout ou réseau)
      if (err instanceof Error && !err.message.includes('timeout') && !err.message.includes('Failed to fetch')) {
        console.error('Error fetching ranking:', err)
      }
      // En cas d'erreur, initialiser avec des données vides
      setRankingData({
        entries: [],
        lastUpdate: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Charger le ranking au montage du composant et le rafraîchir périodiquement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Charger immédiatement sans délai pour accélérer
      fetchRanking().catch(() => {
        // Erreur silencieuse - le hook gère déjà l'état d'erreur
      })
      
      // Rafraîchir automatiquement toutes les heures pour récupérer les mises à jour du cron job
      const interval = setInterval(() => {
        fetchRanking().catch(() => {
          // Erreur silencieuse - le hook gère déjà l'état d'erreur
        })
      }, 60 * 60 * 1000) // 1 heure
      
      return () => {
        clearInterval(interval)
      }
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

