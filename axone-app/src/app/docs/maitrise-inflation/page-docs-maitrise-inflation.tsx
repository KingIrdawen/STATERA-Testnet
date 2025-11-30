import Link from 'next/link';

export default function DocsMaitriseInflationPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Managing Inflation</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Managing Inflation</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          The STA token is designed to grow with the ecosystem and reward those who sustain the protocol.
        </p>
      </div>

      <div className="prose prose-invert max-w-none">
        <section className="space-y-6">
          <p className="text-[#5a9a9a] leading-relaxed">
            The STA token is designed to <strong>grow with the ecosystem</strong> and <strong>reward those who sustain the protocol</strong>. That&apos;s why we&apos;ve fixed an initial inflation at 10% per year, not as a cost—but as a <strong>value engine</strong>. Future adjustments will be governed by STA holders.
          </p>
          <p className="text-[#5a9a9a] leading-relaxed">
            🔹 <strong>In practice:</strong>
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed ml-6 space-y-2">
            <li><strong>100% of inflation is distributed</strong> to Statera users depositing their ERA token in the <strong>ERA Staking Vault</strong>, reinforcing their long-term commitment</li>
            <li>It <strong>increases the value of indices over time</strong>, offering additional rewards to engaged investors</li>
            <li>It <strong>drives adoption</strong> of Statera&apos;s products, creating a <strong>virtuous cycle</strong> where activity fuels greater community rewards</li>
          </ul>
          <p className="text-[#5a9a9a] leading-relaxed font-semibold">
            With Statera, <strong>inflation is not dilution</strong>—it is a <strong>lever for growth and value-sharing</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
