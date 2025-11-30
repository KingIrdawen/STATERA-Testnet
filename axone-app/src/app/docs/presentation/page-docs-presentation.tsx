import Link from 'next/link';

export default function DocsPresentationPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Introduction Page</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Introduction Page</h1>
        <p className="text-2xl font-bold text-[#fab062] mb-8">
          Statera – The smart way to diversify
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Mission</h2>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              Statera indices enable investors of all levels to access sophisticated investment strategies—automatically managed to maximize returns, without effort and without trusted intermediaries.
            </p>
            <p className="text-[#5a9a9a] leading-relaxed">
              Whether you&apos;re a beginner or an expert, Statera allows you to invest in diversified indices (e.g., 50% BTC / 50% HYPE), automatically rebalanced.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Vision and Values</h2>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              The Statera protocol is fully aligned with Hyperliquid&apos;s core values:
            </p>
            <ul className="text-[#5a9a9a] leading-relaxed mb-6 ml-6 space-y-2">
              <li><strong>Performance</strong> → Hourly rebalancing via Hypercore.</li>
              <li><strong>Decentralization</strong> → The protocol will evolve into fully decentralized governance.</li>
              <li><strong>Self-custody</strong> → Users manage their funds directly from their wallets.</li>
              <li><strong>Open innovation</strong> → Statera builds on Hypercore and HyperEVM, two proven, reliable technologies, to deliver novel and relevant solutions.</li>
              <li><strong>Transparency</strong> → Like Hyperliquid, Statera is entirely open-source.</li>
            </ul>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              We chose to build on <strong>HyperEVM and Hypercore</strong> because we believe in uncompromising decentralization—one that sacrifices nothing in performance, user experience, or scalability.
            </p>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              With Statera, <strong>efficiency does not come at the cost of sovereignty.</strong>
            </p>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              Thanks to Hyperliquid&apos;s decentralized order book and high-performance infrastructure, we offer actively managed indices, rebalanced hourly, with <strong>minimal slippage, low fees, and instant execution</strong>—all without ever asking users to give up ownership of their assets.
            </p>
            <p className="text-[#5a9a9a] leading-relaxed font-semibold">
              The DeFi of tomorrow must be <strong>as fast as an institutional exchange, as free as an open-source protocol.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">The STA Token: Rewarding Alignment</h2>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              The <strong>STA token</strong> is not just an access or speculative token.
            </p>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              It is Statera&apos;s <strong>alignment currency</strong>—an asset that rewards those who believe in the protocol, participate in it, and contribute to its growth.
            </p>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              Every STA holder is <strong>morally and economically aligned</strong> with Statera&apos;s success.
            </p>
            <p className="text-[#5a9a9a] leading-relaxed mb-4">
              Whether you use an index, stake your liquid token, or engage with the ecosystem, STA allows you to <strong>capture a share of the value you help create.</strong>
            </p>
            <p className="text-[#5a9a9a] leading-relaxed">
              This is not just a token.
            </p>
            <p className="text-[#5a9a9a] leading-relaxed font-semibold">
              It is <strong>proof of commitment</strong>—and a reward for those who choose to build with us.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
