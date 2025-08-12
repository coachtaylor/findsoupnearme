// src/components/restaurant/RestaurantCard.js
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { StarIcon, MapPinIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

export default function RestaurantCard({ 
  restaurant, 
  selectedSoupTypes = [], 
  selectedRatings = [], 
  selectedPriceRanges = [],
  animationIndex = 0,
  isFeatured = false,
}) {
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
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

  // Progressive image wrapper
  const ProgressiveImage = ({ src, alt, className, onError }) => {
    return (
      <>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-2xl" />
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={onError}
        />
      </>
    );
  };
  
  // Map price range to dollar signs
  const getPriceRangeLabel = () => {
    switch (price_range) {
      case '$':
        return 'Budget Friendly';
      case '$$':
        return 'Moderately Priced';
      case '$$$':
        return 'Fine Dining';
      case '$$$$':
        return 'Luxury';
      default:
        return 'Moderately Priced';
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
  const displayPriceRange = price_range && price_range !== '0' ? price_range : '$$';
  
  // Generate estimated delivery time (random for demo purposes)
  const estimatedDeliveryTime = `${Math.floor(Math.random() * 15) + 15}-${Math.floor(Math.random() * 15) + 25} min`;
  
  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 will-change-transform"
      style={{ animationDelay: `${animationIndex * 100}ms` }}
      ref={cardRef}
    >
      <Link href={restaurantUrl} className="block">
        {/* Image Container - 16:9 Aspect Ratio */}
        <div className="relative h-48 w-full overflow-hidden">
          {/* Background Image */}
          {imageError ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-orange-200">
              <span className="text-6xl">🍲</span>
            </div>
          ) : (
            <ProgressiveImage
              src={image_url || `/api/mock/soup-images?id=${id}`}
              alt={`${name} - Soup Restaurant`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={handleImageError}
            />
          )}
          
          {/* Semi-transparent gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Top Right Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {/* Price Range Badge */}
            {displayPriceRange && displayPriceRange !== '0' && (
              <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-lg border border-white/60 flex items-center gap-1">
                <CurrencyDollarIcon className="h-3 w-3 text-green-600" />
                {displayPriceRange}
              </div>
            )}
            
            {/* Rating Badge */}
            {rating && rating > 0 && (
              <div className="bg-orange-500/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg border border-orange-400/60 flex items-center gap-1">
                <StarIcon className="h-3 w-3 text-yellow-300" />
                {rating.toFixed(1)}
              </div>
            )}
          </div>
          
          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Verified Badge */}
            {is_verified && (
              <div className="bg-emerald-500/95 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg border border-emerald-400/60 flex items-center gap-1">
                <span className="text-xs">✓</span>
                Verified
              </div>
            )}
          </div>
          
          {/* Delivery Time Badge - Bottom Right */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-black/80 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-lg border border-white/20 flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {estimatedDeliveryTime}
            </div>
          </div>
        </div>
        
        {/* Content Container */}
        <div className="p-5">
          {/* Restaurant Name */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 mb-3 line-clamp-2 leading-tight">
            {name}
          </h3>
          
          {/* Rating and Review Count */}
          {rating && rating > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
              </div>
              {review_count && review_count > 0 && (
                <span className="text-sm text-gray-500">
                  ({review_count} review{review_count !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          )}
          
          {/* Location */}
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {city}, {state}
            </span>
          </div>
          
          {/* Soup Types - Horizontal Layout */}
          {soup_types && soup_types.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {soup_types.slice(0, 3).map((type, typeIndex) => (
                  <span
                    key={typeIndex}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                      isSoupTypeSelected(type)
                        ? 'bg-orange-100 text-orange-700 border-orange-200 group-hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <span className="mr-1.5 text-sm">{getSoupEmoji(type)}</span> 
                    {type}
                  </span>
                ))}
                {soup_types.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    +{soup_types.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Price Range Description */}
          <div className="mb-4">
            <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              {getPriceRangeLabel()}
            </span>
          </div>
          
          {/* CTA Button */}
          <div className="w-full text-center py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse">
            <span className="flex items-center justify-center gap-2">
              <span>View Details</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}