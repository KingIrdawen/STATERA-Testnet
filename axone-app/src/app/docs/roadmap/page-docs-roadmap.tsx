import Link from 'next/link';

export default function DocsRoadmapPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Roadmap</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Roadmap</span></h1>
        <p className="text-xl text-white leading-relaxed">
          Statera&apos;s detailed roadmap with key development milestones and upcoming features.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section>
          <div className="flex justify-center my-8">
            <img 
              src="/images/docs/evenements-cles-statera-token-tge.png" 
              alt="Événements clés de Statera Token TGE" 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
