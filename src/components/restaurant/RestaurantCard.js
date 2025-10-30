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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
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
    google_photos,
    photo_urls,
    soup_types = [],
    price_range,
    is_verified,
  } = restaurant;
 
  // Generate URL for the restaurant
  const restaurantUrl = slug && city && state 
    ? `/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}/${slug}`
    : `/restaurants/${id}`;
  
  // Get all available images for this restaurant
  const getAllImages = () => {
    const images = [];
    
    // First, try photo_urls array
    if (photo_urls && Array.isArray(photo_urls) && photo_urls.length > 0) {
      const validPhotos = photo_urls.filter(url => url && typeof url === 'string' && url.startsWith('http'));
      images.push(...validPhotos);
    }
    
    // Then try google_photos
    if (google_photos && Array.isArray(google_photos) && google_photos.length > 0) {
      const validGooglePhotos = google_photos.filter(url => url && typeof url === 'string' && url.startsWith('http'));
      images.push(...validGooglePhotos);
    }
    
    // Then try image_url
    if (image_url && typeof image_url === 'string' && image_url.startsWith('http')) {
      images.push(image_url);
    }
    
    // Return unique images only
    return [...new Set(images)];
  };
  
  const availableImages = getAllImages();
  const hasMultipleImages = availableImages.length > 1;
  
  // Get current image or fallback to placeholder
  const getCurrentImage = () => {
    if (availableImages.length > 0) {
      return availableImages[currentImageIndex] || availableImages[0];
    }
    return null; // Will show placeholder
  };
  
  // Navigate to next image
  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
    setImageLoaded(false);
  };
  
  // Navigate to previous image
  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
    setImageLoaded(false);
  };
  
  // Handle missing or error in image loading
  const handleImageError = () => {
    setImageError(true);
  };

  // Progressive image wrapper with better loading states
  const ProgressiveImage = ({ src, alt, className, onError, style }) => {
    return (
      <>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-2xl flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-400 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-all duration-500 ease-out`}
          style={style}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={onError}
          crossOrigin="anonymous"
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
  const displayPriceRange = price_range && price_range !== 0 && price_range !== '0' ? price_range : '$$';
  
  // Generate estimated delivery time (random for demo purposes)
  const estimatedDeliveryTime = `${Math.floor(Math.random() * 15) + 15}-${Math.floor(Math.random() * 15) + 25} min`;
  
  return (
    <div
      className="group bg-white rounded-3xl shadow-soft hover:shadow-xl border-0 overflow-hidden transition-all duration-500 hover:scale-[1.02] transform backdrop-blur-sm"
      style={{ animationDelay: `${animationIndex * 100}ms` }}
      ref={cardRef}
    >
      <Link href={restaurantUrl} className="block">
        {/* Hero Image Section - Better food showcase */}
        <div className="relative h-64 w-full overflow-hidden bg-gray-50 group/image">
          {/* Background Image */}
          {imageError || !getCurrentImage() ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-t-2xl">
              <div className="text-center px-6">
                <svg className="w-16 h-16 mx-auto mb-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-neutral-600 font-medium block">Images Coming Soon</span>
                <span className="text-xs text-neutral-500 block mt-1">Check back later</span>
              </div>
            </div>
          ) : (
            <ProgressiveImage
              src={getCurrentImage()}
              alt={`${name} - Soup Restaurant`}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              onError={handleImageError}
              style={{
                objectPosition: 'center 25%',
                minHeight: '100%',
                minWidth: '100%'
              }}
            />
          )}
          
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Image Navigation Arrows - Only show if multiple images */}
          {hasMultipleImages && !imageError && (
            <>
              {/* Previous Arrow */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Next Arrow */}
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 z-10"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {availableImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                      setImageLoaded(false);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'bg-white w-6'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
              
              {/* Image Counter */}
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                {currentImageIndex + 1} / {availableImages.length}
              </div>
            </>
          )}
          
          {/* Floating Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {/* Price Range Badge */}
            {displayPriceRange && displayPriceRange !== '0' && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl px-3 py-2 text-sm font-semibold text-gray-800 shadow-lg border border-white/40 flex items-center gap-1.5">
                {displayPriceRange}
              </div>
            )}
          </div>
          
          {/* Verified Badge */}
          {is_verified && (
            <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md rounded-2xl px-3 py-2 text-xs font-semibold text-white shadow-lg border border-emerald-400/40 flex items-center gap-1.5">
              <span className="text-sm">✓</span>
              Verified
            </div>
          )}
          
          {/* Delivery Time Badge */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl px-3 py-2 text-sm font-medium text-white shadow-lg border border-white/20 flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              {estimatedDeliveryTime}
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          {/* Restaurant Name */}
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300 mb-3 line-clamp-2 leading-tight">
            {name}
          </h3>
          
          {/* Star Rating - Always Display */}
          <div className="flex items-center mb-3">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 transition-all duration-300 ${
                    i < Math.floor(rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-neutral-600 text-sm">
              {rating ? rating.toFixed(1) : 'N/A'}
              {review_count ? ` (${review_count} review${review_count !== 1 ? 's' : ''})` : ''}
            </span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 mb-4">
            <MapPinIcon className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600 font-medium">
              {city}, {state}
            </span>
          </div>
          
          {/* Soup Types */}
          {soup_types && soup_types.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {soup_types.slice(0, 3).map((type, typeIndex) => (
                  <span
                    key={typeIndex}
                    className={`inline-flex items-center px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      isSoupTypeSelected(type)
                        ? 'bg-orange-100 text-orange-700 border border-orange-200 group-hover:bg-orange-200 group-hover:scale-105'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 group-hover:bg-gray-100 group-hover:scale-105'
                    }`}
                  >
                    <span className="mr-2 text-base">{getSoupEmoji(type)}</span> 
                    {type}
                  </span>
                ))}
                {soup_types.length > 3 && (
                  <span className="inline-flex items-center px-3 py-2 rounded-2xl text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
                    +{soup_types.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Price Range & CTA Row */}
          <div className="flex items-center justify-between">
            {/* Price Range */}
            <span className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-2xl border border-gray-200 font-medium">
              {getPriceRangeLabel()}
            </span>
            
            {/* CTA Button */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl px-6 py-2.5 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse">
              <span className="flex items-center justify-center gap-2">
                <span>View</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}