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
    <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 border-b border-[#C9A36A]/15 ${
      isScrolled 
        ? 'bg-[#121212]/90 backdrop-blur-md' 
        : 'bg-[#121212]/70'
    }`}>
      <div className="flex min-h-[60px] md:min-h-[80px] w-full">
        {/* Section gauche - Logo */}
        <div className="flex-1 flex items-center justify-start">
          <div className="px-6 sm:px-8 lg:px-12">
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
              <span className="text-[#E6E6E6] font-bold text-lg sm:text-xl md:text-2xl tracking-tight">Statera</span>
            </Link>
          </div>
        </div>

        {/* Section droite - Navigation */}
        <div className="flex-1 flex items-center justify-end">
          <div className="px-6 sm:px-8 lg:px-12">
            <div className="flex items-center gap-3 sm:gap-6">
              <Link
                href="/docs"
                className="text-[#E6E6E6] font-semibold text-xs sm:text-sm md:text-base hover:text-[#C9A36A] transition-colors tracking-tight"
              >
                Docs
              </Link>
              
              <Link
                href="/dashboard/strategy"
                className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 rounded-lg bg-[#C9A36A] text-[#121212] font-semibold text-xs sm:text-sm md:text-base shadow-lg transition-all duration-300 hover:bg-[#b8935f] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#C9A36A]/60 focus:ring-offset-2 focus:ring-offset-[#121212] tracking-tight"
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
