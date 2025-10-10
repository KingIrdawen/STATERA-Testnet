import Link from 'next/link';

export default function DocsPresentationPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Introduction</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Introduction</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Discover Axone, the next-generation crypto vault management platform that revolutionizes decentralized investment.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">About Axone</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone is an innovative platform that automates and optimizes crypto portfolio management through blockchain technology. Our mission is to democratize access to advanced investment strategies while maximizing returns for our users.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about Axone's introduction.
          </p>
        </div>
      </div>
    </div>
  );
}
