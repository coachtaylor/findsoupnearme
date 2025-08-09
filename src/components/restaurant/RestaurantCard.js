// src/components/restaurant/RestaurantCard.js
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function RestaurantCard({ 
  restaurant, 
  selectedSoupTypes = [], 
  selectedRatings = [], 
  selectedPriceRanges = [] 
}) {
  const [imageError, setImageError] = useState(false);
  
  // Format restaurant information
  const {
    id,
    name,
    slug,
    city,
    state,
    rating,
    review_count,
    image_url,
    soup_types = [],
    price_range,
    is_verified,
  } = restaurant;
 
  // Debug: verify data flow for price range
  // eslint-disable-next-line no-console
  console.log('Restaurant data:', { id, name, rating, price_range, soup_types });

  // Generate URL for the restaurant
  const restaurantUrl = slug && city && state 
    ? `/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}/${slug}`
    : `/restaurants/${id}`;
  
  // Handle missing or error in image loading
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Map price range to dollar signs
  const getPriceRangeLabel = () => {
    switch (price_range) {
      case '$':
        return '$ · Budget Friendly';
      case '$$':
        return '$$ · Moderately Priced';
      case '$$$':
        return '$$$ · Fine Dining';
      case '$$$$':
        return '$$$$ · Luxury';
      default:
        return '';
    }
  };
  
  // Map soup types to emojis
  const getSoupEmoji = (type) => {
    const emojiMap = {
      'ramen': '🍜',
      'pho': '🍲',
      'chowder': '🥣',
      'tomato': '🍅',
      'chicken': '🐓',
      'vegetable': '🥕',
      'miso': '🥢',
      'stew': '🍲',
      'noodle': '🍝',
      'seafood': '🦞',
      'bean': '🫘',
      'corn': '🌽',
      'mushroom': '🍄'
    };
    
    const lowerType = type.toLowerCase();
    
    // Find a matching key in the emoji map
    for (const key in emojiMap) {
      if (lowerType.includes(key)) {
        return emojiMap[key];
      }
    }
    
    // Default emoji if no match found
    return '🥣';
  };
  
  // Check if a soup type matches selected filters
  const isSoupTypeSelected = (soupType) => {
    return selectedSoupTypes.length === 0 || selectedSoupTypes.includes(soupType);
  };

  // Decide what to show for price
  const displayPriceRange = price_range || '$$';
  
  return (
    <div className="restaurant-card-modern group h-full">
      <Link href={restaurantUrl} className="block h-full">
        <div className="relative h-full bg-white/95 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 overflow-hidden">
          
          {/* Image Section - Left Column */}
          <div className="relative h-48 lg:h-56 overflow-hidden">
            {/* Background Image */}
            {imageError ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-orange-200">
                <span className="text-6xl">🍲</span>
              </div>
            ) : (
              <img
                src={image_url || `/api/mock/soup-images?id=${id}`}
                alt={`${name} - Soup Restaurant`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={handleImageError}
              />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Rating Overlay - Top Right */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-white/60">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star} 
                      className={`h-3 w-3 ${star <= Math.round(rating || 0) ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-700 ml-1">
                  {rating ? rating.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Verified Badge - Bottom Left */}
            {is_verified && (
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold flex items-center shadow-lg border border-white/60">
                <span className="text-orange-500 mr-1">✓</span> Verified
              </div>
            )}
          </div>
          
          {/* Content Section - Right Column */}
          <div className="p-6 flex flex-col h-full">
            {/* Restaurant Name - Primary Typography */}
            <h2 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-orange-600 transition-colors duration-300">
              {name}
            </h2>
            
            {/* Location - Secondary Typography */}
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-600 text-sm font-medium">
                {city}, {state}
              </span>
            </div>
            
            {/* Review Count - Tertiary Typography */}
            {review_count && (
              <div className="mb-4">
                <span className="text-gray-500 text-xs">
                  {review_count} review{review_count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {/* Soup Types - Feature Tags + Price Range Pill */}
            <div className="flex flex-wrap gap-2 mb-4 flex-grow">
              {(soup_types || []).slice(0, 3).map((type, index) => (
                <span 
                  key={index} 
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 ${
                    isSoupTypeSelected(type)
                      ? 'bg-orange-100 text-orange-700 border-orange-200 group-hover:bg-orange-200 group-hover:border-orange-300'
                      : 'bg-gray-100 text-gray-700 border-gray-200 group-hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1.5 text-sm">{getSoupEmoji(type)}</span> 
                  {type}
                </span>
              ))}
              {soup_types && soup_types.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  +{soup_types.length - 3} more
                </span>
              )}

              {/* Price Range Pill (always show with default) */}
              <span
                className="inline-flex items-center px-2 py-1 rounded-md text-xs sm:text-sm font-medium bg-[#FFF1E6] text-[#E85D04] border border-[#FFD6B0] transition-colors duration-200 ease-in-out hover:bg-[#FFE8D6]"
                aria-label={`Price range ${displayPriceRange}`}
                title={`Price range ${displayPriceRange}`}
              >
                {displayPriceRange}
              </span>
            </div>
            
            {/* Divider to keep spacing consistent below content */}
            <div className="mt-auto pt-3 border-t border-gray-100" />
            
            {/* View Details Button - Hover State */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full text-center py-2.5 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                View Details
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}