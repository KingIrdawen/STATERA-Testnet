import Link from 'next/link';

export default function SmartRebalancingPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Smart Rebalancing</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Smart Rebalancing - At the Heart of Axone Innovation</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The intelligent rebalancing mechanism that powers Axone indexes and optimizes portfolio performance.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Smart Rebalancing Works</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Smart Rebalancing is the core innovation that makes Axone indexes dynamic and intelligent. Our system automatically adjusts portfolio allocations based on market conditions and performance metrics.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about smart rebalancing.
          </p>
        </div>
      </div>
    </div>
  );
}
