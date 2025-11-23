import { Card, CardContent } from '@/components/ui'
import { Wallet, Database, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { Skeleton } from '@/components/ui'

interface PortfolioSummaryProps {
  totalInvested: string
  activeVaultsCount: number
  hypeNativeBalance?: string
  isLoading?: boolean
}

export function PortfolioSummary({
  totalInvested,
  activeVaultsCount,
  hypeNativeBalance,
  isLoading,
}: PortfolioSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border-muted)]">
              <TrendingUp className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Total investi
              </p>
              <p className="text-2xl font-semibold text-[var(--text-secondary)]">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  `$${formatNumber(totalInvested, { decimals: 2 })}`
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border-muted)]">
              <Database className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Vaults actifs
              </p>
              <p className="text-2xl font-semibold text-[var(--text-secondary)]">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  activeVaultsCount
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)] border border-[var(--border-muted)]">
              <Wallet className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Balance HYPE
              </p>
              <p className="text-2xl font-semibold text-[var(--text-secondary)]">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  <>
                    {formatNumber(hypeNativeBalance || '0', { decimals: 2 })}{' '}
                    <span className="text-lg">HYPE</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

