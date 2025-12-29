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
        <h1 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Indices: invest in dynamic portfolios, with one click</span></h1>
        <p className="text-xl text-white leading-relaxed">
          A Statera strategy is a diversified portfolio of crypto assets that automatically rebalances to maintain its target allocation.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="space-y-12">
          <section>
            <p className="text-white leading-relaxed mb-6">
            A Statera <strong>strategy</strong> is a <strong>diversified portfolio of crypto assets</strong> (e.g., 50% BTC, 50% HYPE) that <strong>automatically rebalances</strong> to maintain its target allocation.
          </p>

            <h2 className="text-2xl font-bold mb-6"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Key characteristics:</span></h2>
            <ul className="text-white leading-relaxed ml-6 space-y-2">
            <li>The underlying assets and their weightings in the index</li>
            <li>The frequency of smart rebalancing</li>
            <li>The rebalancing threshold (%)</li>
          </ul>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">How to participate:</span></h2>
            <ol className="text-white leading-relaxed ml-6 space-y-2 list-decimal">
            <li>The user deposits HYPE</li>
            <li>The smart contract instantly purchases the underlying assets via <strong>Hypercore</strong>, Hyperliquid&apos;s ultra-high-performance execution layer.</li>
            <li>The user receives a <strong>liquid token</strong> (e.g., ERA1), representing their proportional share in the index.</li>
          </ol>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Key advantages:</span></h2>
            <ul className="text-white leading-relaxed ml-6 space-y-2">
            <li>No need to manually manage buys or sells</li>
            <li><strong>Hourly automatic rebalancing</strong> to stay aligned with the target strategy and profit from volatility</li>
            <li><strong>Low fees</strong> thanks to Hypercore&apos;s deep liquidity</li>
            <li><strong>Asset security and integrity</strong> guaranteed by HyperUnit</li>
            <li>Liquid tokens are <strong>compatible with other DeFi protocols</strong> (lending, staking, yield strategies, etc.)</li>
          </ul>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Withdrawing funds:</span></h2>
          <p className="text-white leading-relaxed mb-4">
            At any time, users can <strong>redeem their liquid tokens for their equivalent value in HYPE.</strong>
          </p>
            <ul className="text-white leading-relaxed ml-6 space-y-2">
            <li>Entry and exit fees: <strong>0.5% each</strong> (paid in HYPE)</li>
            <li>Management fees: <strong>0.95% per year</strong></li>
          </ul>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Pricing of the liquid token:</span></h2>
            <ul className="text-white leading-relaxed ml-6 space-y-2">
            <li>Based on the portfolio&apos;s <strong>Net Asset Value (NAV)</strong></li>
            <li>Calculated using <strong>on-chain oracles from Hypercore</strong>, ensuring transparency and resistance to manipulation</li>
          </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
