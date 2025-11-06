// src/pages/[state]/[city]/[restaurant].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function RestaurantDetail() {
  const router = useRouter();
  const { state, city, restaurant: slug } = router.query;
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState(null);
  const [error, setError] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
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
    // Check for photo_urls array with same priority logic as RestaurantCard
    if (restaurant.photo_urls && Array.isArray(restaurant.photo_urls) && restaurant.photo_urls.length > 0) {
      // Filter valid URLs and apply priority logic
      const validPhotos = restaurant.photo_urls.filter(url => url && typeof url === 'string' && url.startsWith('http'));
      
      // Prioritize food_photo_2, then food_photo_1, then others
      if (validPhotos.length >= 2) {
        // Reorder: food_photo_2 first, then food_photo_1, then others
        const reorderedPhotos = [
          validPhotos[1], // food_photo_2 (index 1)
          validPhotos[0], // food_photo_1 (index 0)
          ...validPhotos.slice(2) // remaining photos
        ];
        return reorderedPhotos;
      }
      
      return validPhotos;
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
    
    const { rid } = router.query;

    const fetchById = async (restaurantId) => {
      if (!restaurantId) return null;
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`);
        if (!response.ok) return null;
        const data = await response.json();
        if (data?.isErrorData) return null;
        return data;
      } catch (err) {
        console.error('Fallback fetch by ID failed:', err);
        return null;
      }
    };

    async function fetchRestaurantData() {
      setLoading(true);
      try {
        // Try to fetch by slug first
        const response = await fetch(`/api/restaurants/by-slug?slug=${slug}`);
        
        if (!response.ok) {
          // Fallback to general API if by-slug endpoint fails
          const fallbackResponse = await fetch(`/api/restaurants?slug=${slug}`);
          
          if (!fallbackResponse.ok) {
            const byId = await fetchById(rid);
            if (byId) {
              setRestaurantData(byId);
              return;
            }
            throw new Error('Failed to fetch restaurant details');
          }
          
          const fallbackData = await fallbackResponse.json();
          
          // Check if we got restaurant data in the expected format
          if (fallbackData && fallbackData.restaurants && fallbackData.restaurants.length > 0) {
            setRestaurantData(fallbackData.restaurants[0]);
          } else {
            const byId = await fetchById(rid);
            if (byId) {
              setRestaurantData(byId);
              return;
            }
            throw new Error('No restaurant found with that name');
          }
        } else {
          const data = await response.json();
          if (data?.isErrorData) {
            const byId = await fetchById(rid);
            if (byId) {
              setRestaurantData(byId);
              return;
            }
            throw new Error('Restaurant not found');
          }
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
  }, [slug, router.query]);
  
  // Format address for Google Maps
  const getGoogleMapsUrl = (restaurant) => {
    if (!restaurant) return '';
    const address = `${restaurant.name}, ${restaurant.address || ''}, ${restaurant.city || ''}, ${restaurant.state || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  const getOrderUrl = (restaurant) => {
    if (!restaurant) return '#';
    if (restaurant.order_url) return restaurant.order_url;
    if (restaurant.website) return restaurant.website;
    if (restaurant.phone) return `tel:${restaurant.phone}`;
    return getGoogleMapsUrl(restaurant);
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
    
    return (
      <>
        <Head>
          <title>{restaurant.name} - Soup Restaurant in {restaurant.city || 'Your City'}, {restaurant.state || 'Your State'} | FindSoupNearMe</title>
          <meta name="description" content={`${restaurant.name} in ${restaurant.city || 'Your City'}, ${restaurant.state || 'Your State'}. ${restaurant.description?.substring(0, 150) || 'Find menu, reviews, hours, and more.'}`} />
        </Head>
        
        <div className="bg-white">
          {/* Breadcrumbs */}
          <div className="bg-neutral-50 border-b border-neutral-200">
            <div className="container mx-auto px-4 py-2">
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
          
          {/* Hero Header - Modern Professional Design */}
          <section className="bg-white border-b border-neutral-200 shadow-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-8 items-center">
                  {/* Left Side - Restaurant Info */}
                  <div className="lg:col-span-2 flex flex-col gap-3">
                {/* Restaurant Name */}
                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
                  {restaurant.name}
                </h1>

                    {/* Rating & Price Row */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i}
                              className={`h-4 w-4 ${i < Math.floor(restaurant.rating || 0) ? 'text-orange-500 fill-current' : 'text-neutral-300'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                        <span className="font-semibold text-neutral-700">
                        {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                      </span>
                        {restaurant.rating && restaurant.review_count && (
                          <span className="text-neutral-500">
                          ({restaurant.review_count})
                        </span>
                      )}
                    </div>

                      {/* Divider */}
                      <span className="text-neutral-300">•</span>

                      {/* Price Range */}
                  {restaurant.price_range && (
                        <>
                          <span className="font-semibold text-neutral-700">{restaurant.price_range}</span>
                          <span className="text-neutral-600">
                        {restaurant.price_range === '$' && 'Budget Friendly'}
                        {restaurant.price_range === '$$' && 'Moderate'}
                        {restaurant.price_range === '$$$' && 'Upscale'}
                        {restaurant.price_range === '$$$$' && 'Fine Dining'}
                      </span>
                        </>
                  )}
                </div>

                {/* Address */}
                    <div className="flex items-start gap-2 text-neutral-600">
                      <svg className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                      <span className="text-sm leading-relaxed">
                    {restaurant.address ? `${restaurant.address}, ` : ''}
                    {restaurant.city ? `${restaurant.city}, ` : ''}
                    {restaurant.state || ''} 
                    {restaurant.zip_code ? ` ${restaurant.zip_code}` : ''}
                  </span>
                </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {/* Primary Order Button */}
                  <a 
                    href={getOrderUrl(restaurant)}
                    target="_blank" 
                    rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-colors text-sm shadow-sm"
                  >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="19" r="2" />
                      <circle cx="17" cy="19" r="2" />
                    </svg>
                        Order Online
                      </a>

                      {/* Secondary Buttons */}
                      {restaurant.phone && (
                        <a 
                          href={`tel:${restaurant.phone}`}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-700 font-semibold border border-neutral-300 transition-colors text-sm shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </a>
                      )}

                      <a 
                        href={getGoogleMapsUrl(restaurant)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-700 font-semibold border border-neutral-300 transition-colors text-sm shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Directions
                      </a>
                    </div>
                  </div>

                  {/* Right Side - Interactive Photo Carousel */}
                  <div className="lg:col-span-1">
                    {(() => {
                      const photos = getRestaurantPhotos(restaurant);
                      const allPhotos = [];
                      
                      // Add exterior image first if available
                      if (restaurant.exterior_image_url) {
                        allPhotos.push(restaurant.exterior_image_url);
                      }
                      
                      // Add all other photos
                      photos.forEach(url => {
                        if (url !== restaurant.exterior_image_url) {
                          allPhotos.push(url);
                        }
                      });
                      
                      const hasPhotos = allPhotos.length > 0;
                      const totalPhotos = allPhotos.length;
                      
                      const nextImage = () => {
                        setCurrentImageIndex((prev) => (prev + 1) % totalPhotos);
                      };
                      
                      const prevImage = () => {
                        setCurrentImageIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
                      };
                      
                      const goToPhotosTab = () => {
                        setActiveTab('photos');
                        // Smooth scroll to tabs section
                        setTimeout(() => {
                          document.querySelector('[role="tablist"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      };
                      
                      return (
                        <div 
                          className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 cursor-pointer group shadow-md hover:shadow-lg transition-shadow"
                          onClick={goToPhotosTab}
                        >
                          {hasPhotos ? (
                            <>
                              {/* Main Image */}
                              <img 
                                src={allPhotos[currentImageIndex]} 
                                alt={`${restaurant.name} - Photo ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              
                              {/* Navigation Arrows - only show if multiple photos */}
                              {totalPhotos > 1 && (
                                <>
                                  {/* Previous Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      prevImage();
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md z-10"
                                    aria-label="Previous photo"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  
                                  {/* Next Button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      nextImage();
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md z-10"
                                    aria-label="Next photo"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                  
                                  {/* Dot Indicators */}
                                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                    {allPhotos.map((_, index) => (
                                      <button
                                        key={index}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCurrentImageIndex(index);
                                        }}
                                        className={`h-1.5 rounded-full transition-all ${
                                          index === currentImageIndex 
                                            ? 'bg-white w-6' 
                                            : 'bg-white/60 hover:bg-white/80 w-1.5'
                                        }`}
                                        aria-label={`Go to photo ${index + 1}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                              
                              {/* Click to view all photos indicator */}
                              <div className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-neutral-900 text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-sm">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{currentImageIndex + 1} / {totalPhotos}</span>
                              </div>
                            </>
                          ) : (
                            // Fallback illustration when no image
                            <div className="w-full h-full flex items-center justify-center bg-neutral-50">
                              <div className="text-center text-neutral-400">
                                <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm">No photos</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Tabs Navigation */}
          <div className="container mx-auto px-4 border-b border-neutral-200" role="tablist">
            <div className="flex gap-6 md:gap-10">
              <button
                className={`py-4 px-1 border-b-2 font-semibold text-sm tracking-wide transition-all ${
                  activeTab === 'info'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Restaurant Info
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-semibold text-sm tracking-wide transition-all ${
                  activeTab === 'menu'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('menu')}
              >
                Soup Menu
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-semibold text-sm tracking-wide transition-all ${
                  activeTab === 'reviews'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-semibold text-sm tracking-wide transition-all ${
                  activeTab === 'photos'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
                onClick={() => setActiveTab('photos')}
              >
                Photos
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="container mx-auto px-4 pt-[126px] pb-10">
            {/* Menu Tab */}
            {activeTab === 'menu' && (
              <div className="max-w-4xl mx-auto mt-8">
                {/* Removed tab header: Soup Menu */}
                
                {restaurant.soups && restaurant.soups.length > 0 ? (
                  <div className="grid gap-6">
                    {restaurant.soups.map((soup) => (
                      <div key={soup.id} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row hover:shadow-md transition-shadow">
                        {/* Soup Image (if available) */}
                        {soup.image_url && (
                          <div className="md:w-1/4 h-48 md:h-auto rounded-xl overflow-hidden bg-neutral-100 mb-4 md:mb-0 md:mr-6">
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
                            <h3 className="text-xl md:text-2xl font-bold text-neutral-900">{soup.name}</h3>
                            {soup.price && (
                              <span className="text-lg md:text-xl font-semibold text-neutral-900">${parseFloat(soup.price).toFixed(2)}</span>
                            )}
                          </div>
                          
                          {soup.description && (
                            <p className="text-neutral-700 leading-relaxed mb-3">{soup.description}</p>
                          )}
                          
                          {/* Soup Tags */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {soup.soup_type && (
                              <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-medium">
                                {soup.soup_type}
                              </span>
                            )}
                            
                            {soup.dietary_info && Array.isArray(soup.dietary_info) && soup.dietary_info.map((diet, index) => (
                              <span key={index} className="px-2.5 py-1 bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-full text-xs font-medium">
                                {diet}
                              </span>
                            ))}
                            
                            {soup.is_seasonal && (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
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
              <div className="max-w-4xl mx-auto mt-8">
                {/* Removed tab header: Restaurant Information */}
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    {/* Description */}
                    {restaurant.description && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-3 mt-6 first:mt-0">About</h3>
                        <p className="text-neutral-700">{restaurant.description}</p>
                      </div>
                    )}
                    
                    {/* Contact Info */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3 mt-6 first:mt-0">Contact Information</h3>
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
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3 mt-6 first:mt-0">Hours of Operation</h3>
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
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3 mt-6 first:mt-0">Location</h3>
                      <div className="relative h-60 bg-neutral-100 rounded-2xl overflow-hidden border border-white/60 shadow-sm">
                        <a 
                          href={getGoogleMapsUrl(restaurant)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="relative w-full h-full flex items-center justify-center text-orange-600 hover:text-orange-700"
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="font-medium">Open in Google Maps</span>
                        </a>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="max-w-4xl mx-auto mt-8">
                <div className="flex items-center justify-between mb-4">
                  {/* Removed tab header: Reviews */}
                  <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-sm hover:shadow-md transition-colors">
                    Write a Review
                  </button>
                </div>
                
                {restaurant.reviews && restaurant.reviews.length > 0 ? (
                  <div className="space-y-6">
                   {restaurant.reviews.map((review) => (
                      <div key={review.id} className="bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center mb-1">
                              {/* User icon */}
                              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center mr-3 font-semibold">
                                {review.author?.[0]?.toUpperCase() || 'U'}
                              </div>
                              
                              <div>
                                <p className="font-medium text-neutral-900">{review.author || 'User'}</p>
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
                                className={`h-5 w-5 ${i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-neutral-300'}`}
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        
                        {/* Review Content */}
                        <p className="text-neutral-700 leading-relaxed mb-4">{review.content || 'Great restaurant!'}</p>
                        
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
                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-sm hover:shadow-md transition-colors">
                      Write a Review
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div className="max-w-6xl mx-auto mt-8">
                <div className="flex items-center justify-between mb-4">
                  {/* Removed tab header: Photos */}
                  <span className="text-sm text-neutral-600">
                    {(() => {
                      const uniquePhotos = new Set();
                      if (restaurant.exterior_image_url) uniquePhotos.add(restaurant.exterior_image_url);
                      getRestaurantPhotos(restaurant).forEach(url => uniquePhotos.add(url));
                      const count = uniquePhotos.size;
                      return count > 0 ? `${count} photo${count !== 1 ? 's' : ''}` : 'No photos available';
                    })()}
                  </span>
                </div>
                
                {getRestaurantPhotos(restaurant).length > 0 || restaurant.exterior_image_url ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Get all unique photos */}
                    {(() => {
                      const allPhotos = [];
                      const seen = new Set();
                      
                      // Add exterior image first if available
                      if (restaurant.exterior_image_url && !seen.has(restaurant.exterior_image_url)) {
                        allPhotos.push({ url: restaurant.exterior_image_url, label: 'Exterior' });
                        seen.add(restaurant.exterior_image_url);
                      }
                      
                      // Add all other photos
                      getRestaurantPhotos(restaurant).forEach((url, index) => {
                        if (!seen.has(url)) {
                          allPhotos.push({ url, label: `Photo ${allPhotos.length + 1}` });
                          seen.add(url);
                        }
                      });
                      
                      return allPhotos.map((photo, index) => (
                        <div key={index} className="relative group rounded-2xl overflow-hidden bg-neutral-100 aspect-square cursor-pointer">
                          <img 
                            src={photo.url} 
                            alt={`${restaurant.name} ${photo.label.toLowerCase()}`} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                            {photo.label}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-neutral-50 rounded-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Photos Yet</h3>
                    <p className="text-neutral-600 mb-6">Photos for this restaurant will be added soon.</p>
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
