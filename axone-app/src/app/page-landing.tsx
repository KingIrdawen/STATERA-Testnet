'use client';

import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] text-white pt-[60px] md:pt-[80px]">
      <Header />
      
      {/* Hero Section - Static */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-[#fab062] to-[#5a9a9a] bg-clip-text text-transparent">
                A Decentralized<br />
                Investment<br />
                Solution
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-[#5a9a9a] mb-8 sm:mb-10 leading-relaxed font-medium max-w-3xl mx-auto">
              Statera offers an innovative approach to investment by leveraging blockchain technology to automate and optimize portfolio management while delivering value to its users.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard/strategy"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-[#fab062] text-[#011f26] font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:bg-[#e89a4a] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#fab062] focus:ring-offset-2 focus:ring-offset-[#121212]"
              >
                Get Started
              </Link>

              <Link
                href="/docs"
                className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white text-white font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:bg-white hover:text-[#011f26] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#121212]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </div>
  );
}
