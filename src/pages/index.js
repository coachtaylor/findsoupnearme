// src/pages/index.js
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useRestaurants from '../hooks/useRestaurants';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import SearchBar from '../components/search/SearchBar'

export default function Home() {
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
      
      {/* Hero Section */}
      <section className="bg-soup-orange-50 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-soup-brown-900 mb-6">
              Find the Perfect Bowl of Soup Near You
            </h1>
            <p className="text-xl text-soup-brown-700 mb-8">
              Discover, rate, and order from the best soup restaurants in your city.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Restaurants Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-soup-brown-900 mb-8 text-center">
            Featured Soup Spots
          </h2>
          
          {featuredError && (
            <div className="text-red-500 text-center mb-8">
              Error loading featured restaurants. Please try again later.
            </div>
          )}
          
          {featuredLoading ? (
            <SkeletonLoader count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link href="/restaurants" className="inline-block bg-soup-red-600 hover:bg-soup-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
              View All Restaurants
            </Link>
          </div>
        </div>
      </section>
      
      {/* City Section */}
      <section className="py-12 bg-soup-orange-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-soup-brown-900 mb-8 text-center">
            Explore Soup by City
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {popularCities.map((city) => (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCity === city.name
                    ? 'bg-soup-red-600 text-white'
                    : 'bg-white text-soup-brown-800 hover:bg-soup-red-100'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cityRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Link 
              href={`/${selectedCity.toLowerCase().replace(' ', '-')}/restaurants`}
              className="inline-block bg-soup-red-600 hover:bg-soup-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              See All in {selectedCity}
            </Link>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-soup-brown-900 mb-6 text-center">
            About FindSoupNearMe
          </h2>
          <p className="text-lg text-soup-brown-700 mb-4">
            FindSoupNearMe is the #1 platform for discovering and ordering soup from restaurants across the U.S. Whether you're craving a steaming bowl of ramen, a hearty chowder, or a classic chicken noodle, we've got you covered.
          </p>
          <p className="text-lg text-soup-brown-700 mb-4">
            With detailed restaurant listings, reviews from fellow soup lovers, and easy ordering options, finding your perfect bowl has never been easier.
          </p>
          <div className="text-center mt-8">
            <Link href="/about" className="text-soup-red-600 hover:text-soup-red-700 font-semibold underline">
              Learn more about our story
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}