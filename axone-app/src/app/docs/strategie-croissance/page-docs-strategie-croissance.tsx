import Link from 'next/link';

export default function DocsStrategieCroissancePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Growth Strategy - Roadmap</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Growth Strategy - Roadmap</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone&apos;s roadmap to become the reference platform for automated crypto portfolio management.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Long-term Vision</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone develops a structured growth strategy across multiple epochs, each aiming to strengthen the platform&apos;s position in the automated crypto investment solutions market.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about growth strategy and roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}
