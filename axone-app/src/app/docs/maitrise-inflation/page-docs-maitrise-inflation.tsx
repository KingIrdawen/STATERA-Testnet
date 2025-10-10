import Link from 'next/link';

export default function DocsMaitriseInflationPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Inflation Control</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Inflation Control</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          How Axone controls AXN token inflation to maintain its long-term value.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Anti-Inflation Mechanisms</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone implements several mechanisms to control AXN token inflation, including burn programs, deflation mechanisms, and balanced supply management.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about inflation control.
          </p>
        </div>
      </div>
    </div>
  );
}
