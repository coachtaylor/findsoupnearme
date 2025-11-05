// src/pages/terms.js
import Head from 'next/head';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - FindSoupNearMe</title>
        <meta name="description" content="Terms of Service for FindSoupNearMe" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600 mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="prose prose-orange max-w-none">
              {/* Agreement */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing or using FindSoupNearMe (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) at findsoupnearme.com (the &quot;Site&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use our Site.
                </p>
                <p className="text-gray-700">
                  We reserve the right to modify these Terms at any time. Continued use of the Site after changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              {/* Description */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 mb-4">
                  FindSoupNearMe is a restaurant discovery platform that helps users find soup restaurants, read reviews, and access delivery options. We provide:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Restaurant listings and information</li>
                  <li>User reviews and ratings</li>
                  <li>Links to third-party delivery platforms</li>
                  <li>Editorial content and soup guides</li>
                  <li>Account features for registered users</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Registration</h3>
                <p className="text-gray-700 mb-4">
                  To access certain features, you may need to create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Be responsible for all activity under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Termination</h3>
                <p className="text-gray-700 mb-4">
                  We reserve the right to terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.
                </p>
              </section>

              {/* User Content */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User-Generated Content</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Your Content</h3>
                <p className="text-gray-700 mb-4">
                  When you submit reviews, ratings, or other content (&quot;User Content&quot;), you:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Retain ownership of your content</li>
                  <li>Grant us a license to use, display, and distribute it</li>
                  <li>Represent that you have the right to share it</li>
                  <li>Agree it does not violate any laws or third-party rights</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Content Guidelines</h3>
                <p className="text-gray-700 mb-4">User Content must not:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Be false, misleading, or fraudulent</li>
                  <li>Be defamatory, obscene, or offensive</li>
                  <li>Violate intellectual property rights</li>
                  <li>Contain spam or commercial solicitation</li>
                  <li>Include personal information of others</li>
                  <li>Be posted by competitors for sabotage purposes</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Moderation</h3>
                <p className="text-gray-700 mb-4">
                  We reserve the right to remove or modify User Content that violates these Terms, but we are not obligated to monitor all content.
                </p>
              </section>

              {/* Third Party Links */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Links and Services</h2>
                <p className="text-gray-700 mb-4">
                  Our Site contains links to third-party websites and services (DoorDash, Uber Eats, etc.). We are not responsible for:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>The content or practices of third-party sites</li>
                  <li>Orders, payments, or delivery through these platforms</li>
                  <li>Disputes between you and third-party service providers</li>
                  <li>The accuracy of restaurant information on third-party platforms</li>
                </ul>
                <p className="text-gray-700">
                  Your use of third-party services is governed by their own terms and policies.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
                <p className="text-gray-700 mb-4">
                  The Site and its content (excluding User Content) are owned by FindSoupNearMe and protected by copyright, trademark, and other laws. You may not:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Copy, modify, or distribute our content without permission</li>
                  <li>Use our trademarks or branding without authorization</li>
                  <li>Scrape or data mine the Site</li>
                  <li>Create derivative works based on our content</li>
                </ul>
              </section>

              {/* Prohibited Uses */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Uses</h2>
                <p className="text-gray-700 mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Use the Site for illegal purposes</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Site</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post fake reviews or manipulate ratings</li>
                  <li>Use automated tools to access the Site without permission</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              {/* Disclaimer */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    THE SITE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>The Site will be uninterrupted or error-free</li>
                    <li>Restaurant information is accurate or up-to-date</li>
                    <li>Reviews and ratings are truthful or reliable</li>
                    <li>The Site will meet your requirements</li>
                    <li>Any errors will be corrected</li>
                  </ul>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, FINDSOUPNEARME SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Indirect, incidental, or consequential damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Orders, deliveries, or services provided by third parties</li>
                    <li>User Content or actions of other users</li>
                    <li>Food quality, safety, or allergic reactions</li>
                    <li>Errors or omissions in restaurant information</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    OUR TOTAL LIABILITY SHALL NOT EXCEED $100 OR THE AMOUNT YOU PAID US (IF ANY) IN THE PAST 12 MONTHS.
                  </p>
                </div>
              </section>

              {/* Indemnification */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
                <p className="text-gray-700">
                  You agree to indemnify and hold harmless FindSoupNearMe from any claims, damages, or expenses arising from your use of the Site, your User Content, or your violation of these Terms.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-700">
                  These Terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes shall be resolved in the courts of California.
                </p>
              </section>

              {/* Changes */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700">
                  We may modify these Terms at any time. Material changes will be posted on this page with an updated &quot;Effective Date.&quot; Your continued use of the Site after changes constitutes acceptance.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  Questions about these Terms? Contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@findsoupnearme.com</p>
                  <p className="text-gray-700 mb-2"><strong>Website:</strong> <Link href="/" className="text-orange-600 hover:text-orange-700">findsoupnearme.com</Link></p>
                </div>
              </section>
            </div>

            {/* Footer Links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                  Privacy Policy
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