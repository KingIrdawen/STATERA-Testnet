import Link from 'next/link';

export default function DocsEpoque1Page() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Epoch 1</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Epoch 1</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone&apos;s expansion phase: developing advanced capabilities and expanding across multiple blockchain networks.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Expansion Phase</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Epoch 1 focuses on expanding platform capabilities, introducing advanced features, and extending Axone to multiple blockchain networks to maximize accessibility.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about Epoch 1.
          </p>
        </div>
      </div>
    </div>
  );
}
