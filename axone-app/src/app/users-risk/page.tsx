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
                    Legal & Regulatory Risks
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
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Statera is a tool, not an investment scheme.</p>
                  <p className="text-white leading-relaxed">No team and no legal entity controls funds or profits.</p>
                  <p className="text-white leading-relaxed">The protocol will be deployed via a non-upgradeable, permissionless launch. No entity will retain administrative control, special privileges, or early access to tokens. All supply will be distributed algorithmically to users based on participation</p>
                  <p className="text-white leading-relaxed">All logic is automated and immutable.</p>
                  <p className="text-white leading-relaxed">Rewards are algorithmic, not promised.</p>
                </div>
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
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Restrictions on CEX listings of STA</p>
                  <p className="text-white leading-relaxed">Regulatory scrutiny of the token</p>
                  <p className="text-white leading-relaxed">Potential blocking of access from certain regions</p>
                </div>
                <p className="text-white leading-relaxed">
                  You are responsible for ensuring your use of Statera complies with local laws, including tax reporting and crypto regulations.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={300}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Financial Risks
                  </span>
                </h2>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">2.1. Loss of Principal</h3>
                <p className="text-white leading-relaxed mb-4">
                  There is no capital guarantee. The value of your investment, denominated in HYPE, can decrease due to:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Market volatility of underlying assets (e.g., BTC, ETH, etc.)</p>
                  <p className="text-white leading-relaxed">Imperfect rebalancing during extreme price moves</p>
                  <p className="text-white leading-relaxed">Fees (entry, exit, management)</p>
                </div>
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
                    Technical & Infrastructure Risks
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
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Dynamic NAV calculation</p>
                  <p className="text-white leading-relaxed">Fee distribution logic</p>
                  <p className="text-white leading-relaxed">Vesting (STAlp)</p>
                  <p className="text-white leading-relaxed">Inflation scheduling</p>
                  <p className="text-white leading-relaxed">Buyback & burn automation</p>
                </div>

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
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Deposit small amounts initially</p>
                  <p className="text-white leading-relaxed">Monitor official channels for updates</p>
                  <p className="text-white leading-relaxed">Withdraw if uncomfortable with risk level</p>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.3. Oracle Risk</h3>
                <p className="text-white leading-relaxed mb-4">
                  The Net Asset Value (NAV) of each strategy is calculated using on-chain price feeds from Hyperliquid.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  If these oracles:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Are delayed</p>
                  <p className="text-white leading-relaxed">Provide stale prices</p>
                  <p className="text-white leading-relaxed">Are manipulated (e.g., flash loan attack)</p>
                </div>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  → The NAV becomes inaccurate.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  Consequences:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Users may deposit/withdraw at incorrect values</p>
                  <p className="text-white leading-relaxed">Rebalancing triggers at wrong times</p>
                  <p className="text-white leading-relaxed">Staking rewards miscalculated</p>
                </div>
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
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">50% funds STA buyback & burn</p>
                  <p className="text-white leading-relaxed">50% is distributed to STA stakers in HYPE</p>
                </div>
                <p className="text-white leading-relaxed mb-4">
                  This design prevents direct profit capture by the owner — even if fees are increased, the revenue flows back to the community.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  That said, the owner could still:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Disrupt operations (e.g., pause functions, set inefficient parameters)</p>
                  <p className="text-white leading-relaxed">Damage user experience or protocol performance</p>
                </div>
                <p className="text-white leading-relaxed mb-4">
                  To mitigate this:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">All parameter changes are subject to a 48-hour timelock</p>
                  <p className="text-white leading-relaxed">The owner cannot withdraw user funds or alter redistribution logic</p>
                  <p className="text-white leading-relaxed">A clear path to on-chain governance by STA holders will be implemented within 12 months</p>
                </div>
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
                    User Risks & Responsibilities
                  </span>
                </h2>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">4.1. No Recovery Mechanism</h3>
                <p className="text-white leading-relaxed mb-4">
                  There is no customer support.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  There is no way to recover funds if:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">You lose your wallet seed phrase</p>
                  <p className="text-white leading-relaxed">You send funds to the wrong address</p>
                  <p className="text-white leading-relaxed">You approve a malicious contract</p>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">4.2. Phishing & Scams</h3>
                <p className="text-white leading-relaxed mb-4">
                  Fake websites, social media impersonators, and scam tokens are common.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  Always verify:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">The official domain: https://statera.example (TBD)</p>
                  <p className="text-white leading-relaxed">Contract addresses (published in docs and verified on-chain)</p>
                  <p className="text-white leading-relaxed">Social media accounts (blue check + pinned post)</p>
                </div>
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
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Token amounts</p>
                  <p className="text-white leading-relaxed">Gas fees</p>
                  <p className="text-white leading-relaxed">Contract interactions (approve, deposit, withdraw)</p>
                </div>
                <p className="text-white leading-relaxed mt-4 font-semibold">
                  A single mistake can result in permanent loss.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={600}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Economic Model Risks
                  </span>
                </h2>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">Fee Distribution Relies on Activity</h3>
                <p className="text-white leading-relaxed mb-4">
                  100% of fees go back to users:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">50% → Buyback & burn</p>
                  <p className="text-white leading-relaxed">50% → STA stakers (in HYPE)</p>
                </div>
                <p className="text-white leading-relaxed mb-4">
                  Low activity could create a negative feedback loop:
                </p>
                <div className="space-y-2 mb-4">
                  <p className="text-white leading-relaxed">Fewer fees → smaller buybacks → less downward pressure on supply</p>
                  <p className="text-white leading-relaxed">Lower STA staking rewards → reduced user engagement</p>
                  <p className="text-white leading-relaxed">Weaker liquidity → wider spreads → worse execution</p>
                </div>
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
