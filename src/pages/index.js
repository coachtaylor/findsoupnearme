// src/pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const SearchBar = dynamic(() => import('../components/search/SearchBar'), { ssr: false });
import { useRouter } from 'next/router';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import RestaurantSubmissionForm from '../components/forms/RestaurantSubmissionForm';
import { MapPinIcon, Squares2X2Icon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { LAUNCH_CITIES, getCityMapping } from '../lib/launch-cities';

// State abbreviation to full name mapping
const STATE_NAMES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
};

const getStateName = (abbreviation) => {
  return STATE_NAMES[abbreviation?.toUpperCase()] || abbreviation || '';
};

const FALLBACK_POPULAR_CITIES = [
  { name: 'Los Angeles', state: 'CA', count: 198 },
  { name: 'San Diego', state: 'CA', count: 156 },
  { name: 'Seattle', state: 'WA', count: 145 },
  { name: 'Phoenix', state: 'AZ', count: 132 },
];

const FALLBACK_CITY_STATS = {
  restaurants: FALLBACK_POPULAR_CITIES.reduce((sum, city) => sum + (Number(city.count) || 0), 0),
  cities: FALLBACK_POPULAR_CITIES.length,
};

export default function Home() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [soupType, setSoupType] = useState('');
  const [popularCities, setPopularCities] = useState([]);
  const [popularCitiesLoading, setPopularCitiesLoading] = useState(true);
  const [popularCitiesError, setPopularCitiesError] = useState(false);
  const [popularCityTotals, setPopularCityTotals] = useState({ restaurants: 0, cities: 0 });

  // Fetch one restaurant from each state
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadPopularCities = async () => {
      try {
        const response = await fetch('/api/cities/popular?limit=6', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const normalizedCities = Array.isArray(payload?.cities)
          ? payload.cities
              .map((city) => ({
                name: typeof city?.name === 'string' ? city.name.trim() : '',
                state: typeof city?.state === 'string' ? city.state.trim().toUpperCase() : '',
                count: Number(city?.count) || 0,
              }))
              .filter((city) => city.name && city.state)
          : [];

        if (controller.signal.aborted) return;

        if (normalizedCities.length === 0) {
          throw new Error('No city data returned');
        }

        setPopularCities(normalizedCities);

        const restaurantTotal = Number(payload?.totals?.restaurants);
        const cityTotal = Number(payload?.totals?.cities);

        setPopularCityTotals({
          restaurants: Number.isFinite(restaurantTotal)
            ? restaurantTotal
            : normalizedCities.reduce((sum, city) => sum + city.count, 0),
          cities: Number.isFinite(cityTotal) ? cityTotal : normalizedCities.length,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Failed to load popular cities:', error);
        setPopularCities(FALLBACK_POPULAR_CITIES);
        setPopularCityTotals(FALLBACK_CITY_STATS);
        setPopularCitiesError(true);
      } finally {
        if (!controller.signal.aborted) {
          setPopularCitiesLoading(false);
        }
      }
    };

    loadPopularCities();

    return () => controller.abort();
  }, []);

  // Fetch one restaurant from each state
  useEffect(() => {
    const controller = new AbortController();

    const loadFeaturedRestaurants = async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError(null);

        // Get unique states from launch cities
        const uniqueStates = [...new Set(LAUNCH_CITIES.map(city => city.state))];
        console.log('Loading featured restaurants from states:', uniqueStates);
        
        // Fetch one restaurant from each state
        const restaurantPromises = uniqueStates.map(async (state) => {
          try {
            const response = await fetch(
              `/api/restaurants?state=${state}&limit=1&sortBy=rating&sortOrder=desc`,
              { signal: controller.signal }
            );
            
            if (!response.ok) {
              throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log(`Fetched restaurants for state ${state}:`, {
              count: data.restaurants?.length || 0,
              restaurants: data.restaurants
            });
            
            if (data.restaurants && data.restaurants.length > 0) {
              return data.restaurants[0];
            }
            return null;
          } catch (error) {
            console.error(`Failed to load restaurant for state ${state}:`, error);
            return null;
          }
        });

        const restaurants = await Promise.all(restaurantPromises);
        const featured = restaurants.filter(r => r !== null);
        console.log('Final featured restaurants:', featured.length, featured);

        if (controller.signal.aborted) return;

        setFeaturedRestaurants(featured);
        
        if (featured.length === 0) {
          setFeaturedError('No restaurants found in featured cities');
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Failed to load featured restaurants:', error);
        setFeaturedError(error.message);
      } finally {
        if (!controller.signal.aborted) {
          setFeaturedLoading(false);
        }
      }
    };

    loadFeaturedRestaurants();

    return () => controller.abort();
  }, []);

  // Popular specialty tags (secondary filters)
  const popularSpecialties = [
    { name: 'Ramen', value: 'Ramen' },
    { name: 'Pho', value: 'Pho' },
    { name: 'Chowder', value: 'Chowder' },
    { name: 'Pozole', value: 'Pozole' },
    { name: 'Miso', value: 'Miso' },
    { name: 'Tom Yum', value: 'Tom Yum' },
  ];

  // Popular soup types for dropdown
  const soupTypes = [
    { value: '', label: 'Any Soup Type' },
    { value: 'Ramen', label: 'Ramen' },
    { value: 'Pho', label: 'Pho' },
    { value: 'Chowder', label: 'Chowder' },
    { value: 'Pozole', label: 'Pozole' },
    { value: 'Miso', label: 'Miso' },
    { value: 'Tom Yum', label: 'Tom Yum' },
    { value: 'Chicken Noodle', label: 'Chicken Noodle' },
    { value: 'French Onion', label: 'French Onion' },
    { value: 'Tomato', label: 'Tomato' },
    { value: 'Minestrone', label: 'Minestrone' },
    { value: 'Wonton', label: 'Wonton' },
    { value: 'Udon', label: 'Udon' },
    { value: 'Tortilla', label: 'Tortilla' },
  ];

  // Handle specialty click - set soup type in form
  const handleSpecialtyClick = (e, specialtyValue) => {
    e.preventDefault();
    setSoupType(specialtyValue);
    // Focus on location input
    document.getElementById('location-input')?.focus();
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    let searchUrl = '/restaurants';
    const params = new URLSearchParams();

    // Handle location
    const isZipCode = /^\d{5}$/.test(location.trim());
    const cityMapping = getCityMapping();

    const normalizedLocation = location.toLowerCase().trim();

    if (cityMapping[normalizedLocation]) {
      searchUrl = cityMapping[normalizedLocation];
    } else if (isZipCode) {
      // Only allow zip codes for Phoenix (AZ starts with 85)
      if (location.startsWith('85')) {
        searchUrl = '/az/phoenix/restaurants';
      } else {
        // For other zip codes, try to match to launch cities
        // This is a fallback - ideally users should enter city names
        params.append('location', location);
        params.append('type', 'zip');
      }
    } else {
      params.append('location', location);
    }

    // Add soup type if selected
    if (soupType && soupType !== '') {
      params.append('soupType', soupType);
    }

    const queryString = params.toString();
    if (queryString) {
      searchUrl += `?${queryString}`;
    }

    router.push(searchUrl);
  };

  // Check if search button should be enabled
  const isSearchEnabled = location.trim().length > 0;

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>FindSoupNearMe - Discover the Best Soup Restaurants Near You</title>
        <meta name="description" content="Find the best soup restaurants in your city. Discover delicious ramen, pho, chowder, and more at top-rated restaurants." />
      </Head>

      {/* Banner: Link to Submission Form */}
      <section className="bg-[rgb(var(--primary))] text-white py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <UserGroupIcon className="h-5 w-5" />
            <p className="text-sm sm:text-base font-medium text-center">
              Know a great soup restaurant?{' '}
              <a 
                href="#help-us-grow" 
                className="underline hover:opacity-80 font-semibold transition-opacity"
              >
                Submit it here
              </a>
              {' '}to help us grow!
            </p>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-12 pb-10 lg:pt-16 lg:pb-12 bg-[rgb(var(--bg))]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              {/* Left Column: Heading & Content */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[rgb(var(--ink))] mb-3 leading-tight tracking-tight">
                  Find your perfect
                  <br />
                  <span className="text-[rgb(var(--accent))]">bowl of soup</span>
            </h1>
                <p className="text-base lg:text-lg text-[rgb(var(--muted))] mb-6 leading-relaxed">
                  Enter your city or ZIP code to find the best soup restaurants near you. Filter by soup type to find exactly what you&apos;re craving.
                </p>
                
                {/* Search Form */}
                <div className="mb-6">
                  <form onSubmit={handleSearch} className="space-y-3">
                    {/* Location Input - Required */}
                    <div>
                      <label htmlFor="location-input" className="block text-sm font-medium text-[rgb(var(--ink))] mb-2">
                        Location <span className="text-[rgb(var(--primary))]">*</span>
                      </label>
                    <input
                        id="location-input"
                      type="text"
                        placeholder="Enter city or ZIP code"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-[rgb(var(--surface))] border border-black/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent focus:shadow-md transition-all placeholder:text-[rgb(var(--muted))]"
                        required
                    />
                  </div>
                    
                    {/* Soup Type Selector - Optional */}
                    <div>
                      <label htmlFor="soup-type-select" className="block text-sm font-medium text-[rgb(var(--ink))] mb-2">
                        Soup Type <span className="text-[rgb(var(--muted))] text-xs">(optional)</span>
                      </label>
                      <select
                        id="soup-type-select"
                        value={soupType}
                        onChange={(e) => setSoupType(e.target.value)}
                        className="w-full px-4 py-3 text-base bg-[rgb(var(--surface))] border border-black/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:border-transparent focus:shadow-md transition-all"
                      >
                        {soupTypes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Search Button */}
                  <button
                    type="submit"
                      disabled={!isSearchEnabled}
                      className={`w-full px-6 py-3 font-medium rounded-xl shadow-sm transition-all ${
                        isSearchEnabled
                          ? 'bg-[rgb(var(--accent))] hover:opacity-90 text-white hover:shadow-md'
                          : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      Search Restaurants
                  </button>
              </form>
            </div>

                {/* Popular Specialties - Quick Access */}
                <div className="border-t border-black/5 pt-6">
                  <p className="text-sm font-semibold text-[rgb(var(--ink))] mb-3 uppercase tracking-wide">Popular specialties</p>
                  <p className="text-xs text-[rgb(var(--muted))] mb-3">Click to select a soup type, then enter your location</p>
                  <div className="flex flex-wrap gap-2.5">
                    {popularSpecialties.map((specialty) => (
                <button
                        key={specialty.name}
                        type="button"
                        onClick={(e) => handleSpecialtyClick(e, specialty.value)}
                        className={`relative px-4 py-2.5 bg-[rgb(var(--surface))] border border-black/10 rounded-xl text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                          soupType === specialty.value
                            ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent-light))]/30 text-[rgb(var(--accent))]'
                            : 'border-black/10 text-[rgb(var(--ink))] hover:bg-[rgb(var(--accent-light))]/20 hover:border-[rgb(var(--accent-light))]/40'
                        }`}
                      >
                        {specialty.name}
                </button>
              ))}
                </div>
                </div>
              </div>

              {/* Right Column: Visual Element or Additional Content */}
              <div className="hidden lg:block">
                <div className="w-full">
                  <img 
                    src="/images/hero.svg" 
                    alt="Soup illustration" 
                    className="w-full h-auto max-h-[800px] object-contain rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities Section */}
      <section className="py-12 lg:py-16 bg-[rgb(var(--accent-light-light))]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--ink))] mb-2 tracking-tight">
              Popular Cities
            </h2>
            <p className="text-[rgb(var(--muted))] text-lg">
              Explore soup restaurants in major cities
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularCitiesLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`popular-city-skeleton-${index}`}
                    className="p-5 bg-white border border-neutral-200 rounded-xl shadow-sm animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-neutral-200 rounded"></div>
                        <div className="h-3 w-20 bg-neutral-200 rounded"></div>
                      </div>
                      <div className="text-right ml-4 space-y-2">
                        <div className="h-6 w-12 bg-neutral-200 rounded"></div>
                        <div className="h-3 w-16 bg-neutral-200 rounded"></div>
                    </div>
                    </div>
                  </div>
                ))
              : popularCities.length > 0
              ? popularCities.map((city) => {
                  const stateSegment = city.state.toLowerCase();
                  const citySlug = city.name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');

                  return (
                    <Link
                      key={`${city.name}-${city.state}`}
                      href={`/${stateSegment}/${citySlug}/restaurants`}
                      className="group relative overflow-hidden p-6 bg-[rgb(var(--bg))] hover:bg-[rgb(var(--accent-light))]/40 border border-black/5 hover:border-[rgb(var(--accent-light))]/50 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      {/* Decorative corner accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[rgb(var(--accent))]/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPinIcon className="h-5 w-5 text-[rgb(var(--accent))] opacity-60 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-xl font-bold text-[rgb(var(--ink))] group-hover:text-[rgb(var(--accent))] transition-colors">
                              {city.name}
                            </h3>
                          </div>
                          <p className="text-sm font-medium text-[rgb(var(--muted))] ml-7">{getStateName(city.state)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end">
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgb(var(--accent-light))]/50 group-hover:bg-[rgb(var(--accent))] group-hover:scale-110 transition-all duration-300 mb-2">
                            <div className="text-2xl font-bold text-[rgb(var(--accent))] group-hover:text-white transition-colors">
                              {city.count.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs font-semibold text-[rgb(var(--muted))] uppercase tracking-wider">restaurants</div>
                  </div>
                </div>
                    </Link>
                  );
                })
              : (
                <div className="p-6 bg-white border border-neutral-200 rounded-xl shadow-sm col-span-full text-sm text-neutral-500">
                  {popularCitiesError ? 'Popular city data is temporarily unavailable.' : 'No cities found yet.'}
                </div>
              )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Link 
              href="/cities" 
              className="inline-flex items-center text-[rgb(var(--primary))] hover:opacity-80 font-medium text-sm"
            >
              View all cities
              <span className="ml-2">→</span>
            </Link>
            <div className="text-xs text-[rgb(var(--muted))] font-medium">
              {popularCityTotals.restaurants > 0 && popularCityTotals.cities > 0
                ? `${popularCityTotals.restaurants.toLocaleString()} restaurants across ${popularCityTotals.cities} ${popularCityTotals.cities === 1 ? 'city' : 'cities'}`
                : popularCitiesError
                  ? 'City data is temporarily unavailable'
                  : 'Discover restaurants across top cities'}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-12 lg:py-16 bg-[rgb(var(--bg))]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--ink))] mb-2 tracking-tight">
              Featured Restaurants
            </h2>
            <p className="text-[rgb(var(--muted))] text-lg">
              Top-rated soup spots from across our featured cities
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 animate-pulse">
                  <div className="h-48 bg-neutral-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredError || featuredRestaurants.length === 0 ? (
            <div className="text-center py-12 text-[rgb(var(--muted))]">
              {featuredError || 'No restaurants found in featured cities at this time.'}
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
              className="inline-flex items-center px-8 py-3.5 bg-[rgb(var(--primary))] hover:opacity-90 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              Browse all restaurants
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-16 bg-[rgb(var(--accent-light-light))]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--ink))] mb-2 tracking-tight">
                How it works
            </h2>
              <p className="text-[rgb(var(--muted))] text-lg">
                Find your perfect soup in three simple steps
            </p>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="group relative bg-[rgb(var(--bg))] hover:bg-[rgb(var(--accent))] rounded-2xl border border-black/5 p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-[rgb(var(--primary))]/30 transition-all duration-300">
                <div className="mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-[rgb(var(--primary))] text-white rounded-xl text-xl font-bold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                    <span className="relative z-10">01</span>
                  </div>
                </div>
                <div className="mb-4">
                  <MapPinIcon className="h-8 w-8 text-[rgb(var(--primary))] mb-3" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--primary))] mb-3">
                  Enter your location
                </h3>
                <p className="text-[rgb(var(--primary))] opacity-80 leading-relaxed">
                  Start by entering your city or ZIP code. This is required to find restaurants near you.
                </p>
              </div>
              <div className="group relative bg-[rgb(var(--bg))] hover:bg-[rgb(var(--accent))] rounded-2xl border border-black/5 p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-[rgb(var(--primary))]/30 transition-all duration-300">
                <div className="mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-[rgb(var(--primary))] text-white rounded-xl text-xl font-bold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                    <span className="relative z-10">02</span>
                  </div>
                </div>
                <div className="mb-4">
                  <Squares2X2Icon className="h-8 w-8 text-[rgb(var(--primary))] mb-3" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--primary))] mb-3">
                  Filter by soup type
                  </h3>
                <p className="text-[rgb(var(--primary))] opacity-80 leading-relaxed">
                  Optionally select a soup type like Ramen or Pho, or browse all soups in your area. You can also filter by cuisine, ratings, and price range on the results page.
                </p>
              </div>
              <div className="group relative bg-[rgb(var(--bg))] hover:bg-[rgb(var(--accent))] rounded-2xl border border-black/5 p-6 lg:p-8 shadow-sm hover:shadow-md hover:border-[rgb(var(--primary))]/30 transition-all duration-300">
                <div className="mb-6">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-[rgb(var(--primary))] text-white rounded-xl text-xl font-bold shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                    <span className="relative z-10">03</span>
                  </div>
                </div>
                <div className="mb-4">
                  <StarIcon className="h-8 w-8 text-[rgb(var(--primary))] mb-3" />
                </div>
                <h3 className="text-xl font-semibold text-[rgb(var(--primary))] mb-3">
                  Read reviews
                </h3>
                <p className="text-[rgb(var(--primary))] opacity-80 leading-relaxed">
                  Check ratings and reviews from other diners before making your choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section id="help-us-grow" className="py-12 lg:py-16 bg-[rgb(var(--bg))] scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgb(var(--surface))] rounded-full mb-4">
                <UserGroupIcon className="h-8 w-8 text-[rgb(var(--primary))]" />
        </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--ink))] mb-3 tracking-tight">
                Help Us Grow
            </h2>
              <p className="text-lg text-[rgb(var(--muted))] max-w-2xl mx-auto">
                We&apos;re a new website building the best soup restaurant directory. Know a great soup spot that should be listed?
                <span className="font-semibold text-[rgb(var(--ink))]"> Customers and restaurant owners can submit restaurants below.</span>
              </p>
            </div>

            <div className="bg-[rgb(var(--surface))] border border-black/5 rounded-2xl p-6 lg:p-8 shadow-sm">
              <RestaurantSubmissionForm />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
