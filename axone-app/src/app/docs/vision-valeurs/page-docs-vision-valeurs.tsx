import Link from 'next/link';

export default function DocsVisionValeursPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Vision and Values</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Vision and Values</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The Statera protocol is fully aligned with Hyperliquid&apos;s core values.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section className="space-y-6">
          <p className="text-[#5a9a9a] leading-relaxed">
            The Statera protocol is fully aligned with Hyperliquid&apos;s core values:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed ml-6 space-y-2">
            <li><strong>Performance</strong> → Hourly rebalancing via Hypercore.</li>
            <li><strong>Decentralization</strong> → The protocol will evolve into fully decentralized governance.</li>
            <li><strong>Self-custody</strong> → Users manage their funds directly from their wallets.</li>
            <li><strong>Open innovation</strong> → Statera builds on Hypercore and HyperEVM, two proven, reliable technologies, to deliver novel and relevant solutions.</li>
            <li><strong>Transparency</strong> → Like Hyperliquid, Statera is entirely open-source.</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed">
            We chose to build on <strong>HyperEVM and Hypercore</strong> because we believe in uncompromising decentralization—one that sacrifices nothing in performance, user experience, or scalability.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            With Statera, <strong>efficiency does not come at the cost of sovereignty.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Thanks to Hyperliquid&apos;s decentralized order book and high-performance infrastructure, we offer actively managed indices, rebalanced hourly, with <strong>minimal slippage, low fees, and instant execution</strong>—all without ever asking users to give up ownership of their assets.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            The DeFi of tomorrow must be <strong>as fast as an institutional exchange, as free as an open-source protocol.</strong>
          </p>
        </section>
      </div>
    </div>
  );
}
