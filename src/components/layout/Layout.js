// src/components/layout/Layout.js
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Layout({ children, title, description }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title ? `${title} | FindSoupNearMe` : 'FindSoupNearMe - Discover the Best Soup Near You'}</title>
        <meta name="description" content={description || 'Find the best soup restaurants near you. Browse reviews, menus, and order soup online.'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Navigation */}
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-soup-red-600">
                  FindSoupNearMe
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center">
                <Link href="/restaurants" className="px-3 py-2 text-soup-brown-800 hover:text-soup-red-600">
                  All Restaurants
                </Link>
                <Link href="/cities" className="px-3 py-2 text-soup-brown-800 hover:text-soup-red-600">
                  Cities
                </Link>
                <Link href="/about" className="px-3 py-2 text-soup-brown-800 hover:text-soup-red-600">
                  About
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex md:items-center">
              <Link 
                href="/restaurants/search" 
                className="inline-block bg-soup-red-600 hover:bg-soup-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Find Soup Near Me
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-soup-brown-800 hover:text-soup-red-600 hover:bg-soup-orange-50"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </nav>
        
        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/restaurants" className="block px-3 py-2 rounded-md text-base font-medium text-soup-brown-800 hover:text-soup-red-600 hover:bg-soup-orange-50">
              All Restaurants
            </Link>
            <Link href="/cities" className="block px-3 py-2 rounded-md text-base font-medium text-soup-brown-800 hover:text-soup-red-600 hover:bg-soup-orange-50">
              Cities
            </Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-soup-brown-800 hover:text-soup-red-600 hover:bg-soup-orange-50">
              About
            </Link>
            <Link 
              href="/restaurants/search" 
              className="block px-3 py-2 rounded-md text-base font-medium text-soup-red-600 hover:text-soup-red-700 hover:bg-soup-orange-50"
            >
              Find Soup Near Me
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-soup-brown-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FindSoupNearMe</h3>
              <p className="text-soup-orange-100 mb-4">
                The #1 platform for discovering, rating, and ordering soup from restaurants across U.S. cities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-soup-orange-100 hover:text-white">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-soup-orange-100 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-soup-orange-100 hover:text-white">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Explore</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/restaurants" className="text-soup-orange-100 hover:text-white">
                    All Restaurants
                  </Link>
                </li>
                <li>
                  <Link href="/cities" className="text-soup-orange-100 hover:text-white">
                    Cities
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-soup-orange-100 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-soup-orange-100 hover:text-white">
                    Soup Blog
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Popular Cities</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/ny/new-york/restaurants" className="text-soup-orange-100 hover:text-white">
                    New York, NY
                  </Link>
                </li>
                <li>
                  <Link href="/ca/los-angeles/restaurants" className="text-soup-orange-100 hover:text-white">
                    Los Angeles, CA
                  </Link>
                </li>
                <li>
                  <Link href="/il/chicago/restaurants" className="text-soup-orange-100 hover:text-white">
                    Chicago, IL
                  </Link>
                </li>
                <li>
                  <Link href="/tx/austin/restaurants" className="text-soup-orange-100 hover:text-white">
                    Austin, TX
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">For Restaurants</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/for-restaurants" className="text-soup-orange-100 hover:text-white">
                    Claim Your Listing
                  </Link>
                </li>
                <li>
                  <Link href="/for-restaurants/pricing" className="text-soup-orange-100 hover:text-white">
                    Pricing & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/for-restaurants/login" className="text-soup-orange-100 hover:text-white">
                    Restaurant Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-soup-brown-700 text-soup-orange-200 text-sm">
            <div className="flex flex-col md:flex-row justify-between">
              <p>&copy; {new Date().getFullYear()} FindSoupNearMe. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link href="/privacy" className="text-soup-orange-100 hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-soup-orange-100 hover:text-white">
                  Terms of Service
                </Link>
                <Link href="/contact" className="text-soup-orange-100 hover:text-white">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}