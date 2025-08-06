// src/components/restaurant/RestaurantListingPage.js
import { useState, useEffect, useRef } from 'react';
import useRestaurants from '../../hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import SkeletonLoader from '../ui/SkeletonLoader';
import MobileFilterDrawer from './MobileFilterDrawer';
import Breadcrumbs from '../ui/Breadcrumbs';
import Link from 'next/link';
import Head from 'next/head';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function RestaurantListingPage({
  title = 'Soup Restaurants',
  description = 'Discover the best soup restaurants near you.',
  city = null,
  state = null,
  initialPage = 1,
  pageSize = 12,
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [selectedSoupType, setSelectedSoupType] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  
  // Updated to support multiple selections
  const [selectedSoupTypes, setSelectedSoupTypes] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Searchable dropdown state
  const [isSoupTypeDropdownOpen, setIsSoupTypeDropdownOpen] = useState(false);
  const [soupTypeSearchTerm, setSoupTypeSearchTerm] = useState('');
  const soupTypeDropdownRef = useRef(null);
  
  // Fetch restaurants with the given filters
  const { restaurants, loading, error, totalCount } = useRestaurants({
    city,
    state,
    limit: 12,
    soupType: selectedSoupTypes.length > 0 ? selectedSoupTypes : null,
    rating: selectedRatings.length > 0 ? Math.min(...selectedRatings) : null,
    priceRange: selectedPriceRanges.length > 0 ? selectedPriceRanges : null,
    page: currentPage
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSoupType, selectedRating, selectedPriceRange, city, state]);
  
  // All soup types organized by category with restaurant counts
  const soupTypeCategories = [
    {
      name: '🍜 Asian Soups',
      types: [
        { name: 'Pho', count: 85 },
        { name: 'Ramen', count: 81 },
        { name: 'Udon', count: 71 },
        { name: 'Wonton', count: 19 },
        { name: 'Egg Drop', count: 15 },
        { name: 'Hot and Sour', count: 14 },
        { name: 'Miso', count: 11 },
        { name: 'Tom Yum', count: 10 },
        { name: 'Tom Kha', count: 10 },
        { name: 'Tonkotsu', count: 9 },
        { name: 'Shoyu', count: 2 },
        { name: 'Congee', count: 2 },
        { name: 'Samgyetang', count: 7 },
        { name: 'Kimchi', count: 7 },
        { name: 'Bun Bo Hue', count: 8 }
      ]
    },
    {
      name: '🥣 Western Soups',
      types: [
        { name: 'Clam Chowder', count: 12 },
        { name: 'Lobster Bisque', count: 10 },
        { name: 'French Onion', count: 8 },
        { name: 'Vichyssoise', count: 8 },
        { name: 'Bouillabaisse', count: 8 },
        { name: 'Tomato', count: 5 },
        { name: 'Minestrone', count: 5 },
        { name: 'Chowder', count: 5 },
        { name: 'Vegetable', count: 4 },
        { name: 'Stracciatella', count: 4 },
        { name: 'Ribollita', count: 4 },
        { name: 'Chicken Noodle', count: 3 },
        { name: 'Bone Broth', count: 3 },
        { name: 'Bisque', count: 2 },
        { name: 'Corn Chowder', count: 1 },
        { name: 'Avgolemono', count: 1 }
      ]
    },
    {
      name: '⭐ Specialty Soups',
      types: [
        { name: 'House Special', count: 28 },
        { name: 'Vegan', count: 12 },
        { name: 'Cioppino', count: 9 },
        { name: 'Mushroom', count: 6 },
        { name: 'Cabbage', count: 5 },
        { name: 'Fruit', count: 4 },
        { name: 'Apple', count: 4 },
        { name: 'Tortilla', count: 3 },
        { name: 'Lentil', count: 3 },
        { name: 'Sweet Potato', count: 1 },
        { name: 'Pumpkin', count: 1 },
        { name: 'Potato Leek', count: 1 },
        { name: 'Pickle', count: 1 },
        { name: 'Matzo Ball', count: 1 },
        { name: 'Cauliflower', count: 1 },
        { name: 'Butternut Squash', count: 1 },
        { name: 'Ajiaco', count: 1 },
        { name: 'Cherry', count: 2 }
      ]
    }
  ];

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
    { value: 4.5, label: '4.5+' },
    { value: 4, label: '4+' },
    { value: 3.5, label: '3.5+' },
    { value: 3, label: '3+' },
  ];

  // Price range options for filtering
  const priceRangeOptions = [
    { value: '$', label: '$', description: 'Budget Friendly' },
    { value: '$$', label: '$$', description: 'Moderately Priced' },
    { value: '$$$', label: '$$$', description: 'Fine Dining' },
    { value: '$$$$', label: '$$$$', description: 'Luxury' },
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
  
  if (selectedSoupType) {
    pageTitle = `${selectedSoupType} ${pageTitle}`;
  }
  
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
  
  return (
    <>
      <Head>
        <title>{pageTitle} | FindSoupNearMe</title>
        <meta name="description" content={description} />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs customCrumbs={generateBreadcrumbs()} />
        
        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
          {pageTitle}
        </h1>
        
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-orange-50 py-3 px-4 rounded-lg text-neutral-800"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filter Restaurants</span>
          </button>
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
        />
        
        {/* Desktop Filters Section */}
        <div className="hidden md:block">
          <div className="flex items-center mb-3">
            <h2 className="text-lg font-semibold text-neutral-800">Filter Restaurants</h2>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg mb-8">
            <div className="flex justify-between items-start space-x-8">
              {/* Soup Type Filter - Searchable Dropdown */}
              <div className="flex-1">
                <label className="block text-neutral-700 mb-3 font-medium">Soup Type</label>
                <div className="relative" ref={soupTypeDropdownRef}>
                  {/* Selected Items Display */}
                  {selectedSoupTypes.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">Selected:</span>
                        <button
                          onClick={clearAllSoupTypes}
                          className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSoupTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white border border-primary-600"
                          >
                            {type}
                            <button
                              onClick={() => removeSoupType(type)}
                              className="ml-2 hover:text-orange-200"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dropdown Trigger */}
                  <button
                    onClick={() => setIsSoupTypeDropdownOpen(!isSoupTypeDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-300 rounded-lg text-left hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <span className={selectedSoupTypes.length > 0 ? 'text-neutral-900' : 'text-neutral-500'}>
                      {selectedSoupTypes.length > 0 
                        ? `${selectedSoupTypes.length} soup type${selectedSoupTypes.length > 1 ? 's' : ''} selected`
                        : 'Select soup types...'
                      }
                    </span>
                    <svg
                      className={`w-5 h-5 text-neutral-400 transition-transform ${isSoupTypeDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isSoupTypeDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                      {/* Search Input */}
                      <div className="p-3 border-b border-neutral-200">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search soup types..."
                            value={soupTypeSearchTerm}
                            onChange={(e) => setSoupTypeSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <svg
                            className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Categories and Options */}
                      <div className="max-h-80 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <div key={category.name}>
                              <div className="px-3 py-2 bg-neutral-50 text-sm font-medium text-neutral-700 border-b border-neutral-200">
                                {category.name}
                              </div>
                              {category.types.map((type) => (
                                <label
                                  key={type.name}
                                  className="flex items-center px-3 py-2 hover:bg-neutral-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedSoupTypes.includes(type.name)}
                                    onChange={() => toggleSoupType(type.name)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                                  />
                                  <span className="ml-3 text-sm text-neutral-900 flex-1">
                                    {type.name}
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    ({type.count})
                                  </span>
                                </label>
                              ))}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center text-neutral-500">
                            No soup types found matching "{soupTypeSearchTerm}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Rating and Price Range Stacked */}
              <div className="flex-1 space-y-4">
                {/* Rating Filter */}
                <div>
                  <label className="block text-neutral-700 mb-3 font-medium">Minimum Rating</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedRatings.length === 0
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-white text-neutral-700 hover:bg-primary-50 border border-primary-200 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedRatings([])}
                    >
                      Any Rating
                    </button>
                    
                    {ratingOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedRatings.includes(option.value)
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-white text-neutral-700 hover:bg-primary-50 border border-primary-200 hover:shadow-sm'
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
                <div>
                  <label className="block text-neutral-700 mb-3 font-medium">Price Range</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedPriceRanges.length === 0
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-white text-neutral-700 hover:bg-primary-50 border border-primary-200 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedPriceRanges([])}
                    >
                      Any Price
                    </button>
                    
                    {priceRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedPriceRanges.includes(option.value)
                            ? 'bg-primary-500 text-white shadow-md'
                            : 'bg-white text-neutral-700 hover:bg-primary-50 border border-primary-200 hover:shadow-sm'
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

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600">
            {loading ? 'Loading...' : `${totalCount} restaurant${totalCount !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error loading restaurants: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && restaurants.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍲</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No restaurants found</h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your filters or search in a different area.
            </p>
            <button
              onClick={() => {
                setSelectedSoupTypes([]);
                setSelectedRatings([]);
                setSelectedPriceRanges([]);
              }}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && restaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant}
                selectedSoupTypes={selectedSoupTypes}
                selectedRatings={selectedRatings}
                selectedPriceRanges={selectedPriceRanges}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
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
                      className={`px-3 py-2 rounded-lg font-medium ${
                        isCurrentPage
                          ? 'bg-orange-500 text-white'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="px-2 text-neutral-400">...</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}