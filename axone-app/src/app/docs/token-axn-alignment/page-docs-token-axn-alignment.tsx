import Link from 'next/link';
import Image from 'next/image';

export default function DocsTokenAxnAlignmentPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">The STA Token: Rewarding Alignment</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4"><span className="text-[#C9A36A]">The STA Token: Rewarding Alignment</span></h1>
        <p className="text-xl text-white leading-relaxed">
          The STA token is not just an access or speculative token. It is Statera&apos;s alignment currency.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section className="space-y-6">
          <p className="text-white leading-relaxed">
            The <strong>STA token</strong> is not just an access or speculative token.
          </p>
          <p className="text-white leading-relaxed">
            It is Statera&apos;s <strong>alignment currency</strong>—an asset that rewards those who believe in the protocol, participate in it, and contribute to its growth.
          </p>
          <p className="text-white leading-relaxed">
            Every STA holder is <strong>morally and economically aligned</strong> with Statera&apos;s success.
          </p>
          <p className="text-white leading-relaxed">
            Whether you use an index, stake your liquid token, or engage with the ecosystem, STA allows you to <strong>capture a share of the value you help create.</strong>
          </p>
          <p className="text-white leading-relaxed">
            This is not just a token.
          </p>
          <p className="text-white leading-relaxed font-semibold">
            It is <strong>proof of commitment</strong>—and a reward for those who choose to build with us.
          </p>
          <div className="flex justify-center my-8">
            <div className="relative w-full max-w-4xl rounded-lg overflow-hidden">
              <Image 
                src="/images/docs/sphere-centrale-lignes-energetiques.png" 
                alt="Sphère centrale et lignes énergétiques" 
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
