import Link from 'next/link';

export default function DocsTokenomicsPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Tokenomics</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Tokenomics</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Convinced by the performance and value created by our products, we&apos;ve made a radical choice: 100% of protocol revenue is redistributed to the community.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="space-y-12">
          <section>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Convinced by the performance and value created by our products, and guided by <strong>decentralization as our ethical compass</strong>, we&apos;ve made a radical choice : <strong>100% of protocol revenue is redistributed to the community.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            By rewarding engagement, support, and participation, Statera turns every user into a <strong>true co-owner of the protocol&apos;s future.</strong>
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Our tokenomics reflect this vision:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>No internal profit capture</strong></li>
            <li><strong>No privileged allocations</strong></li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Value flows exactly where it should—into the hands of those who <strong>use, support, and believe in Statera</strong>.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            A model that is <strong>fair, transparent, and deeply community-driven.</strong>
          </p>

            <h2 className="text-2xl font-bold text-white mb-6 mt-8">Supply and Inflation: Balancing Growth and Value</h2>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>Initial total supply</strong>: 100,000,000 STA</li>
            <li><strong>Emission model</strong>: 10% annual inflation, issued continuously to fund long-term rewards</li>
            <li><strong>Deflationary offset</strong>: 50% of protocol revenue used to <strong>buy back and burn STA</strong>, creating <strong>programmed scarcity</strong></li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            → Over time, if protocol activity grows, <strong>deflationary pressure can exceed inflation</strong>, making STA <strong>net deflationary</strong>.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            This model ensures <strong>long-term sustainability</strong> while protecting token value from excessive dilution.
          </p>

            <h2 className="text-2xl font-bold text-white mb-6 mt-8">Distribution: Fair, Community-First, No Privileges</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            All STA supply will be distributed at launch across two equitable channels:
          </p>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-600">
              <thead>
                <tr className="bg-[#011f26]">
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">Allocation</th>
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">Percentage</th>
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]"><strong>Community Rewards</strong></td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">50%</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">Distributed via a <strong>points-based system</strong> during Phase 0, based on participation in strategies</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]"><strong>Liquidity Mining</strong></td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">50%</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">Rewards for users providing liquidity into the <strong>Ignition Core</strong>, funding the primary pool at TGE (see below)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            ❗ <strong>No tokens were allocated to the team, investors, or partners</strong>—Statera is built on a <strong>truly fair and decentralized distribution.</strong>
          </p>
          </section>
        </div>
      </div>
    </div>
  );
}
