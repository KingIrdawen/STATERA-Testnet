import Link from 'next/link';

export default function DocsRoadmapPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Roadmap</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Roadmap</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Axone's detailed roadmap with key development milestones and upcoming features.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Development Milestones</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Axone's roadmap is structured across multiple development phases, each bringing new features and improvements to the platform.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Placeholder content. Will be replaced later with the final detailed text about Axone's roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}
