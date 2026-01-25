'use client';

import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import Link from 'next/link';

export default function TermsOfUsePage() {
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
                <li className="text-white">Terms of Use</li>
              </ol>
            </nav>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                  Statera – Terms of use
                </span>
              </h1>
              <p className="text-gray-400 text-sm">
                Last Updated: November 14, 2025
              </p>
            </div>
          </Reveal>

          <div className="prose prose-invert max-w-none space-y-8">
            <Reveal delayMs={200}>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <p className="text-white leading-relaxed mb-6">
                  These Terms of Use ("Terms") govern your access to and use of the software products and services (the "Services") provided through the Statera front-end user interface (the "Interface"), including but not limited to https://statera.example and https://app.statera.example, which allows users to interact with the Statera Protocol — a decentralized, non-custodial blockchain-based protocol (the "Protocol").
                </p>
                <p className="text-white leading-relaxed">
                  By accessing or using the Services, you represent that you have read, understood, and agreed to be bound by these Terms, our Privacy Policy, and our User Risk Documentation, each of which is incorporated herein by reference. If you do not agree to these Terms, you must not access or use the Services.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    1. Acceptance of Terms
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  Your use of the Services constitutes your unconditional acceptance of these Terms and all associated policies. These Terms form a legally binding agreement between you and the Statera community — understood as the decentralized network of users, developers, and contributors interacting with the Protocol.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={400}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    2. Description of Services
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  The Services consist solely of:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>A frontend interface (website and web application)</li>
                  <li>Tools and dashboards that allow users to view data and interact with the Statera Protocol</li>
                  <li>Access to features such as:
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>Depositing and withdrawing from investment strategies</li>
                      <li>Staking ERA and STA tokens</li>
                      <li>Viewing portfolio performance (NAV)</li>
                      <li>Claiming rewards</li>
                    </ul>
                  </li>
                </ul>
              </section>
            </Reveal>

            <Reveal delayMs={500}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    3. Assumption of Risk
                  </span>
                </h2>
                
                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.1. No Warranties</h3>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  THE SERVICES AND THE STATERA PROTOCOL ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. NO WARRANTY IS MADE REGARDING THE SECURITY, ACCURACY, RELIABILITY, OR AVAILABILITY OF THE PROTOCOL OR ITS UNDERLYING TECHNOLOGY.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.2. No Financial Advice</h3>
                <p className="text-white leading-relaxed mb-4">
                  Nothing contained in the Services constitutes financial, investment, legal, tax, or other professional advice. You are solely responsible for:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Determining whether your use of the Protocol is suitable for your financial situation</li>
                  <li>Consulting with qualified professionals before making any decisions</li>
                </ul>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">3.3. Assumption of Risk</h3>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>USING THE SERVICES INVOLVES SIGNAL RISKS, INCLUDING BUT NOT LIMITED TO:
                    <ul className="ml-6 mt-2 space-y-1">
                      <li>Loss of digital assets due to smart contract bugs, hacks, or exploits</li>
                      <li>Market volatility leading to partial or total loss of principal</li>
                      <li>Impermanent loss in liquidity positions</li>
                      <li>Oracle failure, price manipulation, or incorrect NAV calculations</li>
                      <li>Dependency on third-party infrastructure (e.g., Hyperliquid)</li>
                      <li>Regulatory changes affecting token status or access</li>
                    </ul>
                  </li>
                  <li>THERE IS NO GUARANTEE OF PROFIT, AND PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS</li>
                  <li>YOU USE THE SERVICES AT YOUR OWN RISK, AND NO PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE</li>
                </ul>
              </section>
            </Reveal>

            <Reveal delayMs={600}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    4. Eligibility
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  To use the Services, you must:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Be at least 18 years old (or the age of majority in your jurisdiction)</li>
                  <li>Not be located in, or a resident of, any jurisdiction where access to DeFi protocols is prohibited or restricted (e.g., certain sanctions regimes)</li>
                  <li>Not be acting on behalf of a sanctioned individual, entity, or government</li>
                </ul>
                <p className="text-white leading-relaxed">
                  By using the Services, you represent and warrant that you meet these eligibility requirements.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={700}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    5. Prohibited Activities
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  You agree not to:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Use the Services for any illegal, fraudulent, or unauthorized purpose</li>
                  <li>Attempt to interfere with, reverse engineer, or exploit the Protocol or its smart contracts</li>
                  <li>Engage in wash trading, spoofing, or other manipulative practices</li>
                  <li>Impersonate the Statera team or any affiliated entity</li>
                  <li>Use the Interface to promote scams, phishing, or malicious content</li>
                </ul>
                <p className="text-white leading-relaxed">
                  We reserve the right to block, restrict, or report any activity that violates these Terms.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={800}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    6. Intellectual Property
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  All content on the Interface — including text, graphics, logos, icons, and software — is the property of the Statera community or its licensors and is protected by applicable intellectual property laws.
                </p>
                <p className="text-white leading-relaxed">
                  You are granted a limited, revocable, non-exclusive, non-transferable license to access and use the Interface for personal, non-commercial purposes.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={900}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    7. Third-Party Links & Ecosystem Projects
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  The Interface may contain links to:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>External websites</li>
                  <li>Subdomains managed by independent developers (e.g., analytics tools, staking dashboards)</li>
                  <li>Decentralized applications (dApps) within the broader Statera ecosystem</li>
                </ul>
                <p className="text-white leading-relaxed">
                  These sites are not operated or controlled by the core Statera team. Each may have its own terms, privacy policies, and security practices.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1000}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    8. No Liability
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER THE STATERA PROTOCOL, ITS DEVELOPERS, CONTRIBUTORS, NOR ANY ENTITY ASSOCIATED WITH THE PROJECT SHALL BE LIABLE FOR ANY LOSS, DAMAGE, OR INJURY ARISING OUT OF OR IN CONNECTION WITH:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2">
                  <li>YOUR USE OR INABILITY TO USE THE SERVICES</li>
                  <li>ANY TRANSACTION OR INTERACTION WITH THE PROTOCOL</li>
                  <li>ANY SMART CONTRACT FAILURE, EXPLOIT, OR BUG</li>
                  <li>MARKET VOLATILITY OR TOKEN VALUE FLUCTUATIONS</li>
                </ul>
              </section>
            </Reveal>

            <Reveal delayMs={1100}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    9. Indemnification
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  You agree to indemnify and hold harmless the Statera community, its contributors, and any associated parties from any claim, loss, liability, damage, or expense (including reasonable legal fees) arising from your use of the Services, your violation of these Terms, or your engagement in prohibited activities.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1200}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    10. Modifications to These Terms
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  We may update these Terms from time to time. Any changes will be:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2">
                  <li>Posted on this page</li>
                  <li>Effective immediately upon publication</li>
                  <li>Notified via official communication channels (e.g., governance forum, social media)</li>
                </ul>
              </section>
            </Reveal>

            <Reveal delayMs={1300}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    11. Governing Law & Dispute Resolution
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  These Terms are governed by the laws of the jurisdiction of choice for open-source software protocols, recognizing the decentralized and borderless nature of blockchain technology.
                </p>
                <p className="text-white leading-relaxed">
                  All interactions are final and irreversible.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1400}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    12. Severability
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1500}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    13. Entire Agreement
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  These Terms, together with the Privacy Policy and User Risk Documentation, constitute the entire agreement between you and the Statera community regarding your use of the Services.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1600}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    14. Contact & Governance
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  Statera is a community-driven protocol. There is no centralized customer support.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  For questions, feedback, or governance proposals:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2">
                  <li>Visit the official governance forum (TBD)</li>
                  <li>Join the community Discord or Telegram</li>
                  <li>Submit issues via GitHub</li>
                </ul>
                <p className="text-white leading-relaxed mt-4">
                  Future decisions about the Protocol may be made through on-chain governance by STA token holders.
                </p>
              </section>
            </Reveal>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
