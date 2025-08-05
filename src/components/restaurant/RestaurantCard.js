// src/components/restaurant/RestaurantCard.js
import { useState } from 'react';
import Link from 'next/link';

export default function RestaurantCard({ restaurant }) {
  const [imageError, setImageError] = useState(false);
  
  // Create a URL-friendly slug for the restaurant
  const restaurantSlug = restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, '-');
  const stateAbbr = restaurant.state?.toLowerCase() || '';
  const citySlug = restaurant.city?.toLowerCase().replace(/\s+/g, '-') || '';
  
  // Fallback images from Unsplash
  const fallbackImages = [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    'https://images.unsplash.com/photo-1607116667981-ff148a4e754d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    'https://images.unsplash.com/photo-1616501268209-edfff098fdd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
    'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
  ];

  // Use restaurant ID to deterministically select a fallback image
  const fallbackIndex = restaurant.id 
    ? parseInt(restaurant.id.replace(/[^0-9]/g, '').slice(0, 4) || '0', 16) % fallbackImages.length 
    : 0;
  const fallbackImage = fallbackImages[fallbackIndex];
  
  return (
    <div className="border rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 hover:scale-[1.02] bg-white">
      {/* Restaurant Image with Error Handling */}
      <div className="relative h-48 w-full bg-neutral-100">
        {!imageError && restaurant.image_url ? (
          <img
            src={restaurant.image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <img
            src={fallbackImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If even the fallback fails, show a colored background with text
              e.target.style.display = 'none';
              e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
              const textElement = document.createElement('span');
              textElement.textContent = restaurant.name;
              textElement.className = 'text-neutral-800 text-center px-4 font-medium';
              e.target.parentNode.appendChild(textElement);
            }}
          />
        )}
      </div>
      
      {/* Restaurant Info */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-neutral-900 mb-1">{restaurant.name}</h3>
        <p className="text-neutral-600 mb-2">{restaurant.city}, {restaurant.state}</p>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg 
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(restaurant.rating || 0)
                  ? 'text-accent-500 fill-accent-500'
                  : 'text-neutral-300 fill-neutral-300'
              }`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
          {restaurant.rating && (
            <span className="text-sm text-neutral-600 ml-2">
              ({restaurant.review_count || 0} reviews)
            </span>
          )}
        </div>
        
        {/* Soup Types */}
        {restaurant.soup_types && restaurant.soup_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.soup_types.slice(0, 3).map((soupType, index) => (
              <span
                key={index}
                className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
              >
                {soupType}
              </span>
            ))}
            {restaurant.soup_types.length > 3 && (
              <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                +{restaurant.soup_types.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* View Button */}
        <Link
          href={`/${stateAbbr}/${citySlug}/${restaurantSlug}`}
          className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl mt-4 transition duration-300 hover:shadow-md"
        >
          View Restaurant
        </Link>
      </div>
    </div>
  );
}