'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#011f26] shadow-lg">
      <div className="flex min-h-[60px] md:min-h-[80px]">
        {/* Section gauche - Logo */}
        <div className="flex-1 bg-[#011f26] flex items-center justify-start">
          <div className="px-36 md:px-48">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/Logo-Axone.webp"
                alt="AXONE Logo"
                width={150}
                height={50}
                className="h-10 w-auto md:h-12"
                priority
              />
              <span className="text-white font-bold text-xl md:text-2xl tracking-tight">Axone</span>
            </Link>
          </div>
        </div>

        {/* Section droite - Navigation */}
        <div className="flex-1 bg-[#011f26] flex items-center justify-end">
          <div className="px-36 md:px-48">
            <div className="flex items-center gap-6">
              <Link
                href="/docs"
                className="text-white font-bold text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
              >
                Docs
              </Link>
              
                  <Link
                    href="/app"
                    className="inline-flex items-center px-4 py-1.5 md:px-6 md:py-2 rounded-lg bg-[#fab062] text-[#011f26] font-semibold text-sm md:text-base shadow-2xl transition-all duration-300 hover:bg-[#e89a4a] hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#fab062] focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight"
                  >
                    Launch App
                  </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
