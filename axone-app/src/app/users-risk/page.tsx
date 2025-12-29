'use client';

import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import Link from 'next/link';

export default function UsersRiskPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Header />
      
      <main className="pt-[60px] md:pt-[80px] pb-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <Reveal>
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li className="text-gray-600">/</li>
                <li className="text-white">Users Risk</li>
              </ol>
            </nav>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                  Users Risk Documentation
                </span>
              </h1>
              <p className="text-gray-400">
                Important information about risks associated with using Statera
              </p>
            </div>
          </Reveal>

          <div className="prose prose-invert max-w-none space-y-8">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8">
                <p className="text-gray-300 leading-relaxed">
                  <strong className="text-white">Note:</strong> This page requires the content from 
                  <code className="text-[#FAB062]">/docs/Statera - Users risk documentation.docx</code> to be extracted and formatted here.
                  Please replace this placeholder with the actual risk documentation content, clearly structured 
                  with risk categories and explanations.
                </p>
                <p className="text-gray-400 text-sm mt-4">
                  The content should maintain the same visual style as the rest of the site (#121212 background, 
                  gold accents, sober layout) and clearly present different risk categories.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

