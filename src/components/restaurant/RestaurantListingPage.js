// src/components/restaurant/RestaurantListingPage.js
import { useState, useEffect } from 'react';
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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Fetch restaurants with the given filters
  const { 
    restaurants, 
    loading, 
    error, 
    totalCount 
  } = useRestaurants({
    city,
    state,
    limit: pageSize,
    page: currentPage,
    soupType: selectedSoupType,
    rating: selectedRating,
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSoupType, selectedRating, city, state]);
  
  // Common soup types for filtering
  const soupTypes = [
    'Ramen',
    'Pho',
    'Chowder',
    'French Onion',
    'Tomato',
    'Chicken Noodle',
    'Minestrone',
    'Beef Stew',
    'Vegetable',
  ];
  
  // Rating options for filtering
  const ratingOptions = [
    { value: 4.5, label: '4.5+' },
    { value: 4, label: '4+' },
    { value: 3.5, label: '3.5+' },
    { value: 3, label: '3+' },
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
        <h1 className="text-2xl md:text-3xl font-bold text-soup-brown-900 mb-6">
          {pageTitle}
        </h1>
        
        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-soup-orange-50 py-3 px-4 rounded-lg text-soup-brown-800"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filter Restaurants</span>
          </button>
        </div>
        
        {/* Mobile Filter Drawer */}
        <MobileFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          soupTypes={soupTypes}
          selectedSoupType={selectedSoupType}
          onSoupTypeChange={(type) => {
            setSelectedSoupType(type);
            // Don't close drawer yet to allow multiple selections
          }}
          ratingOptions={ratingOptions}
          selectedRating={selectedRating}
          onRatingChange={(rating) => {
            setSelectedRating(rating);
            // Don't close drawer yet to allow multiple selections
          }}
        />
        
        {/* Desktop Filters Section */}
        <div className="hidden md:block bg-soup-orange-50 p-4 rounded-lg mb-8">
          <h2 className="text-lg font-semibold text-soup-brown-800 mb-3">Filter Restaurants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soup Type Filter */}
            <div>
              <label className="block text-soup-brown-700 mb-2">Soup Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedSoupType === null
                      ? 'bg-soup-red-600 text-white'
                      : 'bg-white text-soup-brown-700 hover:bg-soup-red-100'
                  }`}
                  onClick={() => setSelectedSoupType(null)}
                >
                  All Types
                </button>
                
                {soupTypes.map((type) => (
                  <button
                    key={type}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedSoupType === type
                        ? 'bg-soup-red-600 text-white'
                        : 'bg-white text-soup-brown-700 hover:bg-soup-red-100'
                    }`}
                    onClick={() => setSelectedSoupType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rating Filter */}
            <div>
              <label className="block text-soup-brown-700 mb-2">Minimum Rating</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedRating === null
                      ? 'bg-soup-red-600 text-white'
                      : 'bg-white text-soup-brown-700 hover:bg-soup-red-100'
                  }`}
                  onClick={() => setSelectedRating(null)}
                >
                  Any Rating
                </button>
                
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedRating === option.value
                        ? 'bg-soup-red-600 text-white'
                        : 'bg-white text-soup-brown-700 hover:bg-soup-red-100'
                    }`}
                    onClick={() => setSelectedRating(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6 text-soup-brown-700">
          {loading ? (
            <p>Finding the best soup spots for you...</p>
          ) : error ? (
            <p>Error loading restaurants. Please try again later.</p>
          ) : (
            <p>
              Found <span className="font-semibold">{totalCount}</span> 
              {selectedSoupType ? ` ${selectedSoupType}` : ''} restaurants
              {city ? ` in ${city}` : ''}
              {state && !city ? ` in ${state}` : ''}
              {selectedRating ? ` with ${selectedRating}+ stars` : ''}
            </p>
          )}
        </div>
        
        {/* Restaurant Grid */}
        {loading ? (
          <SkeletonLoader count={pageSize} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error loading restaurants. Please try again later.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-soup-red-600 hover:bg-soup-red-700 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-soup-orange-50 rounded-lg">
            <p className="text-soup-brown-700 mb-4">
              No restaurants found with the selected filters.
            </p>
            <button
              onClick={() => {
                setSelectedSoupType(null);
                setSelectedRating(null);
              }}
              className="bg-soup-red-600 hover:bg-soup-red-700 text-white px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-soup-red-600 text-white hover:bg-soup-red-700'
                }`}
                aria-label="Previous page"
              >
                <span className="sr-only md:not-sr-only">Previous</span>
              </button>
              
              {/* Mobile: Show current page / total */}
              <div className="md:hidden flex items-center px-3 py-1">
                <span className="text-soup-brown-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              {/* Desktop: Show page numbers */}
              <div className="hidden md:flex space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    // Show all pages if 5 or fewer
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // Show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Show current page and 2 on each side
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                          ? 'bg-soup-red-600 text-white'
                          : 'bg-white text-soup-brown-700 hover:bg-soup-red-100'
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-soup-red-600 text-white hover:bg-soup-red-700'
                }`}
                aria-label="Next page"
              >
                <span className="sr-only md:not-sr-only">Next</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}