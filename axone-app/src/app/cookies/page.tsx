'use client';

import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white brand-typography">
      <Header />

      <main className="pt-[60px] md:pt-[80px] pb-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <Reveal>
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li className="text-gray-600">/</li>
                <li className="text-white">Cookies</li>
              </ol>
            </nav>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                  Cookies
                </span>
              </h1>
              <p className="text-gray-400 text-sm">
                Last Updated: November 14, 2025
              </p>
            </div>
          </Reveal>

          <div className="prose prose-invert max-w-none space-y-8">
            <Reveal delayMs={200}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <p className="text-white leading-relaxed mb-6">
                  This Cookies page explains how the Statera interface uses cookies and similar technologies to deliver core functionality and improve the experience.
                </p>
                <p className="text-white leading-relaxed">
                  We do not use cookies to collect sensitive personal data. Any optional analytics or preference storage will be disclosed here before activation.
                </p>
              </section>
            </Reveal>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
