import Link from 'next/link';

export default function DocsTokenAxnPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">AXN Token</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">AXN Token</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The AXN token is at the heart of the Axone ecosystem, serving as a governance mechanism and value capture.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">AXN Token Utility</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The AXN token (Axone Token) plays a central role in the Axone ecosystem, enabling protocol governance, platform growth capture, and participation in reward mechanisms.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about the AXN token.
          </p>
        </div>
      </div>
    </div>
  );
}
