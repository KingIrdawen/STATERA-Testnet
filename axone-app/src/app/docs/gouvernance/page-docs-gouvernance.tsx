import Link from 'next/link';

export default function DocsGouvernancePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Protocol Governance</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Protocol Governance</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          With Statera, there are no empty promises—only real, meaningful participation for STA holders.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6 mb-8">
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            It&apos;s no secret: many decentralized protocols promise governance utility for their tokens, only to leave users disappointed.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            With Statera, there are <strong>no empty promises</strong>—only <strong>real, meaningful participation</strong> for STA holders in the protocol&apos;s technical and strategic decisions.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Statera&apos;s roadmap includes the launch of a <strong>fully-fledged DAO</strong>, enabling STA holders to:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>Propose or vote</strong> to add new indices</li>
            <li><strong>Modify parameters</strong> of existing indices (rebalancing frequency, adding/removing assets, adjusting weights)</li>
            <li><strong>Adjust the protocol&apos;s revenue allocation strategy</strong></li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed">
            Governance will be <strong>transparent, decentralized, and driven by the community</strong>—ensuring that those who contribute the most have the greatest say.
          </p>
        </div>
      </div>
    </div>
  );
}
