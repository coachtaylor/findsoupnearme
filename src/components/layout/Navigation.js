// src/components/layout/Navigation.js
import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
            <div className="relative w-[70px] h-[70px] flex items-center justify-center">
              <img 
                src="/images/logo.svg" 
                alt="FindSoup Logo" 
                className="w-[70px] h-[70px] transition-transform duration-200 group-hover:scale-110"
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
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/restaurants" 
              className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
            >
              Restaurants
            </Link>
            <Link 
              href="/about" 
              className="px-4 py-2 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
            >
              About
            </Link>
          </nav>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <Link 
              href="/restaurants/search" 
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[15px] font-['Inter'] font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              Find Soup
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <span className={`block w-5 h-0.5 bg-neutral-800 rounded-full transition-all duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-neutral-800 rounded-full transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-neutral-800 rounded-full transition-all duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-white border-t border-neutral-100 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-6 space-y-1">
          <Link 
            href="/restaurants" 
            className="block px-4 py-3 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Restaurants
          </Link>
          
          <Link 
            href="/about" 
            className="block px-4 py-3 text-[15px] font-['Inter'] font-medium text-neutral-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>

          <div className="pt-4">
            <Link 
              href="/restaurants/search" 
              className="flex items-center justify-center gap-2 w-full px-4 py-3 text-[15px] font-['Inter'] font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              Find Soup Near Me
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
