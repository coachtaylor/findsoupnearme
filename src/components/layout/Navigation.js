// src/components/layout/Navigation.js
import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Menu */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-display font-bold text-primary-500 hover:text-primary-600 transition-colors">
                FindSoupNearMe
              </Link>
            </div>
            
            <div className="hidden md:ml-8 md:flex md:items-center space-x-1">
              <Link 
                href="/restaurants" 
                className="px-3 py-2 rounded-lg text-neutral-700 hover:text-primary-500 hover:bg-neutral-50 transition-colors"
              >
                All Restaurants
              </Link>
              <Link 
                href="/cities" 
                className="px-3 py-2 rounded-lg text-neutral-700 hover:text-primary-500 hover:bg-neutral-50 transition-colors"
              >
                Cities
              </Link>
              <Link 
                href="/about" 
                className="px-3 py-2 rounded-lg text-neutral-700 hover:text-primary-500 hover:bg-neutral-50 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
          
          {/* Desktop Action Button */}
          <div className="hidden md:flex md:items-center">
            <Link 
              href="/restaurants/search" 
              className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl shadow-soft hover:shadow-md transition-all duration-300"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
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
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-neutral-700 hover:text-primary-500 hover:bg-neutral-50 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              
              {/* Menu Closed Icon */}
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
              
              {/* Menu Open Icon */}
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
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden animate-fade-in`} 
        id="mobile-menu"
      >
        <div className="px-4 pt-2 pb-4 space-y-1 bg-white border-t border-neutral-100 shadow-md">
          <Link 
            href="/restaurants" 
            className="block px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:text-primary-500 hover:bg-neutral-50 transition-colors"
          >
            All Restaurants
          </Link>
          
          <Link 
            href="/cities" 
            className="block px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:text-primary-500 hover:bg-neutral-50 transition-colors"
          >
            Cities
          </Link>
          
          <Link 
            href="/about" 
            className="block px-4 py-3 rounded-lg text-base font-medium text-neutral-700 hover:text-primary-500 hover:bg-neutral-50 transition-colors"
          >
            About
          </Link>
          
          <Link 
            href="/restaurants/search" 
            className="flex items-center mt-3 px-4 py-3 rounded-lg text-base font-medium text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-soft"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
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
    </nav>
  );
}