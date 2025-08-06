// src/pages/index.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useRestaurants from '../hooks/useRestaurants';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch featured restaurants
  const { 
    restaurants: featuredRestaurants, 
    loading: featuredLoading, 
    error: featuredError 
  } = useRestaurants({ 
    featured: true, 
    limit: 6 
  });
  
  // You could also fetch restaurants by city
  const [selectedCity, setSelectedCity] = useState('New York');
  const { 
    restaurants: cityRestaurants, 
    loading: cityLoading, 
    error: cityError 
  } = useRestaurants({ 
    city: selectedCity, 
    limit: 3 
  });
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Check if input is a ZIP code (5 digits)
    const isZipCode = /^\d{5}$/.test(searchQuery.trim());
    
    // Map of known city names to their state/city URL paths
    const cityMapping = {
      'new york': '/ny/new-york/restaurants',
      'los angeles': '/ca/los-angeles/restaurants',
      'chicago': '/il/chicago/restaurants',
      'houston': '/tx/houston/restaurants',
      'miami': '/fl/miami/restaurants',
      'seattle': '/wa/seattle/restaurants',
      'phoenix': '/az/phoenix/restaurants',
      'austin': '/tx/austin/restaurants',
      'dallas': '/tx/dallas/restaurants',
      'san francisco': '/ca/san-francisco/restaurants',
      'san diego': '/ca/san-diego/restaurants',
      'philadelphia': '/pa/philadelphia/restaurants'
    };
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    // First check if it's a direct city match
    if (cityMapping[normalizedQuery]) {
      router.push(cityMapping[normalizedQuery]);
      return;
    }
    
    // Then check if it's a Phoenix ZIP code
    if (isZipCode && searchQuery.startsWith('85')) {
      router.push('/az/phoenix/restaurants');
      return;
    }
    
    // Otherwise, go to the restaurant search page with the query
    router.push(`/restaurants?location=${encodeURIComponent(searchQuery)}`);
  };
  
  // Detect user's location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Could integrate with a geocoding service to get city name
          // For now, just show coordinates in the search input
          setSearchQuery(`Near Me (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not detect your location. Please enter it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  
  // Popular cities list for the UI
  const popularCities = [
    { name: 'New York', state: 'NY' },
    { name: 'Los Angeles', state: 'CA' },
    { name: 'Chicago', state: 'IL' },
    { name: 'San Francisco', state: 'CA' },
    { name: 'Seattle', state: 'WA' },
    { name: 'Miami', state: 'FL' }
  ];
  
  // Soup type quick filters
  const quickFilters = [
    { name: 'Ramen', emoji: '🍜', type: 'ramen' },
    { name: 'Stew', emoji: '🍲', type: 'stew' },
    { name: 'Chowder', emoji: '🥣', type: 'chowder' }
  ];
  
  const handleQuickFilter = (soupType) => {
    router.push(`/restaurants?soupType=${soupType}`);
  };
  
  return (
    <div>
      <Head>
        <title>FindSoupNearMe - Discover the Best Soup Restaurants Near You</title>
        <meta name="description" content="Find the best soup restaurants in your city. Discover delicious ramen, pho, chowder, and more at top-rated restaurants." />
      </Head>
      
      {/* Clean Hero with Accent Elements */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        {/* Accent Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-soup-red-100 rounded-full -mr-32 -mt-32 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-soup-orange-100 rounded-full -ml-24 -mb-24 opacity-70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-soup-red-100 text-soup-red-600 rounded-full text-sm font-medium mb-6">
              🍜 Discover 10,000+ Soup Restaurants
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              The Best <span className="text-soup-red-500">Soup</span> Near You
            </h1>
            
            <p className="text-soup-brown-700 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              From hearty ramen to comforting chowder, find your perfect bowl across 11 major US cities
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-soup-brown-400">📍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your city or ZIP code"
                    className="w-full pl-12 pr-12 py-4 bg-white rounded-lg border border-soup-brown-200 shadow-md focus:outline-none focus:ring-2 focus:ring-soup-red-400 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-soup-brown-500 hover:text-soup-red-500 transition-colors"
                    title="Use my current location"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="px-8 py-4 bg-soup-red-500 hover:bg-soup-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  <span>Search</span>
                </button>
              </div>
            </form>
            
            {/* Quick Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {quickFilters.map((filter) => (
                <button
                  key={filter.type}
                  type="button"
                  onClick={() => handleQuickFilter(filter.type)}
                  className="px-5 py-2.5 bg-white rounded-full border border-soup-brown-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 text-soup-brown-700 hover:bg-soup-red-50"
                >
                  <span className="text-xl">{filter.emoji}</span>
                  <span>{filter.name}</span>
                </button>
              ))}
            </div>
            
            {/* Popular Cities */}
            <div className="hidden md:block">
              <p className="text-soup-brown-500 mb-3 text-sm font-medium">Popular Cities:</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {popularCities.map((city) => (
                  <Link
                    key={city.name}
                    href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                    className="text-soup-red-500 hover:text-soup-red-600 text-sm font-medium hover:underline"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Restaurants Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-soup-brown-900">
              Featured Soup Spots
            </h2>
            <Link href="/restaurants" className="text-soup-red-500 hover:text-soup-red-600 font-medium flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {featuredError && (
            <div className="text-red-500 text-center mb-8">
              Error loading featured restaurants. Please try again later.
            </div>
          )}
          
          {featuredLoading ? (
            <SkeletonLoader count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* City Section with Modern Design */}
      <section className="py-16 bg-soup-red-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-soup-brown-900">
              {selectedCity} Favorites
            </h2>
            <div className="hidden md:block">
              <div className="flex space-x-2">
                {popularCities.slice(0, 4).map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city.name)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      selectedCity === city.name
                        ? 'bg-soup-red-500 text-white'
                        : 'bg-white text-soup-brown-700 hover:bg-soup-red-100'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {cityError && (
            <div className="text-red-500 text-center mb-8">
              Error loading restaurants. Please try again later.
            </div>
          )}
          
          {cityLoading ? (
            <SkeletonLoader count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cityRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link 
              href={`/${selectedCity.split(' ')[0] === 'New' ? 'ny' : selectedCity.substring(0, 2).toLowerCase()}/${selectedCity.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
              className="inline-block px-8 py-3 bg-soup-red-500 hover:bg-soup-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Explore All {selectedCity} Restaurants
            </Link>
          </div>
        </div>
      </section>
      
      {/* Discover Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-soup-brown-50 to-soup-orange-50 rounded-2xl p-8 md:p-12 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <span className="inline-block px-4 py-1 bg-soup-orange-100 text-soup-orange-500 rounded-full text-sm font-semibold mb-4">
                    Did You Know?
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-soup-brown-900 mb-4">
                    Every City Has Its Unique Soup Culture
                  </h2>
                  <p className="text-soup-brown-700 mb-6">
                    From New York's classic chicken noodle to San Francisco's clam chowder in sourdough bread bowls, every city has signature soups worth discovering.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center">
                      <span className="text-2xl mr-3">🍜</span>
                      <div>
                        <p className="font-medium text-soup-brown-900">Ramen</p>
                        <p className="text-sm text-soup-brown-600">30+ spots</p>
                      </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center">
                      <span className="text-2xl mr-3">🥣</span>
                      <div>
                        <p className="font-medium text-soup-brown-900">Chowder</p>
                        <p className="text-sm text-soup-brown-600">42+ spots</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                      alt="Delicious ramen" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-5 -left-5 bg-white rounded-lg shadow-md p-3 hidden md:block">
                    <div className="flex items-center">
                      <div className="bg-soup-red-500 rounded-full w-3 h-3 mr-2"></div>
                      <span className="text-sm font-medium">Live: 435+ active restaurants</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}