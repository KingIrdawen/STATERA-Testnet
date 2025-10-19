import Link from 'next/link';

export default function DocsProtocolePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Protocol</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Protocol</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone brings institutional-grade portfolio management to on-chain investing through automated, diversified baskets of crypto assets.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Axone Indices</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            At its core, each Axone Index is an automated, diversified basket of crypto assets—continuously monitored and rebalanced by smart contracts to stay aligned with its strategy. Users deposit stablecoins and receive a liquid, tradable token representing their share of the index, gaining transparent exposure without manual trading or intermediaries.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Smart Rebalancing Innovation</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The protocol&apos;s key innovation is Smart Rebalancing—a dynamic mechanism that adjusts allocations based on asset performance and volatility thresholds. Instead of static or overly frequent rebalancing, Axone leverages hourly monitoring to rebalance only when meaningful deviations occur. This preserves efficiency, reduces costs, and captures volatility intelligently.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Hypercore Integration</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Powered by Hypercore, Hyperliquid&apos;s ultra-fast on-chain liquidity engine, Axone executes these rebalances with minimal slippage and near-instant settlement—making high-frequency, active strategies economically viable in DeFi for the first time.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">HyperUnit Security Layer</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Security and transparency are reinforced by HyperUnit, Hyperliquid&apos;s native asset layer. Unlike wrapped or bridged tokens, HyperUnit ensures that BTC, ETH, and other assets exist natively on-chain, removing intermediary risk and guaranteeing verifiable backing.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">The Complete Protocol</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Together, these components—Axone Indices, Smart Rebalancing, and HyperUnit—form a protocol designed for the next generation of decentralized investing:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>automated</li>
            <li>secure</li>
            <li>transparent</li>
            <li>and truly on-chain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
