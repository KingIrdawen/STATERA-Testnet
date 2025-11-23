import { NextResponse } from 'next/server'
import { deleteVault, getVaultById, updateVault } from '@/server/vaultStore'
import type { UpdateVaultInput } from '@/types/vaults'
import { isAddress } from 'viem'

export const runtime = 'nodejs'

function isValidRisk(v: unknown): v is 'low' | 'medium' | 'high' {
	return v === 'low' || v === 'medium' || v === 'high'
}
function isValidStatus(v: unknown): v is 'open' | 'closed' | 'paused' {
	return v === 'open' || v === 'closed' || v === 'paused'
}

function parseHexAddress(value: unknown, field: string): `0x${string}` {
	if (typeof value !== 'string' || !isAddress(value)) {
		throw new Error(`${field} invalid`)
	}
	return value as `0x${string}`
}

function parseUpdate(body: unknown): UpdateVaultInput {
	if (!body || typeof body !== 'object') throw new Error('Invalid payload')
	const v = body as Partial<UpdateVaultInput>
	const rawBody = body as Record<string, unknown>
	const out: UpdateVaultInput = {}
	if (v.displayName !== undefined) {
		if (typeof v.displayName !== 'string') throw new Error('displayName invalid')
		out.displayName = v.displayName.trim()
	}
	if (v.description !== undefined) {
		if (typeof v.description !== 'string') throw new Error('description invalid')
		out.description = v.description.trim()
	}
	if (v.iconUrl !== undefined) {
		if (typeof v.iconUrl !== 'string') throw new Error('iconUrl invalid')
		out.iconUrl = v.iconUrl.trim()
	}
	if (v.tags !== undefined) {
		if (!Array.isArray(v.tags)) throw new Error('tags invalid')
		out.tags = v.tags.map(t => String(t).trim()).filter(Boolean)
	}
	if (v.risk !== undefined) {
		if (!isValidRisk(v.risk)) throw new Error('risk invalid')
		out.risk = v.risk
	}
	if (v.status !== undefined) {
		if (!isValidStatus(v.status)) throw new Error('status invalid')
		out.status = v.status
	}
	if (v.chainId !== undefined) {
		if (typeof v.chainId !== 'number') throw new Error('chainId invalid')
		out.chainId = v.chainId
	}
	if (v.vaultAddress !== undefined) out.vaultAddress = parseHexAddress(v.vaultAddress, 'vaultAddress')
	if (v.handlerAddress !== undefined) out.handlerAddress = parseHexAddress(v.handlerAddress, 'handlerAddress')
	if (v.l1ReadAddress !== undefined) out.l1ReadAddress = parseHexAddress(v.l1ReadAddress, 'l1ReadAddress')
	if (v.usdcAddress !== undefined) out.usdcAddress = parseHexAddress(v.usdcAddress, 'usdcAddress')
	if ('coreViewsAddress' in rawBody) {
		const coreViewsValue = rawBody.coreViewsAddress
		if (coreViewsValue === null || coreViewsValue === undefined || (typeof coreViewsValue === 'string' && coreViewsValue.trim() === '')) {
			out.coreViewsAddress = undefined
		} else {
			out.coreViewsAddress = parseHexAddress(coreViewsValue, 'coreViewsAddress')
		}
	}
	if (v.coreTokenIds !== undefined) {
		if (typeof v.coreTokenIds !== 'object' || v.coreTokenIds === null) {
			throw new Error('coreTokenIds invalid')
		}
		const coreTokenIds = v.coreTokenIds as Record<string, unknown>
		const usdc = coreTokenIds.usdc
		const hype = coreTokenIds.hype
		const token1 = coreTokenIds.token1
		if (typeof usdc !== 'number' || typeof hype !== 'number' || typeof token1 !== 'number') {
			throw new Error('coreTokenIds invalid')
		}
		out.coreTokenIds = { usdc, hype, token1 }
	}
	return out
}

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		if (typeof id !== 'string') {
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
		}

		const v = await getVaultById(id)
		if (!v) {
			return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
		}
		return NextResponse.json(v, { status: 200 })
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Internal server error'
		const status = message.includes('Invalid') ? 400 : 500
		return NextResponse.json({ error: message }, { status })
	}
}

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		if (typeof id !== 'string') {
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
		}

		const json = (await req.json().catch(() => null)) as unknown
		const payload = parseUpdate(json)
		const updated = await updateVault(id, payload)
		return NextResponse.json(updated, { status: 200 })
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Internal server error'
		const status = message.includes('Invalid') ? 400 : 500
		return NextResponse.json({ error: message }, { status })
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		if (typeof id !== 'string') {
			return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
		}

		await deleteVault(id)
		return new NextResponse(null, { status: 204 })
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Internal server error'
		const status = message.includes('Invalid') ? 400 : 500
		return NextResponse.json({ error: message }, { status })
	}
}

