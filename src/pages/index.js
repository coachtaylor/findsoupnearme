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
  
  // Popular cities list for the UI
  const popularCities = [
    { name: 'New York', state: 'NY' },
    { name: 'Los Angeles', state: 'CA' },
    { name: 'Chicago', state: 'IL' },
    { name: 'San Francisco', state: 'CA' },
    { name: 'Seattle', state: 'WA' },
    { name: 'Miami', state: 'FL' }
  ];
  
  return (
    <div>
      <Head>
        <title>FindSoupNearMe - Discover the Best Soup Restaurants Near You</title>
        <meta name="description" content="Find the best soup restaurants in your city. Browse reviews, menus, and order soup online." />
      </Head>
      
      {/* Hero Section with Modern Design */}
      <section 
        className="relative py-20 md:py-32 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #FFF6ED 0%, #FFE2E2 50%, #FFC7C7 100%)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FFC7C7] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-80 h-80 bg-[#FFD8A9] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-72 h-72 bg-[#FFE2E2] rounded-full opacity-30 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-soup-brown-900 mb-6 leading-tight">
              Find the Perfect Bowl of 
              <span className="text-[#F76E6E] block mt-2">Soup Near You</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-soup-brown-700 mb-10 leading-relaxed">
              Discover, rate, and order from the best soup restaurants in your city.
            </p>
            
            {/* Modern Search Form with Button */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex items-center bg-white rounded-full overflow-hidden shadow-xl border border-gray-100">
                <input
                  type="text"
                  placeholder="Enter city, ZIP code, or location..."
                  className="flex-grow px-6 py-4 text-gray-700 focus:outline-none border-0 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-[#F76E6E] hover:bg-[#E55959] text-white px-8 py-4 flex items-center transition-all duration-300 hover:px-10"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      
      {/* Featured Restaurants Section */}
      <section className="py-16 bg-white relative">
        <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-[#FFE2E2] to-white opacity-50"></div>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-soup-brown-900 mb-3 text-center">
            Featured Soup Spots
          </h2>
          <p className="text-center text-soup-brown-600 mb-12 max-w-2xl mx-auto">
            Discover our handpicked selection of the best soup restaurants, offering everything from hearty ramen to comforting chowder.
          </p>
          
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
          
          <div className="text-center mt-12">
            <Link href="/restaurants" className="inline-block bg-[#F76E6E] hover:bg-[#E55959] text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-lg hover:px-10">
              View All Restaurants
            </Link>
          </div>
        </div>
      </section>
      
      {/* City Section with Modern Design */}
      <section className="py-16 relative" style={{ background: "linear-gradient(135deg, #FFF9F9 0%, #FFF0E5 100%)" }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-soup-brown-900 mb-3 text-center">
            Explore Soup by City
          </h2>
          <p className="text-center text-soup-brown-600 mb-10 max-w-2xl mx-auto">
            Every city has its own unique soup culture. Discover what makes each location special.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {popularCities.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city.name)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCity === city.name
                    ? 'bg-[#F76E6E] text-white shadow-md'
                    : 'bg-white text-soup-brown-800 hover:bg-[#FEE2E2] hover:shadow-md'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
          
          {cityError && (
            <div className="text-red-500 text-center mb-8">
              Error loading restaurants. Please try again later.
            </div>
          )}
          
          {cityLoading ? (
            <SkeletonLoader count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cityRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              href={`/${selectedCity.toLowerCase().replace(' ', '-')}/restaurants`}
              className="inline-block bg-[#F76E6E] hover:bg-[#E55959] text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-lg hover:px-10"
            >
              See All in {selectedCity}
            </Link>
          </div>
        </div>
      </section>
      
      {/* About Section with Modern Design */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-soup-brown-900 mb-3 text-center">
            About FindSoupNearMe
          </h2>
          <p className="text-center text-soup-brown-600 mb-10 max-w-2xl mx-auto">
            We're passionate about connecting soup lovers with their perfect bowl.
          </p>
          
          <div className="bg-gradient-to-br from-[#FFF6ED] to-[#FFE2E2] p-8 rounded-2xl shadow-sm">
            <p className="text-lg text-soup-brown-700 mb-4 leading-relaxed">
              FindSoupNearMe is the #1 platform for discovering and ordering soup from restaurants across the U.S. Whether you're craving a steaming bowl of ramen, a hearty chowder, or a classic chicken noodle, we've got you covered.
            </p>
            <p className="text-lg text-soup-brown-700 mb-4 leading-relaxed">
              With detailed restaurant listings, reviews from fellow soup lovers, and easy ordering options, finding your perfect bowl has never been easier.
            </p>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/about" className="inline-flex items-center text-[#F76E6E] hover:text-[#E55959] font-semibold transition-all duration-300">
              <span>Learn more about our story</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}