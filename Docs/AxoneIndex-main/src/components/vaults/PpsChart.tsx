'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Skeleton } from '@/components/ui'
import { usePpsHistory } from '@/hooks/usePpsHistory'
import { formatHumanBalance } from '@/lib/format'

interface PpsChartProps {
	vaultAddress: string
	className?: string
}

interface ChartDataPoint {
	date: Date
	dateLabel: string
	pps: number
	timestamp: number
}

export function PpsChart({ vaultAddress, className }: PpsChartProps) {
	const { data, loading, error } = usePpsHistory(vaultAddress, 200) // Limiter à 200 points pour les performances

	const chartData: ChartDataPoint[] = useMemo(() => {
		if (!data?.entries || data.entries.length === 0) {
			return []
		}

		return data.entries.map((entry) => {
			const date = new Date(entry.timestamp * 1000)
			const pps = parseFloat(entry.pps)

			// Format de date selon la période
			let dateLabel: string
			const now = Date.now()
			const entryTime = entry.timestamp * 1000
			const diffDays = (now - entryTime) / (1000 * 60 * 60 * 24)

			if (diffDays < 1) {
				// Moins de 24h : afficher l'heure
				dateLabel = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
			} else if (diffDays < 7) {
				// Moins de 7 jours : afficher jour + heure
				dateLabel = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
			} else if (diffDays < 30) {
				// Moins de 30 jours : afficher date + heure
				dateLabel = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit' })
			} else {
				// Plus de 30 jours : afficher seulement la date
				dateLabel = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
			}

			return {
				date,
				dateLabel,
				pps,
				timestamp: entry.timestamp,
			}
		})
	}, [data])

	// Calculer les valeurs min/max pour l'axe Y
	const { minPps, maxPps } = useMemo(() => {
		if (chartData.length === 0) {
			return { minPps: 0, maxPps: 1 }
		}
		const ppsValues = chartData.map((d) => d.pps)
		const min = Math.min(...ppsValues)
		const max = Math.max(...ppsValues)
		// Ajouter une marge de 5% en haut et en bas
		const range = max - min
		return {
			minPps: Math.max(0, min - range * 0.05),
			maxPps: max + range * 0.05,
		}
	}, [chartData])

	interface CustomTooltipProps {
		active?: boolean
		payload?: Array<{
			payload: ChartDataPoint
			value: number
			dataKey: string
		}>
	}

	const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="bg-card border border-border rounded-lg p-3 shadow-lg">
					<p className="text-sm font-medium mb-1">
						{data.date.toLocaleString('fr-FR', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						})}
					</p>
					<p className="text-sm text-muted-foreground">
						PPS: <span className="font-semibold text-foreground">{formatHumanBalance(data.pps.toString(), { minDecimals: 2, maxDecimals: 6 })} USD</span>
					</p>
				</div>
			)
		}
		return null
	}

	if (loading) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle>Évolution de la PPS</CardTitle>
					<CardDescription>Historique du prix par part dans le temps</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[400px] w-full">
						<Skeleton className="h-full w-full" />
					</div>
				</CardContent>
			</Card>
		)
	}

	if (error) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle>Évolution de la PPS</CardTitle>
					<CardDescription>Historique du prix par part dans le temps</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[400px] flex items-center justify-center text-muted-foreground">
						<p className="text-sm">Erreur lors du chargement: {error}</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!data || chartData.length === 0) {
		return (
			<Card className={className}>
				<CardHeader>
					<CardTitle>Évolution de la PPS</CardTitle>
					<CardDescription>Historique du prix par part dans le temps</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[400px] flex items-center justify-center text-muted-foreground">
						<p className="text-sm">Aucune donnée disponible pour le moment</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Évolution de la PPS</CardTitle>
				<CardDescription>
					Historique du prix par part dans le temps ({chartData.length} point{chartData.length > 1 ? 's' : ''})
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="h-[400px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
							<XAxis
								dataKey="dateLabel"
								stroke="hsl(var(--muted-foreground))"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								angle={-45}
								textAnchor="end"
								height={60}
								interval="preserveStartEnd"
							/>
							<YAxis
								domain={[minPps, maxPps]}
								stroke="hsl(var(--muted-foreground))"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								width={80}
								tickFormatter={(value) => formatHumanBalance(value.toString(), { minDecimals: 2, maxDecimals: 4, compact: true })}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Line
								type="monotone"
								dataKey="pps"
								stroke="hsl(var(--chart-1))"
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4, fill: "hsl(var(--chart-1))" }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	)
}

