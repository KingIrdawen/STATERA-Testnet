import Link from 'next/link';

export default function DocsVisionValeursPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Vision and Values</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Vision and Values</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The Axone protocol is fully aligned with Hyperliquid&apos;s core values, building uncompromising decentralization without sacrificing performance.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Core Values</h2>
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance</h3>
              <p className="text-[#5a9a9a] leading-relaxed">→ Hourly rebalancing via Hypercore.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Decentralization</h3>
              <p className="text-[#5a9a9a] leading-relaxed">→ The protocol will evolve into fully decentralized governance.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Self-custody</h3>
              <p className="text-[#5a9a9a] leading-relaxed">→ Users manage their funds directly from their wallets.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Open innovation</h3>
              <p className="text-[#5a9a9a] leading-relaxed">→ Axone builds on Hypercore and HyperEVM, two proven, reliable technologies, to deliver novel and relevant solutions.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Transparency</h3>
              <p className="text-[#5a9a9a] leading-relaxed">→ Like Hyperliquid, Axone is entirely open-source.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Our Foundation</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            We chose to build on HyperEVM and Hypercore because we believe in uncompromising decentralization—one that sacrifices nothing in performance, user experience, or scalability.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            With Axone indices, efficiency does not come at the cost of sovereignty.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Thanks to Hyperliquid&apos;s decentralized order book and high-performance infrastructure, we offer actively managed indices, rebalanced hourly, with minimal slippage, low fees, and instant execution—all without ever asking users to give up ownership of their assets.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">The Future We&apos;re Building</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The DeFi of tomorrow must be as fast as an institutional exchange, as free as an open-source protocol.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            That&apos;s what we&apos;re building. Here. Now.
          </p>
        </div>
      </div>
    </div>
  );
}
