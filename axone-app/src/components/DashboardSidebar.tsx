'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StateraLayersIcon from '@/icons/StateraLayersIcon';
import { useAccount, useChainId } from 'wagmi';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { address } = useAccount();
  const chainId = useChainId();
  const EXPECTED_CHAIN_ID = 998;
  const isCorrectChain = chainId === EXPECTED_CHAIN_ID;

  const menuItems = [
    {
      href: '/dashboard/strategy',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
          <rect x="2.5" y="2.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="11.5" y="2.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="2.5" y="11.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="11.5" y="11.5" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      ),
    },
    {
      href: '/app/strategies',
      label: 'Market',
      icon: <StateraLayersIcon size={20} className="shrink-0" />,
    },
    {
      href: '/dashboard/staking',
      label: 'ERA Staking',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7" />
          <path d="M7 10h6M10 7v6" />
        </svg>
      ),
    },
    {
      href: '/dashboard/staking-sta',
      label: 'STA Staking',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7" />
          <path d="M7.5 12.5c0 0 .8 1 2.5 1s2.5-1 2.5-2.5S12 9 10 8.5 7.5 7.5 7.5 6.5 8.3 5 10 5s2.5 1 2.5 1" />
          <path d="M10 4v1M10 15v1" />
        </svg>
      ),
    },
    {
      href: '/dashboard/swap',
      label: 'Swap',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h12M13 4l3 3-3 3M16 13H4M7 10l-3 3 3 3" />
        </svg>
      ),
    },
    {
      href: '/dashboard/arbitrage',
      label: 'Arbitrage',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10h14M10 3l7 7-7 7" />
        </svg>
      ),
    },
  ];

  // Déterminer si un item est actif
  const isActive = (href: string) => {
    if (href === '/dashboard/strategy') {
      return pathname?.startsWith('/dashboard/strategy');
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const headerHeight = address && !isCorrectChain ? 104 : 60;
  const headerHeightMd = address && !isCorrectChain ? 124 : 80;

  return (
    <aside 
      className={`fixed left-0 w-52 z-[9998] hidden md:block`}
      style={{
        top: `${headerHeight}px`,
        maxHeight: `calc(100vh - ${headerHeight}px)`,
      }}
    >
      <div className="h-full bg-black border-r border-[#C9A36A]/15 overflow-y-auto">
        <div className="p-6 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  active
                    ? 'text-white'
                    : 'text-[rgba(230,230,230,0.45)] hover:text-[rgba(230,230,230,0.75)] hover:bg-white/3'
                }`}
              >
                {item.icon}
                <span className={active ? 'font-bold' : 'font-medium'}>{item.label}</span>
                {active && (
                  <span
                    className="absolute right-0 top-2 bottom-2 w-[2px] rounded-l-full"
                    style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(240,202,122,0.80) 50%, transparent 100%)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

