import Link from 'next/link';

export default function DocsStrategieCroissancePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Growth Strategy - Roadmap</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Growth Strategy – Roadmap</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <section>
          <p className="text-[#5a9a9a] leading-relaxed">
            The Growth Strategy section outlines Statera&apos;s roadmap and development phases.
          </p>
        </section>
      </div>
    </div>
  );
}
