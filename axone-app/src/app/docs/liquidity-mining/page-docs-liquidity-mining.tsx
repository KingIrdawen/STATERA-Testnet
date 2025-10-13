import Link from 'next/link';

export default function DocsLiquidityMiningPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Liquidity Mining</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Liquidity Mining</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone&apos;s liquidity mining program rewards liquidity providers for their contribution to the ecosystem.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Reward Program</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone&apos;s liquidity mining allows users to earn AXN tokens by providing liquidity to trading pools, contributing to ecosystem stability and growth.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about liquidity mining.
          </p>
        </div>
      </div>
    </div>
  );
}
