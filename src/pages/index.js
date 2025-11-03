// src/pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const SearchBar = dynamic(() => import('../components/search/SearchBar'), { ssr: false });
import { useRouter } from 'next/router';
import useRestaurants from '../hooks/useRestaurants';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import { MapPinIcon, Squares2X2Icon, StarIcon } from '@heroicons/react/24/outline';

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
    { name: 'New York', state: 'NY', count: 245 },
    { name: 'Los Angeles', state: 'CA', count: 198 },
    { name: 'Chicago', state: 'IL', count: 167 },
    { name: 'San Francisco', state: 'CA', count: 189 },
    { name: 'Seattle', state: 'WA', count: 156 },
    { name: 'Miami', state: 'FL', count: 178 },
  ];

  // Popular cuisines (primary browsing method)
  const popularCuisines = [
    { name: 'Japanese', slug: 'japanese', description: 'Ramen, miso, udon' },
    { name: 'Vietnamese', slug: 'vietnamese', description: 'Pho, bun bo hue' },
    { name: 'Chinese', slug: 'chinese', description: 'Wonton, hot & sour' },
    { name: 'Thai', slug: 'thai', description: 'Tom yum, tom kha' },
    { name: 'Korean', slug: 'korean', description: 'Kimchi jjigae' },
    { name: 'Mexican', slug: 'mexican', description: 'Pozole, menudo' },
    { name: 'Italian', slug: 'italian', description: 'Minestrone, pasta e fagioli' },
    { name: 'American', slug: 'american', description: 'Chicken noodle, clam chowder' },
  ];

  // Popular specialty tags (secondary filters)
  const popularSpecialties = [
    { name: 'Ramen', href: '/soup-types/ramen' },
    { name: 'Pho', href: '/soup-types/pho' },
    { name: 'Chowder', href: '/soup-types/chowder' },
    { name: 'Pozole', href: '/soup-types/pozole' },
    { name: 'Miso', href: '/soup-types/miso' },
    { name: 'Tom Yum', href: '/soup-types/tom-yum' },
  ];

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/restaurants?location=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>FindSoupNearMe - Discover the Best Soup Restaurants Near You</title>
        <meta name="description" content="Find the best soup restaurants in your city. Discover delicious ramen, pho, chowder, and more at top-rated restaurants." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-12 pb-10 lg:pt-16 lg:pb-12 bg-gradient-to-b from-neutral-50/50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & Content */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 mb-3 leading-tight tracking-tight">
                  Find your perfect
                  <br />
                  <span className="text-orange-600">bowl of soup</span>
                </h1>
                <p className="text-base lg:text-lg text-neutral-600 mb-6 leading-relaxed">
                  Discover the best soup restaurants by cuisine. Browse Japanese, Vietnamese, Mexican, and more, then filter by specialty soups.
                </p>
                
                {/* Search Bar */}
                <div className="mb-6">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Search by city or ZIP code"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-white border border-neutral-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:shadow-md transition-all placeholder:text-neutral-400"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {/* Popular Specialties - Quick Access */}
                <div className="border-t border-neutral-200 pt-6">
                  <p className="text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wide">Popular specialties</p>
                  <div className="flex flex-wrap gap-2.5">
                    {popularSpecialties.map((specialty) => (
                      <Link
                        key={specialty.name}
                        href={specialty.href}
                        className="relative px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 shadow-sm hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {specialty.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Element or Additional Content */}
              <div className="hidden lg:block">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border border-orange-200"></div>
                    <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl border border-neutral-200"></div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl border border-neutral-200"></div>
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border border-orange-200"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border border-orange-200"></div>
                    <div className="aspect-square bg-gradient-to-br from-neutral-100 to-neutral-50 rounded-xl border border-neutral-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Cuisine Section */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 tracking-tight">
              Browse by Cuisine
            </h2>
            <p className="text-neutral-600 text-lg">
              Explore restaurants by cuisine type, then filter by specialty soups
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCuisines.map((cuisine) => (
              <Link
                key={cuisine.slug}
                href={`/cuisines/${cuisine.slug}`}
                className="group p-5 bg-white border border-neutral-300 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 hover:-translate-y-1 transition-all duration-200"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                  {cuisine.name}
                </h3>
                <p className="text-sm text-neutral-500">{cuisine.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link 
              href="/cuisines" 
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              View all cuisines
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-12 lg:py-16 bg-neutral-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 tracking-tight">
              Popular Cities
            </h2>
            <p className="text-neutral-600 text-lg">
              Explore soup restaurants in major cities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                className="group p-5 bg-white border border-neutral-300 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-orange-600 transition-colors">
                      {city.name}
                    </h3>
                    <p className="text-sm text-neutral-500">{city.state}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-neutral-900">{city.count}</div>
                    <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide">restaurants</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link 
              href="/cities" 
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              View all cities
              <span className="ml-2">→</span>
            </Link>
            <div className="text-xs text-neutral-500 font-medium">
              640+ restaurants across 11 cities
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 tracking-tight">
              Featured Restaurants
            </h2>
            <p className="text-neutral-600 text-lg">
              Top-rated soup spots in your area
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 animate-pulse">
                  <div className="h-48 bg-neutral-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredError ? (
            <div className="text-center py-12 text-neutral-500">
              Unable to load restaurants at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              href="/restaurants" 
              className="inline-flex items-center px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              Browse all restaurants
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-neutral-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2 tracking-tight">
                How it works
              </h2>
              <p className="text-neutral-600 text-lg">
                Find your perfect soup in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="group relative bg-white rounded-xl border border-neutral-200 p-6 lg:p-8 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300">
                <div className="mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl text-xl font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <span className="relative z-10">01</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="mb-4">
                  <MapPinIcon className="h-8 w-8 text-orange-600 mb-3" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  Search by location
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Enter your city, ZIP code, or use your current location to find nearby restaurants.
                </p>
              </div>
              <div className="group relative bg-white rounded-xl border border-neutral-200 p-6 lg:p-8 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300">
                <div className="mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl text-xl font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <span className="relative z-10">02</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="mb-4">
                  <Squares2X2Icon className="h-8 w-8 text-orange-600 mb-3" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  Browse by cuisine
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Start with cuisine types like Japanese or Vietnamese, then filter by specialty soups, ratings, and price range.
                </p>
              </div>
              <div className="group relative bg-white rounded-xl border border-neutral-200 p-6 lg:p-8 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300">
                <div className="mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl text-xl font-bold shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                    <span className="relative z-10">03</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="mb-4">
                  <StarIcon className="h-8 w-8 text-orange-600 mb-3" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  Read reviews
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  Check ratings and reviews from other diners before making your choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight">
              Ready to find your perfect soup?
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
                Browse by cuisine or search by location to find your perfect soup
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cuisines"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Browse cuisines
              </Link>
              <Link
                href="/cities"
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-neutral-100 text-neutral-900 font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Browse cities
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
