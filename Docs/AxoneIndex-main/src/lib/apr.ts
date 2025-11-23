import type { PpsEntry } from '@/server/ppsStore'

/**
 * Calcule l'APR (Annual Percentage Rate) basé sur l'évolution de la PPS
 * sur une période donnée (par défaut 30 jours).
 * 
 * Formule : APR = ((PPS_final / PPS_initial) ^ (365 / jours_écoulés) - 1) * 100
 * 
 * @param entries - Historique PPS trié du plus ancien au plus récent
 * @param days - Nombre de jours pour le calcul (défaut: 30)
 * @returns APR en pourcentage ou null si calcul impossible
 */
export function calculateApr(entries: PpsEntry[], days: number = 30): number | null {
	if (!entries || entries.length < 2) {
		return null
	}

	// Trier les entrées par timestamp (du plus ancien au plus récent)
	const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp)

	// Filtrer sur les N derniers jours
	const now = Math.floor(Date.now() / 1000)
	const cutoffTimestamp = now - (days * 24 * 60 * 60)
	const recentEntries = sortedEntries.filter((entry) => entry.timestamp >= cutoffTimestamp)

	if (recentEntries.length < 2) {
		// Pas assez de données sur la période demandée, utiliser toutes les données disponibles
		if (sortedEntries.length < 2) {
			return null
		}
		// Utiliser la première et la dernière entrée disponible
		const firstEntry = sortedEntries[0]
		const lastEntry = sortedEntries[sortedEntries.length - 1]
		
		const ppsInitial = parseFloat(firstEntry.pps)
		const ppsFinal = parseFloat(lastEntry.pps)

		if (ppsInitial <= 0) {
			return null
		}

		const daysElapsed = (lastEntry.timestamp - firstEntry.timestamp) / (24 * 60 * 60)
		
		if (daysElapsed <= 0) {
			return null
		}

		// Calculer le rendement annualisé
		const ratio = ppsFinal / ppsInitial
		const apr = (Math.pow(ratio, 365 / daysElapsed) - 1) * 100

		return apr
	}

	// Utiliser la première et la dernière entrée de la période récente
	const firstEntry = recentEntries[0]
	const lastEntry = recentEntries[recentEntries.length - 1]

	const ppsInitial = parseFloat(firstEntry.pps)
	const ppsFinal = parseFloat(lastEntry.pps)

	if (ppsInitial <= 0) {
		return null
	}

	const daysElapsed = (lastEntry.timestamp - firstEntry.timestamp) / (24 * 60 * 60)
	
	if (daysElapsed <= 0) {
		return null
	}

	// Calculer le rendement annualisé
	const ratio = ppsFinal / ppsInitial
	const apr = (Math.pow(ratio, 365 / daysElapsed) - 1) * 100

	return apr
}

/**
 * Formate l'APR pour l'affichage
 * @param apr - APR en pourcentage ou null
 * @returns String formatée (ex: "+5.23%" ou "-2.15%" ou "N/A")
 */
export function formatApr(apr: number | null): string {
	if (apr === null || !isFinite(apr)) {
		return 'N/A'
	}

	const sign = apr >= 0 ? '+' : ''
	return `${sign}${apr.toFixed(2)}%`
}

