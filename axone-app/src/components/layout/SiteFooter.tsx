'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// External links constants (TODO: Move to config file if needed)
const EXTERNAL_LINKS = {
  twitter: '#', // TODO: Add Twitter URL
  discord: '#', // TODO: Add Discord URL
  github: '#', // TODO: Add GitHub URL
  blog: '#', // TODO: Add Blog URL
};

// Minimal i18n dictionary
const translations = {
  en: {
    products: 'Products',
    ecosystem: 'Ecosystem',
    resources: 'Resources',
    community: 'Community',
    allRightsReserved: 'All rights reserved.',
    productsLinks: {
      market: 'Market',
      dashboard: 'Dashboard',
      referral: 'Referral',
      documentation: 'Documentation',
    },
    ecosystemLinks: {
      about: 'About',
      features: 'Features',
      partners: 'Partners',
      tokenomics: 'Tokenomics',
    },
    resourcesLinks: {
      gettingStarted: 'Getting Started',
      faq: 'FAQ',
      apiDocs: 'API Docs',
      smartContracts: 'Smart Contracts',
    },
    communityLinks: {
      twitter: 'Twitter',
      discord: 'Discord',
      github: 'GitHub',
      blog: 'Blog',
    },
  },
  fr: {
    products: 'Produits',
    ecosystem: 'Écosystème',
    resources: 'Ressources',
    community: 'Communauté',
    allRightsReserved: 'Tous droits réservés.',
    productsLinks: {
      market: 'Market',
      dashboard: 'Dashboard',
      referral: 'Parrainage',
      documentation: 'Documentation',
    },
    ecosystemLinks: {
      about: 'À propos',
      features: 'Fonctionnalités',
      partners: 'Partenaires',
      tokenomics: 'Tokenomics',
    },
    resourcesLinks: {
      gettingStarted: 'Guide de démarrage',
      faq: 'FAQ',
      apiDocs: 'API Docs',
      smartContracts: 'Smart Contracts',
    },
    communityLinks: {
      twitter: 'Twitter',
      discord: 'Discord',
      github: 'GitHub',
      blog: 'Blog',
    },
  },
};

type Language = 'en' | 'fr';

function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage first
  const stored = localStorage.getItem('statera-language');
  if (stored === 'en' || stored === 'fr') {
    return stored;
  }
  
  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  
  return 'en';
}

export function SiteFooter() {
  const [language, setLanguage] = useState<Language>('en');
  
  useEffect(() => {
    setLanguage(detectLanguage());
  }, []);
  
  const t = translations[language];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-black overflow-hidden">
      {/* Stars background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(250,176,98,0.15)_1px,transparent_0)] [background-size:32px_32px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-12">
          {/* Left block: Branding */}
          <div className="space-y-4">
            {/* Logo badge */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#fab062] to-[#5a9a9a] p-0.5 flex-shrink-0">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Image
                    src="/Logo-Statera-sandy-brown-détouré.png"
                    alt="Statera Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl">STATERA</span>
                <span className="text-[#fab062] text-xs font-semibold uppercase tracking-wider">
                  FINANCE
                </span>
              </div>
            </div>
          </div>

          {/* Right block: Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Products */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {t.products}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/app"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.productsLinks.market}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/strategy"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.productsLinks.dashboard}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/referral"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.productsLinks.referral}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.productsLinks.documentation}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ecosystem */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {t.ecosystem}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs/presentation"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.ecosystemLinks.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {/* TODO: Add Features route */}
                    {t.ecosystemLinks.features}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {/* TODO: Add Partners route */}
                    {t.ecosystemLinks.partners}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/tokenomics"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.ecosystemLinks.tokenomics}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {t.resources}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs/presentation"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.resourcesLinks.gettingStarted}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {/* TODO: Add FAQ route */}
                    {t.resourcesLinks.faq}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {/* TODO: Add API Docs route */}
                    {t.resourcesLinks.apiDocs}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {/* TODO: Add Smart Contracts route */}
                    {t.resourcesLinks.smartContracts}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                {t.community}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href={EXTERNAL_LINKS.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.communityLinks.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.communityLinks.discord}
                  </a>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.communityLinks.github}
                  </a>
                </li>
                <li>
                  <a
                    href={EXTERNAL_LINKS.blog}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {t.communityLinks.blog}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-white/50 text-xs text-center">
            © {currentYear} Statera. {t.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}

