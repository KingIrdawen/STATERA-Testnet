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
      href: '/app',
      label: 'Strategies',
      icon: <StateraLayersIcon size={20} className="shrink-0" />,
    },
    {
      href: '/dashboard/referral',
      label: 'Referral',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="6" r="3" />
          <path d="M6 12C6 10.3431 7.79086 9 10 9C12.2091 9 14 10.3431 14 12V16H6V12Z" />
        </svg>
      ),
    },
    {
      href: '/dashboard/points',
      label: 'Points',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3L12.163 7.60714L17 8.34286L13.5 11.7857L14.326 16.5L10 14.3571L5.674 16.5L6.5 11.7857L3 8.34286L7.837 7.60714L10 3Z" />
        </svg>
      ),
    },
  ];

  // Déterminer si un item est actif (pour Dashboard, vérifier si on est sur une page dashboard)
  const isActive = (href: string) => {
    if (href === '/dashboard/strategy') {
      return pathname?.startsWith('/dashboard/strategy') || pathname === '/dashboard/staking' || pathname === '/dashboard/swap' || pathname === '/dashboard/arbitrage';
    }
    return pathname === href;
  };

  const headerHeight = address && !isCorrectChain ? 104 : 60;
  const headerHeightMd = address && !isCorrectChain ? 124 : 80;

  return (
    <aside 
      className={`fixed left-0 w-64 z-[9998]`}
      style={{
        top: `${headerHeight}px`,
        maxHeight: `calc(100vh - ${headerHeight}px)`,
      }}
    >
      <div className="h-full bg-black overflow-y-auto">
        <div className="p-6 space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? 'text-white bg-gray-800/50'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {item.icon}
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

