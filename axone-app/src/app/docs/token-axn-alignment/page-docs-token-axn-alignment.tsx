import Link from 'next/link';

export default function DocsTokenAxnAlignmentPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Axone</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">AXN Token, Alignment Reward</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">AXN Token, Alignment Reward</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The AXN token is not just an access or speculative token. It is Axone&apos;s alignment currency—an asset that rewards those who believe in the protocol.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">More Than a Token</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            The AXN token is not just an access or speculative token.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            It is Axone&apos;s alignment currency—an asset that rewards those who believe in the protocol, participate in it, and contribute to its growth.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Every AXN holder is morally and economically aligned with Axone&apos;s success.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Value Capture</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Whether you use an index, stake your liquid token, or engage with the ecosystem, AXN allows you to capture a share of the value you help create.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Proof of Commitment</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This is not just a token.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            It is proof of commitment—and a reward for those who choose to build with us.
          </p>
        </div>
      </div>
    </div>
  );
}
