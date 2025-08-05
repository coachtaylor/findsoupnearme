// src/components/ui/ResponsiveImage.js
import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * ResponsiveImage component with fallbacks and lazy loading
 * Works across all browsers and handles missing images gracefully
 * 
 * @param {Object} props Component props
 * @param {string} props.src Primary image source URL
 * @param {string} props.fallbackSrc Fallback image URL if primary fails
 * @param {string} props.alt Alt text for the image
 * @param {string} props.className CSS classes to apply
 * @param {Object} props.imgProps Additional props to pass to the img element
 */
export default function ResponsiveImage({ 
  src, 
  fallbackSrc = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
  alt = '', 
  className = '', 
  placeholderText = null,
  ...imgProps 
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Update imgSrc if src prop changes
  useEffect(() => {
    if (src && !imgError) {
      setImgSrc(src);
      setIsLoading(true);
    }
  }, [src, imgError]);
  
  // Handle image load error
  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      console.warn(`Image failed to load: ${imgSrc}`);
      setImgSrc(fallbackSrc);
    } else {
      setImgError(true);
      console.error(`Both primary and fallback images failed to load`);
    }
  };
  
  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  // If both primary and fallback images fail, show a placeholder
  if (imgError) {
    return (
      <div 
        className={`flex items-center justify-center bg-soup-orange-100 ${className}`}
        style={{ ...imgProps.style }}
      >
        <span className="text-soup-brown-800 text-center px-4 font-medium">
          {placeholderText || alt || 'Image not available'}
        </span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-soup-orange-50 animate-pulse ${className}`} />
      )}
      <img 
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        {...imgProps}
      />
    </div>
  );
}