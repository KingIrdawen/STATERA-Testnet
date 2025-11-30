import Link from 'next/link';

export default function HyperUnitPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Statera x HyperUnit</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Statera x HyperUnit</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          A protocol&apos;s performance is only as strong as the security of its foundations.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section className="space-y-6">
          <p className="text-[#5a9a9a] leading-relaxed">
            A protocol&apos;s performance is only as strong as the <strong>security of its foundations.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Fast and low-cost rebalancing makes no sense if your assets are built on <strong>fragile layers, risky bridges, or opaque wrapped tokens.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            That&apos;s why Statera is built on <strong>HyperUnit</strong>—Hyperliquid&apos;s integrated tokenization infrastructure—to ensure a seamless, secure, traceable, and non-custodial user experience.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Most DeFi protocols use <strong>&quot;wrapped&quot; tokens</strong> (wBTC, wETH, etc.) to represent assets from other blockchains. With <strong>HyperUnit</strong>, assets like BTC, ETH, and others are <strong>natively available on Hyperliquid</strong> through an on-chain registration and verification system.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            HyperUnit eliminates the risks associated with wrapped tokens and the security vulnerabilities that bridges introduce to on-chain ecosystems.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            By relying on native asset representation, Statera ensures:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed ml-6 space-y-2">
            <li><strong>Full transparency</strong> of asset backing</li>
            <li><strong>No dependency on third-party custodians</strong></li>
            <li><strong>Reduced attack surface</strong> (no bridge exploits)</li>
            <li><strong>On-chain verifiability</strong> of reserves</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed">
            This means users get the full benefits of cross-chain exposure—without compromising on decentralization or security.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            With HyperUnit, <strong>your Bitcoin is truly Bitcoin, your Ethereum is truly Ethereum—natively, securely, and transparently on Hyperliquid.</strong>
          </p>

          <div className="mt-8">
            <p className="text-white font-semibold mb-2">Visuel :</p>
            <p className="text-[#5a9a9a] leading-relaxed mb-1">
              <strong>User: Deposits HYPE → [Statera Protocol] → Receives ERA1 token</strong>
            </p>
            <p className="text-[#5a9a9a] leading-relaxed mb-1">
              <strong>→ ERA1 represents 50% BTC / 50% HYPE exposure</strong>
            </p>
            <p className="text-[#5a9a9a] leading-relaxed mb-1">
              <strong>→ Index auto-rebalances via Hypercore when threshold breached</strong>
            </p>
            <p className="text-[#5a9a9a] leading-relaxed">
              <strong>→ User can: Hold, transfer, deposit, or redeem ERA1 for HYPE</strong>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
