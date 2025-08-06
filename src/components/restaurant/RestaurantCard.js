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
  
  return (
    <div className="card overflow-hidden hover-lift h-full">
      <Link href={restaurantUrl} className="block h-full flex flex-col">
        <div className="relative h-48 w-full overflow-hidden">
          {/* Image */}
          {imageError ? (
            <div className="flex items-center justify-center h-full bg-accent-100">
              <span className="text-5xl">🍲</span>
            </div>
          ) : (
            <img
              src={image_url || `/api/mock/soup-images?id=${id}`}
              alt={`${name} - Soup Restaurant`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              onError={handleImageError}
            />
          )}
          
          {/* Price range label - Moved to top right */}
          {price_range && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium shadow-lg border border-white/20">
              {price_range}
            </div>
          )}
          
          {/* Verified badge if applicable */}
          {is_verified && (
            <div className="absolute top-3 left-3 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center shadow-soft">
              <span className="text-orange-500 mr-1">✓</span> Verified
            </div>
          )}
        </div>
        
        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-bold text-neutral-900 line-clamp-1">{name}</h2>
            
            {/* Star rating - Moved under restaurant name */}
            <div className="flex items-center">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.round(rating) ? 'text-orange-400 fill-current' : 'text-gray-300 fill-current'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-neutral-600 text-sm">
                {rating ? rating.toFixed(1) : 'N/A'}
                {review_count ? ` (${review_count})` : ''}
              </span>
            </div>
            
            {/* Location */}
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-neutral-600 text-sm line-clamp-1">
                {city}, {state}
              </span>
            </div>
            
            {/* Soup Types */}
            {soup_types && soup_types.length > 0 && (
              <div className="flex flex-wrap gap-2 min-h-[3rem]">
                {soup_types.slice(0, 3).map((type, index) => (
                  <span 
                    key={index} 
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${
                      isSoupTypeSelected(type)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-primary-50 text-primary-700 border-primary-200'
                    }`}
                  >
                    <span className="mr-1">{getSoupEmoji(type)}</span> {type}
                  </span>
                ))}
                {soup_types.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600 border border-primary-200">
                    +{soup_types.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* View Details Button */}
          <Link
            href={restaurantUrl}
            className="block w-full text-center py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-soft hover:shadow-md mt-6"
          >
            View Details
          </Link>
        </div>
      </Link>
    </div>
  );
}