import Link from 'next/link';
import Image from 'next/image';

export default function DocsProtocolPage() {
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
        <h1 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Protocol</span></h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <section>
          <p className="text-white leading-relaxed">
            The Statera Protocol section covers the core concepts and innovations that power the platform.
          </p>
          <div className="flex justify-center my-8">
            <div className="relative w-full max-w-4xl rounded-lg overflow-hidden">
              <Image 
                src="/images/docs/infographie-statera-protocol-indices-crypto-intelligents.png" 
                alt="Infographie Statera Protocol - indices crypto intelligents" 
                width={1200}
                height={800}
                className="rounded-lg"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                quality={90}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
