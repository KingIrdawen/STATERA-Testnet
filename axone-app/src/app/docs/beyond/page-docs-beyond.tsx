import Link from 'next/link';

export default function DocsBeyondPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Beyond</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4"><span className="text-[#C9A36A]">Beyond</span></h1>
        <p className="text-xl text-white leading-relaxed">
          The future vision of Statera beyond the initial roadmap.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section>
          <p className="text-white leading-relaxed">
            Content coming soon...
          </p>
        </section>
      </div>
    </div>
  );
}
