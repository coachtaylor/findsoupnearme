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
                <Link href="/" className="text-2xl font-bold text-primary-500">
                  FindSoupNearMe
                </Link>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center">
                <Link href="/restaurants" className="px-3 py-2 text-neutral-700 hover:text-primary-500">
                  All Restaurants
                </Link>
                <Link href="/cities" className="px-3 py-2 text-neutral-700 hover:text-primary-500">
                  Cities
                </Link>
                <Link href="/about" className="px-3 py-2 text-neutral-700 hover:text-primary-500">
                  About
                </Link>
              </div>
            </div>
            
            <div className="hidden md:flex md:items-center">
              <Link 
                href="/restaurants/search" 
                className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded"
              >
                Find Soup Near Me
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded text-neutral-700 hover:text-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>
        
        {/* Mobile menu */}
        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/restaurants" className="block px-3 py-2 text-neutral-700 hover:text-primary-500">
              All Restaurants
            </Link>
            <Link href="/cities" className="block px-3 py-2 text-neutral-700 hover:text-primary-500">
              Cities
            </Link>
            <Link href="/about" className="block px-3 py-2 text-neutral-700 hover:text-primary-500">
              About
            </Link>
            <Link href="/restaurants/search" className="block px-3 py-2 text-primary-500 hover:text-primary-600">
              Find Soup Near Me
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-neutral-900 text-white py-8">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} FindSoupNearMe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}