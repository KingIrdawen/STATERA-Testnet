import Link from 'next/link';

export default function DocsMissionPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Mission</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Mission</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone indices enable investors of all levels to access sophisticated investment strategies—automatically managed to maximize returns, without effort and without trusted intermediaries.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Accessible Investment Strategies</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Whether you&apos;re a beginner or an expert, Axone allows you to invest in diversified indices (e.g., 50% BTC / 50% HYPE), automatically rebalanced.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Our platform eliminates the complexity of manual portfolio management while ensuring optimal performance through intelligent automation and smart rebalancing mechanisms.
          </p>
        </div>
      </div>
    </div>
  );
}
