import Link from 'next/link';

export default function DocsLockVaultsPage() {
  return (
    <div>
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-white transition-colors">Statera</Link></li>
          <li className="text-gray-600">/</li>
          <li><Link href="/docs" className="hover:text-white transition-colors">Docs</Link></li>
          <li className="text-gray-600">/</li>
          <li className="text-white">Strategy staking</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Strategy staking: transform your ERA token in STA rewards</h1>
        <p className="text-xl text-[#5a9a9a] leading-relaxed">
          Users can deposit their liquid tokens into our Strategy Staking vault to earn rewards in STA, Statera&apos;s native token.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8">
        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">How it works:</h2>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>The user deposits their liquid tokens into the Strategy Staking vault</li>
            <li>There is <strong>no minimum lock-up period</strong> and <strong>no penalties</strong> for withdrawing</li>
            <li>Rewards in <strong>STA are accrued continuously</strong> and can be claimed at any time</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Source of rewards:</h2>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li><strong>100% of the annual 10% inflation</strong> of the STA token is allocated to the Strategy Staking vaults</li>
            <li>→ <strong>Linear reward distribution over time</strong>: 1 month of participation = 1/12 of annual rewards (shared proportionally among vault depositors)</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Incentive to stay:</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Rewards accumulate continuously while your tokens are staked.
          </p>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Real-time dashboard:</h2>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            An on-chain dashboard allows users to monitor:
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Accrued rewards</li>
            <li>Their share in the vault</li>
          </ul>
        </div>

        <div className="bg-[#001a1f] border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Real-World Example: Alice invests 25 HYPE in the ERA1 strategy</h2>
          
          <h3 className="text-xl font-bold text-white mb-4 mt-6">🔹 Context</h3>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Alice deposits <strong>25 HYPE</strong> into the <strong>ERA1 strategy (50% BTC, 50% HYPE)</strong></li>
            <li>Entry fee: <strong>0.125 HYPE (0.5%)</strong></li>
            <li>She receives <strong>24.875 ERA1</strong> (representing 24.875 HYPE of portfolio exposure)</li>
            <li>She deposits her <strong>24.875 ERA1 in the Strategy Staking Vault for 12 months</strong></li>
            <li>She is <strong>one of 100 participants</strong> in the Strategy Staking vault this year</li>
            <li>The protocol issues <strong>10% annual inflation</strong> on STA:</li>
            <li>Total supply: <strong>100,000,000 STA</strong> → 10% = <strong>10,000,000 STA/year (on first year)</strong></li>
            <li><strong>100% is allocated to ERA depositors in the Staking vault</strong> → <strong>10,000,000 STA to distribute</strong></li>
          </ul>

          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Reward distribution is linear and based on <strong>token × months deposited</strong>:
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-600">
              <thead>
                <tr className="bg-[#011f26]">
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">User</th>
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">Tokens × Months</th>
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">Share in Vault</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">1 - Alice</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">24.875 × 12 = 298.5</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">298.5 / 20,000 = <strong>1.49%</strong></td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">2 - Bob</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">15 × 12 = 180</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">180 / 20,000 = 0.9%</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">3 - Clara</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">10.5 × 6 = 63</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">63 / 20,000 = 0.32%</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">4 - Dario</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">32.3 × 3 = 96.9</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">96.9 / 20,000 = 0.48%</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">...</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">...</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">...</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">100 - Alex</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">225 × 4 = 900</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">900 / 20,000 = 4.5%</td>
                </tr>
                <tr className="bg-[#011f26]">
                  <td className="border border-gray-600 px-4 py-2 text-white font-bold">Total</td>
                  <td className="border border-gray-600 px-4 py-2 text-white font-bold">20,000 token-months</td>
                  <td className="border border-gray-600 px-4 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            → Alice&apos;s share: 1.49%
          </p>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            → <strong>STA reward</strong>: 1.49% × 10,000,000 = <strong>149,000 STA</strong>
          </p>

          <h3 className="text-xl font-bold text-white mb-4 mt-6">🔹 Alice withdraws after 12 months – Revalued index value</h3>
          <p className="text-[#5a9a9a] leading-relaxed mb-4">
            Assumption: the ERA1 price increased by <strong>20% (including management fees)</strong>
          </p>
          <ul className="text-[#5a9a9a] leading-relaxed mb-4 ml-6 space-y-2">
            <li>Value of her <strong>24.875 ERA1</strong> before fees:</li>
            <li>→ 24.875 × 1.20 = <strong>29.85 HYPE</strong></li>
            <li>Exit fee: 0.5% × 29.85 = <strong>0.149 HYPE</strong></li>
            <li>Final amount received:</li>
            <li>→ 29.85 – 0.149 = <strong>29.70 HYPE</strong></li>
          </ul>

          <h3 className="text-xl font-bold text-white mb-4 mt-6">📈 Alice&apos;s Total Gains</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-600">
              <thead>
                <tr className="bg-[#011f26]">
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">Component</th>
                  <th className="border border-gray-600 px-4 py-2 text-left text-white">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">🔹 Initial deposit</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">25 HYPE</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">💹 Index gain (net performance)</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">+4.70 HYPE (after fees)</td>
                </tr>
                <tr>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">🪙 STA rewards</td>
                  <td className="border border-gray-600 px-4 py-2 text-[#5a9a9a]">149,000 STA</td>
                </tr>
                <tr className="bg-[#011f26]">
                  <td className="border border-gray-600 px-4 py-2 text-white font-bold">✅ Total return</td>
                  <td className="border border-gray-600 px-4 py-2 text-white font-bold">+18.8% in HYPE + substantial STA rewards</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[#5a9a9a] leading-relaxed">
            <strong>Even without considering the monetary value of STA</strong>, Alice achieved an <strong>18.8% return on her capital in one year.</strong> And <strong>if STA appreciates</strong> (due to demand, buyback and burn, HYPE rewards), her <strong>total return becomes even higher.</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
