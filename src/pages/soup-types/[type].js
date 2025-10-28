// src/pages/soup-types/[type].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import RestaurantCard from '../../components/restaurant/RestaurantCard';
import { MapPinIcon, FunnelIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import useRestaurants from '../../hooks/useRestaurants';

export default function SoupTypePage() {
  const router = useRouter();
  const { type } = router.query;
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Fetch restaurants serving this soup type
  const { 
    restaurants, 
    loading, 
    error,
    states,
    cities 
  } = useRestaurants({ 
    soupType: type,
    state: selectedState !== 'all' ? selectedState : undefined,
    city: selectedCity !== 'all' ? selectedCity : undefined,
    priceRange: priceRange !== 'all' ? priceRange : undefined,
    sortBy 
  });

  // Format soup type name for display
  const formatSoupName = (name) => {
    if (!name) return '';
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const soupName = formatSoupName(type);

  // Get soup info from our database
  const soupInfo = {
    'ramen': {
      description: 'Japanese noodle soup with rich pork or chicken broth, topped with soft-boiled eggs, green onions, and tender slices of pork.',
      origin: 'Japan',
      color: 'from-red-500 to-orange-500',
      facts: [
        'Originated in China, popularized in Japan',
        'Over 30 different regional styles',
        'Broth simmered for 12+ hours',
        'Can contain over 1,000 calories'
      ]
    },
    'pho': {
      description: 'Vietnamese beef or chicken noodle soup with aromatic herbs, bean sprouts, and lime in a deeply flavorful broth.',
      origin: 'Vietnam',
      color: 'from-green-500 to-teal-500',
      facts: [
        'National dish of Vietnam',
        'Typically eaten for breakfast',
        'Broth made from bones simmered 24+ hours',
        'Pronounced "fuh", not "foe"'
      ]
    },
    'clam-chowder': {
      description: 'Creamy New England soup with tender clams, potatoes, onions, and celery in a rich dairy-based broth.',
      origin: 'United States',
      color: 'from-blue-500 to-indigo-500',
      facts: [
        'Boston vs Manhattan rivalry',
        'New England style uses cream',
        'Manhattan style uses tomatoes',
        'First served in 1700s'
      ]
    },
    'french-onion': {
      description: 'Rich beef broth with caramelized onions, topped with crusty bread and melted Gruyère cheese.',
      origin: 'France',
      color: 'from-purple-500 to-pink-500',
      facts: [
        'Dates back to Roman times',
        'Onions caramelized for 40+ minutes',
        'Traditionally served at 3am',
        'Cheese must be broiled, not melted'
      ]
    },
    'tom-yum': {
      description: 'Spicy and sour Thai soup with lemongrass, galangal, kaffir lime leaves, and chili peppers.',
      origin: 'Thailand',
      color: 'from-red-500 to-pink-500',
      facts: [
        'One of Thailand\'s most famous dishes',
        'Can be made with shrimp or chicken',
        'Balance of spicy, sour, salty, sweet',
        'Rich in antioxidants'
      ]
    },
    'chicken-noodle': {
      description: 'Classic American comfort soup with tender chicken, vegetables, and egg noodles in a savory broth.',
      origin: 'United States',
      color: 'from-yellow-500 to-orange-500',
      facts: [
        'Called "Jewish penicillin"',
        'May actually help with colds',
        'Most popular soup in America',
        'Over 1 billion servings sold yearly'
      ]
    },
    'miso-soup': {
      description: 'Traditional Japanese soup with fermented soybean paste, tofu, seaweed, and green onions.',
      origin: 'Japan',
      color: 'from-amber-500 to-orange-500',
      facts: [
        'Served with most Japanese meals',
        'Miso paste is fermented for months',
        'Rich in probiotics',
        'Over 1,000 varieties of miso'
      ]
    },
    'lobster-bisque': {
      description: 'Luxurious French soup with lobster, cream, cognac, and aromatic vegetables.',
      origin: 'France',
      color: 'from-red-500 to-rose-500',
      facts: [
        'Shells are roasted for flavor',
        'Contains cognac or sherry',
        'Strained multiple times',
        'Traditionally thickened with rice'
      ]
    },
    'minestrone': {
      description: 'Hearty Italian vegetable soup with beans, pasta or rice, and tomatoes.',
      origin: 'Italy',
      color: 'from-green-500 to-emerald-500',
      facts: [
        'Means "big soup" in Italian',
        'No fixed recipe - varies by region',
        'Often contains seasonal vegetables',
        'Can be vegetarian or with meat'
      ]
    },
    'chicken-tortilla': {
      description: 'Mexican soup with shredded chicken, crispy tortilla strips, avocado, and fresh lime.',
      origin: 'Mexico',
      color: 'from-yellow-500 to-lime-500',
      facts: [
        'Also called Sopa Azteca',
        'Tortillas fried until crispy',
        'Topped with fresh avocado',
        'Popular in Mexico City'
      ]
    }
  };

  const currentSoupInfo = soupInfo[type?.toLowerCase()] || {
    description: `Delicious ${soupName} from restaurants near you.`,
    origin: 'Various',
    color: 'from-orange-500 to-red-500',
    facts: []
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{soupName} Restaurants | FindSoupNearMe</title>
        <meta name="description" content={`Find the best ${soupName} restaurants near you. ${currentSoupInfo.description}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet" />
      </Head>

      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${currentSoupInfo.color} pt-32 pb-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          {/* Back Link */}
          <Link 
            href="/soup-types"
            className="inline-flex items-center gap-2 mb-8 text-white/90 hover:text-white font-['Inter'] font-medium transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to All Soup Types
          </Link>

          <div className="max-w-3xl">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-['Inter'] font-semibold mb-6">
              Origin: {currentSoupInfo.origin}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-['Outfit'] font-bold mb-6 leading-tight">
              {soupName}
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-white/90 leading-relaxed">
              {currentSoupInfo.description}
            </p>

            {/* Fun Facts */}
            {currentSoupInfo.facts.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentSoupInfo.facts.map((fact, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm font-['Inter'] text-white/90">
                      {fact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FunnelIcon className="w-5 h-5 text-neutral-600" />
              <h3 className="text-lg font-['Outfit'] font-bold text-neutral-900">Filters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* State Filter */}
              <div>
                <label className="block text-sm font-['Inter'] font-medium text-neutral-700 mb-2">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity('all');
                  }}
                  className="w-full px-4 py-2 font-['Inter'] rounded-lg border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="all">All States</option>
                  {states?.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-['Inter'] font-medium text-neutral-700 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={selectedState === 'all'}
                  className="w-full px-4 py-2 font-['Inter'] rounded-lg border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
                >
                  <option value="all">All Cities</option>
                  {cities?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-['Inter'] font-medium text-neutral-700 mb-2">
                  Price Range
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 font-['Inter'] rounded-lg border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="all">All Prices</option>
                  <option value="$">$ - Budget</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Upscale</option>
                  <option value="$$$$">$$$$ - Fine Dining</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-['Inter'] font-medium text-neutral-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 font-['Inter'] rounded-lg border border-neutral-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-['Outfit'] font-bold text-neutral-900">
              {loading ? 'Loading...' : `${restaurants?.length || 0} Restaurants`}
            </h2>
            {selectedState !== 'all' && (
              <div className="flex items-center gap-2 text-sm font-['Inter'] text-neutral-600">
                <MapPinIcon className="w-4 h-4" />
                {selectedCity !== 'all' ? `${selectedCity}, ${selectedState}` : selectedState}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-neutral-100 rounded-2xl h-96 animate-pulse"></div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-['Outfit'] font-bold text-neutral-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-lg font-['Inter'] text-neutral-600">
                {error}
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && restaurants && restaurants.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && restaurants && restaurants.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-['Outfit'] font-bold text-neutral-900 mb-2">
                No restaurants found
              </h3>
              <p className="text-lg font-['Inter'] text-neutral-600 mb-6">
                Try adjusting your filters or search in a different area
              </p>
              <button
                onClick={() => {
                  setSelectedState('all');
                  setSelectedCity('all');
                  setPriceRange('all');
                }}
                className="px-6 py-3 bg-orange-500 text-white font-['Inter'] font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Explore Other Soups */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-['Outfit'] font-bold text-neutral-900 mb-4">
            Explore Other Soup Types
          </h2>
          <p className="text-lg font-['Inter'] text-neutral-600 mb-8">
            Discover more delicious soups from around the world
          </p>
          <Link
            href="/soup-types"
            className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-['Inter'] font-semibold rounded-2xl hover:bg-orange-600 shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            View All Soup Types
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

