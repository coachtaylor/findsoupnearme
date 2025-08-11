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
  const { restaurants, loading, error, totalCount, refetch } = useRestaurants({
    city,
    state,
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
            className="w-full flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm py-3 px-4 rounded-xl text-neutral-800"
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
          
          <div className="relative z-20 rounded-2xl p-6 mb-6 bg-white/70 backdrop-blur-md border border-white/60 shadow-sm">
            <div className="flex justify-between items-start gap-8">
              {/* Soup Type Filter - Searchable Dropdown */}
              <div className="flex-1">
                <label className="block text-neutral-700 mb-3 font-medium">Soup Type</label>
                <div className={`relative ${isSoupTypeDropdownOpen ? 'mb-48' : ''}`} ref={soupTypeDropdownRef}>
                  {/* Selected Items Display */}
                  {selectedSoupTypes.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-700">Selected:</span>
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
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-500 text-white border border-orange-500 shadow-sm transition transform hover:scale-105"
                          >
                            {type}
                            <button
                              onClick={() => removeSoupType(type)}
                              className="ml-2 hover:text-orange-100"
                              aria-label={`Remove ${type}`}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dropdown Trigger as Search Input (single search bar) */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={selectedSoupTypes.length > 0 ? `${selectedSoupTypes.length} selected • search to add more...` : 'Select or search soup types...'}
                      value={soupTypeSearchTerm}
                      onChange={(e) => setSoupTypeSearchTerm(e.target.value)}
                      onFocus={() => setIsSoupTypeDropdownOpen(true)}
                      className="w-full pl-10 pr-10 py-3 bg-white/80 backdrop-blur-md border border-white/60 rounded-xl text-neutral-700 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-300/60"
                    />
                    <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  <button
                      type="button"
                      aria-label="Toggle soup type dropdown"
                    onClick={() => setIsSoupTypeDropdownOpen(!isSoupTypeDropdownOpen)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <svg className={`w-5 h-5 transition-transform ${isSoupTypeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isSoupTypeDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-md border border-white/60 rounded-xl shadow-xl max-h-96 overflow-hidden animate-fade-in">

                      {/* Categories and Options */}
                      <div className="max-h-80 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <div key={category.name}>
                              <div className="px-3 py-2 bg-neutral-50 text-sm font-medium text-neutral-700 border-b border-neutral-200/70">
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
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-neutral-300 rounded"
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
              <div className="flex-1 space-y-6">
                {/* Rating Filter */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-neutral-700 font-medium">Minimum Rating</label>
                    {selectedRatings.length > 0 && (
                      <span className="text-xs text-orange-600 font-medium">{selectedRatings.length} selected</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                        selectedRatings.length === 0
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white/80 backdrop-blur-sm text-neutral-700 border-neutral-200 hover:bg-orange-50'
                      }`}
                      onClick={() => setSelectedRatings([])}
                    >
                      Any Rating
                    </button>
                    
                    {ratingOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                          selectedRatings.includes(option.value)
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-white/80 backdrop-blur-sm text-neutral-700 border-neutral-200 hover:bg-orange-50'
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-neutral-700 font-medium">Price Range</label>
                    {selectedPriceRanges.length > 0 && (
                      <span className="text-xs text-orange-600 font-medium">{selectedPriceRanges.length} selected</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                        selectedPriceRanges.length === 0
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white/80 backdrop-blur-sm text-neutral-700 border-neutral-200 hover:bg-orange-50'
                      }`}
                      onClick={() => setSelectedPriceRanges([])}
                    >
                      Any Price
                    </button>
                    
                    {priceRangeOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all border ${
                          selectedPriceRanges.includes(option.value)
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-white/80 backdrop-blur-sm text-neutral-700 border-neutral-200 hover:bg-orange-50'
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
        {isLoading && (
          <SkeletonLoader count={6} />
        )}

        {/* No Results */}
        {!isLoading && restaurants.length === 0 && !error && (
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
        {!isLoading && restaurants.length > 0 && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {restaurants.map((restaurant, index) => (
              <div 
                key={restaurant.id}
                className="glassmorphism-card group stagger-animate h-full card-interactive reveal-on-scroll will-change-transform will-change-opacity"
                style={{
                  animationDelay: `${index * 150}ms`,
                  transform: `translateY(${index * 20}px)`
                }}
              >
                <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                  <img
                    src={restaurant.image_url || '/images/soup-pattern.svg'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = '/images/soup-pattern.svg';
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Steam Animation */}
                  <div className="steam-container absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="steam animate-steam-1"></div>
                    <div className="steam animate-steam-2"></div>
                    <div className="steam animate-steam-3"></div>
                  </div>
                  
                  {/* Price range label - Top right */}
                  {restaurant.price_range && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium shadow-lg border border-white/20 hover-reveal"
                         data-hover-text={`Price range: ${restaurant.price_range}`}>
                      {restaurant.price_range}
                    </div>
                  )}
                  
                  {/* Verified badge if applicable - Top left */}
                  {restaurant.is_verified && (
                    <div className="absolute top-3 left-3 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center shadow-soft hover-reveal"
                         data-hover-text="Verified restaurant">
                      <span className="text-orange-500 mr-1">✓</span> Verified
                    </div>
                  )}
                </div>
                
                <div className="p-6 relative z-10 flex flex-col flex-1">
                  <div className="flex-1 space-y-4">
                    {/* Restaurant Name */}
                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                      {restaurant.name}
                    </h3>
                    
                    {/* Star Rating */}
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 transition-all duration-300 ${
                              i < Math.floor(restaurant.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-neutral-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-neutral-600 text-sm">
                        {restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}
                        {restaurant.review_count ? ` (${restaurant.review_count})` : ''}
                      </span>
                    </div>
                    
                    {/* Location with Animated Icon */}
                    <div className="flex items-center space-x-2">
                      <div className="map-pin-container">
                        <svg className="h-4 w-4 text-orange-500 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-neutral-600 text-sm line-clamp-1">
                        {restaurant.city}, {restaurant.state}
                      </span>
                    </div>
                    
                    {/* Soup Types - Always Visible */}
                    {restaurant.soup_types && restaurant.soup_types.length > 0 && (
                      <div className="flex flex-wrap gap-2 min-h-[3rem]">
                        {restaurant.soup_types.slice(0, 3).map((type, typeIndex) => (
                          <span
                            key={typeIndex}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors duration-200 micro-interaction"
                            style={{ animationDelay: `${typeIndex * 50}ms` }}
                          >
                            <span className="mr-1">{getSoupEmoji(type)}</span> {type}
                          </span>
                        ))}
                        {restaurant.soup_types.length > 3 && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                            +{restaurant.soup_types.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* View Details Button with Enhanced Hover */}
                  <Link
                    href={restaurant.slug && restaurant.city && restaurant.state
                      ? `/${restaurant.state.toLowerCase()}/${restaurant.city.toLowerCase().replace(/\s+/g, '-')}/${restaurant.slug}`
                      : `/restaurants/${restaurant.id}`
                    }
                    className="block w-full text-center py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse mt-6 btn-enhanced click-feedback"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>View Details</span>
                      <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
                
                {/* Subtle Border Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/30 via-transparent to-orange-600/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm"></div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
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