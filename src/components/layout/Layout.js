// src/components/layout/Layout.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Footer from './Footer';

export default function Layout({ children, title, description }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle scroll event to show sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title ? `${title} | FindSoupNearMe` : 'FindSoupNearMe - Find The Best Soup Near You'}</title>
        <meta name="description" content={description || 'Discover the best soup restaurants near you. Find ramen, pho, chowder, and more at top-rated restaurants.'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Main Header */}
      <header className={`bg-white transition-all duration-300 z-50 ${isScrolled ? 'shadow-md sticky top-0 py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#F76E6E]">
                Find<span className="text-soup-brown-900">Soup</span>Near<span className="text-[#F7941E]">Me</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/restaurants" className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium">
                All Restaurants
              </Link>
              <Link href="/cities" className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium">
                Cities
              </Link>
              <Link href="/soup-types" className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium">
                Soup Types
              </Link>
              <Link href="/about" className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium">
                About
              </Link>
            </nav>
            
            {/* Mini Search (visible in sticky mode) */}
            {isScrolled && (
              <div className="hidden md:flex items-center">
                <form action="/restaurants" method="get" className="relative">
                  <input 
                    type="text" 
                    name="location" 
                    placeholder="Quick search..." 
                    className="pl-4 pr-10 py-2 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#F76E6E] w-48" 
                  />
                  <button 
                    type="submit" 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soup-brown-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden flex flex-col space-y-1.5" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-soup-brown-900 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-soup-brown-900 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-soup-brown-900 transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 mt-4' : 'max-h-0'}`}>
            <nav className="flex flex-col space-y-4 py-4">
              <Link 
                href="/restaurants" 
                className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Restaurants
              </Link>
              <Link 
                href="/cities" 
                className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Cities
              </Link>
              <Link 
                href="/soup-types" 
                className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Soup Types
              </Link>
              <Link 
                href="/about" 
                className="text-soup-brown-700 hover:text-[#F76E6E] transition-colors font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {/* Mobile Search */}
              <form 
                action="/restaurants" 
                method="get" 
                className="relative mt-2"
                onSubmit={() => setIsMobileMenuOpen(false)}
              >
                <input 
                  type="text" 
                  name="location" 
                  placeholder="Search for soup near you..." 
                  className="w-full pl-4 pr-10 py-3 bg-neutral-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F76E6E]" 
                />
                <button 
                  type="submit" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-soup-brown-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}