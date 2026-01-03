import Link from 'next/link';
import Image from 'next/image';

export default function DocsCaptureCroissancePage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Capturing Growth</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Capturing Growth – Revenue Distribution</span></h1>
        <p className="text-xl text-white leading-relaxed">
          At Statera, we believe a decentralized protocol must first serve its community.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="space-y-12">
          <section>
          <p className="text-white leading-relaxed mb-4">
            At Statera, we believe a decentralized protocol must <strong>first serve its community</strong>. That&apos;s why we&apos;ve built an <strong>innovative, transparent economic model</strong> designed to <strong>directly return value</strong> to the people who power the ecosystem: <strong>STA holders</strong>.
          </p>
          <p className="text-white leading-relaxed mb-4">
            Every transaction on Statera generates fees.
          </p>
          <p className="text-white leading-relaxed mb-4">
            When a user deposits HYPE into a strategy, an <strong>entry fee of 0.5%</strong> is charged in HYPE. This means 0.5% of the deposited amount is taken as a fee, and the remaining 99.5% is used to calculate the user&apos;s initial investment NAV.
          </p>
          <p className="text-white leading-relaxed mb-4">
            <em>Example</em>: If a user deposits 1 HYPE, <strong>0.005 HYPE</strong> is taken as fee, and the NAV of his investment starts at <strong>0.995 HYPE</strong>.
          </p>
          <p className="text-white leading-relaxed mb-4">
            When a user withdraws from a strategy, an <strong>exit fee of 0.5%</strong> is applied to the amount withdrawn. The fee is deducted at withdrawal, in HYPE.
          </p>
          <p className="text-white leading-relaxed mb-4">
            <em>Example</em>: If the user&apos;s investment has grown to a NAV of 2 HYPE and he decide to withdraw everything, he receives <strong>1.99 HYPE</strong>, and <strong>0.01 HYPE</strong> is taken as exit fee.
          </p>
          <p className="text-white leading-relaxed mb-4">
            Additionally, a <strong>management fee of 0.95% per year</strong> is charged on the total capital invested in the strategy. This fee is deducted periodically directly from the strategy pool, reducing the overall NAV for all investors over time. It applies to all participants and is included in the reported NAV.
          </p>
          <p className="text-white leading-relaxed mb-4">
            These fees fund the dual redistribution mechanism:
          </p>
          <p className="text-white leading-relaxed mb-4">
            Unlike centralized models where revenues benefit a few insiders, <strong>100% of fees go back to STA holders</strong>:
          </p>
          <ul className="text-white leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>50% → Direct redistribution</strong></li>
            <li><strong>50% → Buyback & Burn</strong></li>
          </ul>
          <p className="text-white leading-relaxed mb-4">
            Statera does <strong>not extract value for centralized stakeholders</strong>. Instead, it <strong>redistributes value fairly, predictably, and automatically</strong>—a model that embodies our vision of a <strong>sustainable, community-driven, and economically resilient protocol</strong>, where every participant benefits from Statera&apos;s success.
          </p>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Direct Redistribution</span></h2>
          <p className="text-white leading-relaxed mb-4">
            50% of all protocol fees are deposited into a <strong>dedicated vault</strong>, fully controlled by <strong>audited smart contracts</strong>. This vault powers a <strong>continuous stream of automatic distributions</strong> to STA holders who <strong>deposit their tokens into the STA Staking Vault</strong>— demonstrating long-term commitment to the protocol.
          </p>
          <p className="text-white leading-relaxed mb-4">
            The STA Staking Vault allows users to deposit their STA and receive, as rewards, 50% of the <strong>HYPE collected by the protocol</strong>, distributed proportionally based on vault&apos;s share.
          </p>
          <p className="text-white leading-relaxed mb-4">
            This means every user who supports Statera earns a <strong>real, passive income</strong>, directly tied to the protocol&apos;s activity and growth.
          </p>
          <p className="text-white leading-relaxed mb-4">
            This mechanism creates a <strong>virtuous cycle</strong>:
          </p>
          <ul className="text-white leading-relaxed mb-4 ml-6 space-y-2">
            <li>✅ The more activity on Statera → the higher the fees collected → the greater the value returned to STA Staking Vault depositors.</li>
            <li>✅ STA holders are incentivized to deposit on STA Staking Vault, increasing protocol stability and community engagement</li>
          </ul>

            <h2 className="text-2xl font-bold mb-6 mt-8"><span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">Buyback & Burn</span></h2>
          <p className="text-white leading-relaxed mb-4">
            We&apos;ve designed a <strong>simple but powerful mechanism</strong> to support long-term token value and deliver direct impact to our community.
          </p>
          <p className="text-white leading-relaxed mb-4">
            🔹 <strong>Every day, 50% of collected fees are used to buy back STA tokens from the market and burn them permanently.</strong>
          </p>
          <p className="text-white leading-relaxed mb-4">
            This process:
          </p>
          <ul className="text-white leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>Reduces circulating supply</strong>, naturally and steadily supporting STA&apos;s value</li>
            <li><strong>Indirectly benefits indices containing STA</strong>, increasing their exposure over time</li>
            <li><strong>Offsets inflation</strong>, protecting long-term holders</li>
          </ul>
          <p className="text-white leading-relaxed">
            The more platform activity grows, the stronger the <strong>Buyback & Burn</strong> mechanism becomes—acting as an <strong>engine of scarcity and appreciation</strong> for STA.
          </p>

          <div className="flex justify-center my-8">
            <div className="relative w-full max-w-4xl rounded-lg overflow-hidden">
              <Image 
                src="/images/docs/distribution-frais-statera-protocol.png" 
                alt="Distribution des frais Statera Protocol" 
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
    </div>
  );
}
