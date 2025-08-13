// src/components/restaurant/RestaurantListingPage.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useRestaurants from '../../hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import SkeletonLoader from '../ui/SkeletonLoader';
import MobileFilterDrawer from './MobileFilterDrawer';
import Breadcrumbs from '../ui/Breadcrumbs';
import Link from 'next/link';
import Head from 'next/head';
import { 
  AdjustmentsHorizontalIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function RestaurantListingPage({
  title = 'Soup Restaurants',
  description = 'Discover the best soup restaurants near you.',
  city = null,
  state = null,
  initialPage = 1,
  pageSize = 12,
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedSoupType, setSelectedSoupType] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  
  // Updated to support multiple selections
  const [selectedSoupTypes, setSelectedSoupTypes] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Location search state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState(null);
  const [locationDisplay, setLocationDisplay] = useState('');
  
  // Searchable dropdown state
  const [isSoupTypeDropdownOpen, setIsSoupTypeDropdownOpen] = useState(false);
  const [soupTypeSearchTerm, setSoupTypeSearchTerm] = useState('');
  const soupTypeDropdownRef = useRef(null);
  
  // Initialize location from URL parameters
  useEffect(() => {
    if (router.isReady) {
      const { location } = router.query;
      if (location) {
        setLocationQuery(location);
        setLocationFilter(location);
        setLocationDisplay(location);
      }
    }
  }, [router.isReady, router.query]);

  // Fetch soup types from database
  useEffect(() => {
    const fetchSoupTypes = async () => {
      try {
        setSoupTypesLoading(true);
        
        // Fetch all soup types from the database
        const response = await fetch('/api/restaurants?soupTypes=all&limit=1000');
        const data = await response.json();
        
        console.log('API response for soup types:', data);
        
        if (data.restaurants && data.restaurants.length > 0) {
          // Extract all soup types from restaurants
          const allSoupTypes = new Map();
          
          data.restaurants.forEach(restaurant => {
            if (restaurant.soups && Array.isArray(restaurant.soups)) {
              restaurant.soups.forEach(soup => {
                if (soup.soup_type) {
                  const count = allSoupTypes.get(soup.soup_type) || 0;
                  allSoupTypes.set(soup.soup_type, count + 1);
                }
              });
            }
          });
          
          console.log('Extracted soup types:', allSoupTypes);
          
          // Convert to array and sort by count
          const sortedSoupTypes = Array.from(allSoupTypes.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
          
          // Organize into categories based on soup type names
          const categories = [
            {
              name: '🍜 Asian Soups',
              types: sortedSoupTypes.filter(soup => 
                /pho|ramen|udon|miso|wonton|congee|kimchi|bun bo hue|shoyu|tonkotsu|tom yum|tom kha|egg drop|hot and sour|samgyetang|bun bo hue/i.test(soup.name)
              )
            },
            {
              name: '🥣 Western Soups',
              types: sortedSoupTypes.filter(soup => 
                /cream|bisque|borscht|chowder|minestrone|vegetable|lentil|split pea|chicken noodle|beef stew|clam|lobster|french onion|vichyssoise|bouillabaisse|tomato|stracciatella|ribollita|bone broth|corn|avgolemono/i.test(soup.name)
              )
            },
            {
              name: '🌶️ Latin & Caribbean',
              types: sortedSoupTypes.filter(soup => 
                /gumbo|tortilla|tomatillo|lemongrass|lemon basil|caldo de res|gazpacho/i.test(soup.name)
              )
            },
            {
              name: '🥘 Specialty & Regional',
              types: sortedSoupTypes.filter(soup => 
                /house special|vegan|cioppino|mushroom|cabbage|fruit|apple|sweet potato|pumpkin|potato leek|pickle|matzo ball|cauliflower|butternut squash|ajiaco|cherry/i.test(soup.name)
              )
            }
          ];
          
          // Filter out empty categories and set state
          const nonEmptyCategories = categories.filter(cat => cat.types.length > 0);
          setSoupTypeCategories(nonEmptyCategories);
        } else {
          // If no restaurants found, set empty categories
          setSoupTypeCategories([]);
        }
      } catch (error) {
        console.error('Error fetching soup types:', error);
        // Fallback to empty categories if API fails
        setSoupTypeCategories([]);
      } finally {
        setSoupTypesLoading(false);
      }
    };
    
    fetchSoupTypes();
  }, []);
  
  // Fetch restaurants with the given filters
  const { restaurants, loading, error, totalCount, refetch } = useRestaurants({
    city,
    state,
    location: locationFilter,
    limit: 12,
    soupType: selectedSoupTypes.length > 0 ? selectedSoupTypes : null,
    rating: selectedRatings.length > 0 ? Math.min(...selectedRatings) : null,
    priceRange: selectedPriceRanges.length > 0 ? selectedPriceRanges : null,
    page: currentPage
  });
  
  // Pull-to-refresh (mobile)
  useEffect(() => {
    let startY = 0;
    let isPulling = false;
    const threshold = 60;
    const el = typeof window !== 'undefined' ? window : null;
    if (!el) return;
    
    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };
    const onTouchMove = (e) => {
      if (!isPulling) return;
      const delta = e.touches[0].clientY - startY;
      if (delta > threshold) {
        isPulling = false;
        refetch();
      }
    };
    const onTouchEnd = () => {
      isPulling = false;
    };
    
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [refetch]);

  // IntersectionObserver for scroll reveals
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const elements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [restaurants]);
  
  // Show loading state only when actually loading
  const isLoading = loading;
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSoupType, selectedRating, selectedPriceRange, city, state, locationFilter]);
  
  // Dynamic soup types from database - will be populated by useEffect
  const [soupTypeCategories, setSoupTypeCategories] = useState([]);
  const [soupTypesLoading, setSoupTypesLoading] = useState(true);

  // Filter soup types based on search term
  const filteredCategories = soupTypeCategories.map(category => ({
    ...category,
    types: category.types.filter(type => 
      type.name.toLowerCase().includes(soupTypeSearchTerm.toLowerCase())
    )
  })).filter(category => category.types.length > 0);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (soupTypeDropdownRef.current && !soupTypeDropdownRef.current.contains(event.target)) {
        setIsSoupTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle soup type selection
  const toggleSoupType = (soupType) => {
    if (selectedSoupTypes.includes(soupType)) {
      setSelectedSoupTypes(selectedSoupTypes.filter(type => type !== soupType));
    } else {
      setSelectedSoupTypes([...selectedSoupTypes, soupType]);
    }
  };

  // Remove selected soup type
  const removeSoupType = (soupType) => {
    setSelectedSoupTypes(selectedSoupTypes.filter(type => type !== soupType));
  };

  // Clear all soup type selections
  const clearAllSoupTypes = () => {
    setSelectedSoupTypes([]);
  };
  
  // Rating options for filtering
  const ratingOptions = [
    { value: 4.5, label: '4.5+', icon: StarIcon },
    { value: 4, label: '4+', icon: StarIcon },
    { value: 3.5, label: '3.5+', icon: StarIcon },
    { value: 3, label: '3+', icon: StarIcon },
  ];

  // Price range options for filtering
  const priceRangeOptions = [
    { value: '$', label: '$', description: 'Budget Friendly', icon: CurrencyDollarIcon },
    { value: '$$', label: '$$', description: 'Moderately Priced', icon: CurrencyDollarIcon },
    { value: '$$$', label: '$$$', description: 'Fine Dining', icon: CurrencyDollarIcon },
    { value: '$$$$', label: '$$$$', description: 'Luxury', icon: CurrencyDollarIcon },
  ];
  
  // Generate page title based on filters
  let pageTitle = title;
  if (city && state) {
    pageTitle = `Soup Restaurants in ${city}, ${state}`;
  } else if (city) {
    pageTitle = `Soup Restaurants in ${city}`;
  } else if (state) {
    pageTitle = `Soup Restaurants in ${state}`;
  }
  
  // Add location filter to page title if active
  if (locationFilter) {
    pageTitle = `Soup Restaurants in ${locationDisplay}`;
  }
  
  if (selectedSoupType) {
    pageTitle = `${selectedSoupType} ${pageTitle}`;
  }
  
  // Clear location filter
  const clearLocationFilter = () => {
    setLocationFilter(null);
    setLocationDisplay('');
    setLocationQuery('');
    setCurrentPage(1);
    
    // Remove location from URL
    const newQuery = { ...router.query };
    delete newQuery.location;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  };
  
  // Handle location search with URL update
  const handleLocationSearch = () => {
    if (locationQuery.trim()) {
      const newLocation = locationQuery.trim();
      setLocationFilter(newLocation);
      setLocationDisplay(newLocation);
      setCurrentPage(1); // Reset to page 1 when location changes
      
      // Update URL with location parameter
      const newQuery = { ...router.query, location: newLocation };
      router.push({
        pathname: router.pathname,
        query: newQuery
      }, undefined, { shallow: true });
    }
  };

  // Generate custom breadcrumbs
  const generateBreadcrumbs = () => {
    const crumbs = [{ href: '/', label: 'Home' }];
    
    crumbs.push({ href: '/restaurants', label: 'Restaurants' });
    
    if (state) {
      crumbs.push({
        href: `/${state.toLowerCase()}/restaurants`,
        label: state
      });
    }
    
    if (city && state) {
      crumbs.push({
        href: `/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}/restaurants`,
        label: city
      });
    }
    
    return crumbs;
  };

  // Helper to get emoji based on soup type
  const getSoupEmoji = (type) => {
    switch (type) {
      case 'Pho': return '🍜';
      case 'Ramen': return '🍜';
      case 'Udon': return '🍜';
      case 'Wonton': return '🥟';
      case 'Egg Drop': return '🥚';
      case 'Hot and Sour': return '🌶️';
      case 'Miso': return '🥣';
      case 'Tom Yum': return '🌶️';
      case 'Tom Kha': return '🥣';
      case 'Tonkotsu': return '🍜';
      case 'Shoyu': return '🥣';
      case 'Congee': return '🍚';
      case 'Samgyetang': return '🥣';
      case 'Kimchi': return '🥬';
      case 'Bun Bo Hue': return '🍜';
      case 'Clam Chowder': return '🐚';
      case 'Lobster Bisque': return '🦞';
      case 'French Onion': return '🧅';
      case 'Vichyssoise': return '🥣';
      case 'Bouillabaisse': return '🥣';
      case 'Tomato': return '🍅';
      case 'Minestrone': return '🥣';
      case 'Chowder': return '🥣';
      case 'Vegetable': return '🥬';
      case 'Stracciatella': return '🥣';
      case 'Ribollita': return '🥣';
      case 'Chicken Noodle': return '🍜';
      case 'Bone Broth': return '🍖';
      case 'Bisque': return '🥣';
      case 'Corn Chowder': return '🌽';
      case 'Avgolemono': return '🥣';
      case 'House Special': return '🍲';
      case 'Vegan': return '🥗';
      case 'Cioppino': return '🍷';
      case 'Mushroom': return '🍄';
      case 'Cabbage': return '🥬';
      case 'Fruit': return '🍎';
      case 'Apple': return '🍎';
      case 'Tortilla': return '🌮';
      case 'Lentil': return '🫘';
      case 'Sweet Potato': return '🍠';
      case 'Pumpkin': return '🎃';
      case 'Potato Leek': return '🥔';
      case 'Pickle': return '🧂';
      case 'Matzo Ball': return '🥣';
      case 'Cauliflower': return '🥦';
      case 'Butternut Squash': return '🎃';
      case 'Ajiaco': return '🥣';
      case 'Cherry': return '🍒';
      default: return '🍲';
    }
  };
  
  return (
    <>
      <Head>
        <title>{pageTitle} | FindSoupNearMe</title>
        <meta name="description" content={description} />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header Section */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 border-b border-gray-100">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumbs */}
            <Breadcrumbs customCrumbs={generateBreadcrumbs()} />
            
            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {pageTitle}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover amazing soup restaurants near you. Order online and enjoy delicious soups delivered to your door.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by city, state, ZIP, or restaurant name..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLocationSearch();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-2 border-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300/40 focus:border-orange-400 text-lg transition-all duration-200 hover:border-gray-300 hover:shadow-xl"
                />
                <button
                  onClick={handleLocationSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Search
                </button>
              </div>
              {locationFilter && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    📍 Filtering by: <strong>{locationDisplay}</strong>
                  </span>
                  <button
                    onClick={clearLocationFilter}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column - Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-8">
                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 shadow-sm py-4 px-6 rounded-2xl text-gray-800 font-medium hover:shadow-md transition-all duration-300"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                    <span>Filter Restaurants</span>
                  </button>
                </div>

                {/* Desktop Filters */}
                <div className="hidden lg:block">
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <AdjustmentsHorizontalIcon className="h-6 w-6 text-orange-500" />
                      Filters
                    </h2>
                    
                    {/* Soup Type Filter */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🍜</span>
                        <h3 className="font-semibold text-gray-800">Soup Type</h3>
                      </div>
                      
                      {/* Selected Items Display */}
                      {selectedSoupTypes.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Selected:</span>
                            <button
                              onClick={clearAllSoupTypes}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedSoupTypes.map((type) => (
                              <span
                                key={type}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200"
                              >
                                {type}
                                <button
                                  onClick={() => removeSoupType(type)}
                                  className="ml-2 hover:text-orange-800"
                                  aria-label={`Remove ${type}`}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Input */}
                      <div className="relative mb-4">
                        <input
                          type="text"
                          placeholder="Search soup types..."
                          value={soupTypeSearchTerm}
                          onChange={(e) => setSoupTypeSearchTerm(e.target.value)}
                          onFocus={() => setIsSoupTypeDropdownOpen(true)}
                          className="w-full pl-4 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-300/40 focus:border-orange-400 transition-all duration-200"
                        />
                      </div>

                      {/* Dropdown Menu */}
                      {isSoupTypeDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden" ref={soupTypeDropdownRef}>
                          <div className="max-h-80 overflow-y-auto">
                            {soupTypesLoading ? (
                              <div className="px-4 py-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                                Loading soup types...
                              </div>
                            ) : filteredCategories.length > 0 ? (
                              filteredCategories.map((category) => (
                                <div key={category.name}>
                                  <div className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
                                    {category.name}
                                  </div>
                                  {category.types.map((type) => (
                                    <label
                                      key={type.name}
                                      className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedSoupTypes.includes(type.name)}
                                        onChange={() => toggleSoupType(type.name)}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                      />
                                      <span className="ml-3 text-sm text-gray-900 flex-1">
                                        {type.name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({type.count})
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-4 text-center text-gray-500">
                                {soupTypeSearchTerm ? `No soup types found matching "${soupTypeSearchTerm}"` : 'No soup types available'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rating Filter */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <StarIcon className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold text-gray-800">Minimum Rating</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                            selectedRatings.length === 0
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedRatings([])}
                        >
                          Any Rating
                        </button>
                        
                        {ratingOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                              selectedRatings.includes(option.value)
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (selectedRatings.includes(option.value)) {
                                setSelectedRatings(selectedRatings.filter(r => r !== option.value));
                              } else {
                                setSelectedRatings([...selectedRatings, option.value]);
                              }
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-gray-800">Price Range</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                            selectedPriceRanges.length === 0
                              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedPriceRanges([])}
                        >
                          Any Price
                        </button>
                        
                        {priceRangeOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                              selectedPriceRanges.includes(option.value)
                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (selectedPriceRanges.includes(option.value)) {
                                setSelectedPriceRanges(selectedPriceRanges.filter(p => p !== option.value));
                              } else {
                                setSelectedPriceRanges([...selectedPriceRanges, option.value]);
                              }
                            }}
                            title={option.description}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Restaurant Grid */}
            <div className="lg:w-3/4">
              {/* Results Summary */}
              <div className="mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🍜</span>
                      <span className="text-lg font-semibold text-gray-800">
                        {totalCount} restaurant{totalCount !== 1 ? 's' : ''} found
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Ready to explore
                    </div>
                  </div>
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                  <p className="text-red-800">Error loading restaurants: {error}</p>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <SkeletonLoader count={6} />
              )}

              {/* No Results */}
              {!isLoading && restaurants.length === 0 && !error && (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 rounded-3xl mb-6">
                    <span className="text-5xl">🍲</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No restaurants found</h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Try adjusting your filters or search in a different area to discover amazing soup spots.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSoupTypes([]);
                      setSelectedRatings([]);
                      setSelectedPriceRanges([]);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* Restaurant Grid */}
              {!isLoading && restaurants.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {restaurants.map((restaurant, index) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      selectedSoupTypes={selectedSoupTypes}
                      selectedRatings={selectedRatings}
                      selectedPriceRanges={selectedPriceRanges}
                      animationIndex={index}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-xl hover:bg-gray-100 transition-colors disabled:hover:bg-transparent"
                    >
                      ← Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        const isCurrentPage = page === currentPage;
                        const isNearCurrent = Math.abs(page - currentPage) <= 2;
                        const isFirstOrLast = page === 1 || page === totalPages;
                        
                        if (isCurrentPage || isNearCurrent || isFirstOrLast) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                isCurrentPage
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === currentPage - 3 || page === currentPage + 3) {
                          return <span key={page} className="px-2 text-gray-400">...</span>;
                        }
                        return null;
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-xl hover:bg-gray-100 transition-colors disabled:hover:bg-transparent"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          soupTypes={soupTypeCategories.flatMap(cat => cat.types.map(t => t.name))}
          selectedSoupTypes={selectedSoupTypes}
          onSoupTypeChange={setSelectedSoupTypes}
          ratingOptions={ratingOptions}
          selectedRatings={selectedRatings}
          onRatingChange={setSelectedRatings}
          priceRangeOptions={priceRangeOptions}
          selectedPriceRanges={selectedPriceRanges}
          onPriceRangeChange={setSelectedPriceRanges}
          locationQuery={locationQuery}
          onLocationChange={setLocationQuery}
          onLocationSearch={handleLocationSearch}
        />
      </div>
    </>
  );
}