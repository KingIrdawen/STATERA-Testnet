import Link from 'next/link';

export default function HyperunitPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Axone x Hyperunit</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Axone x Hyperunit</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The integration between Axone and Hyperunit that ensures transparency and security for all indexes.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Partnership Benefits</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The collaboration between Axone and Hyperunit brings enhanced security, transparency, and reliability to our investment products. This partnership ensures that all assets are native, safe, and fully transparent.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about Axone x Hyperunit integration.
          </p>
        </div>
      </div>
    </div>
  );
}
