// src/pages/[state]/[city]/[restaurant].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function RestaurantDetail() {
  const router = useRouter();
  const { state, city, restaurant: slug } = router.query;
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState(null);
  const [error, setError] = useState(null);
  
  // Helper functions for data handling
  const getSoupTypes = (restaurant) => {
    if (restaurant.soup_types && restaurant.soup_types.length > 0) {
      return restaurant.soup_types;
    }
    
    // Try to extract from soups array if available
    if (restaurant.soups && restaurant.soups.length > 0) {
      return [...new Set(restaurant.soups.map(soup => soup.soup_type).filter(Boolean))];
    }
    
    // Fallback to default
    return ['Soup'];
  };

  const getRestaurantPhotos = (restaurant) => {
    // Check for photo_urls array
    if (restaurant.photo_urls && Array.isArray(restaurant.photo_urls) && restaurant.photo_urls.length > 0) {
      return restaurant.photo_urls.filter(url => url && typeof url === 'string' && url.startsWith('http'));
    }
    
    // Return empty array if no valid photos
    return [];
  };

  const formatHoursOfOperation = (hoursData) => {
    if (!hoursData) return [];
    
    // Handle string format (JSON string)
    if (typeof hoursData === 'string') {
      try {
        const parsed = JSON.parse(hoursData);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    
    // Handle array format
    if (Array.isArray(hoursData)) {
      return hoursData;
    }
    
    // Handle object format
    if (typeof hoursData === 'object') {
      return Object.entries(hoursData).map(([day, hours]) => `${day}: ${hours}`);
    }
    
    return [];
  };
  
  // Fetch restaurant data when the slug is available
  useEffect(() => {
    if (!slug) return;
    
    async function fetchRestaurantData() {
      setLoading(true);
      try {
        // Try to fetch by slug first
        const response = await fetch(`/api/restaurants/by-slug?slug=${slug}`);
        
        if (!response.ok) {
          // Fallback to general API if by-slug endpoint fails
          const fallbackResponse = await fetch(`/api/restaurants?slug=${slug}`);
          
          if (!fallbackResponse.ok) {
            throw new Error('Failed to fetch restaurant details');
          }
          
          const fallbackData = await fallbackResponse.json();
          
          // Check if we got restaurant data in the expected format
          if (fallbackData && fallbackData.restaurants && fallbackData.restaurants.length > 0) {
            setRestaurantData(fallbackData.restaurants[0]);
          } else {
            throw new Error('No restaurant found with that name');
          }
        } else {
          const data = await response.json();
          setRestaurantData(data);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Unable to load restaurant information. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRestaurantData();
  }, [slug]);
  
  // Format address for Google Maps
  const getGoogleMapsUrl = (restaurant) => {
    if (!restaurant) return '';
    const address = `${restaurant.name}, ${restaurant.address || ''}, ${restaurant.city || ''}, ${restaurant.state || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };
  
  // Function to format a phone number
  const formatPhoneNumber = (phoneNumberString) => {
    if (!phoneNumberString) return '';
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      const intlCode = (match[1] ? '+1 ' : '');
      return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    return phoneNumberString;
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-primary-500 border-r-transparent animate-spin"></div>
          <p className="mt-6 text-lg text-neutral-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <div className="max-w-2xl mx-auto text-center bg-neutral-50 p-8 rounded-2xl shadow-soft">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Restaurant Not Found</h1>
          <p className="text-neutral-700 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants" className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-soft hover:shadow-md transition-colors">
              Browse Restaurants
            </Link>
            <button 
              onClick={() => router.back()} 
              className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-700 rounded-xl border border-neutral-200 hover:border-neutral-300 shadow-soft transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have restaurant data, display it
  if (restaurantData) {
    const restaurant = restaurantData;
    const soupTypes = getSoupTypes(restaurant);
    
    // Default fallback image if needed
    const fallbackImage = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80';
    
    return (
      <>
        <Head>
          <title>{restaurant.name} - Soup Restaurant in {restaurant.city || 'Your City'}, {restaurant.state || 'Your State'} | FindSoupNearMe</title>
          <meta name="description" content={`${restaurant.name} in ${restaurant.city || 'Your City'}, ${restaurant.state || 'Your State'}. ${restaurant.description?.substring(0, 150) || 'Find menu, reviews, hours, and more.'}`} />
        </Head>
        
        <div className="bg-white">
          {/* Breadcrumbs */}
          <div className="bg-neutral-50 border-b border-neutral-200">
            <div className="container mx-auto px-4 py-3">
              <nav className="text-sm">
                <ol className="flex flex-wrap items-center">
                  <li className="flex items-center">
                    <Link href="/" className="text-primary-600 hover:text-primary-700">
                      Home
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                  <li className="flex items-center">
                    <Link href={`/${state?.toLowerCase()}/restaurants`} className="text-primary-600 hover:text-primary-700">
                      {state || 'State'}
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                  <li className="flex items-center">
                    <Link href={`/${state?.toLowerCase()}/${city?.toLowerCase()}/restaurants`} className="text-primary-600 hover:text-primary-700">
                      {restaurant.city || 'City'}
                    </Link>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </li>
                  <li className="text-neutral-600 truncate">
                    {restaurant.name}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
          
          {/* Restaurant Header */}
          <div className="container mx-auto px-4 py-6 md:py-10">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">{restaurant.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center mt-2 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg 
                      key={i}
                      className={`h-5 w-5 ${
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
                  <span className="ml-2 text-neutral-700">
                    {restaurant.rating ? restaurant.rating.toFixed(1) : 'No ratings'} 
                    {restaurant.review_count ? ` (${restaurant.review_count} reviews)` : ''}
                  </span>
                </div>
                
                {/* Address & Info */}
                <p className="text-neutral-600">
                  {restaurant.address ? `${restaurant.address}, ` : ''}
                  {restaurant.city ? `${restaurant.city}, ` : ''}
                  {restaurant.state || ''} 
                  {restaurant.zip_code ? ` ${restaurant.zip_code}` : ''}
                </p>
                
                {/* Soup Types */}
                {soupTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {soupTypes.map((type, index) => (
                      <span key={index} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3">
                <a 
                  href={getGoogleMapsUrl(restaurant)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-soft hover:shadow-md transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Directions
                </a>
                
                {restaurant.phone && (
                  <a 
                    href={`tel:${restaurant.phone}`} 
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 shadow-soft transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {formatPhoneNumber(restaurant.phone) || 'Call'}
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Restaurant Photos */}
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main Photo */}
              <div className="md:col-span-2 h-64 md:h-96 rounded-2xl overflow-hidden bg-neutral-100">
                {restaurant.exterior_image_url ? (
                  <img 
                    src={restaurant.exterior_image_url} 
                    alt={`${restaurant.name} exterior`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = fallbackImage;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img 
                      src={fallbackImage}
                      alt={`${restaurant.name}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              {/* Food Photos */}
              <div className="grid grid-cols-2 gap-4 h-64 md:h-96">
                {getRestaurantPhotos(restaurant).length > 0 ? (
                  getRestaurantPhotos(restaurant).slice(0, 2).map((url, index) => (
                    <div key={index} className="rounded-2xl overflow-hidden bg-neutral-100">
                      <img 
                        src={url} 
                        alt={`${restaurant.name} food ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = fallbackImage;
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center">
                    <span className="text-neutral-400">No food photos available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="container mx-auto px-4 mt-6 border-b border-neutral-200">
            <div className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'menu'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('menu')}
              >
                Soup Menu
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'info'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Restaurant Info
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="container mx-auto px-4 py-8">
            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Soup Menu</h2>
                
                {restaurant.soups && restaurant.soups.length > 0 ? (
                  <div className="grid gap-6">
                    {restaurant.soups.map((soup) => (
                      <div key={soup.id} className="bg-white rounded-xl shadow-soft p-6 flex flex-col md:flex-row">
                        {/* Soup Image (if available) */}
                        {soup.image_url && (
                          <div className="md:w-1/4 h-48 md:h-auto rounded-lg overflow-hidden bg-neutral-100 mb-4 md:mb-0 md:mr-6">
                            <img 
                              src={soup.image_url} 
                              alt={soup.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Soup Details */}
                        <div className={soup.image_url ? "md:w-3/4" : "w-full"}>
                          <div className="flex flex-wrap items-start justify-between mb-2">
                            <h3 className="text-xl font-bold text-neutral-900">{soup.name}</h3>
                            {soup.price && (
                              <span className="text-lg font-semibold text-neutral-900">${parseFloat(soup.price).toFixed(2)}</span>
                            )}
                          </div>
                          
                          {soup.description && (
                            <p className="text-neutral-600 mb-3">{soup.description}</p>
                          )}
                          
                          {/* Soup Tags */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {soup.soup_type && (
                              <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                                {soup.soup_type}
                              </span>
                            )}
                            
                            {soup.dietary_info && Array.isArray(soup.dietary_info) && soup.dietary_info.map((diet, index) => (
                              <span key={index} className="px-2 py-1 bg-secondary-50 text-secondary-700 rounded-full text-xs">
                                {diet}
                              </span>
                            ))}
                            
                            {soup.is_seasonal && (
                              <span className="px-2 py-1 bg-accent-50 text-accent-700 rounded-full text-xs">
                                Seasonal
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-neutral-50 rounded-xl">
                    <p className="text-neutral-600">No soup menu information available.</p>
                    <p className="text-neutral-500 mt-2">Check back soon or contact the restaurant directly for their latest menu.</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Restaurant Information</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    {/* Description */}
                    {restaurant.description && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">About</h3>
                        <p className="text-neutral-700">{restaurant.description}</p>
                      </div>
                    )}
                    
                    {/* Contact Info */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Contact Information</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-neutral-700">
                            {restaurant.address ? `${restaurant.address}, ` : ''}
                            {restaurant.city ? `${restaurant.city}, ` : ''}
                            {restaurant.state || ''} 
                            {restaurant.zip_code ? ` ${restaurant.zip_code}` : ''}
                          </span>
                        </li>
                        
                        {restaurant.phone && (
                          <li className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href={`tel:${restaurant.phone}`} className="text-primary-600 hover:text-primary-700">
                              {formatPhoneNumber(restaurant.phone)}
                            </a>
                          </li>
                        )}
                        
                        {restaurant.website && (
                          <li className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 break-all">
                              {restaurant.website}
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    {/* Price Range */}
                    {restaurant.price_range && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Price Range</h3>
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-neutral-700">
                            {restaurant.price_range}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column */}
                  <div>
                    {/* Hours */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Hours of Operation</h3>
                      {formatHoursOfOperation(restaurant.hours_of_operation).length > 0 ? (
                        <ul className="space-y-2">
                          {formatHoursOfOperation(restaurant.hours_of_operation).map((hours, index) => (
                            <li key={index} className="flex justify-between items-center py-2 border-b border-neutral-100">
                              <span className="text-neutral-700 font-medium">{hours.split(': ')[0] || 'Day'}</span>
                              <span className="text-neutral-600">{hours.split(': ')[1] || 'Hours not specified'}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-neutral-600">Hours information not available</p>
                      )}
                    </div>
                    
                    {/* Map */}
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Location</h3>
                      <div className="h-60 bg-neutral-100 rounded-xl overflow-hidden">
                        <a 
                          href={getGoogleMapsUrl(restaurant)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full h-full flex items-center justify-center text-primary-600 hover:text-primary-700"
                        >
                          <span>Open in Google Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Reviews</h2>
                  <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-soft hover:shadow-md transition-colors">
                    Write a Review
                  </button>
                </div>
                
                {restaurant.reviews && restaurant.reviews.length > 0 ? (
                  <div className="space-y-6">
                   {restaurant.reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-xl shadow-soft p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center mb-1">
                              {/* User icon */}
                              <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              
                              <div>
                                <p className="font-medium text-neutral-900">User</p>
                                <p className="text-sm text-neutral-500">
                                  {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Rating */}
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg 
                                key={i}
                                className={`h-5 w-5 ${
                                  i < (review.rating || 0)
                                    ? 'text-accent-500 fill-accent-500'
                                    : 'text-neutral-300 fill-neutral-300'
                                }`}
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        
                        {/* Review Content */}
                        <p className="text-neutral-700 mb-4">{review.content || 'Great restaurant!'}</p>
                        
                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            {review.images.map((img, index) => (
                              <div key={index} className="h-24 rounded-lg overflow-hidden bg-neutral-100">
                                <img 
                                  src={img} 
                                  alt={`Review image ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Helpful Button */}
                        <div className="flex items-center">
                          <button className="flex items-center text-sm text-neutral-500 hover:text-neutral-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            Helpful ({review.helpful_votes || 0})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-neutral-50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Reviews Yet</h3>
                    <p className="text-neutral-600 mb-6">Be the first to review this restaurant!</p>
                    <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-soft hover:shadow-md transition-colors">
                      Write a Review
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Similar Restaurants */}
          <div className="bg-neutral-50 py-12 mt-10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Similar Restaurants Nearby</h2>
              
              <div className="text-center">
                <p className="text-neutral-600 mb-6">Looking for more delicious soup options in {restaurant.city || 'your area'}?</p>
                <Link 
                  href={`/${state?.toLowerCase()}/${city?.toLowerCase()}/restaurants`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-soft hover:shadow-md transition-colors"
                >
                  Explore All {restaurant.city || 'Local'} Restaurants
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Default loading state if no data yet
  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="flex flex-col items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-primary-500 border-r-transparent animate-spin"></div>
        <p className="mt-6 text-lg text-neutral-600">Loading restaurant details...</p>
      </div>
    </div>
  );
}