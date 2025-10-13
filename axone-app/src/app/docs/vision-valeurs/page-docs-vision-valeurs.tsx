import Link from 'next/link';

export default function DocsVisionValeursPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Vision and Values</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Vision and Values</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Our vision of a more accessible decentralized financial ecosystem and our fundamental values that guide our development.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Vision</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone aspires to become the global reference for automated crypto portfolio management, creating an ecosystem where blockchain technology serves financial inclusion and investment democratization.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about Axone&apos;s vision and values.
          </p>
        </div>
      </div>
    </div>
  );
}
