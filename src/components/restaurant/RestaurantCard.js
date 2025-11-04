// src/components/restaurant/RestaurantCard.js
import Link from 'next/link';
import { useState } from 'react';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function RestaurantCard({ 
  restaurant, 
  animationIndex = 0,
}) {
  const [imageError, setImageError] = useState(false);
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
    google_photos,
    photo_urls,
    soup_types = [],
    price_range,
    is_verified,
    cuisine,
    cuisines,
    cuisine_type,
  } = restaurant;

  // Get cuisine type - handle different field names and formats
  const getCuisineType = () => {
    if (cuisine_type) return cuisine_type;
    if (cuisine) return Array.isArray(cuisine) ? cuisine[0] : cuisine;
    if (cuisines && Array.isArray(cuisines) && cuisines.length > 0) return cuisines[0];
    if (cuisines && typeof cuisines === 'string') return cuisines;
    return null;
  };

  const cuisineType = getCuisineType();
  
  // Debug: Log restaurant data to see what's available (temporarily enabled)
  if (process.env.NODE_ENV === 'development') {
    console.log('Restaurant card data:', { 
      name, 
      cuisine, 
      cuisines, 
      cuisine_type, 
      cuisineType,
      allFields: Object.keys(restaurant).filter(k => k.includes('cuisine') || k.includes('Cuisine'))
    });
  }
  
  // Format cuisine name for display
  const formatCuisineName = (cuisine) => {
    if (!cuisine) return '';
    return cuisine
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
 
  // Generate URL for the restaurant
  const restaurantUrl = slug && city && state 
    ? `/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, '-')}/${slug}`
    : `/restaurants/${id}`;
  
  // Get primary image
  const getPrimaryImage = () => {
    // Try photo_urls first
    if (photo_urls && Array.isArray(photo_urls) && photo_urls.length > 0) {
      const validPhoto = photo_urls.find(url => url && typeof url === 'string' && url.startsWith('http'));
      if (validPhoto) return validPhoto;
    }
    
    // Then try google_photos
    if (google_photos && Array.isArray(google_photos) && google_photos.length > 0) {
      const validPhoto = google_photos.find(url => url && typeof url === 'string' && url.startsWith('http'));
      if (validPhoto) return validPhoto;
    }
    
    // Then try image_url
    if (image_url && typeof image_url === 'string' && image_url.startsWith('http')) {
      return image_url;
    }
    
    return null;
  };
  
  const primaryImage = getPrimaryImage();
  const displayPriceRange = price_range && price_range !== '0' && price_range !== '0' ? price_range : '$$';
  const estimatedDeliveryTime = `${Math.floor(Math.random() * 15) + 15}-${Math.floor(Math.random() * 15) + 25} min`;
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-orange-300 transition-all duration-200 h-full flex flex-col"
      style={{ animationDelay: `${animationIndex * 100}ms` }}
    >
      <Link href={restaurantUrl} className="block h-full flex flex-col">
        {/* Hero Image Section - Reduced height */}
        <div className="relative h-40 w-full overflow-hidden bg-neutral-100 flex-shrink-0">
          {imageError || !primaryImage ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-neutral-100 to-neutral-200">
              <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ) : (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 bg-neutral-200 animate-pulse"></div>
              )}
              <img
                src={primaryImage}
                alt={name}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
                loading="lazy"
                decoding="async"
              />
            </>
          )}
          
          {/* Price Range Badge - Top Right - Smaller */}
          {displayPriceRange && displayPriceRange !== '0' && (
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-semibold text-neutral-900 shadow-sm border border-neutral-200/50">
              {displayPriceRange}
            </div>
          )}
          
          {/* Verified Badge - Top Left - Smaller */}
          {is_verified && (
            <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm">
              Verified
            </div>
          )}
          
          {/* Delivery Time Badge - Bottom Right - Smaller */}
          <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium text-white shadow-sm flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {estimatedDeliveryTime}
          </div>
        </div>
        
        {/* Content Section - Compact padding */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Restaurant Name - Tighter */}
          <h3 className="text-base font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors mb-1.5 line-clamp-2">
            {name}
          </h3>
          
          {/* Rating and Location on same line */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-neutral-300'
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-medium text-neutral-700">
                {rating ? rating.toFixed(1) : 'N/A'}
              </span>
              {review_count > 0 && (
                <span className="text-xs text-neutral-500">
                  ({review_count})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <MapPinIcon className="h-3 w-3" />
              <span>{city}, {state}</span>
            </div>
          </div>
          
          {/* Tags Row - Cuisine and Specialty inline */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {cuisineType && (
              <span className="inline-flex items-center px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-md text-xs font-medium text-neutral-700 uppercase tracking-wide">
                {formatCuisineName(cuisineType)}
              </span>
            )}
            {/* Show up to 3 soup types */}
            {soup_types && soup_types.length > 0 && (
              <>
                {soup_types.slice(0, 3).map((soupType, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md text-xs font-semibold text-orange-700"
                  >
                    {soupType}
                  </span>
                ))}
                {/* Show count if more than 3 */}
                {soup_types.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-orange-50 border border-orange-200 rounded-md text-xs font-semibold text-orange-700">
                    +{soup_types.length - 3}
                  </span>
                )}
              </>
            )}
          </div>
          
          {/* View Button - Compact, no border */}
          <div className="mt-auto pt-2">
            <div className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm group-hover:gap-2 gap-1.5 transition-all">
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}