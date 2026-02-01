import Link from 'next/link';

export default function DocsFonctionnementRevenusPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Protocol Functioning - Revenue</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4"><span className="text-[#C9A36A]">Protocol Mechanics – Revenue Generation</span></h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <section>
          <p className="text-white leading-relaxed">
            The Protocol Mechanics section explains how users can participate in Statera strategies and earn rewards.
          </p>
        </section>
      </div>
    </div>
  );
}
