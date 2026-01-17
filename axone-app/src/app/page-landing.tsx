'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import Link from 'next/link';

interface LandingStats {
  vaultCount: number;
  vaultAddresses: string[];
  totalDepositCount: number;
  depositCountByVault: Record<string, number>;
  fromBlockUsed: number;
  totalDepositedUsd: number;
  vaults: Array<{
    id: string;
    name: string;
    riskLevel: string;
    status: string;
    tvlUsd: number;
    vaultAddress: string;
    chainId: number;
  }>;
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export default function Home() {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch('/api/public/landing-stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('[Landing] Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#E6E6E6]">
      <Header />
      <section className="relative overflow-hidden bg-[#121212]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/90 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-full sm:w-1/2 lg:w-[55%]">
            <Image
              src="/Image-titre.png"
              alt="Statera hero background"
              width={1400}
              height={1400}
              className="h-full w-auto max-w-none object-contain opacity-20 translate-x-10"
              sizes="(min-width: 1024px) 900px, (min-width: 640px) 600px, 420px"
              priority
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-28 lg:py-32 relative">
          <Reveal>
            <div className="max-w-2xl">
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl text-[#C9A36A] tracking-[0.1em]"
                style={{ fontFamily: '"Canela Sans", var(--font-inter), system-ui, sans-serif' }}
              >
                STATERA
              </h1>
              <p
                className="mt-4 text-xs sm:text-sm uppercase tracking-[0.12em] text-[#C9A36A]"
                style={{ fontFamily: '"Canela Sans", var(--font-inter), system-ui, sans-serif' }}
              >
                DECENTRALIZED INVESTMENT STRATEGIES
              </p>
              <p className="mt-6 text-base sm:text-lg text-[#E6E6E6]/80 leading-relaxed">
                Non-custodial, on-chain strategies delivering disciplined risk exposure and volatility capture.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard/strategy"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#C9A36A] text-[#121212] font-semibold tracking-[0.04em] text-sm sm:text-base transition-colors duration-300 hover:bg-[#b78f56] focus:outline-none focus:ring-2 focus:ring-[#C9A36A] focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  Access Platform
                </Link>

                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-md border border-[#E6E6E6]/30 text-[#E6E6E6] font-semibold tracking-[0.04em] text-sm sm:text-base transition-colors duration-300 hover:border-[#E6E6E6]/60 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#E6E6E6]/40 focus:ring-offset-2 focus:ring-offset-[#121212]"
                >
                  View Documentation
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="mt-12 sm:mt-16">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-[#C9A36A]">—</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#E6E6E6]/50 mt-2">Total Deposited</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-[#C9A36A]">—</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#E6E6E6]/50 mt-2">Active Vaults</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-[#C9A36A]">—</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#E6E6E6]/50 mt-2">Total Unique Deposits</p>
                </div>
              </div>
            ) : error ? (
              <p className="text-xs uppercase tracking-[0.2em] text-red-400">Unable to load metrics</p>
            ) : stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-[#C9A36A]">
                    <AnimatedCounter
                      value={stats.totalDepositedUsd}
                      duration={2000}
                      formatter={(val) => formatUsd(val)}
                    />
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#E6E6E6]/50 mt-2">Total Deposited</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-[#C9A36A]">
                    <AnimatedCounter
                      value={stats.vaultCount}
                      duration={2000}
                      formatter={(val) => Math.floor(val).toString()}
                    />
                  </p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#E6E6E6]/50 mt-2">Active Vaults</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-[#C9A36A]">
                    <AnimatedCounter
                      value={stats.totalDepositCount}
                      duration={2000}
                      formatter={(val) => Math.floor(val).toLocaleString()}
                    />
                  </p>
                  <p
                    className="text-xs uppercase tracking-[0.2em] text-[#E6E6E6]/50 mt-2"
                    title="Number of deposit transactions across all deployed vaults"
                  >
                    Total Unique Deposits
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.7rem] sm:text-xs uppercase tracking-[0.24em] text-[#E6E6E6]/50">
            <span>Non-custodial architecture</span>
            <span className="text-[#C9A36A]/50" aria-hidden="true">·</span>
            <span>Rules-based allocation</span>
            <span className="text-[#C9A36A]/50" aria-hidden="true">·</span>
            <span>On-chain transparency</span>
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
}
