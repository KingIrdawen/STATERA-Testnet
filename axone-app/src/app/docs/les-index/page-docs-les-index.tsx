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
        <h1 className="text-4xl font-bold mb-4"><span className="text-[#C9A36A]">Indices: invest in dynamic portfolios, with one click</span></h1>
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

            <h2 className="text-2xl font-bold mb-6"><span className="text-[#C9A36A]">Key characteristics:</span></h2>
            <ul className="text-white leading-relaxed ml-6 space-y-2">
            <li>The underlying assets and their weightings in the index</li>
            <li>The frequency of smart rebalancing</li>
            <li>The rebalancing threshold (%)</li>
          </ul>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="text-[#C9A36A]">How to participate:</span></h2>
            <ol className="text-white leading-relaxed ml-6 space-y-2 list-decimal">
            <li>The user deposits HYPE</li>
            <li>The smart contract instantly purchases the underlying assets via <strong>Hypercore</strong>, Hyperliquid&apos;s ultra-high-performance execution layer.</li>
            <li>The user receives a <strong>liquid token</strong> (e.g., ERA1), representing their proportional share in the index.</li>
          </ol>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="text-[#C9A36A]">Key advantages:</span></h2>
            <ul className="text-white leading-relaxed ml-6 space-y-2">
            <li>No need to manually manage buys or sells</li>
            <li><strong>Hourly automatic rebalancing</strong> to stay aligned with the target strategy and profit from volatility</li>
            <li><strong>Low fees</strong> thanks to Hypercore&apos;s deep liquidity</li>
            <li><strong>Asset security and integrity</strong> guaranteed by HyperUnit</li>
            <li>Liquid tokens are <strong>compatible with other DeFi protocols</strong> (lending, staking, yield strategies, etc.)</li>
          </ul>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="text-[#C9A36A]">Withdrawing funds:</span></h2>
          <p className="text-white leading-relaxed mb-4">
            At any time, users can <strong>redeem their liquid tokens for their equivalent value in HYPE.</strong>
          </p>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="text-[#C9A36A]">Pricing of ERA token:</span></h2>
            <ul className="text-white leading-relaxed ml-6 space-y-2 mb-6">
            <li>Based on the portfolio&apos;s <strong>Net Asset Value (NAV)</strong></li>
            <li>Calculated using <strong>on-chain oracles from Hypercore</strong>, ensuring transparency and resistance to manipulation</li>
          </ul>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="text-[#C9A36A]">Protocol fees</span></h2>
            
            <h3 className="text-xl font-bold text-white mb-4 mt-6">Entry fees: 0.5%</h3>
            <ul className="text-white leading-relaxed ml-6 space-y-2 mb-6">
              <li>Charged when a user deposits HYPE into a strategy.</li>
              <li>0.5% of the deposited amount is taken as a fee, paid in HYPE.</li>
              <li>The remaining 99.5% is used to calculate the user&apos;s initial investment NAV.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-4 mt-6">Exit fees: 0.5%</h3>
            <ul className="text-white leading-relaxed ml-6 space-y-2 mb-6">
              <li>Charged when a user withdraws funds from a strategy.</li>
              <li>0.5% of the withdrawal amount (based on current NAV) is deducted in HYPE.</li>
              <li>The user receives the remaining 99.5%.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-4 mt-6">Management fees: 0.95% per year</h3>
            <ul className="text-white leading-relaxed ml-6 space-y-2 mb-6">
              <li>Charged continuously on the total capital invested in a strategy.</li>
              <li>Accrued over time (e.g., calculated hourly or daily) and deducted directly from the pool, reducing the overall NAV for all participants.</li>
              <li>Applies regardless of performance.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-4 mt-6">External fees:</h3>
            <ul className="text-white leading-relaxed ml-6 space-y-2">
              <li>Additional fees are taken by Hypercore to perform rebalancing transactions.</li>
              <li>Incurred only during automated rebalancing transactions.</li>
              <li>0.002% per transaction — extremely low thanks to Hypercore&apos;s efficient execution layer.</li>
              <li>Annual impact estimated at ~0.05% to 0.06% of total capital per year.</li>
              <li>Accrued over time and deducted directly from the pool, reducing the overall NAV for all participants.</li>
            </ul>
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
