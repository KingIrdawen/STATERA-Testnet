"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

const pagesOrder = [
  // Structure complète de la doc dans l'ordre de navigation - correspond exactement à Documentation - 07-11-2025.md
  { slug: "/docs/presentation", label: "Introduction Page" },
  { slug: "/docs/mission", label: "Mission" },
  { slug: "/docs/vision-valeurs", label: "Vision and Values" },
  { slug: "/docs/token-axn-alignment", label: "The STA Token: Rewarding Alignment" },
  { slug: "/docs/protocole", label: "Protocol" },
  { slug: "/docs/index-axone", label: "What is a Statera Index?" },
  { slug: "/docs/smart-rebalancing", label: "Smart Rebalancing: The Core Innovation of Statera" },
  { slug: "/docs/hyperunit", label: "Statera x HyperUnit" },
  { slug: "/docs/fonctionnement-revenus", label: "Protocol Mechanics – Revenue Generation" },
  { slug: "/docs/les-index", label: "Indices: invest in dynamic portfolios, with one click" },
  { slug: "/docs/lock-vaults", label: "Strategy staking: transform your ERA token in STA rewards" },
  { slug: "/docs/token-axn", label: "The STA token: capture the value of the Statera protocol" },
  { slug: "/docs/gouvernance", label: "Protocol Governance" },
  { slug: "/docs/capture-croissance", label: "Capturing Growth – Revenue Distribution" },
  { slug: "/docs/maitrise-inflation", label: "Managing Inflation" },
  { slug: "/docs/tokenomics", label: "Tokenomics" },
  { slug: "/docs/liquidity-mining", label: "Liquidity Mining: Rewarding Early Engagement" },
  { slug: "/docs/strategie-croissance", label: "Growth Strategy – Roadmap" },
  { slug: "/docs/roadmap", label: "Roadmap" },
  { slug: "/docs/epoque-0", label: "Epoch 0" },
  { slug: "/docs/epoque-1", label: "Epoch 1" },
  { slug: "/docs/epoque-2", label: "Epoch 2" },
  { slug: "/docs/beyond", label: "Beyond" },
];

export default function DocsNavigation() {
  const pathname = usePathname();
  const index = pagesOrder.findIndex((p) => p.slug === pathname);

  const prev = index > 0 ? pagesOrder[index - 1] : null;
  const next = index < pagesOrder.length - 1 ? pagesOrder[index + 1] : null;

  if (!prev && !next) return null;

  // Style discret pour toutes les pages
  const linkClassName = "group flex flex-col justify-between border-b border-gray-800/50 pb-4 pt-2 hover:border-gray-700/50 transition-all";

  return (
    <div className="mt-16 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={prev.slug}
          className={linkClassName}
        >
          <span className="text-sm text-[#5a9a9a] mb-2 flex items-center gap-2">
            <ArrowLeft size={16} className="text-[#fab062]" />
            Previous page
          </span>
          <span className="text-lg font-semibold text-white group-hover:text-[#fab062] transition-colors text-left">
            {prev.label}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.slug}
          className={linkClassName}
        >
          <span className="text-sm text-[#5a9a9a] mb-2 flex items-center justify-end gap-2">
            Next page
            <ArrowRight size={16} className="text-[#fab062]" />
          </span>
          <span className="text-lg font-semibold text-white group-hover:text-[#fab062] transition-colors text-right">
            {next.label}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
