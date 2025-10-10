'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import DocsNavigation from '@/components/DocsNavigation';
import { cn } from '@/lib/utils';

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
      title: 'Introduction',
      href: '/docs/presentation',
      children: [
        { title: 'Mission', href: '/docs/mission' },
        { title: 'Vision and Values', href: '/docs/vision-valeurs' },
        { title: 'AXN Token, Alignment Reward', href: '/docs/token-axn-alignment' },
      ],
    },
    {
      title: 'Protocol',
      href: '/docs/protocole',
      children: [
        { title: 'What is an Axone Index?', href: '/docs/index-axone' },
        { title: 'Smart Rebalancing - At the Heart of Axone Innovation', href: '/docs/smart-rebalancing' },
        { title: 'Axone x Hyperunit', href: '/docs/hyperunit' },
      ],
    },
    {
      title: 'Protocol Functioning - Revenue',
      href: '/docs/fonctionnement-revenus',
      children: [
        { title: 'The Indexes: Invest in Dynamic Portfolios with One Click', href: '/docs/les-index' },
        { title: 'Lock Vaults: Earn AXN Rewards', href: '/docs/lock-vaults' },
      ],
    },
    {
      title: 'AXN Token - Capture Axone Protocol Value',
      href: '/docs/token-axn',
      children: [
        { title: 'Protocol Governance', href: '/docs/gouvernance' },
        { title: 'Growth Capture - Revenue Utilization', href: '/docs/capture-croissance' },
        { title: 'Inflation Control', href: '/docs/maitrise-inflation' },
        { title: 'Tokenomics', href: '/docs/tokenomics' },
        { title: 'Liquidity Mining: Reward Early Engagement', href: '/docs/liquidity-mining' },
      ],
    },
    {
      title: 'Growth Strategy - Roadmap',
      href: '/docs/strategie-croissance',
      children: [
        { title: 'Roadmap', href: '/docs/roadmap' },
        { title: 'Epoch 0', href: '/docs/epoque-0' },
        { title: 'Epoch 1', href: '/docs/epoque-1' },
        { title: 'Epoch 2', href: '/docs/epoque-2' },
        { title: 'Next Steps', href: '/docs/next-steps' },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Bouton toggle mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-20 left-4 z-[10000] bg-black border border-gray-700 rounded px-3 py-2 text-sm hover:bg-gray-800 transition-colors"
      >
        Table of Contents
      </button>

      <div className="flex pt-[60px] md:pt-[80px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[9998] w-80 bg-black p-6 overflow-y-auto md:static md:translate-x-0 transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="space-y-6">
            
            {tocItems.map((section) => (
              <div key={section.title}>
                <Link
                  href={section.href}
                  className={cn(
                    "text-sm font-semibold text-[#fab062] uppercase tracking-wide mb-3 block hover:text-white transition-colors",
                    isActive(section.href) && "text-white"
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
                          "text-[#5a9a9a] hover:text-white hover:bg-gray-800 rounded-md px-3 py-2 transition-colors block",
                          isActive(item.href) && "text-white bg-gray-800 rounded-md"
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
        <main className="flex-1 max-w-4xl mx-auto p-8">
          {children}
          <DocsNavigation />
        </main>
      </div>

      {/* Footer noir simple */}
      <footer className="bg-black py-8">
        <div className="flex min-h-[60px] md:min-h-[80px]">
          {/* Section gauche - Logos sociaux alignés avec le logo du header */}
          <div className="flex-1 flex items-center justify-start">
            <div className="px-4 sm:px-8 md:px-36 lg:px-48">
              <div className="flex items-center gap-4">
                <Link
                  href="/x"
                  className="text-white hover:text-[#fab062] transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>

                <Link
                  href="/discord"
                  className="text-white hover:text-[#fab062] transition-colors"
                  aria-label="Discord"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Section droite - Navigation alignée avec le bouton Launch App */}
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
                  href="/terms"
                  className="text-white font-bold text-xs sm:text-sm md:text-base hover:text-[#fab062] transition-colors tracking-tight"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
