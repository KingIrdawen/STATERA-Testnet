import Link from 'next/link';

export default function DocsProtocolePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Protocol</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Protocol</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Discover the technical functioning of the Axone protocol and its fundamental components.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Protocol Architecture</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The Axone protocol is built on a decentralized architecture that enables automated crypto portfolio management with maximum security and optimal efficiency.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about the Axone protocol architecture.
          </p>
        </div>
      </div>
    </div>
  );
}
