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
        <h1 className="text-4xl font-bold mb-4"><span className="text-[#C9A36A]">Protocol</span></h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <section>
          <p className="text-white leading-relaxed">
            The Statera Protocol section covers the core concepts and innovations that power the platform.
          </p>
          <div className="flex justify-center my-8">
            <img 
              src="/images/docs/infographie-statera-protocol-indices-crypto-intelligents.png" 
              alt="Infographie Statera Protocol - indices crypto intelligents" 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
