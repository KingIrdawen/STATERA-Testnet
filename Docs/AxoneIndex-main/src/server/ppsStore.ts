import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export interface PpsEntry {
	timestamp: number
	pps: string
	blockNumber: number
	txHash: string
}

/**
 * Récupère l'historique PPS pour un vault donné
 * @param vaultAddress - Adresse du vault
 * @param limit - Nombre maximum d'entrées à retourner (optionnel, défaut: toutes)
 * @returns Liste des entrées PPS, triées du plus récent au plus ancien
 */
export async function getPpsHistory(
	vaultAddress: string,
	limit?: number
): Promise<PpsEntry[]> {
	if (!vaultAddress) {
		return []
	}

	try {
		const key = `pps:${vaultAddress.toLowerCase()}`
		
		// Récupérer toutes les entrées (déjà triées du plus récent au plus ancien grâce à LPUSH)
		const entries = await redis.lrange<PpsEntry>(key, 0, limit ? limit - 1 : -1)
		
		if (!entries || !Array.isArray(entries)) {
			return []
		}

		// Valider et parser les entrées
		const validEntries: PpsEntry[] = []
		for (const entry of entries) {
			if (
				entry &&
				typeof entry === 'object' &&
				typeof entry.timestamp === 'number' &&
				typeof entry.pps === 'string' &&
				typeof entry.blockNumber === 'number' &&
				typeof entry.txHash === 'string'
			) {
				validEntries.push({
					timestamp: entry.timestamp,
					pps: entry.pps,
					blockNumber: entry.blockNumber,
					txHash: entry.txHash,
				})
			}
		}

		return validEntries
	} catch (error) {
		console.error('Error fetching PPS history:', error)
		return []
	}
}

