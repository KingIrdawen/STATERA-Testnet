import Link from 'next/link';

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
        <h1 className="text-4xl font-bold text-white mb-4">The STA Token: Rewarding Alignment</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The STA token is not just an access or speculative token. It is Statera&apos;s alignment currency.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section className="space-y-6">
          <p className="text-[#5a9a9a] leading-relaxed">
            The <strong>STA token</strong> is not just an access or speculative token.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            It is Statera&apos;s <strong>alignment currency</strong>—an asset that rewards those who believe in the protocol, participate in it, and contribute to its growth.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Every STA holder is <strong>morally and economically aligned</strong> with Statera&apos;s success.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            Whether you use an index, stake your liquid token, or engage with the ecosystem, STA allows you to <strong>capture a share of the value you help create.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            This is not just a token.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            It is <strong>proof of commitment</strong>—and a reward for those who choose to build with us.
          </p>
        </section>
      </div>
    </div>
  );
}
