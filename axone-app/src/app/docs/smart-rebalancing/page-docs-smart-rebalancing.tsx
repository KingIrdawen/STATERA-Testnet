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
          Unlike a static basket of assets, an Axone index is powered by smart contracts that automatically adjust its composition to maintain its target allocation.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">The Need for Smart Rebalancing</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Unlike a static basket of assets, an Axone index is powered by smart contracts that automatically adjust its composition to maintain its target allocation—e.g., 50% BTC / 50% HYPE.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Holding crypto long-term (spot) has long been a profitable strategy—who wouldn&apos;t dream, in 2025, of shouting back to their 2013 self: &quot;Buy Bitcoin!&quot;?
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            But markets have matured. The era of easy gains is over. Institutions have entered the game.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Today, passive holding is no longer enough. You must act intelligently.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">How It Works</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Cryptocurrencies are volatile. In Axone indices, this leads to weight imbalances:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>When an asset rises, it becomes overweighted.</li>
            <li>When another falls, it becomes underweighted.</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Smart rebalancing automatically adjusts the portfolio:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>→ The rebalancing smart contract sells part of the appreciated asset</li>
            <li>→ Then buys more of the underperforming one</li>
            <li>→ Fees are payed with users funds on this index.</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This ensures consistent exposure to your chosen assets.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Dynamic Threshold System</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone indices perform hourly checks on their portfolio composition, but rebalancing is not executed automatically every hour—it is triggered only when an asset&apos;s weight deviates significantly from its target.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The deviation threshold required to initiate a rebalance (e.g., ±1%, ±2%, etc.) is not fixed across all indices—it is customized based on the index&apos;s strategy, asset volatility, and risk profile.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            For example:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>A low-volatility index might use a tight threshold (e.g., ±0.5%) to maintain precise exposure.</li>
            <li>A high-volatility or momentum-focused index might use a wider threshold (e.g., ±2%) to avoid over-trading and capture stronger trends.</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This dynamic approach ensures that rebalancing occurs only when meaningful, reducing unnecessary operations, minimizing costs, and improving net performance. If the portfolio remains within the defined tolerance band after an hourly check, no action is taken—preserving efficiency while maintaining strategic discipline.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            By combining hourly monitoring with index-specific thresholds, Axone delivers a smarter, more adaptive form of active management—fully automated, transparent, and optimized for each strategy.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Example: Axone BTC50 Defensive Index (50% BTC / 50% HYPE)</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            After a strong rally in Bitcoin, the portfolio&apos;s composition shifts to:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>BTC: 55%</li>
            <li>HYPE: 45%</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The target allocation is 50/50, and the rebalancing threshold is set at ±1%. Since BTC is now 5 percentage points above its target (well beyond the 1% threshold), the smart rebalancing mechanism is triggered.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The smart contract automatically:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>→ Sells a portion of BTC</li>
            <li>→ Buys HYPE</li>
            <li>→ Returns the portfolio to 50% BTC / 50% HYPE</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            🔁 Result: You&apos;ve sold high and bought low—without any action on your part. The system only acted because the deviation was significant, ensuring smart, efficient, and cost-effective rebalancing.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            This mechanism lets you benefit from volatility while avoiding unnecessary trades on minor price noise.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Advantages of Axone&apos;s Smart Rebalancing</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            A non-rebalanced portfolio drifts with the market: if BTC surges, you become overexposed to BTC risk. A correction can lead to massive losses.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Smart rebalancing maintains stable allocation, reducing the risk of overconcentration. In volatile or sideways markets, a rebalanced index often outperforms simple holding.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Smart rebalancing doesn&apos;t guarantee outperformance in all market conditions. In strong bull runs, selling early may limit maximum gains. But in return, you reduce risk, diversify intelligently, and capitalize on volatility—a more robust long-term approach.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Rebalancing in Traditional Finance</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Rebalancing is a well-established pillar of portfolio management. Decades of academic research and institutional practice, including studies by Vanguard, Morningstar, and BlackRock, consistently show that regularly returning a portfolio to its target mix improves risk-adjusted returns, captures a &quot;buy low, sell high&quot; effect, and avoids unwanted risk drift.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            On average, annual or threshold-based rebalancing (±5%) delivers a performance boost of 0.3% to 0.5% per year, while reducing volatility.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            However, these same studies warn against excessively frequent rebalancing (monthly or weekly), due to transaction costs, spreads, and operational friction. In traditional finance, marginal costs quickly accumulate, eroding net performance. That&apos;s why conventional wisdom recommends moderate frequency: not too rare to maintain discipline, not too frequent to avoid overtrading.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Sources:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>Vanguard study: <a href="https://www.financieelonafhankelijkblog.nl/wp-content/uploads/2021/11/Vanguard-ISGPORE.pdf" className="text-[#fab062] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">https://www.financieelonafhankelijkblog.nl/wp-content/uploads/2021/11/Vanguard-ISGPORE.pdf</a></li>
            <li>Morningstar report: <a href="https://www.morningstar.com/columns/rekenthaler-report/when-rebalancing-creates-higher-returnsand-when-it-doesnt" className="text-[#fab062] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">https://www.morningstar.com/columns/rekenthaler-report/when-rebalancing-creates-higher-returnsand-when-it-doesnt</a></li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Rebalancing in DeFi</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Rebalancing isn&apos;t just a good idea—it&apos;s a strategy validated by decades of financial analysis. It improves risk-return profiles, enforces discipline, and harnesses volatility.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            In theory, DeFi should take rebalancing further: automation, higher frequency, transparency.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Yet in practice, most DeFi protocols face the same limitation as TradFi: costs.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            On AMM-based DEXs (Automated Market Makers), each rebalancing incurs:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>High swap fees</li>
            <li>Significant slippage, especially on large amounts</li>
            <li>Fragmented liquidity, vulnerable to manipulation</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Like TradFi, frequency quickly becomes a source of friction, not performance.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The promise of active, frequent rebalancing remains unfulfilled—not due to flawed strategy, but because of infrastructure limits.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Axone&apos;s Smart Rebalancing: Optimized Execution via Hypercore</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone is designed to break through this barrier.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            By leveraging Hypercore, Hyperliquid&apos;s on-chain liquidity engine, Axone bypasses these structural frictions.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Thanks to a centralized, decentralized, ultra-high-performance order book, fueled by institutional-grade liquidity, Axone achieves:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>Minimal fees</li>
            <li>Near-zero slippage</li>
            <li>Instant execution</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This infrastructure makes hourly rebalancing economically rational—turning what was once a cost into a performance lever.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            Where others are held back by friction, Axone moves forward—powered by the fusion of proven strategy and cutting-edge technology.
          </p>
        </div>
      </div>
    </div>
  );
}
