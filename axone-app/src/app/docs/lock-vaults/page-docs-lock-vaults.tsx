import Link from 'next/link';

export default function DocsLockVaultsPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Lock Vaults</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Lock Vaults</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Lock Vaults allow you to lock your tokens for a determined period in exchange for increased rewards.
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
