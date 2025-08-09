import Link from 'next/link';

const cities = [
  { name: 'New York', state: 'NY' },
  { name: 'Los Angeles', state: 'CA' },
  { name: 'Chicago', state: 'IL' },
  { name: 'San Francisco', state: 'CA' },
  { name: 'Seattle', state: 'WA' },
  { name: 'Dallas', state: 'TX' },
  { name: 'Miami', state: 'FL' },
  { name: 'Philadelphia', state: 'PA' },
  { name: 'San Diego', state: 'CA' },
  { name: 'Austin', state: 'TX' },
  { name: 'Phoenix', state: 'AZ' },
];

const soupTypes = [
  'Ramen',
  'Pho',
  'Chicken Noodle',
  'Clam Chowder',
  'Tomato',
  'French Onion',
  'Minestrone',
  'Miso',
  'Borscht',
  'Gumbo',
];

const aboutLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Press', href: '/press' },
  { name: 'Careers', href: '/careers' },
  { name: 'Contact', href: '/contact' },
];

const legalLinks = [
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Cookie Policy', href: '/cookies' },
  { name: 'Accessibility', href: '/accessibility' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-neutral-950 text-neutral-300 overflow-hidden">
      {/* Geometric accents */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 blur-3xl" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Top brand + newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-12">
          <div className="lg:col-span-5">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center mr-3 shadow-sm">🥣</div>
              <span className="text-white font-extrabold text-2xl">FindSoupNearMe</span>
            </div>
            <p className="text-neutral-400 leading-relaxed max-w-md">
              Discover the best soup spots across the country. From ramen to chowder, we help you find the perfect bowl near you.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-sm">
              <h3 className="text-white text-lg font-semibold mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-neutral-400 mb-4">Get the latest soup news and special offers delivered to your inbox.</p>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" stroke="none" /><path d="M22 6l-10 7L2 6" /></svg>
                  </span>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900/60 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                    required
                    aria-label="Email address"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-colors shadow-sm"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-10" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
          {/* Cities */}
          <div className="lg:col-span-3 col-span-2">
            <h3 className="text-white text-sm tracking-wider uppercase font-semibold mb-4">Popular Cities</h3>
            <ul className="space-y-3">
              {cities.slice(0, 6).map((city) => (
                <li key={`${city.name}-${city.state}`}>
                  <Link 
                    href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                  >
                    {city.name}, {city.state}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cities" className="text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center group">
                  View All Cities
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          {/* Soup Types */}
          <div className="lg:col-span-3 col-span-2">
            <h3 className="text-white text-sm tracking-wider uppercase font-semibold mb-4">Soup Types</h3>
            <ul className="space-y-3">
              {soupTypes.slice(0, 6).map((type) => (
                <li key={type}>
                  <Link 
                    href={`/search?type=${encodeURIComponent(type)}`}
                    className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                  >
                    {type}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/soup-types" className="text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center group">
                  View All Soup Types
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="lg:col-span-3 col-span-2">
            <h3 className="text-white text-sm tracking-wider uppercase font-semibold mb-4">About</h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Restaurant Owners */}
          <div className="lg:col-span-3 col-span-2">
            <h3 className="text-white text-sm tracking-wider uppercase font-semibold mb-4">Restaurant Owners</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/restaurant/claim"
                  className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                >
                  Claim Your Restaurant
                </Link>
              </li>
              <li>
                <Link 
                  href="/restaurant/pricing"
                  className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/restaurant/login"
                  className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                >
                  Owner Login
                </Link>
              </li>
              <li>
                <Link 
                  href="/restaurant/resources"
                  className="text-neutral-400 hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                >
                  Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center mr-3 shadow-sm">S</div>
              <span className="text-white font-bold text-xl">FindSoupNearMe</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-6 md:mb-0">
              {legalLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="text-neutral-400 text-sm hover:text-white transition-colors hover:underline underline-offset-4 decoration-orange-500/40"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex space-x-5">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-neutral-500 text-sm">
            <p>© {currentYear} FindSoupNearMe.com. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}