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
          Axone indexes are automated portfolios that replicate the strategies of the best crypto traders.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How Indexes Work</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            An Axone index is an automated portfolio that follows a predefined investment strategy, allowing users to benefit from the expertise of the best traders without needing deep technical knowledge.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about Axone indexes.
          </p>
        </div>
      </div>
    </div>
  );
}
