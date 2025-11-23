import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatNumber } from '@/lib/format'
import { ArrowRight } from 'lucide-react'
import type { VaultPortfolioData } from '@/hooks/useAllVaultsData'

interface VaultPortfolioCardProps {
  vaultData: VaultPortfolioData
}

export function VaultPortfolioCard({ vaultData }: VaultPortfolioCardProps) {
  const { vault, userShares, valueUsd, percentage, pps } = vaultData

  return (
    <Link href={`/vault/${vault.slug}`}>
      <Card className="hover:border-[var(--border)] transition-colors cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{vault.displayName}</CardTitle>
            <ArrowRight className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          {vault.description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{vault.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  Vos parts
                </p>
                <p className="text-xl font-semibold text-[var(--text-secondary)] font-mono">
                  {formatNumber(userShares, { decimals: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  Valeur (USD)
                </p>
                <p className="text-xl font-semibold text-[var(--text-secondary)] font-mono">
                  ${formatNumber(valueUsd, { decimals: 2 })}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  % du vault
                </p>
                <p className="text-lg font-semibold text-[var(--text-secondary)] font-mono">
                  {formatNumber(percentage, { decimals: 2 })}%
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  PPS (USD)
                </p>
                <p className="text-lg font-semibold text-[var(--text-secondary)] font-mono">
                  ${formatNumber(pps, { decimals: 2 })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

