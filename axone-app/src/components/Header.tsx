'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[9999] shadow-lg transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/50 backdrop-blur-md' 
        : 'bg-black'
    }`}>
      <div className="flex min-h-[60px] md:min-h-[80px]">
        {/* Section gauche - Logo */}
        <div className="flex-1 flex items-center justify-start">
          <div className="px-4 sm:px-8 md:px-36 lg:px-48">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/Logo-Statera-sandy-brown-détouré.png"
                alt="STATERA Logo"
                width={150}
                height={50}
                sizes="(min-width: 768px) 150px, 120px"
                className="h-8 w-auto sm:h-10 md:h-12"
                priority
              />
              <span className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-tight">Statera</span>
            </Link>
          </div>
        </div>

        {/* Section droite - Navigation */}
        <div className="flex-1 flex items-center justify-end">
          <div className="px-4 sm:px-8 md:px-36 lg:px-48">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/docs"
                className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
              >
                Docs
              </Link>
              
                  <Link
                    href="/app"
                    className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-lg bg-[#fab062] text-[#011f26] font-semibold text-xs sm:text-sm md:text-base shadow-2xl transition-all duration-300 hover:bg-[#e89a4a] hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#fab062] focus:ring-offset-2 focus:ring-offset-[#011f26] tracking-tight"
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
