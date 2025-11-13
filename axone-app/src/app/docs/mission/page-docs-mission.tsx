import Link from 'next/link';

export default function DocsMissionPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Mission</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Mission</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed mb-4">
          Statera indices enable investors of all levels to access sophisticated investment strategies—automatically managed to maximize returns, without effort and without trusted intermediaries.
        </p>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Whether you&apos;re a beginner or an expert, Statera allows you to invest in diversified indices (e.g., 50% BTC / 50% HYPE), automatically rebalanced.
        </p>
      </div>
    </div>
  );
}
