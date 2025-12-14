'use client';

import Link from 'next/link';
import Image from 'next/image';
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

  const dashboardLinks = [
    { href: '/dashboard/strategy', label: 'Strategy' },
    { href: '/dashboard/staking', label: 'Staking' },
    { href: '/dashboard/swap', label: 'Swap' },
    { href: '/dashboard/arbitrage', label: 'Arbitrage' },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[9999] bg-[#121212]/50 backdrop-blur-md border-b border-gray-800">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between py-4 ${address && !isCorrectChain ? '' : ''}`}>
            {/* Logo et nom */}
            <Link href="/" className="flex items-center gap-3 sm:gap-4">
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

            {/* Navigation centrée */}
            <nav className="flex items-center gap-4 sm:gap-6 absolute left-1/2 transform -translate-x-1/2">
              {dashboardLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-bold text-xs sm:text-sm md:text-base transition-colors tracking-tight ${
                      isActive
                        ? 'text-[#fab062]'
                        : 'text-white hover:text-[#fab062]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Navigation droite */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/docs"
                className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
              >
                Docs
              </Link>
              <Link
                href="/admin"
                className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
              >
                Admin
              </Link>
              
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
    </header>
  );
}

