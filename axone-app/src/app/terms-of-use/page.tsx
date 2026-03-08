'use client';

import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import Link from 'next/link';
import { cinzel } from '@/lib/fonts';

export default function TermsOfUsePage() {
  return (
    <div className={`${cinzel.className} min-h-screen bg-[#0A0A0A] text-white`}>
      <style>{`
        .legal-content h1,
        .legal-content h2 span,
        .legal-content h3 {
          background: linear-gradient(135deg, #7A4F28 0%, #C98B3D 25%, #F0CA7A 50%, #C98B3D 75%, #7A4F28 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .legal-content p,
        .legal-content li {
          color: rgba(230, 230, 230, 0.65);
          font-weight: 300;
          letter-spacing: 0.04em;
        }
        .legal-content strong {
          color: rgba(230, 230, 230, 0.9);
          -webkit-text-fill-color: rgba(230, 230, 230, 0.9);
        }
      `}</style>
      <Header />

      <main className="pt-[60px] md:pt-[80px] pb-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <Reveal delayMs={100}>
            <div className="mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.08em] mb-4 leading-relaxed">
                Statera – Terms of use
              </h1>
              <p className="text-[rgba(230,230,230,0.4)] text-xs tracking-[0.14em]">
                Last Updated: November 14, 2025
              </p>
            </div>
          </Reveal>

          <div className="legal-content prose prose-invert max-w-none space-y-8">
            <Reveal delayMs={200}>
              <div>
                <p className="text-white leading-relaxed mb-6">
                  These Terms of Use ("Terms") govern your access to and use of the software products and services (the "Services") provided through the Statera front-end user interface (the "Interface"), including but not limited to https://statera.example and https://app.statera.example, which allows users to interact with the Statera Protocol — a decentralized, non-custodial blockchain-based protocol (the "Protocol").
                </p>
                <p className="text-white leading-relaxed">
                  By accessing or using the Services, you represent that you have read, understood, and agreed to be bound by these Terms, our Privacy Policy, and our User Risk Documentation, each of which is incorporated herein by reference. If you do not agree to these Terms, you must not access or use the Services.
                </p>
              </div>
            </Reveal>

            <Reveal delayMs={300}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Acceptance of Terms
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  Your use of the Services constitutes your unconditional acceptance of these Terms and all associated policies. These Terms form a legally binding agreement between you and the Statera community — understood as the decentralized network of users, developers, and contributors interacting with the Protocol.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={400}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Description of Services
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Assumption of Risk
                  </span>
                </h2>
                
                <h3 className="text-xl font-bold text-[#C9A36A] mb-4 mt-6">3.1. No Warranties</h3>
                <p className="text-white leading-relaxed mb-4 font-semibold">
                  THE SERVICES AND THE STATERA PROTOCOL ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. NO WARRANTY IS MADE REGARDING THE SECURITY, ACCURACY, RELIABILITY, OR AVAILABILITY OF THE PROTOCOL OR ITS UNDERLYING TECHNOLOGY.
                </p>

                <h3 className="text-xl font-bold text-[#C9A36A] mb-4 mt-6">3.2. No Financial Advice</h3>
                <p className="text-white leading-relaxed mb-4">
                  Nothing contained in the Services constitutes financial, investment, legal, tax, or other professional advice. You are solely responsible for:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Determining whether your use of the Protocol is suitable for your financial situation</li>
                  <li>Consulting with qualified professionals before making any decisions</li>
                </ul>

                <h3 className="text-xl font-bold text-[#C9A36A] mb-4 mt-6">3.3. Assumption of Risk</h3>
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Eligibility
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Prohibited Activities
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Intellectual Property
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Third-Party Links & Ecosystem Projects
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    No Liability
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Indemnification
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  You agree to indemnify and hold harmless the Statera community, its contributors, and any associated parties from any claim, loss, liability, damage, or expense (including reasonable legal fees) arising from your use of the Services, your violation of these Terms, or your engagement in prohibited activities.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1200}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Modifications to These Terms
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Governing Law & Dispute Resolution
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
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Severability
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1500}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Entire Agreement
                  </span>
                </h2>
                <p className="text-white leading-relaxed">
                  These Terms, together with the Privacy Policy and User Risk Documentation, constitute the entire agreement between you and the Statera community regarding your use of the Services.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1600}>
              <section>
                <h2 className="text-2xl font-bold mb-6">
                  <span className="text-[#C9A36A]">
                    Contact & Governance
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
