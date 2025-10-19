import Link from 'next/link';

export default function HyperunitPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Axone x Hyperunit</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Axone x Hyperunit</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          A protocol&apos;s performance is only as strong as the security of its foundations. Axone is built on HyperUnit for seamless, secure, and non-custodial asset management.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Security-First Foundation</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            A protocol&apos;s performance is only as strong as the security of its foundations.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Fast and low-cost rebalancing makes no sense if your assets are built on fragile layers, risky bridges, or opaque wrapped tokens.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            That&apos;s why Axone is built on HyperUnit—Hyperliquid&apos;s integrated tokenization infrastructure—to ensure a seamless, secure, traceable, and non-custodial user experience.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Native Asset Representation</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Most DeFi protocols use &quot;wrapped&quot; tokens (wBTC, wETH, etc.) to represent assets from other blockchains. With HyperUnit, assets like BTC, ETH, and others are natively available on Hyperliquid through an on-chain registration and verification system.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            HyperUnit eliminates the risks associated with wrapped tokens and the security vulnerabilities that bridges introduce to on-chain ecosystems.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Axone&apos;s Security Benefits</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            By relying on native asset representation, Axone ensures:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6">
            <li>Full transparency of asset backing</li>
            <li>No dependency on third-party custodians</li>
            <li>Reduced attack surface (no bridge exploits)</li>
            <li>On-chain verifiability of reserves</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This means users get the full benefits of cross-chain exposure—without compromising on decentralization or security.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            With HyperUnit, your Bitcoin is truly Bitcoin, your Ethereum is truly Ethereum—natively, securely, and transparently on Hyperliquid.
          </p>
        </div>
      </div>
    </div>
  );
}
