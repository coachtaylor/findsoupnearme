import Link from 'next/link';
import { LAUNCH_CITIES } from '../../lib/launch-cities';

const cities = LAUNCH_CITIES;

const aboutLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[rgb(var(--primary))] text-white overflow-hidden">
      <div className="relative max-w-7xl mx-auto py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
        {/* Top brand section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center mb-3">
            <img src="/images/logo.svg" alt="FindSoupNearMe" className="h-[70px] w-[70px] mr-3" />
            <span className="text-white font-bold text-2xl">FindSoupNearMe</span>
          </div>
          <p className="text-white/80 leading-relaxed max-w-2xl text-sm">
            Discover the best soup spots across the country. From ramen to chowder, we help you find the perfect bowl near you.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mb-6 lg:mb-8" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:gap-8 mb-6">
          {/* Cities */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Popular Cities</h3>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={`${city.name}-${city.state}`}>
                  <Link 
                    href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {city.name}, {city.state}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">About</h3>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Restaurant Owners */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">For Restaurants</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/submit"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Submit Restaurant
                </Link>
              </li>
              <li>
                <Link 
                  href="/restaurant/claim"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Claim Your Restaurant
                </Link>
              </li>
              <li>
                <Link 
                  href="/restaurant/login"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Owner Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="text-white/70 text-sm text-center md:text-right">
              <p>© {currentYear} FindSoupNearMe.com. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}