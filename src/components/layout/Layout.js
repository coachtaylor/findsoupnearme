// src/components/layout/Layout.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from './Footer';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout({ children, title, description }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title ? `${title} | FindSoupNearMe` : 'FindSoupNearMe - Find The Best Soup Near You'}</title>
        <meta name="description" content={description || 'Discover the best soup restaurants near you. Find ramen, pho, chowder, and more at top-rated restaurants.'} />
        <link rel="icon" href="/images/soup-logo.svg" type="image/svg+xml" />
      </Head>

      {/* Modern Navigation Bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100/50' 
            : 'bg-white'
        }`}
        aria-label="Site navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <img 
                  src="/images/logo.svg" 
                  alt="FindSoup Logo" 
                  className="w-10 h-10 transition-transform duration-200 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-['Outfit'] font-bold text-neutral-900 tracking-tight">
                  FindSoup
                </span>
                <span className="text-[10px] font-['Inter'] font-medium text-orange-600 -mt-1 tracking-wide">
                  NEAR ME
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/restaurants"
                className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              >
                Restaurants
              </Link>
              <Link
                href="/cities"
                className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              >
                Cities
              </Link>
              <Link
                href="/soup-types"
                className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              >
                Soup Types
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              >
                About
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search Icon Button - Shows when scrolled */}
              {isScrolled && (
                <Link
                  href="/restaurants"
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 transition-colors"
                  aria-label="Search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </Link>
              )}

              {/* Auth Buttons */}
              {!user ? (
                <>
                  <Link 
                    href="/auth/login" 
                    className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-5 py-2.5 text-[15px] font-['Inter'] font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/dashboard" 
                    className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => { await signOut(); }}
                    className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Sign out
                  </button>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-['Inter'] font-bold text-sm shadow-sm">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className={`block w-5 h-0.5 bg-neutral-800 rounded-full transition-all duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-neutral-800 rounded-full transition-all duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-neutral-800 rounded-full transition-all duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`lg:hidden bg-white border-t border-neutral-100 transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-6 space-y-1">
            <Link 
              href="/restaurants" 
              className="block px-4 py-3 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Restaurants
            </Link>
            <Link 
              href="/cities" 
              className="block px-4 py-3 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cities
            </Link>
            <Link 
              href="/soup-types" 
              className="block px-4 py-3 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Soup Types
            </Link>
            <Link 
              href="/about" 
              className="block px-4 py-3 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            <div className="h-px bg-neutral-100 my-4"></div>

            {!user ? (
              <div className="space-y-2 pt-2">
                <Link 
                  href="/auth/login" 
                  className="block w-full px-4 py-3 text-center text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link 
                  href="/auth/register" 
                  className="block w-full px-4 py-3 text-center text-[15px] font-['Inter'] font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <Link 
                  href="/dashboard" 
                  className="block w-full px-4 py-3 text-center text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => { await signOut(); setIsMobileMenuOpen(false); }}
                  className="block w-full px-4 py-3 text-center text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-50 rounded-lg transition-colors"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
