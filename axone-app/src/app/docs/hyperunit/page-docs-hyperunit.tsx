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
        <h1 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Statera x HyperUnit</span></h1>
        <p className="text-xl text-white leading-relaxed">
          A protocol&apos;s performance is only as strong as the security of its foundations.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section className="space-y-6">
          <p className="text-white leading-relaxed">
            A protocol&apos;s performance is only as strong as the <strong>security of its foundations.</strong>
          </p>
          <p className="text-white leading-relaxed">
            Fast and low-cost rebalancing makes no sense if your assets are built on <strong>fragile layers, risky bridges, or opaque wrapped tokens.</strong>
          </p>
          <p className="text-white leading-relaxed">
            That&apos;s why Statera is built on <strong>HyperUnit</strong>—Hyperliquid&apos;s integrated tokenization infrastructure—to ensure a seamless, secure, traceable, and non-custodial user experience.
          </p>
          <p className="text-white leading-relaxed">
            Most DeFi protocols use <strong>&quot;wrapped&quot; tokens</strong> (wBTC, wETH, etc.) to represent assets from other blockchains. With <strong>HyperUnit</strong>, assets like BTC, ETH, and others are <strong>natively available on Hyperliquid</strong> through an on-chain registration and verification system.
          </p>
          <p className="text-white leading-relaxed">
            HyperUnit eliminates the risks associated with wrapped tokens and the security vulnerabilities that bridges introduce to on-chain ecosystems.
          </p>
          <p className="text-white leading-relaxed">
            By relying on native asset representation, Statera ensures:
          </p>
          <ul className="text-white leading-relaxed ml-6 space-y-2">
            <li><strong>Full transparency</strong> of asset backing</li>
            <li><strong>No dependency on third-party custodians</strong></li>
            <li><strong>Reduced attack surface</strong> (no bridge exploits)</li>
            <li><strong>On-chain verifiability</strong> of reserves</li>
          </ul>
          <p className="text-white leading-relaxed">
            This means users get the full benefits of cross-chain exposure—without compromising on decentralization or security.
          </p>
          <p className="text-white leading-relaxed font-semibold">
            With HyperUnit, <strong>your Bitcoin is truly Bitcoin, your Ethereum is truly Ethereum—natively, securely, and transparently on Hyperliquid.</strong>
          </p>

          <div className="flex justify-center my-8">
            <img 
              src="/images/docs/protocole-statera-token-era1.png" 
              alt="Protocole Statera et Token ERA1" 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
