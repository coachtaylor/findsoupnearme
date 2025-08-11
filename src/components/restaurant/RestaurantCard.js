// src/components/restaurant/RestaurantCard.js
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
  const rippleRef = useRef(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
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
 
  // Debug log removed for production cleanliness

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
          <div className="absolute inset-0 image-skeleton animate-shimmer" />
        )}
        <img
          src={src}
          alt={alt}
          className={`${className} ${imageLoaded ? 'image-loaded' : 'image-blur'} will-change-transform will-change-opacity`}
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
  
  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Magnetic hover effect
  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;
    if (isReducedMotion) return;

    let rafId = null;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const strength = 0.06; // subtle
      targetX = dx * strength;
      targetY = dy * strength;
      if (!rafId) rafId = requestAnimationFrame(animate);
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(animate);
    };

    const animate = () => {
      const scaled = (Math.abs(targetX) > 0.1 || Math.abs(targetY) > 0.1) ? 1.02 : 1;
      element.style.transform = `translate(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px) scale(${scaled})`;
      rafId = null;
    };

    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mouseleave', onMouseLeave);
    return () => {
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mouseleave', onMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
      element.style.transform = '';
    };
  }, [isReducedMotion]);

  // Ripple on click
  const handleRipple = (event) => {
    if (isReducedMotion) return;
    const container = rippleRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.animationDuration = '0.35s';
    container.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 400);
  };
  
  return (
    <div
      className="restaurant-card-modern group h-full stagger-animate will-change-transform spring-click"
      style={{ animationDelay: isReducedMotion ? undefined : `${animationIndex * 120}ms` }}
      ref={cardRef}
    >
      <Link href={restaurantUrl} className="block h-full">
        <div
          ref={rippleRef}
          onMouseDown={handleRipple}
          className={`relative h-full ripple-container rounded-2xl border shadow-layered-depth hover:shadow-layer-3 transition-all duration-300 overflow-hidden card-border-gradient card-glass-enhanced ${isFeatured ? 'animate-breathing' : ''} ambient-shadow-ring gradient-mesh-overlay`}
        >
          
          {/* Image Section - Left Column */}
          <div className="relative h-48 lg:h-56 overflow-hidden">
            {/* Background Image */}
            {imageError ? (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100 to-orange-200 image-skeleton">
                <span className="text-6xl">🍲</span>
              </div>
            ) : (
              <ProgressiveImage
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

            {/* Price Range - Dynamic badge */}
            <div className="mt-2 mb-3">
              <span className="price-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" opacity=".15"/>
                  <path d="M12 7v10m0-8a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-orange-600">{displayPriceRange}</span>
                <span className="sub">{getPriceRangeLabel()}</span>
              </span>
            </div>
            
            {/* Review Count - Progressive Disclosure */}
            {review_count && (
              <div className="mb-4 progressive-disclosure">
                <span className="text-gray-500 text-xs">
                  {review_count} review{review_count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {/* Soup Types - Feature Tags */}
            <div className="flex flex-wrap gap-2 mb-4 flex-grow progressive-disclosure">
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
            </div>
            
            {/* Divider to keep spacing consistent below content */}
            <div className="mt-auto pt-3 border-t border-gray-100" />
            
            {/* View Details Button - Hover State */}
            <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full text-center py-3 px-4 min-h-[44px] bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                View Details
              </div>
            </div>
          </div>
          {/* Hover-reveal secondary info panel */}
          <div className="hover-secondary-panel p-4">
            <div className="flex items-center justify-between text-sm text-neutral-700">
              <span>{city}, {state}</span>
              {rating ? <span>⭐ {rating.toFixed(1)}</span> : null}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}