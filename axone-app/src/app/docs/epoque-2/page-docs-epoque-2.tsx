import Link from 'next/link';

export default function DocsEpoque2Page() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Epoch 2</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Epoch 2</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone&apos;s innovation phase: AI-driven investment strategies and institutional products.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <p className="text-[#5a9a9a] leading-relaxed">
            Content coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
