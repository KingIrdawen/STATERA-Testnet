'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import DocsNavigation from '@/components/DocsNavigation';
import { cn } from '@/lib/utils';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const tocItems = [
    {
      title: 'Introduction Page',
      href: '/docs/presentation',
      children: [
        { title: 'Mission', href: '/docs/mission' },
        { title: 'Vision and Values', href: '/docs/vision-valeurs' },
        { title: 'The STA Token: Rewarding Alignment', href: '/docs/token-axn-alignment' },
      ],
    },
    {
      title: 'Protocol',
      href: '/docs/protocol',
      children: [
        { title: 'What is a Statera Index?', href: '/docs/index-statera' },
        { title: 'Smart Rebalancing: The Core Innovation of Statera', href: '/docs/smart-rebalancing' },
        { title: 'Statera x HyperUnit', href: '/docs/hyperunit' },
      ],
    },
    {
      title: 'Protocol Mechanics – Revenue Generation',
      href: '/docs/fonctionnement-revenus',
      children: [
        { title: 'Indices: invest in dynamic portfolios, with one click', href: '/docs/les-index' },
        { title: 'Strategy staking: transform your ERA token in STA rewards', href: '/docs/lock-vaults' },
      ],
    },
    {
      title: 'The STA token: capture the value of the Statera protocol',
      href: '/docs/token-axn',
      children: [
        { title: 'Protocol Governance', href: '/docs/gouvernance' },
        { title: 'Capturing Growth – Revenue Distribution', href: '/docs/capture-croissance' },
        { title: 'Managing Inflation', href: '/docs/maitrise-inflation' },
        { title: 'Tokenomics', href: '/docs/tokenomics' },
        { title: 'Liquidity Mining: Rewarding Early Engagement', href: '/docs/liquidity-mining' },
      ],
    },
    {
      title: 'Growth Strategy – Roadmap',
      href: '/docs/strategie-croissance',
      children: [
        { title: 'Roadmap', href: '/docs/roadmap' },
        { title: 'Epoch 0', href: '/docs/epoque-0' },
        { title: 'Epoch 1', href: '/docs/epoque-1' },
        { title: 'Epoch 2', href: '/docs/epoque-2' },
        { title: 'Beyond', href: '/docs/beyond' },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-[#121212] text-white statera-docs-typo">
      <Header />
      
      {/* Bouton toggle mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-20 left-4 z-[10000] bg-[#121212] border border-gray-700 rounded px-3 py-2 text-sm hover:bg-gray-800 transition-colors"
      >
        Table of Contents
      </button>

      <div className="flex pt-[60px] md:pt-[80px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[9998] w-80 bg-[#121212] p-6 overflow-y-auto md:static md:translate-x-0 transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="space-y-6">
            
            {tocItems.map((section) => (
              <div key={section.title}>
                <Link
                  href={section.href}
                  className={cn(
                    "text-sm font-semibold uppercase tracking-wide mb-3 block transition-colors",
                    isActive(section.href) 
                      ? "bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent"
                      : "bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent hover:opacity-80"
                  )}
                >
                  {section.title}
                </Link>
                
                <ul className="space-y-1 ml-4">
                  {section.children.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "text-white hover:bg-gray-800 rounded-md px-3 py-2 transition-colors block",
                          isActive(item.href) && "bg-gray-800 rounded-md"
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
            <div className="prose prose-invert max-w-none">
              {children}
            </div>
            <DocsNavigation />
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
