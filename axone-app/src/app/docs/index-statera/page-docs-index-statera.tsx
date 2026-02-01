import Link from 'next/link';
import Image from 'next/image';

export default function DocsIndexStateraPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">What is a Statera Index?</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4"><span className="text-[#C9A36A]">What is a Statera Index?</span></h1>
        <p className="text-xl text-white leading-relaxed">
          A Statera Index is an automated, diversified crypto portfolio, designed to simplify on-chain investing.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section className="space-y-6">
          <p className="text-white leading-relaxed">
            A Statera <strong>Index</strong> is an <strong>automated, diversified crypto portfolio</strong>, designed to simplify on-chain investing.
          </p>
          <p className="text-white leading-relaxed">
            For example, our first index, gives you 50% exposure to Bitcoin (BTC) and 50% to HYPE, Hyperliquid&apos;s native token—without requiring you to buy or manage these assets yourself.
          </p>
          <p className="text-white leading-relaxed">
            But Statera is far more than just holding tokens for you.
          </p>
          <p className="text-white leading-relaxed">
            By depositing HYPE, you receive a <strong>liquid token, called an ERA token</strong> representing your share in the index. This token is <strong>tradable, transferable, and usable in other DeFi protocols</strong>—for lending, staking, or yield strategies.
          </p>
          <p className="text-white leading-relaxed">
            Thanks to <strong>hourly smart rebalancing</strong>, the index stays true to its strategy: it automatically sells appreciated assets to buy those that have dropped—<strong>profiting from volatility, with zero effort from you and outperforming a simple holding strategy.</strong>
          </p>
          <p className="text-white leading-relaxed">
            You gain the benefits of <strong>active management</strong>, combined with the <strong>full transparency of a decentralized protocol.</strong>
          </p>
          <p className="text-white leading-relaxed">
            <strong>Returns, peace of mind, and traceability</strong> — Statera delivers the <strong>smoothest Web3 investing experience.</strong>
          </p>
          <div className="flex justify-center my-8">
            <div className="relative w-full max-w-4xl rounded-lg overflow-hidden">
              <Image 
                src="/images/docs/investissez-indices-crypto-intelligents.png" 
                alt="Investissez dans des indices crypto intelligents" 
                width={1200}
                height={800}
                className="rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                quality={90}
              />
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
