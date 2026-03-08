'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import DocsNavigation from '@/components/DocsNavigation';
import { cn } from '@/lib/utils';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { cinzel } from '@/lib/fonts';

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
    <div className={`${cinzel.className} min-h-screen bg-[#0A0A0A] text-white`}>
      <style>{`
        .docs-content h1,
        .docs-content h2,
        .docs-content h3,
        .docs-content h4,
        .docs-content h2 span,
        .docs-content h3 span {
          background: linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .docs-content p,
        .docs-content li,
        .docs-content td {
          color: rgba(230, 230, 230, 0.7);
          font-weight: 300;
          letter-spacing: 0.04em;
        }
        .docs-content strong {
          color: rgba(230, 230, 230, 0.9);
          -webkit-text-fill-color: rgba(230, 230, 230, 0.9);
        }
        .docs-content th {
          color: rgba(230, 230, 230, 0.9);
        }
      `}</style>
      <Header />

      {/* Bouton toggle mobile */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-20 left-4 z-[10000] bg-[#0A0A0A] border border-[#C9A36A]/30 rounded px-3 py-2 text-xs tracking-[0.14em] uppercase text-[#C9A36A] hover:bg-white/5 transition-colors"
      >
        Table of Contents
      </button>

      <div className="flex pt-[60px] md:pt-[80px]">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-[9998] w-80 bg-[#0A0A0A] border-r border-[#C9A36A]/10 p-6 overflow-y-auto md:static md:translate-x-0 transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="space-y-6">
            {tocItems.map((section) => (
              <div key={section.title}>
                <Link
                  href={section.href}
                  className={cn(
                    "text-[0.6rem] font-semibold uppercase tracking-[0.18em] mb-3 block transition-opacity",
                    isActive(section.href)
                      ? "text-[#C9A36A]"
                      : "text-[#C9A36A] hover:opacity-70"
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
                          "text-[0.7rem] tracking-[0.08em] text-[rgba(230,230,230,0.6)] hover:text-[rgba(230,230,230,0.9)] px-3 py-2 transition-colors block rounded",
                          isActive(item.href) && "bg-white/5 text-[rgba(230,230,230,0.9)]"
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
          <div className="bg-white/5 border border-[#C9A36A]/15 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#C9A36A]/10 ring-1 ring-[#C9A36A]/10">
            <div className="docs-content prose prose-invert max-w-none">
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
