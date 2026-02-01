'use client';

import Header from '@/components/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Reveal } from '@/components/landing/Reveal';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white statera-docs-typo">
      <Header />

      <main className="pt-[60px] md:pt-[80px] pb-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <Reveal>
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li className="text-gray-600">/</li>
                <li className="text-white">Cookies</li>
              </ol>
            </nav>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                  Cookies Policy
                </span>
              </h1>
              <p className="text-gray-400 text-sm">
                Last Updated: November 14, 2025
              </p>
            </div>
          </Reveal>

          <div className="prose prose-invert max-w-none space-y-8">
            <Reveal delayMs={200}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    What Are Cookies?
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
                </p>
                <p className="text-white leading-relaxed">
                  Cookies allow a website to recognize your device and store some information about your preferences or past actions. This helps improve your browsing experience by remembering your settings and preferences.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={300}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    Types of Cookies We Use
                  </span>
                </h2>
                
                <h3 className="text-xl font-bold text-white mb-4 mt-6">Strictly Necessary Cookies</h3>
                <p className="text-white leading-relaxed mb-4">
                  These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. Without these cookies, services you have asked for cannot be provided.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  These cookies do not store any personally identifiable information and cannot be disabled in our systems.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">Performance and Analytics Cookies</h3>
                <p className="text-white leading-relaxed mb-4">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They allow us to recognize and count the number of visitors and see how visitors move around our website.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  This helps us improve the way our website works, for example, by ensuring that users find what they are looking for easily.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">Functional Cookies</h3>
                <p className="text-white leading-relaxed mb-4">
                  These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  If you do not allow these cookies, some or all of these services may not function properly.
                </p>

                <h3 className="text-xl font-bold text-white mb-4 mt-6">Advertising Cookies</h3>
                <p className="text-white leading-relaxed mb-4">
                  These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
                </p>
                <p className="text-white leading-relaxed">
                  Currently, we do not use advertising cookies on the Statera interface. If this changes in the future, we will update this policy and provide clear notice.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={400}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    How We Use Cookies on This Site
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  The Statera interface uses cookies to:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Ensure the website functions correctly and securely</li>
                  <li>Remember your preferences and settings (such as language or theme)</li>
                  <li>Analyze website traffic and usage patterns to improve our services</li>
                  <li>Provide a personalized experience when you return to the site</li>
                </ul>
                <p className="text-white leading-relaxed">
                  We do not use cookies to collect sensitive personal data without your explicit consent. Any optional analytics or preference storage will be disclosed here before activation.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={500}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    Third-Party Cookies
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website, deliver advertisements, and so on.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  These third-party services may include:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li>Analytics providers that help us understand how visitors use our website</li>
                  <li>Content delivery networks that help us serve content efficiently</li>
                  <li>Security services that help protect our website from malicious activity</li>
                </ul>
                <p className="text-white leading-relaxed">
                  These third-party cookies are subject to the respective privacy policies of the third-party providers. We recommend reviewing their policies to understand how they use cookies and other tracking technologies.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={600}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    Cookie Management and Browser Controls
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  However, please note that disabling cookies may affect the functionality of this website and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site.
                </p>
                
                <h3 className="text-xl font-bold text-white mb-4 mt-6">How to Manage Cookies in Your Browser</h3>
                
                <h4 className="text-lg font-bold text-white mb-3 mt-4">Google Chrome</h4>
                <p className="text-white leading-relaxed mb-4">
                  Go to Settings → Privacy and security → Cookies and other site data. You can choose to block all cookies, block third-party cookies, or allow all cookies.
                </p>

                <h4 className="text-lg font-bold text-white mb-3 mt-4">Safari</h4>
                <p className="text-white leading-relaxed mb-4">
                  Go to Preferences → Privacy. You can choose to block all cookies or manage cookie preferences for specific websites.
                </p>

                <h4 className="text-lg font-bold text-white mb-3 mt-4">Firefox</h4>
                <p className="text-white leading-relaxed mb-4">
                  Go to Options → Privacy & Security. Under Cookies and Site Data, you can choose to block cookies or manage exceptions.
                </p>

                <h4 className="text-lg font-bold text-white mb-3 mt-4">Microsoft Edge</h4>
                <p className="text-white leading-relaxed">
                  Go to Settings → Cookies and site permissions → Cookies and site data. You can choose to block all cookies, block third-party cookies, or allow all cookies.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={700}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    Consent and Preferences
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  By continuing to use our website, you consent to our use of cookies as described in this policy. You can change your cookie preferences at any time through your browser settings.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  If you wish to withdraw your consent, you can delete cookies that have already been set. You can do this through your browser settings or by using browser extensions designed to manage cookies.
                </p>
                <p className="text-white leading-relaxed">
                  Please note that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, and some parts of our website may not function properly.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={800}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    Data Retention
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  Cookies are stored on your device for different periods depending on their type:
                </p>
                <ul className="text-white leading-relaxed ml-6 space-y-2 mb-4">
                  <li><strong>Session cookies</strong> are temporary and are deleted when you close your browser</li>
                  <li><strong>Persistent cookies</strong> remain on your device for a set period (typically 30 days to 2 years) or until you delete them manually</li>
                </ul>
                <p className="text-white leading-relaxed">
                  The specific retention period for each cookie type may vary. We review and update our cookie retention practices periodically to ensure they align with our data protection obligations.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={900}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    Updates to This Policy
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  We may update this Cookies Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                </p>
                <p className="text-white leading-relaxed mb-4">
                  Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically to stay informed about how we use cookies.
                </p>
                <p className="text-white leading-relaxed">
                  Your continued use of our website after any changes to this policy constitutes your acceptance of the updated policy.
                </p>
              </section>
            </Reveal>

            <Reveal delayMs={1000}>
              <section className="bg-white/5 border border-white/10 rounded-lg p-6 sm:p-8 shadow-lg shadow-[#FAB062]/20 ring-1 ring-[#FAB062]/10">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-[#EF9B13] via-[#FAB062] to-[#D36A03] bg-clip-text text-transparent">
                    Contact Information
                  </span>
                </h2>
                <p className="text-white leading-relaxed mb-4">
                  If you have any questions about our use of cookies or this Cookies Policy, please contact us via the official channels provided on the website.
                </p>
                <p className="text-white leading-relaxed">
                  For general inquiries about the Statera protocol, you can visit our documentation, join our community Discord or Telegram, or submit issues via GitHub.
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
