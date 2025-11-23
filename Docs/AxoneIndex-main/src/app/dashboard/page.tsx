'use client'

import { useAllVaultsData } from '@/hooks/useAllVaultsData'
import { truncateAddress, formatUnitsSafe } from '@/lib/format'
import { Card, CardContent, Button } from '@/components/ui'
import { AlertCircle, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useAccount, useChainId, useBalance } from 'wagmi'
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary'
import { VaultPortfolioCard } from '@/components/dashboard/VaultPortfolioCard'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { portfolioData, totalInvested, activeVaultsCount, isLoading, isError, error } = useAllVaultsData()
  
  // Récupérer la balance HYPE native
  const { data: hypeNative, isLoading: isLoadingHype } = useBalance({
    address,
    query: { enabled: !!address },
  })
  
  const hypeNativeBalance = hypeNative 
    ? formatUnitsSafe(hypeNative.value, hypeNative.decimals)
    : '0'

  // Si pas de wallet connecté
  if (!isConnected) {
    return (
      <main className="min-h-screen hero-gradient">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vault-brand/5 to-transparent pointer-events-none" />
          <div className="relative z-10 container-custom py-8" style={{ paddingTop: '10rem' }}>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Connectez votre wallet</h2>
                <p className="text-muted-foreground">Veuillez connecter votre wallet pour accéder au dashboard</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  // Si erreur
  if (isError) {
    return (
      <main className="min-h-screen hero-gradient">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vault-brand/5 to-transparent pointer-events-none" />
          <div className="relative z-10 container-custom py-8" style={{ paddingTop: '10rem' }}>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Erreur</h2>
                <p className="text-muted-foreground">{error?.message || 'Une erreur est survenue'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen hero-gradient">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-vault-brand/5 to-transparent pointer-events-none" />
        <div className="relative z-10 container-custom py-8" style={{ paddingTop: '10rem' }}>
          {chainId !== 998 && (
            <div className="mb-6 rounded-xl border border-[var(--border-muted)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Vous n&apos;êtes pas connecté au réseau HyperEVM Testnet (998). Certaines données peuvent être indisponibles.
              </p>
            </div>
          )}

          <div className="mb-8 text-center w-full">
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-vault-muted max-w-2xl mx-auto">
              Vue d&apos;ensemble de votre portefeuille et de vos positions dans les vaults
            </p>
            {address && (
              <p className="text-xs text-vault-muted font-mono mt-2">
                {truncateAddress(address)}
              </p>
            )}
          </div>

          <div className="mb-8">
            <PortfolioSummary
              totalInvested={totalInvested}
              activeVaultsCount={activeVaultsCount}
              hypeNativeBalance={hypeNativeBalance}
              isLoading={isLoading || isLoadingHype}
            />
          </div>

          {portfolioData.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Aucune position</h2>
                <p className="text-muted-foreground mb-6">
                  Vous n&apos;avez actuellement aucune part dans les vaults.
                </p>
                <Link href="/market">
                  <Button>Explorer les vaults</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {portfolioData.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-vault-primary mb-4">
                Vos positions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolioData.map((vaultData) => (
                  <VaultPortfolioCard key={vaultData.vault.id} vaultData={vaultData} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}