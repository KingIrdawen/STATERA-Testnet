import { NextResponse } from 'next/server'
import { getPpsHistory } from '@/server/ppsStore'
import { getVaultById } from '@/server/vaultStore'
import { isAddress } from 'viem'

export const runtime = 'nodejs'

/**
 * GET /api/vaults/[id]/pps
 * Récupère l'historique PPS pour un vault
 * 
 * Paramètres de requête:
 * - limit: nombre maximum d'entrées à retourner (optionnel)
 * 
 * Le paramètre [id] peut être:
 * - Un vault ID (ex: "Era-1") - l'adresse sera récupérée depuis Redis
 * - Une adresse de vault (ex: "0x...") - utilisée directement
 */
export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		if (typeof id !== 'string') {
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
		}

		// Récupérer le paramètre limit depuis l'URL
		const url = new URL(req.url)
		const limitParam = url.searchParams.get('limit')
		const limit = limitParam ? parseInt(limitParam, 10) : undefined

		if (limit !== undefined && (isNaN(limit) || limit < 1)) {
			return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 })
		}

		// Déterminer l'adresse du vault
		let vaultAddress: string

		if (isAddress(id)) {
			// Si c'est une adresse, l'utiliser directement
			vaultAddress = id.toLowerCase()
		} else {
			// Sinon, chercher le vault par ID
			const vault = await getVaultById(id)
			if (!vault) {
				return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
			}
			vaultAddress = vault.vaultAddress.toLowerCase()
		}

		// Récupérer l'historique PPS
		const history = await getPpsHistory(vaultAddress, limit)

		return NextResponse.json(
			{
				vaultAddress,
				entries: history,
				count: history.length,
			},
			{ status: 200 }
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Internal server error'
		return NextResponse.json({ error: message }, { status: 500 })
	}
}

