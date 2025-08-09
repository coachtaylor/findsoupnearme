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
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title ? `${title} | FindSoupNearMe` : 'FindSoupNearMe - Find The Best Soup Near You'}</title>
        <meta name="description" content={description || 'Discover the best soup restaurants near you. Find ramen, pho, chowder, and more at top-rated restaurants.'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Floating Glass Navigation */}
      <header
        className={
          `fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ` +
          `w-[min(100%-2rem,theme(maxWidth.7xl))] ` +
          `${isScrolled ? 'scale-[0.99]' : 'scale-100'}`
        }
        aria-label="Site navigation"
      >
        <div
          className={
            `rounded-2xl border shadow-lg backdrop-blur-xl bg-white/75 ` +
            `transition-all duration-300 ` +
            `${isScrolled ? 'py-2 border-white/50 shadow-md bg-white/70' : 'py-3 md:py-4 border-white/60'}`
          }
        >
          <div className="px-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center group" aria-label="Go to homepage">
                <span className="relative inline-flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-sm">
                  <svg
                    viewBox="0 0 48 48"
                    className="w-6 h-6"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <defs>
                      <linearGradient id="logoSoupGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                    {/* steam */}
                    <path d="M16 10c2 2 0 4-2 6M24 8c2 2 0 4-2 6M32 10c2 2 0 4-2 6"
                      fill="none" stroke="url(#logoSoupGrad)" strokeWidth="2.2" strokeLinecap="round"
                      className="opacity-80" />
                    {/* bowl */}
                    <path d="M10 22c0 7 7 12 14 12s14-5 14-12"
                      fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                    {/* rim */}
                    <path d="M8 22h32" stroke="url(#logoSoupGrad)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className={`font-extrabold tracking-tight transition-all ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
                  <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Find</span>
                  <span className="text-neutral-900">Soup</span>
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">NearMe</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2 lg:gap-6">
                <Link
                  href="/restaurants"
                  className="relative px-2 py-2 text-neutral-700 hover:text-orange-600 transition-colors group"
                >
                  <span className="font-medium">All Restaurants</span>
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                </Link>
                <Link
                  href="/cities"
                  className="relative px-2 py-2 text-neutral-700 hover:text-orange-600 transition-colors group"
                >
                  <span className="font-medium">Cities</span>
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                </Link>
                <Link
                  href="/soup-types"
                  className="relative px-2 py-2 text-neutral-700 hover:text-orange-600 transition-colors group"
                >
                  <span className="font-medium">Soup Types</span>
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                </Link>
                <Link
                  href="/about"
                  className="relative px-2 py-2 text-neutral-700 hover:text-orange-600 transition-colors group"
                >
                  <span className="font-medium">About</span>
                  <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              </nav>

              {/* Right-side actions */}
              <div className="hidden md:flex items-center gap-2">
                {/* Quick Search - subtle, visible when scrolled */}
                <form action="/restaurants" method="get" className={`relative transition-opacity ${isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'} mr-2`}>
                  <input
                    type="text"
                    name="location"
                    placeholder="Quick search..."
                    className="pl-4 pr-10 py-2 bg-white/70 border border-white/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-300/60 focus:border-orange-400/60 shadow-sm"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>

                {/* Auth */}
                {!user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login" className="px-4 py-2 rounded-full text-sm font-medium text-neutral-700 hover:text-orange-600 transition-colors">
                      Sign in
                    </Link>
                    <Link href="/auth/register" className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm hover:from-orange-600 hover:to-orange-700 transition-colors">
                      Get Started
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="px-3 py-2 rounded-full text-sm font-medium text-neutral-700 hover:text-orange-600 transition-colors">
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => { await signOut(); }}
                      className="px-3 py-2 rounded-full text-sm font-medium text-neutral-700 hover:text-orange-600 transition-colors"
                    >
                      Sign out
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold shadow-sm">
                      {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                )}

                {/* Mobile Menu Button placeholder to align layout */}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden relative inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`block w-5 h-0.5 bg-neutral-800 transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-neutral-800 transition-opacity ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'} my-1`}></span>
                <span className={`block w-5 h-0.5 bg-neutral-800 transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`}></span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-4 pb-4 pt-2">
              <nav className="flex flex-col">
                <Link href="/restaurants" className="px-4 py-3 rounded-xl text-neutral-800 hover:text-orange-600 hover:bg-orange-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  All Restaurants
                </Link>
                <Link href="/cities" className="px-4 py-3 rounded-xl text-neutral-800 hover:text-orange-600 hover:bg-orange-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Cities
                </Link>
                <Link href="/soup-types" className="px-4 py-3 rounded-xl text-neutral-800 hover:text-orange-600 hover:bg-orange-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Soup Types
                </Link>
                <Link href="/about" className="px-4 py-3 rounded-xl text-neutral-800 hover:text-orange-600 hover:bg-orange-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  About
                </Link>

                <form action="/restaurants" method="get" className="relative mt-2" onSubmit={() => setIsMobileMenuOpen(false)}>
                  <input
                    type="text"
                    name="location"
                    placeholder="Search soups near you..."
                    className="w-full pl-4 pr-10 py-3 bg-white/70 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300/60 focus:border-orange-400/60 shadow-sm"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>

                <div className="mt-2 flex items-center gap-2">
                  {!user ? (
                    <>
                      <Link href="/auth/login" className="flex-1 px-4 py-3 rounded-xl text-center font-medium text-neutral-800 hover:text-orange-600 hover:bg-orange-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign in
                      </Link>
                      <Link href="/auth/register" className="flex-1 px-4 py-3 rounded-xl text-center font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm hover:from-orange-600 hover:to-orange-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/dashboard" className="flex-1 px-4 py-3 rounded-xl text-center font-medium text-neutral-800 hover:text-orange-600 hover:bg-orange-50 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                      <button
                        onClick={async () => { await signOut(); setIsMobileMenuOpen(false); }}
                        className="flex-1 px-4 py-3 rounded-xl text-center font-medium text-neutral-800 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 sm:pt-28">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}