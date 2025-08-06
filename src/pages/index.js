// src/pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useRestaurants from '../hooks/useRestaurants';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  const subheadingText = "From hearty ramen to comforting chowder, find your perfect bowl across 11 major US cities";
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Page load animation trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Typing effect for subheading
  useEffect(() => {
    if (!isLoaded) return;
    
    if (typingIndex < subheadingText.length) {
      const timer = setTimeout(() => {
        setTypingText(subheadingText.slice(0, typingIndex + 1));
        setTypingIndex(typingIndex + 1);
      }, 30);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, typingIndex, subheadingText]);
  
  // Enhanced mouse movement parallax effect (disabled on mobile for performance)
  useEffect(() => {
    if (isMobile) return;
    
    let animationFrameId;
    let isMoving = false;
    
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      
      if (!isMoving) {
        isMoving = true;
      }
      
      // Cancel previous animation frame for smooth performance
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        // Normalize coordinates to center (0,0) and limit movement range
        const normalizedX = (x - 0.5) * 2; // Range: -1 to 1
        const normalizedY = (y - 0.5) * 2; // Range: -1 to 1
        
        // Apply easing for smoother movement
        const easedX = normalizedX * 0.8;
        const easedY = normalizedY * 0.8;
        
        setMousePosition({ 
          x: Math.max(-1, Math.min(1, easedX)), 
          y: Math.max(-1, Math.min(1, easedY)) 
        });
      });
    };
    
    const handleMouseLeave = () => {
      // Smoothly reset position when mouse leaves the hero section
      isMoving = false;
      setMousePosition({ x: 0, y: 0 });
    };
    
    const handleMouseEnter = () => {
      isMoving = true;
    };
    
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove, { passive: true });
      heroElement.addEventListener('mouseleave', handleMouseLeave);
      heroElement.addEventListener('mouseenter', handleMouseEnter);
      
      return () => {
        heroElement.removeEventListener('mousemove', handleMouseMove);
        heroElement.removeEventListener('mouseleave', handleMouseLeave);
        heroElement.removeEventListener('mouseenter', handleMouseEnter);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [isMobile]);
  
  // Scroll position tracking for wave parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Fetch featured restaurants
  const { 
    restaurants: featuredRestaurants, 
    loading: featuredLoading, 
    error: featuredError 
  } = useRestaurants({ 
    featured: true, 
    limit: 6 
  });
  
  // You could also fetch restaurants by city
  const [selectedCity, setSelectedCity] = useState('New York');
  const { 
    restaurants: cityRestaurants, 
    loading: cityLoading, 
    error: cityError 
  } = useRestaurants({ 
    city: selectedCity, 
    limit: 3 
  });
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Check if input is a ZIP code (5 digits)
    const isZipCode = /^\d{5}$/.test(searchQuery.trim());
    
    // Map of known city names to their state/city URL paths
    const cityMapping = {
      'new york': '/ny/new-york/restaurants',
      'los angeles': '/ca/los-angeles/restaurants',
      'chicago': '/il/chicago/restaurants',
      'houston': '/tx/houston/restaurants',
      'miami': '/fl/miami/restaurants',
      'seattle': '/wa/seattle/restaurants',
      'phoenix': '/az/phoenix/restaurants',
      'austin': '/tx/austin/restaurants',
      'dallas': '/tx/dallas/restaurants',
      'san francisco': '/ca/san-francisco/restaurants',
      'san diego': '/ca/san-diego/restaurants',
      'philadelphia': '/pa/philadelphia/restaurants'
    };
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    // First check if it's a direct city match
    if (cityMapping[normalizedQuery]) {
      router.push(cityMapping[normalizedQuery]);
      return;
    }
    
    // Then check if it's a Phoenix ZIP code
    if (isZipCode && searchQuery.startsWith('85')) {
      router.push('/az/phoenix/restaurants');
      return;
    }
    
    // Otherwise, go to the restaurant search page with the query
    router.push(`/restaurants?location=${encodeURIComponent(searchQuery)}`);
  };
  
  // Detect user's location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Could integrate with a geocoding service to get city name
          // For now, just show coordinates in the search input
          setSearchQuery(`Near Me (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not detect your location. Please enter it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  
  // Popular cities list for the UI
  const popularCities = [
    { name: 'New York', state: 'NY' },
    { name: 'Los Angeles', state: 'CA' },
    { name: 'Chicago', state: 'IL' },
    { name: 'San Francisco', state: 'CA' },
    { name: 'Seattle', state: 'WA' },
    { name: 'Miami', state: 'FL' }
  ];
  
  // Soup type quick filters
  const quickFilters = [
    { name: 'Ramen', emoji: '🍜', type: 'ramen' },
    { name: 'Stew', emoji: '🍲', type: 'stew' },
    { name: 'Chowder', emoji: '🥣', type: 'chowder' }
  ];
  
  const handleQuickFilter = (soupType) => {
    router.push(`/restaurants?soupType=${soupType}`);
  };
  
  return (
    <div>
      <Head>
        <title>FindSoupNearMe - Discover the Best Soup Restaurants Near You</title>
        <meta name="description" content="Find the best soup restaurants in your city. Discover delicious ramen, pho, chowder, and more at top-rated restaurants." />
      </Head>
      
      {/* Clean Hero with Accent Elements */}
      <section ref={heroRef} className="py-20 md:py-28 relative overflow-hidden">
        {/* Modern Animated Gradient Background */}
        <div className="absolute inset-0 animate-gradient-shift"></div>
        
        {/* Primary Conic Gradient */}
        <div className="absolute inset-0 animate-conic-gradient-primary opacity-30"></div>
        
        {/* Secondary Conic Gradient with Different Timing */}
        <div className="absolute inset-0 animate-conic-gradient-secondary opacity-20"></div>
        
        {/* Enhanced Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-15 mix-blend-multiply">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px 256px'
          }}></div>
        </div>
        
        {/* Subtle Radial Gradient for Depth */}
        <div className="absolute inset-0 bg-radial-gradient opacity-25"></div>
        
        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-vignette opacity-40"></div>
        {/* Accent Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 rounded-full -mr-32 -mt-32 opacity-50 blur-sm"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-100 rounded-full -ml-24 -mb-24 opacity-50 blur-sm"></div>
        <div className="absolute top-1/4 left-0 w-32 h-32 bg-orange-100 rounded-full -ml-16 opacity-40 blur-sm"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-light-orange-100 rounded-full opacity-30 blur-sm"></div>
        
        {/* Dynamic 3D Floating Bowl Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Bowl 1 - Large Deep Background */}
          <div 
            className="floating-bowl absolute top-8 right-8 w-28 h-28 md:w-36 md:h-36 opacity-25 transform transition-all duration-800 ease-out"
            style={{
              transform: isMobile 
                ? 'translate3d(0px, 0px, -200px) rotateX(15deg) rotateY(10deg)' 
                : `translate3d(${mousePosition.x * -12}px, ${mousePosition.y * -12}px, -200px) rotateX(${15 + mousePosition.y * 8}deg) rotateY(${10 + mousePosition.x * 6}deg)`,
              zIndex: 1
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-full shadow-2xl relative">
              <div className="absolute inset-2 bg-gradient-to-br from-primary-50 to-transparent rounded-full opacity-60"></div>
            </div>
          </div>
          
          {/* Bowl 2 - Medium Mid-ground */}
          <div 
            className="floating-bowl absolute top-1/3 left-12 w-20 h-20 md:w-24 md:h-24 opacity-40 transform transition-all duration-600 ease-out"
            style={{
              transform: isMobile 
                ? 'translate3d(0px, 0px, -120px) rotateX(-8deg) rotateY(-15deg)' 
                : `translate3d(${mousePosition.x * -18}px, ${mousePosition.y * -18}px, -120px) rotateX(${-8 + mousePosition.y * 12}deg) rotateY(${-15 + mousePosition.x * 10}deg)`,
              zIndex: 2
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-full shadow-xl relative">
              <div className="absolute inset-2 bg-gradient-to-br from-orange-50 to-transparent rounded-full opacity-70"></div>
            </div>
          </div>
          
          {/* Bowl 3 - Small Foreground */}
          <div 
            className="floating-bowl absolute bottom-16 right-1/3 w-16 h-16 md:w-20 md:h-20 opacity-60 transform transition-all duration-500 ease-out"
            style={{
              transform: isMobile 
                ? 'translate3d(0px, 0px, -60px) rotateX(5deg) rotateY(20deg)' 
                : `translate3d(${mousePosition.x * -24}px, ${mousePosition.y * -24}px, -60px) rotateX(${5 + mousePosition.y * 15}deg) rotateY(${20 + mousePosition.x * 12}deg)`,
              zIndex: 3
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-light-orange-100 to-light-orange-200 rounded-full shadow-lg relative">
              <div className="absolute inset-2 bg-gradient-to-br from-light-orange-50 to-transparent rounded-full opacity-80"></div>
            </div>
          </div>
          
          {/* Bowl 4 - Tiny Accent */}
          <div 
            className="floating-bowl absolute top-1/2 right-1/4 w-12 h-12 md:w-14 md:h-14 opacity-35 transform transition-all duration-700 ease-out"
            style={{
              transform: isMobile 
                ? 'translate3d(0px, 0px, -80px) rotateX(25deg) rotateY(-5deg)' 
                : `translate3d(${mousePosition.x * -8}px, ${mousePosition.y * -8}px, -80px) rotateX(${25 + mousePosition.y * 6}deg) rotateY(${-5 + mousePosition.x * 4}deg)`,
              zIndex: 2
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-accent-50 to-accent-100 rounded-full shadow-md relative">
              <div className="absolute inset-1 bg-gradient-to-br from-white to-transparent rounded-full opacity-50"></div>
            </div>
          </div>
          
          {/* Bowl 5 - Floating Spoon */}
          <div 
            className="floating-bowl absolute bottom-8 left-1/4 w-8 h-8 md:w-10 md:h-10 opacity-50 transform transition-all duration-400 ease-out"
            style={{
              transform: isMobile 
                ? 'translate3d(0px, 0px, -40px) rotateX(-12deg) rotateY(8deg)' 
                : `translate3d(${mousePosition.x * -16}px, ${mousePosition.y * -16}px, -40px) rotateX(${-12 + mousePosition.y * 10}deg) rotateY(${8 + mousePosition.x * 8}deg)`,
              zIndex: 3
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 rounded-full shadow-sm relative">
              <div className="absolute inset-1 bg-gradient-to-br from-white to-transparent rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="parallax-container max-w-3xl mx-auto text-center">
            {/* Badge Layer - Deep Background */}
            <div 
              className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-6 parallax-layer"
              style={{
                transform: isMobile 
                  ? 'translateZ(-100px)' 
                  : `translate3d(${mousePosition.x * -15}px, ${mousePosition.y * -15}px, -100px)`,
                zIndex: 1
              }}
            >
              🍜 Discover 10,000+ Soup Restaurants
            </div>
            
            {/* Heading Layer - Mid Ground */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight parallax-layer"
              style={{
                transform: isMobile 
                  ? 'translateZ(-50px)' 
                  : `translate3d(${mousePosition.x * -8}px, ${mousePosition.y * -8}px, -50px)`,
                zIndex: 2
              }}
            >
              The Best <span className="text-orange-500">Soup</span> Near You
            </h1>
            
            {/* Subheading Layer - Shallow Background */}
            <p 
              className="text-neutral-700 text-lg md:text-xl mb-10 max-w-2xl mx-auto parallax-layer"
              style={{
                transform: isMobile 
                  ? 'translateZ(-25px)' 
                  : `translate3d(${mousePosition.x * -5}px, ${mousePosition.y * -5}px, -25px)`,
                zIndex: 1
              }}
            >
              From hearty ramen to comforting chowder, find your perfect bowl across 11 major US cities
            </p>
            
            {/* Form Layer - Foreground */}
            <form 
              onSubmit={handleSearch} 
              className="max-w-2xl mx-auto mb-8 parallax-layer"
              style={{
                transform: isMobile 
                  ? 'translateZ(0px)' 
                  : `translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg)`,
                zIndex: 3
              }}
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-orange-400">📍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your city or ZIP code"
                    className="w-full pl-12 pr-12 py-4 bg-white rounded-lg border border-neutral-200 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-orange-500 transition-colors"
                    title="Use my current location"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <button
                  type="submit"
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                  <span>Search</span>
                </button>
              </div>
            </form>
            
            {/* Quick Filters Layer - Mid Foreground */}
            <div 
              className="flex flex-wrap justify-center gap-3 mb-8 parallax-layer"
              style={{
                transform: isMobile 
                  ? 'translateZ(25px)' 
                  : `translate3d(${mousePosition.x * 3}px, ${mousePosition.y * 3}px, 25px)`,
                zIndex: 2
              }}
            >
              {quickFilters.map((filter) => (
                <button
                  key={filter.type}
                  type="button"
                  onClick={() => handleQuickFilter(filter.type)}
                  className="px-5 py-2.5 bg-white rounded-full border border-neutral-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-2 text-neutral-700 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700"
                >
                  <span className="text-xl">{filter.emoji}</span>
                  <span>{filter.name}</span>
                </button>
              ))}
            </div>
            
            {/* Popular Cities Layer - Deep Foreground */}
            <div 
              className="hidden md:block parallax-layer"
              style={{
                transform: isMobile 
                  ? 'translateZ(50px)' 
                  : `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 50px)`,
                zIndex: 1
              }}
            >
              <p className="text-neutral-500 mb-3 text-sm font-medium">Popular Cities:</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {popularCities.map((city) => (
                  <Link
                    key={city.name}
                    href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium hover:underline"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern SVG Wave Dividers */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          {/* Primary Wave */}
          <svg 
            className="wave-divider wave-primary"
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
            style={{
              transform: isMobile 
                ? `translateY(${scrollY * 0.1}px)` 
                : `translateY(${mousePosition.y * -5 + scrollY * 0.1}px)`
            }}
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".6" 
              fill="#fef2f2"
            />
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".8" 
              fill="#fef7ed"
            />
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              fill="#fef3e2"
            />
          </svg>
          
          {/* Secondary Wave */}
          <svg 
            className="wave-divider wave-secondary"
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
            style={{
              transform: isMobile 
                ? `translateY(${scrollY * 0.15}px)` 
                : `translateY(${mousePosition.y * -3 + scrollY * 0.15}px)`
            }}
          >
            <path 
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
              opacity=".7" 
              fill="#fef2f2"
            />
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".9" 
              fill="#fef7ed"
            />
          </svg>
          
          {/* Accent Wave */}
          <svg 
            className="wave-divider wave-accent"
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
            style={{
              transform: isMobile 
                ? `translateY(${scrollY * 0.2}px)` 
                : `translateY(${mousePosition.y * -7 + scrollY * 0.2}px)`
            }}
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".5" 
              fill="#fef3e2"
            />
          </svg>
        </div>
      </section>
      
      {/* Featured Restaurants Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Featured Soup Spots
            </h2>
            <Link href="/restaurants" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {featuredError && (
            <div className="text-red-500 text-center mb-8">
              Error loading featured restaurants. Please try again later.
            </div>
          )}
          
          {featuredLoading ? (
            <SkeletonLoader count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* City Section with Modern Design */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
              {selectedCity} Favorites
            </h2>
            <div className="hidden md:block">
              <div className="flex space-x-2">
                {popularCities.slice(0, 4).map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city.name)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                      selectedCity === city.name
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-neutral-700 hover:bg-orange-100'
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {cityError && (
            <div className="text-red-500 text-center mb-8">
              Error loading restaurants. Please try again later.
            </div>
          )}
          
          {cityLoading ? (
            <SkeletonLoader count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cityRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link 
              href={`/${selectedCity.split(' ')[0] === 'New' ? 'ny' : selectedCity.substring(0, 2).toLowerCase()}/${selectedCity.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
              className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              Explore All {selectedCity} Restaurants
            </Link>
          </div>
        </div>
      </section>
      
      {/* Discover Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-light-orange-50 rounded-2xl p-8 md:p-12 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <span className="inline-block px-4 py-1 bg-light-orange-100 text-light-orange-500 rounded-full text-sm font-semibold mb-4">
                    Did You Know?
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                    Every City Has Its Unique Soup Culture
                  </h2>
                  <p className="text-neutral-700 mb-6">
                    From New York's classic chicken noodle to San Francisco's clam chowder in sourdough bread bowls, every city has signature soups worth discovering.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center border border-orange-100">
                      <span className="text-2xl mr-3">🍜</span>
                      <div>
                        <p className="font-medium text-neutral-900">Ramen</p>
                        <p className="text-sm text-orange-600">30+ spots</p>
                      </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center border border-orange-100">
                      <span className="text-2xl mr-3">🥣</span>
                      <div>
                        <p className="font-medium text-neutral-900">Chowder</p>
                        <p className="text-sm text-orange-600">42+ spots</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                      alt="Delicious ramen" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-5 -left-5 bg-white rounded-lg shadow-md p-3 hidden md:block">
                    <div className="flex items-center">
                      <div className="bg-orange-500 rounded-full w-3 h-3 mr-2"></div>
                      <span className="text-sm font-medium">Live: 435+ active restaurants</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}