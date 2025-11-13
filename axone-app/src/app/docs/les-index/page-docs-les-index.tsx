import Link from 'next/link';

export default function DocsLesIndexPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Indices</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Indices: invest in dynamic portfolios, with one click</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          A Statera strategy is a diversified portfolio of crypto assets that automatically rebalances to maintain its target allocation.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            A Statera <strong>strategy</strong> is a <strong>diversified portfolio of crypto assets</strong> (e.g., 50% BTC, 50% HYPE) that <strong>automatically rebalances</strong> to maintain its target allocation.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Key characteristics:</h2>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>The underlying assets and their weightings in the index</li>
            <li>The frequency of smart rebalancing</li>
            <li>The rebalancing threshold (%)</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">How to participate:</h2>
          <ol className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2 list-decimal">
            <li>The user deposits HYPE</li>
            <li>The smart contract instantly purchases the underlying assets via <strong>Hypercore</strong>, Hyperliquid&apos;s ultra-high-performance execution layer.</li>
            <li>The user receives a <strong>liquid token</strong> (e.g., ERA1), representing their proportional share in the index.</li>
          </ol>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Key advantages:</h2>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>No need to manually manage buys or sells</li>
            <li><strong>Hourly automatic rebalancing</strong> to stay aligned with the target strategy and profit from volatility</li>
            <li><strong>Low fees</strong> thanks to Hypercore&apos;s deep liquidity</li>
            <li><strong>Asset security and integrity</strong> guaranteed by HyperUnit</li>
            <li>Liquid tokens are <strong>compatible with other DeFi protocols</strong> (lending, staking, yield strategies, etc.)</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Withdrawing funds:</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            At any time, users can <strong>redeem their liquid tokens for their equivalent value in HYPE.</strong>
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Entry and exit fees: <strong>0.5% each</strong> (paid in HYPE)</li>
            <li>Management fees: <strong>0.95% per year</strong></li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Pricing of the liquid token:</h2>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Based on the portfolio&apos;s <strong>Net Asset Value (NAV)</strong></li>
            <li>Calculated using <strong>on-chain oracles from Hypercore</strong>, ensuring transparency and resistance to manipulation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
