'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function VaultsHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/50 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between px-4 sm:px-8 md:px-36 lg:px-48 py-4">
        {/* Logo et nom */}
        <Link href="/" className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/Logo-Statera-sandy-brown-détouré.png"
            alt="Statera Logo"
            width={150}
            height={50}
            className="h-8 w-auto sm:h-10 md:h-12"
            sizes="(min-width: 768px) 150px, 120px"
          />
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            Statera
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/docs"
            className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
          >
            Docs
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
              largeScreen: false, // Désactiver temporairement pour éviter les erreurs getBalance
            }}
          />
        </div>
      </div>
    </header>
  );
}