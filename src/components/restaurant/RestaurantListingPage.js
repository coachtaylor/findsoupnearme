// src/components/restaurant/RestaurantListingPage.js
import { useState, useEffect } from 'react';
import useRestaurants from '../../hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';
import SkeletonLoader from '../ui/SkeletonLoader';
import Link from 'next/link';
import Head from 'next/head';

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
  
  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Restaurants', href: '/restaurants' },
  ];
  
  if (state) {
    breadcrumbItems.push({
      label: state,
      href: `/${state.toLowerCase()}/restaurants`,
    });
  }
  
  if (city && state) {
    breadcrumbItems.push({
      label: city,
      href: `/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}/restaurants`,
    });
  }
  
  return (
    <>
      <Head>
        <title>{pageTitle} | FindSoupNearMe</title>
        <meta name="description" content={description} />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-6">
          <ol className="flex flex-wrap">
            {breadcrumbItems.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && <span className="mx-2 text-soup-brown-400">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-soup-brown-600">{item.label}</span>
                ) : (
                  <Link href={item.href} className="text-soup-red-600 hover:text-soup-red-700">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-soup-brown-900 mb-6">
          {pageTitle}
        </h1>
        
        {/* Filters Section */}
        <div className="bg-soup-orange-50 p-4 rounded-lg mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-soup-red-600 text-white hover:bg-soup-red-700'
                }`}
              >
                Previous
              </button>
              
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
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-soup-red-600 text-white hover:bg-soup-red-700'
                }`}
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