// src/pages/about/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { LAUNCH_CITIES } from '../../lib/launch-cities';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  HeartIcon,
  ShieldCheckIcon,
  HomeIcon,
  GlobeAltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Client-side detection
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Scroll position tracking
  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setScrollY(scrollY);
      setScrollProgress(scrollY / (documentHeight - windowHeight));
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);
  
  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <Head>
        <title>About FindSoupNearMe | Find The Best Soup Near You</title>
        <meta name="description" content="Learn about FindSoupNearMe, the #1 platform for discovering, rating, and ordering soup from restaurants across U.S. cities." />
      </Head>
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] transform origin-left transition-transform duration-300"
           style={{ transform: `scaleX(${scrollProgress})` }}></div>
      
      {/* Hero Header Section */}
      <section className="relative pt-12 md:pt-16 pb-12 md:pb-16 bg-gradient-to-b from-[rgb(var(--bg))] via-[rgb(var(--bg))] to-[rgb(var(--accent-light-light))] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[rgb(var(--accent))] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[rgb(var(--primary))] rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[rgb(var(--ink))] leading-[1.1]">
                  The Story Behind
                  <span className="block text-[rgb(var(--accent))] mt-2">FindSoupNearMe</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-[rgb(var(--muted))] leading-relaxed max-w-2xl">
                  We&apos;re on a mission to make finding your perfect bowl of soup as simple as it should be.
                </p>
              </div>
              
              {/* Stats or Key Points */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[rgb(var(--accent))]/10 flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-[rgb(var(--accent))]" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[rgb(var(--ink))]">4</div>
                    <div className="text-sm text-[rgb(var(--muted))]">Launch Cities</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[rgb(var(--primary))]/10 flex items-center justify-center">
                    <BuildingStorefrontIcon className="w-6 h-6 text-[rgb(var(--primary))]" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[rgb(var(--ink))]">100+</div>
                    <div className="text-sm text-[rgb(var(--muted))]">Restaurants</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[rgb(var(--accent))]/10 flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-[rgb(var(--accent))]" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[rgb(var(--ink))]">Soup</div>
                    <div className="text-sm text-[rgb(var(--muted))]">Lovers Served</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Visual Element */}
            <div className="lg:col-span-5 relative">
              <div className="relative">
                {/* Large decorative card */}
                <div className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--bg))] rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-black/5 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[rgb(var(--accent))] flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[rgb(var(--ink))]">Discover</h3>
                        <p className="text-sm text-[rgb(var(--muted))]">Find your perfect soup</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="h-2 bg-[rgb(var(--accent-light))]/30 rounded-full overflow-hidden">
                        <div className="h-full bg-[rgb(var(--accent))] rounded-full w-3/4"></div>
                      </div>
                      <div className="h-2 bg-[rgb(var(--accent-light))]/30 rounded-full overflow-hidden">
                        <div className="h-full bg-[rgb(var(--accent))] rounded-full w-2/3"></div>
                      </div>
                      <div className="h-2 bg-[rgb(var(--accent-light))]/30 rounded-full overflow-hidden">
                        <div className="h-full bg-[rgb(var(--accent))] rounded-full w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Small decorative card */}
                <div className="absolute -bottom-6 -left-6 bg-[rgb(var(--primary))] rounded-2xl p-6 shadow-xl ring-1 ring-black/10 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="text-white">
                    <div className="text-3xl font-bold mb-1">100%</div>
                    <div className="text-sm opacity-90">Free for restaurants</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="pt-8 md:pt-10 pb-12 md:pb-16 bg-[rgb(var(--accent-light-light))]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--bg))] rounded-3xl p-10 md:p-16 shadow-lg ring-1 ring-black/5">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[rgb(var(--accent))] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-6">
                  Our Mission
                </h2>
                <p className="text-lg md:text-xl text-[rgb(var(--muted))] leading-relaxed">
                  Make it effortless to find comforting, high-quality soups nearby, while celebrating the cultures and kitchens that make them. From sinigang and tinola to pho, ramen, chowder, and pozole — we help diners discover the bowls that feel like home, and help local restaurants get found.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* What We Do Section */}
      <section className="py-12 md:py-16 bg-[rgb(var(--bg))]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-4">
              What We Do
            </h2>
            <p className="text-lg md:text-xl text-[rgb(var(--muted))] max-w-2xl mx-auto">
              Local discovery, not noise.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="group bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:ring-[rgb(var(--accent))]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-[rgb(var(--accent-light))]/40 flex items-center justify-center mb-6 group-hover:bg-[rgb(var(--accent))] transition-colors">
                <MagnifyingGlassIcon className="w-7 h-7 text-[rgb(var(--accent))] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-[rgb(var(--ink))] mb-4">Accurate Information</h3>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                Accurate hours, menus, dietary tags, and &quot;open now&quot; filters so you can decide in seconds.
              </p>
            </div>
            
            <div className="group bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:ring-[rgb(var(--accent))]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-[rgb(var(--accent-light))]/40 flex items-center justify-center mb-6 group-hover:bg-[rgb(var(--accent))] transition-colors">
                <MapPinIcon className="w-7 h-7 text-[rgb(var(--accent))] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-[rgb(var(--ink))] mb-4">City & Style Guides</h3>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                Curated lists like Best Pho in Seattle and Gluten-Free Soups in LA, updated with real-world signals.
              </p>
            </div>
            
            <div className="group bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:ring-[rgb(var(--accent))]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-[rgb(var(--accent-light))]/40 flex items-center justify-center mb-6 group-hover:bg-[rgb(var(--accent))] transition-colors">
                <ShoppingBagIcon className="w-7 h-7 text-[rgb(var(--accent))] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-[rgb(var(--ink))] mb-4">Seamless Ordering</h3>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                One-tap paths to delivery partners or direct ordering, with clear labels and no dark patterns.
              </p>
            </div>
            
            <div className="group bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:ring-[rgb(var(--accent))]/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="w-14 h-14 rounded-xl bg-[rgb(var(--accent-light))]/40 flex items-center justify-center mb-6 group-hover:bg-[rgb(var(--accent))] transition-colors">
                <BuildingStorefrontIcon className="w-7 h-7 text-[rgb(var(--accent))] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-semibold text-[rgb(var(--ink))] mb-4">Restaurant Tools</h3>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                Free claiming and verification, optional upgrades for soup-of-the-day, promos, photo galleries, and insights.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Principles Section */}
      <section className="py-12 md:py-16 bg-[rgb(var(--accent-light-light))]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-4">
              Our Principles
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 border-l-4 border-[rgb(var(--accent))]">
              <div className="flex items-center gap-3 mb-4">
                <HeartIcon className="w-6 h-6 text-[rgb(var(--accent))]" />
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))]">Food is a Bridge</h3>
              </div>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                We celebrate cultural roots and new traditions with respect and proper naming.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 border-l-4 border-[rgb(var(--primary))]">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-[rgb(var(--primary))]" />
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))]">Trust Beats Hype</h3>
              </div>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                Clear info, transparent rankings, and verified-visit reviews.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 border-l-4 border-[rgb(var(--accent))]">
              <div className="flex items-center gap-3 mb-4">
                <HomeIcon className="w-6 h-6 text-[rgb(var(--accent))]" />
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))]">Local First</h3>
              </div>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                Independent restaurants and neighborhood spots get real visibility.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 border-l-4 border-[rgb(var(--primary))]">
              <div className="flex items-center gap-3 mb-4">
                <GlobeAltIcon className="w-6 h-6 text-[rgb(var(--primary))]" />
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))]">Accessibility by Default</h3>
              </div>
              <p className="text-base text-[rgb(var(--muted))] leading-7">
                Readable contrast, keyboard navigation, and straightforward language.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-[rgb(var(--bg))]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[rgb(var(--muted))]">Simple steps to find your perfect soup</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--bg))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-[rgb(var(--accent))] text-white flex items-center justify-center font-bold text-2xl shadow-md mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))] mb-3">Explore</h3>
                <p className="text-base text-[rgb(var(--muted))] leading-7">
                  Search by city, soup style, diet, price, or &quot;open now.&quot;
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-center gap-2 text-sm text-[rgb(var(--muted))]">
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  <span>Browse & Filter</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--bg))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-[rgb(var(--accent))] text-white flex items-center justify-center font-bold text-2xl shadow-md mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))] mb-3">Decide</h3>
                <p className="text-base text-[rgb(var(--muted))] leading-7">
                  Skim photos, menus, ratings, and today&apos;s specials.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-center gap-2 text-sm text-[rgb(var(--muted))]">
                  <StarIcon className="w-4 h-4" />
                  <span>Compare & Review</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--bg))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-[rgb(var(--accent))] text-white flex items-center justify-center font-bold text-2xl shadow-md mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))] mb-3">Enjoy</h3>
                <p className="text-base text-[rgb(var(--muted))] leading-7">
                  Order via DoorDash/Uber Eats or go direct — your call.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-center gap-2 text-sm text-[rgb(var(--muted))]">
                  <ShoppingBagIcon className="w-4 h-4" />
                  <span>Order & Enjoy</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--bg))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-[rgb(var(--accent))] text-white flex items-center justify-center font-bold text-2xl shadow-md mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--ink))] mb-3">Support</h3>
                <p className="text-base text-[rgb(var(--muted))] leading-7">
                  Leave a helpful review and save favorites.
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-center gap-2 text-sm text-[rgb(var(--muted))]">
                  <HeartIcon className="w-4 h-4" />
                  <span>Share & Save</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* For Restaurants Section */}
      <section className="py-12 md:py-16 bg-[rgb(var(--accent-light-light))]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-gradient-to-br from-[rgb(var(--surface))] to-[rgb(var(--bg))] rounded-3xl p-10 md:p-16 shadow-lg ring-1 ring-black/5">
            <div className="flex items-start gap-4 mb-8">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[rgb(var(--primary))] flex items-center justify-center">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-6">
                  For Restaurants
                </h2>
              </div>
            </div>
            
            <div className="space-y-6 mb-8">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[rgb(var(--accent))] mt-2"></div>
                <div>
                  <p className="text-base md:text-lg text-[rgb(var(--muted))] leading-7">
                    <strong className="text-[rgb(var(--ink))]">Free to claim, verification included.</strong> Keep hours, menus, and links accurate.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[rgb(var(--accent))] mt-2"></div>
                <div>
                  <p className="text-base md:text-lg text-[rgb(var(--muted))] leading-7">
                    <strong className="text-[rgb(var(--ink))]">Upgrade when it makes sense.</strong> Feature your soup-of-the-day, highlight promos, add galleries, and see clicks, calls, and directions in your dashboard.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[rgb(var(--accent))] mt-2"></div>
                <div>
                  <p className="text-base md:text-lg text-[rgb(var(--muted))] leading-7">
                    <strong className="text-[rgb(var(--ink))]">No gimmicks.</strong> Clear pricing, cancel anytime, real outcomes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[rgb(var(--accent))] hover:opacity-90 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Submit Your Restaurant</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quality & Integrity Section */}
      <section className="py-12 md:py-16 bg-[rgb(var(--bg))]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-4">
              Quality & Integrity
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 text-center">
              <div className="w-16 h-16 rounded-xl bg-[rgb(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-[rgb(var(--primary))]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--ink))] mb-3">Data Standards</h3>
              <p className="text-sm text-[rgb(var(--muted))] leading-6">
                We validate business details, surface recent updates, and flag stale info.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 text-center">
              <div className="w-16 h-16 rounded-xl bg-[rgb(var(--accent))]/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-[rgb(var(--accent))]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--ink))] mb-3">Review Integrity</h3>
              <p className="text-sm text-[rgb(var(--muted))] leading-6">
                Verified-visit QR, moderation for fairness, and owner responses visible.
              </p>
            </div>
            
            <div className="bg-[rgb(var(--surface))] rounded-2xl p-8 shadow-sm ring-1 ring-black/5 text-center">
              <div className="w-16 h-16 rounded-xl bg-[rgb(var(--primary))]/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-[rgb(var(--primary))]" />
              </div>
              <h3 className="text-lg font-semibold text-[rgb(var(--ink))] mb-3">Disclosure</h3>
              <p className="text-sm text-[rgb(var(--muted))] leading-6">
                Sponsored placements and affiliate links are labeled.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Soup Section */}
      <section className="py-12 md:py-16 bg-[rgb(var(--accent-light-light))]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] rounded-3xl p-10 md:p-16 shadow-xl text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-6">
              Why Soup?
            </h2>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
              Because soup is universal — comfort, culture, and care in one bowl. Our platform honors that, lifting up community recipes like sinigang and tinola alongside global favorites, so anyone can find the warmth they&apos;re looking for, fast.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
