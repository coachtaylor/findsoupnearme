// src/pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const SearchBar = dynamic(() => import('../components/search/SearchBar'), { ssr: false });
import { useRouter } from 'next/router';
import useRestaurants from '../hooks/useRestaurants';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import { MagnifyingGlassIcon, MapPinIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Fetch featured restaurants
  const { 
    restaurants: featuredRestaurants, 
    loading: featuredLoading, 
    error: featuredError 
  } = useRestaurants({ 
    featured: true, 
    limit: 6 
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Popular cities
  const popularCities = [
    { name: 'New York', state: 'NY', count: '245+' },
    { name: 'Los Angeles', state: 'CA', count: '198+' },
    { name: 'Chicago', state: 'IL', count: '167+' },
    { name: 'San Francisco', state: 'CA', count: '189+' },
    { name: 'Seattle', state: 'WA', count: '156+' },
    { name: 'Miami', state: 'FL', count: '178+' },
  ];

  // Quick soup filters
  const soupCategories = [
    { name: 'Ramen', color: 'from-orange-400 to-red-500' },
    { name: 'Pho', color: 'from-green-400 to-teal-500' },
    { name: 'Chowder', color: 'from-blue-400 to-indigo-500' },
    { name: 'Bisque', color: 'from-pink-400 to-rose-500' },
  ];

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/restaurants?location=${encodeURIComponent(searchQuery)}`);
  };

  // How it works steps
  const howItWorks = [
    { 
      icon: MapPinIcon, 
      title: 'Find Your Location', 
      description: 'Search by city, ZIP code, or use your current location' 
    },
    { 
      icon: MagnifyingGlassIcon, 
      title: 'Browse Soup Spots', 
      description: 'Explore restaurants by soup type, ratings, and more' 
    },
    { 
      icon: StarIcon, 
      title: 'Read Reviews', 
      description: 'Check ratings and reviews from soup lovers like you' 
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <Head>
        <title>FindSoupNearMe - Discover the Best Soup Restaurants Near You</title>
        <meta name="description" content="Find the best soup restaurants in your city. Discover delicious ramen, pho, chowder, and more at top-rated restaurants." />
      </Head>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-full border border-orange-200/50 mb-8 animate-fade-in-scale">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-['Inter'] font-semibold text-orange-700">10,000+ Restaurants Listed</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-['Outfit'] font-bold text-neutral-900 mb-6 leading-[1.1] tracking-tight">
              Find Your Perfect
              <span className="block mt-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                Bowl of Soup
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl lg:text-2xl font-['Inter'] text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              From hearty ramen to comforting chowder, discover the best soup restaurants in your city
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500" />
                    <input
                      type="text"
                      placeholder="Enter your city or ZIP code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-lg rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <MagnifyingGlassIcon className="w-6 h-6" />
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Soup Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="text-sm font-['Inter'] font-medium text-neutral-500 self-center mr-2">Popular:</span>
              {soupCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => router.push(`/soup-types/${category.name.toLowerCase()}`)}
                  className="px-4 py-2 bg-white rounded-lg border border-neutral-200 hover:border-orange-400 hover:shadow-sm transition-all duration-200 group"
                >
                  <span className="text-sm font-['Inter'] font-medium text-neutral-700 group-hover:text-orange-600 transition-colors">{category.name}</span>
                </button>
              ))}
              <Link
                href="/soup-types"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow-md transition-all duration-200 group flex items-center gap-2"
              >
                <span className="text-sm font-['Inter'] font-semibold">View All</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center border border-orange-200/50">
                  <MapPinIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-['Outfit'] font-bold text-neutral-900">11</div>
                  <div className="text-sm font-['Inter'] text-neutral-600">Cities</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center border border-orange-200/50">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-['Outfit'] font-bold text-neutral-900">640+</div>
                  <div className="text-sm font-['Inter'] text-neutral-600">Restaurants</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center border border-orange-200/50">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-['Outfit'] font-bold text-neutral-900">50K+</div>
                  <div className="text-sm font-['Inter'] text-neutral-600">Happy Diners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-['Outfit'] font-bold text-neutral-900 mb-4 tracking-tight">
              Explore Popular Cities
            </h2>
            <p className="text-lg font-['Inter'] text-neutral-600 max-w-2xl mx-auto">
              Browse soup restaurants in major cities across the United States
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center border border-orange-200/50 group-hover:scale-110 transition-transform">
                      <MapPinIcon className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-['Outfit'] font-bold text-neutral-900 group-hover:text-orange-600 transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-sm font-['Inter'] text-neutral-500">{city.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-['Outfit'] font-bold text-orange-600">{city.count}</div>
                    <div className="text-xs font-['Inter'] text-neutral-500">restaurants</div>
                  </div>
                </div>
                <div className="flex items-center text-sm font-['Inter'] font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore restaurants
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/cities" 
              className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl border-2 border-orange-200 hover:bg-orange-50 transition-all duration-200"
            >
              View All Cities
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-4">
              <StarIcon className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-['Inter'] font-semibold text-orange-600">Featured</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-['Outfit'] font-bold text-neutral-900 mb-4 tracking-tight">
              Top Rated Soup Spots
            </h2>
            <p className="text-lg font-['Inter'] text-neutral-600 max-w-2xl mx-auto">
              Handpicked restaurants serving the most delicious soups
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 animate-pulse">
                  <div className="h-48 bg-neutral-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-neutral-200 rounded"></div>
                    <div className="h-4 bg-neutral-100 rounded w-2/3"></div>
                    <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredError ? (
            <div className="text-center py-12 text-red-500">
              Error loading restaurants. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link 
              href="/restaurants" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Browse All Restaurants
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-orange-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-['Outfit'] font-bold text-neutral-900 mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg font-['Inter'] text-neutral-600 max-w-2xl mx-auto">
              Finding your perfect bowl of soup is as easy as 1-2-3
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                
                {/* Card */}
                <div className="bg-white rounded-2xl p-8 pt-12 shadow-sm border border-neutral-100 h-full">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line (hidden on mobile) */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 w-8 h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-['Outfit'] font-bold mb-6 tracking-tight">
              Ready to Find Your Perfect Soup?
            </h2>
            <p className="text-xl font-['Inter'] mb-10 text-orange-50">
              Join thousands of soup lovers discovering amazing restaurants in their city
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/restaurants"
                className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center"
              >
                <MagnifyingGlassIcon className="w-6 h-6 mr-2" />
                Start Exploring
              </Link>
              <Link
                href="/cities"
                className="px-8 py-4 bg-orange-700/50 backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-orange-700/70 transition-all duration-300 inline-flex items-center justify-center"
              >
                <MapPinIcon className="w-6 h-6 mr-2" />
                Browse Cities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
