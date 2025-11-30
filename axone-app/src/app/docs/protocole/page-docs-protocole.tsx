import Link from 'next/link';

export default function DocsProtocolePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Protocol</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Protocol</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <section>
          <p className="text-[#5a9a9a] leading-relaxed">
            The Statera Protocol section covers the core concepts and innovations that power the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
