'use client';

import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import Link from 'next/link';

export default function UsersRiskPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white brand-typography">
      <Header />
      
      <main className="pt-[60px] md:pt-[80px] pb-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <Reveal>
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li className="text-gray-600">/</li>
                <li className="text-white">Users Risk</li>
              </ol>
            </nav>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#C9A36A] tracking-[0.04em] mb-4 leading-relaxed">
                Risks
              </h1>
              <p className="text-white leading-relaxed">
                Statera is a decentralized, non-custodial protocol built on open-source smart contracts. It is designed to empower users with automated portfolio management, intelligent rebalancing, and community-driven value redistribution — all without intermediaries.
              </p>
              <p className="text-white leading-relaxed mt-4">
                However, using Statera involves significant risks. This page outlines the key legal, financial, technical, and operational risks you should understand before interacting with the protocol.
              </p>
            </div>
          </Reveal>

          <div className="prose prose-invert max-w-none space-y-8">
            <Reveal delayMs={200}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    1. Legal & Regulatory Risks
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  Statera does not operate as a financial institution, custodian, or investment advisor. It is a permissionless protocol governed entirely by smart contracts. However, regulatory authorities in various jurisdictions may interpret certain aspects of the protocol differently.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">1.1. Potential Classification as a Security</h3>
                <p className="text-white leading-relaxed mb-4">
                  The distribution of STA tokens via staking (e.g., Strategy Staking Vault) and the receipt of fee rewards in HYPE could be interpreted by regulators (e.g., the U.S. SEC) as participation in an investment contract under the Howey Test.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  If STA is deemed a security, future access to the protocol or trading of STA on certain platforms could be restricted in regulated jurisdictions.
                </p>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  Our Position:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Statera is a tool, not an investment scheme.</li>
                  <li>No team and no legal entity controls funds or profits.</li>
                  <li>The protocol will be deployed via a non-upgradeable, permissionless launch. No entity will retain administrative control, special privileges, or early access to tokens. All supply will be distributed algorithmically to users based on participation</li>
                  <li>All logic is automated and immutable.</li>
                  <li>Rewards are algorithmic, not promised.</li>
                </ul>
                <p className="text-white leading-relaxed">
                  We believe Statera falls outside traditional securities frameworks — but this is not legal advice.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">1.2. No KYC / AML Compliance</h3>
                <p className="text-white leading-relaxed mb-4">
                  Statera does not collect personal data, perform KYC checks, or implement AML filters.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  This aligns with core DeFi principles but may result in:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Restrictions on CEX listings of STA</li>
                  <li>Regulatory scrutiny of the token</li>
                  <li>Potential blocking of access from certain regions</li>
                </ul>
                <p className="text-white leading-relaxed">
                  You are responsible for ensuring your use of Statera complies with local laws, including tax reporting and crypto regulations.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={300}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    2. Financial Risks
                  </span>
                </h2>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">2.1. Loss of Principal</h3>
                <p className="text-white leading-relaxed mb-4">
                  There is no capital guarantee. The value of your investment, denominated in HYPE, can decrease due to:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Market volatility of underlying assets (e.g., BTC, ETH, etc.)</li>
                  <li>Imperfect rebalancing during extreme price moves</li>
                  <li>Fees (entry, exit, management)</li>
                </ul>
                <p className="text-white leading-relaxed">
                  You may lose some or all of your deposited HYPE, even if you earn STA rewards.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">2.2. Performance ≠ Profit</h3>
                <p className="text-white leading-relaxed mb-4">
                  Past performance is not indicative of future results.
                </p>
                <p className="text-white leading-relaxed">
                  High volatility, black swan events, or prolonged bear markets can lead to significant drawdowns.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">2.3. Impermanent Loss (IL)</h3>
                <p className="text-white leading-relaxed">
                  Users holding STAlp (liquidity tokens) are exposed to impermanent loss due to price divergence between STA and HYPE in the LP.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">2.4. Inflation and Token Value</h3>
                <p className="text-white leading-relaxed mb-4">
                  STA has a 10% annual inflation, fully distributed to users who stake ERA tokens.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  While this rewards engagement, it also increases supply.
                </p>
                <p className="text-white leading-relaxed">
                  The net effect on price depends on whether buyback & burn (50% of fees) offsets inflation.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={400}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    3. Technical & Infrastructure Risks
                  </span>
                </h2>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.1. Reliance on Hyperliquid</h3>
                <p className="text-white leading-relaxed mb-4">
                  Statera depends on Hyperliquid for critical infrastructure:
                </p>
                <p className="text-white leading-relaxed mb-4">
                  If Hyperliquid goes offline or suffers an exploit, Statera cannot function normally until resolution.
                </p>
                <p className="text-white leading-relaxed">
                  We monitor Hyperliquid's uptime and security posture closely. Users should assess this dependency before participation.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.2. Smart Contract Risk</h3>
                <p className="text-white leading-relaxed mb-4">
                  Statera's smart contracts are complex, involving:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Dynamic NAV calculation</li>
                  <li>Fee distribution logic</li>
                  <li>Vesting (STAlp)</li>
                  <li>Inflation scheduling</li>
                  <li>Buyback & burn automation</li>
                </ul>

                <h4 className="text-lg font-bold text-white mb-3 mt-4">Pre-TGE Status:</h4>
                <p className="text-white leading-relaxed mb-4">
                  The protocol is unaudited at launch.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  First fees collected (entry/exit/management) will fund a third-party audit by a reputable firm (to be announced).
                </p>
                <p className="text-white leading-relaxed mb-4">
                  Audit results will be published before TGE and available to all users.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  The protocol is unaudited at launch because Statera is a fully decentralized, community-funded project with no venture capital or team treasury. The first fees collected will be used to commission a third-party audit, ensuring the protocol is secured by the ecosystem itself.
                </p>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  Until the audit is complete, all interactions are at high risk. We strongly advise users to:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2">
                  <li>Deposit small amounts initially</li>
                  <li>Monitor official channels for updates</li>
                  <li>Withdraw if uncomfortable with risk level</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.3. Oracle Risk</h3>
                <p className="text-white leading-relaxed mb-4">
                  The Net Asset Value (NAV) of each strategy is calculated using on-chain price feeds from Hyperliquid.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  If these oracles:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Are delayed</li>
                  <li>Provide stale prices</li>
                  <li>Are manipulated (e.g., flash loan attack)</li>
                </ul>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  → The NAV becomes inaccurate.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  Consequences:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Users may deposit/withdraw at incorrect values</li>
                  <li>Rebalancing triggers at wrong times</li>
                  <li>Staking rewards miscalculated</li>
                </ul>
                <p className="text-white leading-relaxed mb-4">
                  Mitigation:
                </p>
                <p className="text-white leading-relaxed">
                  We rely on Hyperliquid's robust oracle design, but no system is immune to manipulation.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.4. Upgradeability & Immutability</h3>
                <p className="text-white leading-relaxed mb-4">
                  The protocol includes a governance owner (managed by a multi-signature wallet) capable of adjusting key parameters such as fees, rebalancing frequency, and staking logic.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  However, all revenue generated by the protocol is automatically routed to a dedicated vault, where:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>50% funds STA buyback & burn</li>
                  <li>50% is distributed to STA stakers in HYPE</li>
                </ul>
                <p className="text-white leading-relaxed mb-4">
                  This design prevents direct profit capture by the owner — even if fees are increased, the revenue flows back to the community.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  That said, the owner could still:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Disrupt operations (e.g., pause functions, set inefficient parameters)</li>
                  <li>Damage user experience or protocol performance</li>
                </ul>
                <p className="text-white leading-relaxed mb-4">
                  To mitigate this:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>All parameter changes are subject to a 48-hour timelock</li>
                  <li>The owner cannot withdraw user funds or alter redistribution logic</li>
                  <li>A clear path to on-chain governance by STA holders will be implemented within 12 months</li>
                </ul>
                <p className="text-white leading-relaxed">
                  While this introduces a temporary trust assumption, the economic design ensures that malicious actions would be self-destructive for any rational actor. This ensures trustless operation and protects against governance attacks.
                </p>
                <p className="text-white leading-relaxed mt-4">
                  Future versions may introduce governance, allowing STA holders to vote on upgrades — but only via transparent, on-chain proposals.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={500}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    4. User Risks & Responsibilities
                  </span>
                </h2>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">4.1. No Recovery Mechanism</h3>
                <p className="text-white leading-relaxed mb-4">
                  There is no customer support.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  There is no way to recover funds if:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>You lose your wallet seed phrase</li>
                  <li>You send funds to the wrong address</li>
                  <li>You approve a malicious contract</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">4.2. Phishing & Scams</h3>
                <p className="text-white leading-relaxed mb-4">
                  Fake websites, social media impersonators, and scam tokens are common.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  Always verify:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>The official domain: https://statera.example (TBD)</li>
                  <li>Contract addresses (published in docs and verified on-chain)</li>
                  <li>Social media accounts (blue check + pinned post)</li>
                </ul>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  Never click links from DMs. Never enter your seed phrase anywhere.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">4.3. Wallet & Transaction Risks</h3>
                <p className="text-white leading-relaxed mb-4">
                  Ensure your wallet (e.g., MetaMask) is up to date.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  Double-check:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2">
                  <li>Token amounts</li>
                  <li>Gas fees</li>
                  <li>Contract interactions (approve, deposit, withdraw)</li>
                </ul>
                <p className="text-white leading-relaxed mt-4 font-semibold">
                  A single mistake can result in permanent loss.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={600}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    5. Economic Model Risks
                  </span>
                </h2>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">Fee Distribution Relies on Activity</h3>
                <p className="text-white leading-relaxed mb-4">
                  100% of fees go back to users:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>50% → Buyback & burn</li>
                  <li>50% → STA stakers (in HYPE)</li>
                </ul>
                <p className="text-white leading-relaxed mb-4">
                  Low activity could create a negative feedback loop:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2">
                  <li>Fewer fees → smaller buybacks → less downward pressure on supply</li>
                  <li>Lower STA staking rewards → reduced user engagement</li>
                  <li>Weaker liquidity → wider spreads → worse execution</li>
                </ul>
                <p className="text-white leading-relaxed mt-4">
                  This highlights the importance of sustainable demand for Statera's strategies, not just short-term incentives.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={700}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Risk Summary Table
                  </span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-white/20">
                    <thead>
                      <tr className="bg-white/5">
                        <th className="border border-white/20 px-4 py-3 text-left text-white font-semibold">Function</th>
                        <th className="border border-white/20 px-4 py-3 text-left text-white font-semibold">Risk if Failed</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-white/20 px-4 py-3 text-white">On-chain order execution</td>
                        <td className="border border-white/20 px-4 py-3 text-white">Rebalancing fails → portfolio drifts from target allocation</td>
                      </tr>
                      <tr className="bg-white/5">
                        <td className="border border-white/20 px-4 py-3 text-white">Price Oracles</td>
                        <td className="border border-white/20 px-4 py-3 text-white">Incorrect NAV → wrong staking rewards, unfair deposits/withdrawals</td>
                      </tr>
                      <tr>
                        <td className="border border-white/20 px-4 py-3 text-white">Settlement on the Hyperliquid network</td>
                        <td className="border border-white/20 px-4 py-3 text-white">Funds stuck, delayed, or misrouted</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </Reveal>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
