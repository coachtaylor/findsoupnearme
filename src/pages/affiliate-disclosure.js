// src/pages/affiliate-disclosure.js
import Head from 'next/head';
import Link from 'next/link';

export default function AffiliateDisclosure() {
  return (
    <>
      <Head>
        <title>Affiliate Disclosure - FindSoupNearMe</title>
        <meta name="description" content="Affiliate partnership disclosure for FindSoupNearMe" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Affiliate Disclosure</h1>
            <p className="text-gray-600 mb-8">
              <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="prose prose-orange max-w-none">
              {/* Overview */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 mb-4">
                  FindSoupNearMe participates in affiliate marketing programs with various delivery platforms and restaurant partners. This means that when you click on certain links on our site and make a purchase or order through those platforms, we may earn a commission at no additional cost to you.
                </p>
                <p className="text-gray-700">
                  We believe in full transparency about how we make money and want you to understand our affiliate relationships.
                </p>
              </section>

              {/* What Are Affiliate Links */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Affiliate Links?</h2>
                <p className="text-gray-700 mb-4">
                  Affiliate links are special tracking links that allow us to earn a commission when you make a purchase through them. These links contain tracking codes that identify the traffic as coming from our website.
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Important:</strong> Using our affiliate links does NOT increase the price you pay. You pay the exact same price as you would if you went directly to the platform&apos;s website. The commission comes from the merchant&apos;s marketing budget, not your pocket.
                </p>
              </section>

              {/* Our Affiliate Partners */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Affiliate Partners</h2>
                <p className="text-gray-700 mb-4">
                  We currently work with or are in the process of partnering with:
                </p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Delivery Platforms</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li><strong>DoorDash:</strong> We may earn a commission when you order through DoorDash</li>
                    <li><strong>Uber Eats:</strong> We participate in the Uber Eats affiliate program</li>
                    <li><strong>Grubhub:</strong> Affiliate partnership where applicable</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Affiliate Networks</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li><strong>Skimlinks / Sovrn Commerce:</strong> We use affiliate networks that automatically convert eligible links</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Direct Restaurant Partnerships</h3>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Some restaurants may provide us with unique promo codes or referral links</li>
                    <li>These partnerships help support independent restaurants and our platform</li>
                  </ul>
                </div>
              </section>

              {/* How We Mark Links */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Mark Affiliate Links</h2>
                <p className="text-gray-700 mb-4">
                  All affiliate links on our site are marked with:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">rel=&quot;sponsored&quot;</code> attribute for search engines</li>
                  <li>Visual indicators where appropriate (e.g., &quot;Order Now&quot; buttons)</li>
                  <li>This disclosure page for full transparency</li>
                </ul>
              </section>

              {/* Our Promise */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Promise to You</h2>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✓ Honest Recommendations</h3>
                    <p className="text-gray-700">
                      We ONLY recommend restaurants and services we genuinely believe in. Our affiliate partnerships do not influence our editorial content or reviews. If a restaurant pays us, but serves bad soup, we&apos;ll tell you.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✓ No Price Manipulation</h3>
                    <p className="text-gray-700">
                      We never inflate prices. You pay the same price whether you use our link or go directly to the platform.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✓ User First</h3>
                    <p className="text-gray-700">
                      Your experience comes first. We won&apos;t recommend platforms or restaurants solely because they offer higher commissions.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✓ Clear Disclosure</h3>
                    <p className="text-gray-700">
                      We clearly disclose our affiliate relationships and are transparent about how we make money.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">✓ No Spam or Tricks</h3>
                    <p className="text-gray-700">
                      We don&apos;t use popups, coupon injections, toolbars, or other intrusive methods. We don&apos;t bid on brand keywords or hijack traffic.
                    </p>
                  </div>
                </div>
              </section>

              {/* How Commissions Work */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How Commissions Work</h2>
                <p className="text-gray-700 mb-4">
                  When you click an affiliate link and make a purchase:
                </p>
                <ol className="list-decimal pl-6 mb-4 text-gray-700 space-y-3">
                  <li>
                    <strong>You click</strong> an &quot;Order Now&quot; button or delivery platform link on our site
                  </li>
                  <li>
                    <strong>You&apos;re redirected</strong> through our tracking link to the partner&apos;s website or app
                  </li>
                  <li>
                    <strong>You place an order</strong> at the normal price (no markup from us)
                  </li>
                  <li>
                    <strong>We earn a commission</strong> from the platform, typically a small percentage of your order
                  </li>
                  <li>
                    <strong>You get your soup</strong> - the most important part!
                  </li>
                </ol>
                <p className="text-gray-700">
                  These commissions help us keep FindSoupNearMe free for everyone and allow us to continue discovering and sharing amazing soup spots.
                </p>
              </section>

              {/* Editorial Independence */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Editorial Independence</h2>
                <p className="text-gray-700 mb-4">
                  Our editorial content is independent from our affiliate partnerships:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Restaurant reviews are based on genuine experiences and user feedback</li>
                  <li>Rankings are determined by quality, ratings, and relevance - not commission rates</li>
                  <li>We include restaurants even if they don&apos;t offer affiliate programs</li>
                  <li>Paid placements (if any) are clearly labeled as &quot;Sponsored&quot; or &quot;Featured&quot;</li>
                </ul>
              </section>

              {/* FTC Compliance */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">FTC Compliance</h2>
                <p className="text-gray-700 mb-4">
                  This disclosure is in accordance with the Federal Trade Commission&apos;s (FTC) requirements for affiliate marketing. The FTC requires that we disclose:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>When we have a financial relationship with companies we recommend</li>
                  <li>That we may earn compensation from your purchases</li>
                  <li>That our opinions remain our own regardless of compensation</li>
                </ul>
                <p className="text-gray-700">
                  Learn more about the FTC&apos;s Endorsement Guidelines at <a href="https://www.ftc.gov/legal-library/browse/rules/guides-concerning-use-endorsements-testimonials-advertising" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline">ftc.gov</a>
                </p>
              </section>

              {/* Supporting Our Mission */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Supporting Our Mission</h2>
                <p className="text-gray-700 mb-4">
                  By using our affiliate links, you&apos;re helping us:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Discover and add more amazing soup restaurants to our database</li>
                  <li>Write helpful guides and editorial content</li>
                  <li>Keep the site free for all users</li>
                  <li>Maintain and improve our platform</li>
                  <li>Support our small team of soup enthusiasts</li>
                </ul>
                <p className="text-gray-700 font-semibold">
                  Thank you for supporting FindSoupNearMe! 🍜
                </p>
              </section>

              {/* Your Choice */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Choice</h2>
                <p className="text-gray-700 mb-4">
                  You are never obligated to use our affiliate links. You can:
                </p>
                <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                  <li>Go directly to delivery platforms by typing their URL</li>
                  <li>Search for restaurants on your own</li>
                  <li>Call restaurants directly for pickup or delivery</li>
                </ul>
                <p className="text-gray-700">
                  We provide these links as a convenience, but the choice is always yours.
                </p>
              </section>

              {/* Questions */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about our affiliate relationships or this disclosure, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>Email:</strong> affiliates@findsoupnearme.com</p>
                  <p className="text-gray-700 mb-2"><strong>General Contact:</strong> <Link href="/contact" className="text-orange-600 hover:text-orange-700">Contact Form</Link></p>
                </div>
              </section>

              {/* Updates */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Disclosure</h2>
                <p className="text-gray-700">
                  We may update this disclosure as we add new partners or change our affiliate relationships. Significant changes will be reflected in the &quot;Last Updated&quot; date at the top of this page.
                </p>
              </section>
            </div>

            {/* Footer Links */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-orange-600 hover:text-orange-700">
                  Terms of Service
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