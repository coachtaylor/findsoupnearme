// src/components/restaurant/RestaurantCard.js
import Link from 'next/link';
import { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

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
  } = restaurant;
 
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
        {/* Hero Image Section */}
        <div className="relative h-48 w-full overflow-hidden bg-neutral-100 flex-shrink-0">
          {imageError || !primaryImage ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-neutral-100 to-neutral-200">
              <svg className="w-12 h-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          
          {/* Price Range Badge - Top Right */}
          {displayPriceRange && displayPriceRange !== '0' && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-sm font-semibold text-neutral-900 shadow-md border border-neutral-200/50">
              {displayPriceRange}
            </div>
          )}
          
          {/* Verified Badge - Top Left */}
          {is_verified && (
            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-md">
              Verified
            </div>
          )}
          
          {/* Delivery Time Badge - Bottom Right */}
          <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-sm font-medium text-white shadow-md flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5" />
            {estimatedDeliveryTime}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Restaurant Name */}
          <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors mb-2 line-clamp-1">
            {name}
          </h3>
          
          {/* Star Rating */}
          <div className="flex items-center mb-3">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${
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
            <span className="text-sm text-neutral-600">
              {rating ? rating.toFixed(1) : 'N/A'}
              {review_count ? ` (${review_count} review${review_count !== 1 ? 's' : ''})` : ''}
            </span>
          </div>
          
          {/* Location */}
          <div className="mb-3">
            <span className="text-sm text-neutral-500">
              {city}, {state}
            </span>
          </div>
          
          {/* Specialty Tag */}
          {soup_types && soup_types.length > 0 && (
            <div className="mb-4">
              <span className="inline-block px-3.5 py-2 bg-orange-50 border border-orange-200 rounded-lg text-sm font-semibold text-orange-700 shadow-sm">
                {soup_types[0]}
              </span>
            </div>
          )}
          
          {/* View Button */}
          <div className="pt-3 border-t border-neutral-100 mt-auto">
            <div className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm group-hover:gap-2 gap-1.5 transition-all">
              <span>View</span>
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