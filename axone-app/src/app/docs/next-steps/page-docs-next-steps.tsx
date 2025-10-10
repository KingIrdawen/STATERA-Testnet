import Link from 'next/link';

export default function DocsNextStepsPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Next Steps</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Next Steps</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The future development roadmap and upcoming features for the Axone ecosystem.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Future Development</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            After completing Epoch 2, Axone will continue to evolve with new features, partnerships, and technological advancements to maintain its position as the leading DeFi platform.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about next steps and future development.
          </p>
        </div>
      </div>
    </div>
  );
}
