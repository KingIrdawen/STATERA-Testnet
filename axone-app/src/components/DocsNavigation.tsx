"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

const pagesOrder = [
  // Structure complète de la doc dans l'ordre de navigation
  { slug: "/docs/presentation", label: "Introduction" },
  { slug: "/docs/mission", label: "Mission" },
  { slug: "/docs/vision-valeurs", label: "Vision and Values" },
  { slug: "/docs/token-axn-alignment", label: "AXN Token, Alignment Reward" },
  { slug: "/docs/protocole", label: "Protocol" },
  { slug: "/docs/index-axone", label: "What is an Axone Index?" },
  { slug: "/docs/smart-rebalancing", label: "Smart Rebalancing - At the Heart of Axone Innovation" },
  { slug: "/docs/hyperunit", label: "Axone x Hyperunit" },
  { slug: "/docs/fonctionnement-revenus", label: "Protocol Functioning - Revenue" },
  { slug: "/docs/les-index", label: "The Indexes: Invest in Dynamic Portfolios with One Click" },
  { slug: "/docs/lock-vaults", label: "Lock Vaults: Earn AXN Rewards" },
  { slug: "/docs/token-axn", label: "AXN Token - Capture Axone Protocol Value" },
  { slug: "/docs/gouvernance", label: "Protocol Governance" },
  { slug: "/docs/capture-croissance", label: "Growth Capture - Revenue Utilization" },
  { slug: "/docs/maitrise-inflation", label: "Inflation Control" },
  { slug: "/docs/tokenomics", label: "Tokenomics" },
  { slug: "/docs/liquidity-mining", label: "Liquidity Mining: Reward Early Engagement" },
  { slug: "/docs/strategie-croissance", label: "Growth Strategy - Roadmap" },
  { slug: "/docs/roadmap", label: "Roadmap" },
  { slug: "/docs/epoque-0", label: "Epoch 0" },
  { slug: "/docs/epoque-1", label: "Epoch 1" },
  { slug: "/docs/epoque-2", label: "Epoch 2" },
  { slug: "/docs/next-steps", label: "Next Steps" },
];

export default function DocsNavigation() {
  const pathname = usePathname();
  const index = pagesOrder.findIndex((p) => p.slug === pathname);

  const prev = index > 0 ? pagesOrder[index - 1] : null;
  const next = index < pagesOrder.length - 1 ? pagesOrder[index + 1] : null;

  if (!prev && !next) return null;

  return (
    <div className="mt-16 border-t border-gray-700 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <Link
          href={prev.slug}
          className="group flex flex-col justify-between bg-[#001a1f] border border-gray-700 rounded-xl p-5 hover:bg-gray-800 transition-all"
        >
          <span className="text-sm text-[#5a9a9a] mb-2 flex items-center gap-2">
            <ArrowLeft size={16} className="text-[#fab062]" />
            Previous page
          </span>
          <span className="text-lg font-semibold text-white group-hover:text-[#fab062] transition-colors">
            {prev.label}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.slug}
          className="group flex flex-col justify-between bg-[#001a1f] border border-gray-700 rounded-xl p-5 hover:bg-gray-800 transition-all text-right"
        >
          <span className="text-sm text-[#5a9a9a] mb-2 flex items-center justify-end gap-2">
            Next page
            <ArrowRight size={16} className="text-[#fab062]" />
          </span>
          <span className="text-lg font-semibold text-white group-hover:text-[#fab062] transition-colors">
            {next.label}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
