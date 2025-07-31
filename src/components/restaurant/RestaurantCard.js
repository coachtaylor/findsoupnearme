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
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white">
      {/* Restaurant Image with Error Handling */}
      <div className="relative h-48 w-full bg-soup-orange-100">
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
              textElement.className = 'text-soup-brown-800 text-center px-4 font-medium';
              e.target.parentNode.appendChild(textElement);
            }}
          />
        )}
      </div>
      
      {/* Restaurant Info */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-soup-brown-900 mb-1">{restaurant.name}</h3>
        <p className="text-soup-brown-600 mb-2">{restaurant.city}, {restaurant.state}</p>
        
        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg 
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(restaurant.rating || 0)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
          {restaurant.rating && (
            <span className="text-sm text-soup-brown-600 ml-2">
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
                className="text-xs bg-soup-orange-100 text-soup-brown-700 px-2 py-1 rounded-full"
              >
                {soupType}
              </span>
            ))}
            {restaurant.soup_types.length > 3 && (
              <span className="text-xs bg-soup-orange-50 text-soup-brown-600 px-2 py-1 rounded-full">
                +{restaurant.soup_types.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* View Button */}
        <Link
          href={`/${stateAbbr}/${citySlug}/${restaurantSlug}`}
          className="block w-full text-center bg-soup-red-600 hover:bg-soup-red-700 text-white font-medium py-2 rounded-md mt-4 transition duration-300"
        >
          View Restaurant
        </Link>
      </div>
    </div>
  );
}