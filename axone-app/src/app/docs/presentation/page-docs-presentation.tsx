import Link from 'next/link';

export default function DocsPresentationPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Introduction</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Introduction</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone redefines how people invest in crypto. Built on Hyperliquid&apos;s high-performance, fully decentralized infrastructure, it brings institutional-grade strategies to everyone.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Redefining Crypto Investment</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone redefines how people invest in crypto.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Built on Hyperliquid&apos;s high-performance, fully decentralized infrastructure, it brings institutional-grade strategies to everyone—automated, transparent, and self-custodial.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">The Protocol</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            At its core, Axone is a protocol for on-chain indices: diversified, actively rebalanced portfolios that require no intermediaries or manual management. Its design combines speed, decentralization, and open innovation, ensuring users never sacrifice sovereignty for performance.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">The AXN Token</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The AXN token embodies this alignment. It rewards participation, contribution, and belief in the protocol&apos;s long-term vision—a transparent, decentralized financial ecosystem where efficiency and freedom coexist.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">The Future</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone is not just another DeFi product.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            It&apos;s the next step toward a faster, fairer, and truly open financial future.
          </p>
        </div>
      </div>
    </div>
  );
}
