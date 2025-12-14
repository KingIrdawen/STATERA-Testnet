'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

interface LinkGroup {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

interface StrategyHeroProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  linkGroups?: LinkGroup[];
}

const defaultLinkGroups: LinkGroup[] = [
  {
    title: 'Produits',
    links: [
      { label: 'Market', href: '/app' },
      { label: 'Dashboard', href: '/dashboard/strategy' },
      { label: 'Parrainage', href: '/dashboard/referral' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  {
    title: 'Écosystème',
    links: [
      { label: 'À propos', href: '/docs/presentation' },
      { label: 'Fonctionnalités', href: '#' }, // TODO: Add route
      { label: 'Partenaires', href: '#' }, // TODO: Add route
      { label: 'Tokenomics', href: '/docs/tokenomics' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Guide de démarrage', href: '/docs/presentation' },
      { label: 'FAQ', href: '#' }, // TODO: Add route
      { label: 'API Docs', href: '#' }, // TODO: Add route
      { label: 'Smart Contracts', href: '#' }, // TODO: Add route
    ],
  },
  {
    title: 'Communauté',
    links: [
      { label: 'Twitter', href: '#' }, // TODO: Add social links
      { label: 'Discord', href: '#' }, // TODO: Add social links
      { label: 'GitHub', href: '#' }, // TODO: Add social links
      { label: 'Blog', href: '#' }, // TODO: Add route
    ],
  },
];

export function StrategyHero({
  title = "L'investissement Web3 réinventé pour une nouvelle ère financière",
  subtitle = "Statera transforme la complexité de la DeFi en une expérience simple et accessible. Rejoignez des milliers d'investisseurs qui ont déjà choisi l'excellence.",
  ctaLabel = 'COMMENCER MAINTENANT',
  ctaHref,
  linkGroups = defaultLinkGroups,
}: StrategyHeroProps) {
  const router = useRouter();
  const { address } = useAccount();

  const handleCTAClick = () => {
    if (ctaHref) {
      router.push(ctaHref);
      return;
    }

    if (address) {
      // User is connected, scroll to strategies section
      const strategiesElement = document.getElementById('strategies');
      if (strategiesElement) {
        strategiesElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/app');
      }
    } else {
      // User not connected, navigate to dashboard
      router.push('/dashboard/strategy');
    }
  };

  return (
    <div className="relative w-full bg-black overflow-hidden">
      {/* Stars background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(250,176,98,0.15)_1px,transparent_0)] [background-size:32px_32px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left column: Branding + Title + Text + CTA */}
          <div className="space-y-6">
            {/* Logo badge + Branding */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#fab062] to-[#5a9a9a] p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Image
                    src="/Logo-Statera-sandy-brown-détouré.png"
                    alt="Statera Logo"
                    width={40}
                    height={40}
                    className="w-8 h-8 sm:w-10 sm:h-10"
                  />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-lg sm:text-xl">STATERA</span>
                <span className="text-[#fab062] text-xs sm:text-sm font-semibold uppercase tracking-wider">
                  FINANCE
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {title}
            </h1>

            {/* Supporting paragraph */}
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl">
              {subtitle}
            </p>

            {/* CTA Button */}
            <button
              onClick={handleCTAClick}
              className="group relative inline-flex items-center gap-3 px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-[#fab062] to-[#e89a4a] text-black font-bold text-sm sm:text-base rounded-xl hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>{ctaLabel}</span>
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Right column: Link groups */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8">
            {linkGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-gray-400 text-sm hover:text-[#fab062] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

