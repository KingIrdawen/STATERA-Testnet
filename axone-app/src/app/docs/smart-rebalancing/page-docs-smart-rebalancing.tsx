import Link from 'next/link';

export default function SmartRebalancingPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Smart Rebalancing</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Smart Rebalancing: The Core Innovation of Statera</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Unlike a static basket of assets, a Statera index is powered by smart contracts that automatically adjust its composition to maintain its target allocation.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="space-y-12">
          <section>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Unlike a static basket of assets, a Statera index is powered by <strong>smart contracts</strong> that automatically adjust its composition to maintain its target allocation—e.g., 50% BTC / 50% HYPE.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Holding crypto long-term (spot) has long been a profitable strategy—who wouldn&apos;t dream, in 2025, of shouting back to their 2013 self: &quot;Just buy Bitcoin!&quot;?
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            But markets have matured. The era of easy gains is over. Institutions have entered the game.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4 font-semibold">
            Today, <strong>passive holding is no longer enough. You must act intelligently.</strong>
          </p>

            <h2 className="text-2xl font-bold text-white mb-6 mt-8">How It Works</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Cryptocurrencies are volatile. In Statera indices, this leads to weight imbalances:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>When an asset rises, it becomes <strong>overweighted</strong>.</li>
            <li>When another falls, it becomes <strong>underweighted</strong>.</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            <strong>Smart rebalancing</strong> automatically adjusts the portfolio:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>→ The rebalancing smart contract sells part of the appreciated asset</li>
            <li>→ Then buys more of the underperforming one</li>
            <li>→ Fees are payed with users funds on this index.</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This ensures consistent exposure to your chosen assets.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Statera indices perform <strong>hourly checks</strong> on their portfolio composition, but rebalancing is <strong>not executed automatically every hour</strong>—it is <strong>triggered only when an asset&apos;s weight deviates significantly from its target</strong>.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The <strong>deviation threshold</strong> required to initiate a rebalance (e.g., ±0.1% for our first strategy) is <strong>not fixed across all indices</strong>—it is <strong>customized based on the index&apos;s strategy, defined by asset volatility and risk profile</strong>.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            For example:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>A <strong>low-volatility index</strong> might use a tight threshold (e.g., ±0.1%) to maintain precise exposure.</li>
            <li>A <strong>high-volatility or momentum-focused index</strong> might use a wider threshold (e.g., ±0.5-1%) to avoid over-trading and capture stronger trends.</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This dynamic approach ensures that rebalancing occurs <strong>only when meaningful</strong>, reducing unnecessary operations, minimizing costs, and improving net performance. If the portfolio remains within the defined tolerance band after an hourly check, no action is taken—preserving efficiency while maintaining strategic discipline.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            By combining <strong>hourly monitoring</strong> with <strong>index-specific thresholds</strong>, Statera delivers a <strong>smarter, more adaptive form of active management</strong>—fully automated, transparent, and optimized for each strategy.
          </p>

            <h2 className="text-2xl font-bold text-white mb-6 mt-8">Example: Statera&apos;s first index ERA1 (50% BTC / 50% HYPE)</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            After a strong rally in Bitcoin, the portfolio&apos;s composition shifts to:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>BTC: 50.5%</strong></li>
            <li><strong>HYPE: 49.5%</strong></li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The <strong>target allocation</strong> is 50/50, and the <strong>rebalancing threshold is set at ±0.1%</strong>. Since BTC is now <strong>0.4 percentage points above</strong> its target (well beyond the 0.1% threshold), the <strong>smart rebalancing mechanism is triggered</strong>.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The smart contract automatically:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>→ Sells a portion of BTC</li>
            <li>→ Buys HYPE</li>
            <li>→ Returns the portfolio to <strong>50% BTC / 50% HYPE</strong></li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            🔁 <strong>Result</strong>: You&apos;ve <strong>sold high and bought low</strong>—without any action on your part. The system only acted because the deviation was significant, ensuring <strong>smart, efficient, and cost-effective rebalancing</strong>.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            This mechanism lets you <strong>benefit from volatility</strong> while avoiding unnecessary trades on minor price noise.
          </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Advantages of Statera&apos;s Smart Rebalancing</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            A non-rebalanced portfolio drifts with the market: if BTC surges, you become <strong>overexposed to BTC risk</strong>. A correction can lead to massive losses.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Smart rebalancing <strong>maintains stable allocation</strong>, reducing the risk of overconcentration. In volatile or sideways markets, a rebalanced index <strong>often outperforms simple holding.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Smart rebalancing doesn&apos;t guarantee outperformance in all market conditions. In strong bull runs, selling early may limit maximum gains. But in return, you <strong>reduce risk, diversify intelligently, and capitalize on volatility</strong>—a more <strong>robust long-term approach.</strong>
          </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Rebalancing in Traditional Finance</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Rebalancing is a well-established pillar of portfolio management. Decades of academic research and institutional practice, including studies by <strong>Vanguard, Morningstar</strong> and others, consistently show that regularly returning a portfolio to its target mix improves <strong>risk-adjusted returns</strong>, captures a <strong>&quot;buy low, sell high&quot; effect</strong>, and avoids unwanted risk drift.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            On average, annual or threshold-based rebalancing (±5%) delivers a <strong>performance boost of 0.3% to 0.5% per year</strong>, while reducing volatility.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            However, these same studies warn against <strong>excessively frequent rebalancing</strong> (monthly or weekly), due to <strong>transaction costs, spreads, and operational friction</strong>. In traditional finance, marginal costs quickly accumulate, eroding net performance. That&apos;s why conventional wisdom recommends moderate frequency: <strong>not too rare to maintain discipline, not too frequent to avoid overtrading.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Sources:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Vanguard study: <a href="https://www.financieelonafhankelijkblog.nl/wp-content/uploads/2021/11/Vanguard-ISGPORE.pdf" className="text-[#fab062] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">https://www.financieelonafhankelijkblog.nl/wp-content/uploads/2021/11/Vanguard-ISGPORE.pdf</a></li>
            <li>Morningstar report: <a href="https://www.morningstar.com/columns/rekenthaler-report/when-rebalancing-creates-higher-returnsand-when-it-doesnt" className="text-[#fab062] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">https://www.morningstar.com/columns/rekenthaler-report/when-rebalancing-creates-higher-returnsand-when-it-doesnt</a></li>
          </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Rebalancing in DeFi</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Rebalancing isn&apos;t just a good idea—it&apos;s a <strong>strategy validated by decades of financial analysis.</strong> It improves risk-return profiles, enforces discipline, and harnesses volatility.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            In theory, <strong>DeFi should take rebalancing further</strong>: automation, higher frequency, transparency.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Yet in practice, <strong>most DeFi protocols face the same limitation as TradFi: costs.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            On AMM-based DEXs (Automated Market Makers), each rebalancing incurs:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>High swap fees</strong></li>
            <li><strong>Significant slippage</strong>, especially on large amounts</li>
            <li><strong>Fragmented liquidity</strong>, vulnerable to manipulation</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Like TradFi, frequency quickly becomes <strong>a source of friction, not performance.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            The promise of active, frequent rebalancing <strong>remains unfulfilled</strong>—not due to flawed strategy, but <strong>because of infrastructure limits.</strong>
          </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Statera&apos;s smart rebalancing: optimized execution via Hypercore</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            ✅ <strong>Statera is designed to break through this barrier.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            By leveraging <strong>Hypercore</strong>, Hyperliquid&apos;s on-chain liquidity engine, Statera bypasses these structural frictions.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Thanks to an on-chain <strong>centralized ultra-high-performance order book</strong>, fueled by <strong>institutional-grade liquidity</strong>, Statera achieves:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>Minimal fees</strong></li>
            <li><strong>Near-zero slippage</strong></li>
            <li><strong>Instant execution</strong></li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            🔄 This infrastructure makes <strong>hourly rebalancing economically rational</strong>—turning what was once a cost into a <strong>performance lever.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            Where others are held back by friction, Statera moves forward—powered by the fusion of <strong>proven strategy and cutting-edge technology.</strong>
          </p>
          </section>
        </div>
      </div>
    </div>
  );
}
