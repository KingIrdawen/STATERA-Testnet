import Link from 'next/link';

export default function DocsIndexAxonePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">What is an Axone Index?</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">What is an Axone Index?</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          An Axone Index is an automated, diversified crypto portfolio, designed to simplify on-chain investing.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Automated Diversified Portfolios</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            An Axone Index is an automated, diversified crypto portfolio, designed to simplify on-chain investing.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            For example, our first index, BTC50 Defensive, gives you 50% exposure to Bitcoin (BTC) and 50% to $HYPE, Hyperliquid&apos;s native token—without requiring you to buy or manage these assets yourself.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Liquid Token Representation</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            By depositing stablecoins (USDC or USDH), you receive a liquid token representing your share in the index. This token is tradable, transferable, and usable in other DeFi protocols—for lending, staking, or yield strategies.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Smart Rebalancing</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Thanks to hourly smart rebalancing, the index stays true to its strategy: it automatically sells appreciated assets to buy those that have dropped—profiting from volatility, with zero effort from you.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Active Management Benefits</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            You gain the benefits of active management, combined with the full transparency of a decentralized protocol.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            Returns, peace of mind, and traceability—Axone Index delivers the smoothest Web3 investing experience.
          </p>
        </div>
      </div>
    </div>
  );
}
