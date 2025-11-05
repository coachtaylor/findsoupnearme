// src/pages/privacy.js
import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - FindSoupNearMe</title>
        <meta name="description" content="Privacy Policy for FindSoupNearMe" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600 mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="prose prose-orange max-w-none">
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-700 mb-4">
                  Welcome to FindSoupNearMe (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and being transparent about how we collect, use, and share information. This Privacy Policy explains our practices regarding the information we collect through our website at findsoupnearme.com (the &quot;Site&quot;).
                </p>
                <p className="text-gray-700">
                  By using our Site, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
                <p className="text-gray-700 mb-3">When you create an account or interact with our Site, we may collect:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Name and email address (for account creation)</li>
                  <li>Restaurant reviews and ratings you submit</li>
                  <li>Favorite restaurants and preferences</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information Collected Automatically</h3>
                <p className="text-gray-700 mb-3">When you visit our Site, we automatically collect:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li><strong>Usage Data:</strong> Pages viewed, time spent on pages, links clicked</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                  <li><strong>Location Data:</strong> General location (city/state) based on IP address</li>
                  <li><strong>Cookies:</strong> We use cookies and similar technologies (see Section 5)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Order Intent Tracking</h3>
                <p className="text-gray-700 mb-4">
                  When you click on delivery platform links (DoorDash, Uber Eats, etc.), we collect:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Which restaurant you selected</li>
                  <li>Which delivery platform you chose</li>
                  <li>Timestamp of the click</li>
                  <li>Anonymized IP address (hashed for privacy)</li>
                  <li>Browser and device information</li>
                </ul>
                <p className="text-gray-700">
                  <strong>Note:</strong> We do NOT collect any information about the actual order you place with delivery platforms, payment information, or order contents. That information is handled entirely by the delivery platform.
                </p>
              </section>

              {/* How We Use Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-700 mb-3">We use the collected information to:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Provide and improve our restaurant discovery service</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Analyze usage patterns to improve our Site</li>
                  <li>Track order intent clicks for analytics and affiliate partnerships</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and abuse</li>
                </ul>
              </section>

              {/* Sharing of Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Third-Party Services</h3>
                <p className="text-gray-700 mb-4">
                  We share information with third-party service providers who help us operate our Site:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li><strong>Hosting & Infrastructure:</strong> Vercel, Supabase</li>
                  <li><strong>Analytics:</strong> Google Analytics (anonymized)</li>
                  <li><strong>Email Services:</strong> For account notifications</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Delivery Partners</h3>
                <p className="text-gray-700 mb-4">
                  When you click on delivery platform links, you are redirected to third-party sites (DoorDash, Uber Eats, Grubhub, etc.). These platforms have their own privacy policies, and we encourage you to review them. We may share anonymized usage statistics with these partners.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Affiliate Programs</h3>
                <p className="text-gray-700 mb-4">
                  We participate in affiliate programs with delivery platforms. When you make a purchase through our referral links, we may earn a commission. This does not affect the price you pay. See our <Link href="/affiliate-disclosure" className="text-orange-600 hover:text-orange-700">Affiliate Disclosure</Link> for more details.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Legal Requirements</h3>
                <p className="text-gray-700 mb-4">
                  We may disclose your information if required by law, court order, or government request, or to protect our rights and safety.
                </p>

                <p className="text-gray-700 font-semibold">
                  We do NOT sell your personal information to third parties.
                </p>
              </section>

              {/* Cookies */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking Technologies</h2>
                <p className="text-gray-700 mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for site functionality (login sessions, preferences)</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our Site</li>
                  <li><strong>Preference Cookies:</strong> Remember your delivery platform preferences</li>
                </ul>
                <p className="text-gray-700">
                  You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.
                </p>
              </section>

              {/* Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
                <p className="text-gray-700 mb-4">
                  We implement reasonable security measures to protect your information, including:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Encryption of data in transit (HTTPS/SSL)</li>
                  <li>Secure database storage with access controls</li>
                  <li>Hashing of IP addresses for privacy</li>
                  <li>Regular security audits and updates</li>
                </ul>
                <p className="text-gray-700">
                  However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              {/* Your Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
                <p className="text-gray-700 mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct your information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
                  <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                </ul>
                <p className="text-gray-700">
                  To exercise these rights, contact us at <a href="mailto:privacy@findsoupnearme.com" className="text-orange-600 hover:text-orange-700">privacy@findsoupnearme.com</a>
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
                <p className="text-gray-700">
                  Our Site is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                </p>
              </section>

              {/* California Privacy Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. California Privacy Rights (CCPA)</h2>
                <p className="text-gray-700 mb-4">
                  If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Right to know what personal information we collect</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information (we don&apos;t sell data)</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                </ul>
              </section>

              {/* Changes to Policy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the &quot;Effective Date.&quot; We encourage you to review this policy periodically.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or our practices, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>Email:</strong> privacy@findsoupnearme.com</p>
                  <p className="text-gray-700 mb-2"><strong>Website:</strong> <Link href="/" className="text-orange-600 hover:text-orange-700">findsoupnearme.com</Link></p>
                </div>
              </section>
            </div>

            {/* Footer Links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/terms" className="text-orange-600 hover:text-orange-700">
                  Terms of Service
                </Link>
                <Link href="/affiliate-disclosure" className="text-orange-600 hover:text-orange-700">
                  Affiliate Disclosure
                </Link>
                <Link href="/contact" className="text-orange-600 hover:text-orange-700">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}