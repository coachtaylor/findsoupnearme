// src/components/layout/Navigation.js
import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-soup-red-600">
                FindSoupNearMe
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center">
              {/* Add the restaurant listing links here */}
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
      </div>
      
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
    </nav>
  );
}