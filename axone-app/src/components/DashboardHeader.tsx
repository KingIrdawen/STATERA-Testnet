'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

export function DashboardHeader() {
  const pathname = usePathname();
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const centerLinks = [
    { href: '/dashboard/referral', label: 'Referral' },
    { href: '/dashboard/points', label: 'Points' },
    { href: '/docs', label: 'Docs' },
  ];

  const mobileNavLinks = [
    { href: '/dashboard/strategy', label: 'Dashboard' },
    { href: '/app/strategies', label: 'Market' },
    { href: '/dashboard/staking', label: 'ERA Staking' },
    { href: '/dashboard/staking-sta', label: 'STA Staking' },
    { href: '/dashboard/swap', label: 'Swap' },
    { href: '/dashboard/arbitrage', label: 'Arbitrage' },
    { href: '/dashboard/referral', label: 'Referral' },
    { href: '/dashboard/points', label: 'Points' },
    { href: '/docs', label: 'Docs' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard/strategy') {
      return pathname === href || pathname?.startsWith('/dashboard/strategy/');
    }
    return pathname === href;
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-[9999] bg-black/95 backdrop-blur-md">
      {/* Bandeau Wrong Network intégré dans le header */}
      {address && !isCorrectChain && (
        <div className="bg-red-600 text-white text-center py-3 px-4 text-sm font-semibold shadow-lg border-b-2 border-red-700">
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <span className="flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>Wrong Network - Please switch to HyperEVM Testnet (Chain ID: 998)</span>
            </span>
            <button
              onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
              className="px-4 py-1.5 bg-white text-red-600 font-semibold rounded text-xs hover:bg-gray-100 transition-colors whitespace-nowrap shadow-md"
            >
              Switch Network
            </button>
          </div>
        </div>
      )}
      <div className="w-full">
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between py-4 relative">
            {/* Logo — gauche */}
            <Link href="/" className="flex items-center gap-3 sm:gap-4 z-10">
              <Image
                src="/Logo-Statera-sandy-brown-détouré.png"
                alt="Statera Logo"
                width={48}
                height={48}
                className="h-8 w-auto sm:h-10 md:h-12"
                sizes="(min-width: 768px) 150px, 120px"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Statera
              </span>
            </Link>

            {/* Navigation centrale — positionnée absolument pour centrage parfait sur le viewport */}
            <nav className="hidden lg:flex items-center gap-4 sm:gap-6 absolute left-1/2 -translate-x-1/2">
              {centerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-bold text-xs sm:text-sm md:text-base transition-colors tracking-tight ${
                    isActive(link.href)
                      ? 'text-[#C9A36A]'
                      : 'text-white hover:text-[#C9A36A]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Admin + Wallet — droite */}
            <div className="flex items-center gap-4 sm:gap-6 z-10">
              <Link
                href="/admin"
                className="hidden md:inline-flex text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#C9A36A] transition-colors tracking-tight"
              >
                Admin
              </Link>

              {/* Hamburger button — mobile only */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 text-white"
                aria-label="Open menu"
              >
                <span className="block w-6 h-0.5 bg-white rounded" />
                <span className="block w-6 h-0.5 bg-white rounded" />
                <span className="block w-6 h-0.5 bg-white rounded" />
              </button>

              {/* Bouton de connexion de wallet avec RainbowKit */}
              <ConnectButton
                label="Connect Wallet"
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Golden glow separator line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A36A]/45 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] blur-[3px] bg-[#C9A36A]/20 pointer-events-none" />

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9996] bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="fixed inset-0 z-[9997] flex flex-col bg-black/95 backdrop-blur-md overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A36A]/20">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src="/Logo-Statera-sandy-brown-détouré.png"
                  alt="Statera Logo"
                  width={36}
                  height={36}
                  className="h-8 w-auto"
                />
                <span className="text-lg font-bold text-white">Statera</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-2xl leading-none w-9 h-9 flex items-center justify-center hover:text-[#C9A36A] transition-colors"
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            {/* Drawer sections */}
            <nav className="flex-1 px-6 py-6 space-y-8">
              {/* Section: Navigate */}
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.4)] mb-3 font-semibold">
                  Navigate
                </p>
                <div className="space-y-1">
                  {mobileNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-3 rounded-lg text-base font-semibold transition-colors ${
                        isActive(link.href)
                          ? 'text-[#C9A36A] bg-[#C9A36A]/10'
                          : 'text-white hover:text-[#C9A36A] hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Section: More */}
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[rgba(230,230,230,0.4)] mb-3 font-semibold">
                  More
                </p>
                <div className="space-y-1">
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-lg text-base font-semibold text-white hover:text-[#C9A36A] hover:bg-white/5 transition-colors"
                  >
                    Admin
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

