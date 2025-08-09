// src/pages/index.js
import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [rippleElements, setRippleElements] = useState([]);
  const [magneticElements, setMagneticElements] = useState([]);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [loadingStates, setLoadingStates] = useState({
    featured: false,
    city: false,
    discover: false
  });
  const [isClient, setIsClient] = useState(false);
  
  // Intersection Observer refs for scroll animations
  const featuredSectionRef = useRef(null);
  const citySectionRef = useRef(null);
  const discoverSectionRef = useRef(null);
  const [visibleSections, setVisibleSections] = useState({
    featured: false,
    city: false,
    discover: false
  });
  
  const subheadingText = "From hearty ramen to comforting chowder, find your perfect bowl across 11 major US cities";
  
  // Micro-interaction utility functions
  const createRippleEffect = (event, element) => {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 600);
  };
  
  const handleMagneticHover = (event, element) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(event.clientX - centerX, 2) + Math.pow(event.clientY - centerY, 2)
    );
    const maxDistance = Math.max(rect.width, rect.height) * 2;
    
    if (distance < maxDistance) {
      const strength = (1 - distance / maxDistance) * 0.1;
      const translateX = (event.clientX - centerX) * strength;
      const translateY = (event.clientY - centerY) * strength;
      
      element.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.02)`;
    } else {
      element.style.transform = 'translate(0, 0) scale(1)';
    }
  };
  
  const handleMagneticLeave = (element) => {
    element.style.transform = 'translate(0, 0) scale(1)';
  };
  
  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };
  
  const simulateLoading = (section) => {
    setLoadingStates(prev => ({ ...prev, [section]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [section]: false }));
    }, 1500);
  };
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    setIsClient(true);
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
    if (isMobile || !isClient) return;
    
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
        const easedY = normalizedY * 0.6;
        
        setMousePosition({ x: easedX, y: easedY });
      });
    };
    
    const handleMouseLeave = () => {
      setMousePosition({ x: 0, y: 0 });
      isMoving = false;
    };
    
    const handleMouseEnter = () => {
      isMoving = false;
    };
    
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      heroElement.addEventListener('mouseleave', handleMouseLeave);
      heroElement.addEventListener('mouseenter', handleMouseEnter);
    }
    
    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
        heroElement.removeEventListener('mouseleave', handleMouseLeave);
        heroElement.removeEventListener('mouseenter', handleMouseEnter);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMobile, isClient]);
  
  // Scroll position tracking for wave parallax
  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setScrollY(scrollY);
      setScrollProgress(scrollY / (documentHeight - windowHeight));
      setIsScrolling(true);
      
      // Clear scrolling state after scroll ends
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(window.scrollTimeout);
    };
  }, [isClient]);
  
  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (!isClient) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionName = entry.target.dataset.section;
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({
            ...prev,
            [sectionName]: true
          }));
        }
      });
    }, observerOptions);
    
    // Observe sections
    if (featuredSectionRef.current) {
      featuredSectionRef.current.dataset.section = 'featured';
      observer.observe(featuredSectionRef.current);
    }
    if (citySectionRef.current) {
      citySectionRef.current.dataset.section = 'city';
      observer.observe(citySectionRef.current);
    }
    if (discoverSectionRef.current) {
      discoverSectionRef.current.dataset.section = 'discover';
      observer.observe(discoverSectionRef.current);
    }
    
    return () => observer.disconnect();
  }, [isClient]);
  
  // Fetch featured restaurants
  const { 
    restaurants: featuredRestaurants, 
    loading: featuredLoading, 
    error: featuredError 
  } = useRestaurants({ 
    featured: true, 
    limit: 6 
  });
  

  

  
  // Popular cities list for the UI - moved outside component to prevent recreation
  const popularCities = useMemo(() => [
    { name: 'New York', state: 'NY' },
    { name: 'Los Angeles', state: 'CA' },
    { name: 'Chicago', state: 'IL' },
    { name: 'San Francisco', state: 'CA' },
    { name: 'Seattle', state: 'WA' },
    { name: 'Miami', state: 'FL' },
    { name: 'Phoenix', state: 'AZ' },
    { name: 'Houston', state: 'TX' },
    { name: 'Austin', state: 'TX' },
    { name: 'Dallas', state: 'TX' },
    { name: 'San Diego', state: 'CA' },
    { name: 'Philadelphia', state: 'PA' }
  ], []);
  
  const [filteredCities, setFilteredCities] = useState(popularCities);
  
  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const filtered = popularCities.filter(city => {
        const cityName = city.name.toLowerCase();
        const stateName = city.state.toLowerCase();
        const stateFullName = getStateFullName(city.state).toLowerCase();
        
        return cityName.includes(query) || 
               stateName.includes(query) || 
               stateFullName.includes(query) ||
               cityName.startsWith(query) ||
               cityName.split(' ').some(word => word.startsWith(query));
      });
      setFilteredCities(filtered);
    } else {
      setFilteredCities(popularCities);
    }
  }, [searchQuery, popularCities]);
  
  // Helper function to get full state names
  const getStateFullName = (stateCode) => {
    const stateNames = {
      'NY': 'New York',
      'CA': 'California',
      'IL': 'Illinois',
      'WA': 'Washington',
      'FL': 'Florida',
      'AZ': 'Arizona',
      'TX': 'Texas',
      'PA': 'Pennsylvania'
    };
    return stateNames[stateCode] || stateCode;
  };
  
  // Helper function to get city image
  const getCityImage = (cityName) => {
    const cityImages = {
      'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'los angeles': 'https://images.unsplash.com/photo-1544413660-299165566b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'chicago': 'https://images.unsplash.com/photo-1494522358658-554d6e0c1c1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'seattle': 'https://images.unsplash.com/photo-1502173173179-9e4bc76ae31a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'miami': 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'phoenix': 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'houston': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'austin': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'dallas': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'san diego': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'philadelphia': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    };
    return cityImages[cityName.toLowerCase()] || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  };

  // Helper function to get restaurant count for a city
  const getRestaurantCount = (cityName) => {
    const cityCounts = {
      'new york': 245,
      'los angeles': 198,
      'chicago': 167,
      'san francisco': 189,
      'seattle': 156,
      'miami': 178,
      'phoenix': 134,
      'houston': 223,
      'austin': 167,
      'dallas': 189,
      'san diego': 145,
      'philadelphia': 167
    };
    return cityCounts[cityName.toLowerCase()] || 89;
  };
  
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
  
  // Soup type quick filters
  const quickFilters = [
    { name: 'Ramen', emoji: '🍜', type: 'ramen' },
    { name: 'Stew', emoji: '🍲', type: 'stew' },
    { name: 'Chowder', emoji: '🥣', type: 'chowder' }
  ];
  
  const handleQuickFilter = (soupType) => {
    router.push(`/restaurants?soupType=${soupType}`);
  };

  // Map soup types to emojis
  const getSoupEmoji = (soupType) => {
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
    
    const lowerType = soupType.toLowerCase();
    
    // Find a matching key in the emoji map
    for (const key in emojiMap) {
      if (lowerType.includes(key)) {
        return emojiMap[key];
      }
    }
    
    // Default emoji if no match found
    return '🥣';
  };
  
  return (
    <div className="relative">
      <Head>
        <title>FindSoupNearMe - Discover the Best Soup Restaurants Near You</title>
        <meta name="description" content="Find the best soup restaurants in your city. Discover delicious ramen, pho, chowder, and more at top-rated restaurants." />
      </Head>
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform origin-left transition-transform duration-300"
           style={{ transform: `scaleX(${scrollProgress})` }}></div>
      
      {/* Organic Blob Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-orange-300/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-orange-100/25 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Modern Hero Section with Split Layout */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0">
          {/* Primary gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 via-white to-orange-50/40"></div>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-200/20 via-transparent to-orange-300/20 animate-pulse"></div>
          
          {/* Radial gradient for depth */}
          <div className="absolute inset-0 bg-radial-gradient opacity-30"></div>
        </div>

        {/* Floating Geometric Accent Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large floating circle */}
          <div 
            className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-60 blur-xl animate-float"
            style={{
              animationDelay: '0s',
              animationDuration: '6s'
            }}
          ></div>
          
          {/* Medium floating triangle */}
          <div 
            className="absolute top-1/3 left-10 w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 opacity-40 animate-float"
            style={{
              animationDelay: '2s',
              animationDuration: '8s',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          
          {/* Small floating square */}
          <div 
            className="absolute bottom-1/4 right-1/3 w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 opacity-50 animate-float"
            style={{
              animationDelay: '4s',
              animationDuration: '7s',
              transform: 'rotate(45deg)'
            }}
          ></div>
          
          {/* Floating spoon element */}
          <div 
            className="absolute top-1/2 left-1/4 w-8 h-8 opacity-30 animate-float"
            style={{
              animationDelay: '1s',
              animationDuration: '5s'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-orange-400">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          </div>
          
          {/* Floating bowl element */}
          <div 
            className="absolute bottom-1/3 right-1/4 w-10 h-10 opacity-40 animate-float"
            style={{
              animationDelay: '3s',
              animationDuration: '6s'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-orange-500">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          </div>
        </div>

        {/* Steam Animation Elements */}
        <div className="absolute top-1/4 right-1/3 pointer-events-none">
          <div className="steam-container">
            <div className="steam animate-steam-1"></div>
            <div className="steam animate-steam-2"></div>
            <div className="steam animate-steam-3"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            
            {/* Left Content Section */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-full text-sm font-semibold shadow-lg border border-orange-200/50 backdrop-blur-sm">
                <span className="mr-2">🍜</span>
                Discover 10,000+ Soup Restaurants
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                The Best{' '}
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Soup
                </span>{' '}
                Near You
              </h1>

              {/* Subheading */}
              <p className="text-xl lg:text-2xl text-neutral-600 max-w-2xl leading-relaxed">
                From hearty ramen to comforting chowder, find your perfect bowl across 11 major US cities
              </p>

              {/* Enhanced Search Bar */}
              <div className="max-w-2xl">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <span className="text-2xl">📍</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter your city or ZIP code"
                        className="w-full pl-16 pr-16 py-6 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-orange-200/50 shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300/50 focus:border-orange-400 text-lg font-medium transition-all duration-300 hover:shadow-2xl hover:border-orange-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={detectLocation}
                        className="absolute inset-y-0 right-0 pr-6 flex items-center text-neutral-500 hover:text-orange-500 transition-colors duration-300"
                        title="Use my current location"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Search Button */}
                    <button
                      type="submit"
                      className="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 group"
                    >
                      <MagnifyingGlassIcon className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Search</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-4">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.type}
                    type="button"
                    onClick={() => handleQuickFilter(filter.type)}
                    className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border-2 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 text-neutral-700 hover:bg-orange-50 hover:border-orange-300 hover:scale-105 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{filter.emoji}</span>
                    <span className="font-semibold">{filter.name}</span>
                  </button>
                ))}
              </div>

              {/* Popular Cities */}
              <div className="pt-4">
                <p className="text-neutral-500 mb-3 text-sm font-medium">Popular Cities:</p>
                <div className="flex flex-wrap gap-4">
                  {popularCities.slice(0, 6).map((city) => (
                    <Link
                      key={city.name}
                      href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                      className="text-orange-600 hover:text-orange-700 text-sm font-semibold hover:underline transition-colors duration-300"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Image Section */}
            <div className="relative lg:flex lg:justify-center lg:items-center">
              {/* Main Food Image */}
              <div className="relative w-full max-w-lg mx-auto">
                {/* Image Container */}
                <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/soup-pattern.svg"
                    alt="Delicious soup bowl"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  
                  {/* Floating Elements Over Image */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-3xl">🥣</span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-2xl">🍜</span>
                  </div>
                </div>

                {/* Floating Accent Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full opacity-60 animate-float"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg 
            className="w-full h-24 lg:h-32"
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
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
        </div>
      </section>
      
      {/* Featured Restaurants Section */}
      <section 
        ref={featuredSectionRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          '--scroll-progress': scrollProgress,
          '--section-depth': Math.max(0, Math.min(1, (scrollY - 600) / 200))
        }}
      >
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(249, 115, 22, 0.3) 1px, transparent 1px),
            radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 40px 40px',
          transform: `translateY(${scrollY * 0.1}px)`
        }}></div>
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }}></div>
        
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-300/40 rounded-full animate-pulse"
               style={{ transform: `translateY(${scrollY * 0.05}px)` }}></div>
          <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-orange-200/60 rounded-full animate-pulse delay-1000"
               style={{ transform: `translateY(${scrollY * 0.08}px)` }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-orange-400/50 rounded-full animate-pulse delay-2000"
               style={{ transform: `translateY(${scrollY * 0.03}px)` }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100/80 backdrop-blur-sm text-orange-600 rounded-full text-sm font-medium mb-4 border border-orange-200/50">
              🍜 Featured Collection
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Featured Soup Spots
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Discover handpicked restaurants serving the most delicious soups in your area
            </p>
          </div>
          
          {featuredError && (
            <div className="text-red-500 text-center mb-8 bg-red-50/80 backdrop-blur-sm rounded-lg p-4 border border-red-200/50">
              Error loading featured restaurants. Please try again later.
            </div>
          )}
          
          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div 
                  key={index}
                  className="glassmorphism-card animate-pulse"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-orange-200 rounded"></div>
                    <div className="h-4 bg-orange-100 rounded w-2/3"></div>
                    <div className="h-4 bg-orange-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {featuredRestaurants.map((restaurant, index) => (
                <div 
                  key={restaurant.id}
                  className={`glassmorphism-card group stagger-animate h-full card-interactive ${
                    expandedCards.has(restaurant.id) ? 'state-transition expanded' : 'state-transition'
                  }`}
                  style={{
                    animationDelay: `${index * 150}ms`,
                    transform: `translateY(${index * 20}px)`,
                    '--card-depth': Math.max(0, Math.min(1, (scrollY - 600) / 200))
                  }}
                  onMouseMove={(e) => handleMagneticHover(e, e.currentTarget)}
                  onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}
                  data-hover-text={`${restaurant.name} - ${restaurant.city}, ${restaurant.state}`}
                >

                  
                  <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
                    <img
                      src={restaurant.image_url || '/images/soup-pattern.svg'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = '/images/soup-pattern.svg';
                      }}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Steam Animation */}
                    <div className="steam-container absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="steam animate-steam-1"></div>
                      <div className="steam animate-steam-2"></div>
                      <div className="steam animate-steam-3"></div>
                    </div>
                    
                    {/* Price range label - Moved to top right */}
                    {restaurant.price_range && (
                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium shadow-lg border border-white/20 hover-reveal"
                           data-hover-text={`Price range: ${restaurant.price_range}`}>
                        {restaurant.price_range}
                      </div>
                    )}
                    
                    {/* Verified badge if applicable - Moved to top left */}
                    {restaurant.is_verified && (
                      <div className="absolute top-3 left-3 bg-white rounded-full px-2 py-1 text-xs font-medium flex items-center shadow-soft hover-reveal"
                           data-hover-text="Verified restaurant">
                        <span className="text-orange-500 mr-1">✓</span> Verified
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 relative z-10 flex flex-col flex-1">
                    <div className="flex-1 space-y-4">
                      {/* Restaurant Name */}
                      <h3 className="text-xl font-bold text-neutral-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                        {restaurant.name}
                      </h3>
                      
                      {/* Star Rating - Moved here */}
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 transition-all duration-300 ${
                                i < Math.floor(restaurant.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-neutral-300'
                              }`}
                              style={{
                                animationDelay: `${i * 100}ms`,
                                animation: hoveredElement === restaurant.id ? 'pulse-glow 1s ease-in-out infinite' : 'none'
                              }}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-neutral-600 text-sm">
                          {restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}
                          {restaurant.review_count ? ` (${restaurant.review_count})` : ''}
                        </span>
                      </div>
                      
                      {/* Location with Animated Icon */}
                      <div className="flex items-center space-x-2">
                        <div className="map-pin-container">
                          <svg className="h-4 w-4 text-orange-500 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-neutral-600 text-sm line-clamp-1">
                          {restaurant.city}, {restaurant.state}
                        </span>
                      </div>
                      
                      {/* Soup Types - Always Visible */}
                      {restaurant.soup_types && restaurant.soup_types.length > 0 && (
                        <div className="flex flex-wrap gap-2 min-h-[3rem]">
                          {restaurant.soup_types.slice(0, 3).map((type, typeIndex) => (
                            <span
                              key={typeIndex}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors duration-200 micro-interaction"
                              style={{ animationDelay: `${typeIndex * 50}ms` }}
                            >
                              <span className="mr-1">{getSoupEmoji(type)}</span> {type}
                            </span>
                          ))}
                          {restaurant.soup_types.length > 3 && (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                              +{restaurant.soup_types.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* View Details Button with Enhanced Hover */}
                    <Link
                      href={restaurant.slug && restaurant.city && restaurant.state
                        ? `/${restaurant.state.toLowerCase()}/${restaurant.city.toLowerCase().replace(/\s+/g, '-')}/${restaurant.slug}`
                        : `/restaurants/${restaurant.id}`
                      }
                      className="block w-full text-center py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse mt-6 btn-enhanced click-feedback"
                      onClick={(e) => createRippleEffect(e, e.currentTarget)}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span>View Details</span>
                        <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                  
                  {/* Subtle Border Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400/30 via-transparent to-orange-600/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm"></div>
                </div>
              ))}
            </div>
          )}
          
          {/* View All Button */}
          <div className="text-center mt-12">
            <Link 
              href="/restaurants" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform group breathing-animation"
            >
              <span className="mr-2">View All Restaurants</span>
              <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Interactive City Section with Modern Design */}
      <section 
        ref={citySectionRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.city ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          '--scroll-progress': scrollProgress,
          '--section-depth': Math.max(0, Math.min(1, (scrollY - 1200) / 300))
        }}
      >
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(249, 115, 22, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(249, 115, 22, 0.1) 75%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
          transform: `translateY(${scrollY * 0.15}px)`
        }}></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.3) 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-300/40 rounded-full animate-pulse"
             style={{ transform: `translateY(${scrollY * 0.05}px)` }}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-orange-200/60 rounded-full animate-pulse delay-1000"
             style={{ transform: `translateY(${scrollY * 0.08}px)` }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-orange-400/50 rounded-full animate-pulse delay-2000"
             style={{ transform: `translateY(${scrollY * 0.03}px)` }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header with Floating Search */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100/80 backdrop-blur-sm text-orange-600 rounded-full text-sm font-medium mb-4 border border-orange-200/50">
              🌆 City Explorer
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Discover Local Favorites
            </h2>
            <p className="text-neutral-600 text-lg mb-6">
              Explore amazing soup spots in cities across the country
            </p>
          </div>
          
          {/* Floating Search Input with Glassmorphism */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-md rounded-xl border border-white/50 shadow-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search cities..."
                    className="flex-1 bg-transparent border-none outline-none text-neutral-700 placeholder-neutral-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Horizontal Scrolling City Cards */}
          <div className="relative">
            {/* Scroll Indicators */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
              <button 
                className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-orange-200/50 hover:scale-110 transition-transform duration-300 cursor-pointer opacity-60 hover:opacity-100"
                onClick={() => {
                  const container = document.querySelector('.city-scroll-container');
                  if (container) {
                    container.scrollBy({ left: -400, behavior: 'smooth' });
                  }
                }}
              >
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden lg:block">
              <button 
                className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-orange-200/50 hover:scale-110 transition-transform duration-300 cursor-pointer opacity-60 hover:opacity-100"
                onClick={() => {
                  const container = document.querySelector('.city-scroll-container');
                  if (container) {
                    container.scrollBy({ left: 400, behavior: 'smooth' });
                  }
                }}
              >
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Horizontal Scrolling Container */}
            <div className="overflow-x-auto scrollbar-hide pb-8 -mx-4 px-4 city-scroll-container">
              <div className="flex gap-6 min-w-max" style={{ paddingLeft: '0px', paddingRight: '0px' }}>
                {filteredCities.map((city, index) => (
                  <div
                    key={city.name}
                    className="city-card relative group cursor-pointer transition-all duration-700 hover:scale-105 transform rounded-2xl overflow-hidden magnetic-hover flex-shrink-0"
                    style={{
                      width: '320px',
                      height: '400px',
                      animationDelay: `${index * 150}ms`,
                      transform: `translateX(${visibleSections.city ? 0 : '50px'})`,
                      opacity: visibleSections.city ? 1 : 0,
                      transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms`
                    }}
                    onClick={(e) => {
                      createRippleEffect(e, e.currentTarget);
                      router.push(`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`);
                    }}
                    onMouseMove={(e) => handleMagneticHover(e, e.currentTarget)}
                    onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}
                    data-hover-text={`Explore ${city.name} restaurants`}
                  >
                    {/* City Background Image */}
                    <div className="absolute inset-0 w-full h-full">
                      <img
                        src={getCityImage(city.name)}
                        alt={`${city.name} cityscape`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      
                      {/* Sophisticated Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                      
                      {/* Additional Gradient Layer for Depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* City Content */}
                    <div className="relative z-10 p-8 text-white h-full flex flex-col justify-between">
                      {/* Top Section */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-1 group-hover:text-orange-300 transition-colors duration-300">
                            {city.name}
                          </h3>
                          <p className="text-orange-200/80 text-sm font-medium">
                            {getStateFullName(city.state)}
                          </p>
                        </div>
                        
                        {/* Animated Location Icon */}
                        <div className="map-pin-container">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all duration-300">
                            <svg className="h-6 w-6 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Middle Section - Restaurant Count */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                            🍜
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                            <span className="text-lg font-bold">
                              {getRestaurantCount(city.name)}+
                            </span>
                            <span className="text-sm ml-1">spots</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Section */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
                              🌟 Top Rated
                            </span>
                          </div>
                          
                          {/* Explore Button */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 hover:bg-white/30 transition-all duration-300">
                              <span className="text-sm font-medium">Explore</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Reveal Information */}
                    <div 
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center cursor-pointer"
                      onClick={() => router.push(`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`)}
                    >
                      <div className="text-center text-white p-6">
                        <div className="text-4xl mb-4 animate-bounce">🍲</div>
                        <p className="text-lg font-bold mb-2">Explore {city.name}</p>
                        <p className="text-sm opacity-80 mb-4">Discover the best soup spots</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                          <span className="text-sm font-medium">View Restaurants</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ambient Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/30 via-transparent to-orange-600/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm"></div>
                    
                    {/* Floating Particles Effect */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-4 right-4 w-2 h-2 bg-orange-300/60 rounded-full animate-pulse floating-particle"></div>
                      <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-orange-200/80 rounded-full animate-pulse floating-particle" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 right-8 w-1 h-1 bg-orange-400/70 rounded-full animate-pulse floating-particle" style={{ animationDelay: '2s' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {filteredCities.length === 0 && (
            <div className="text-center py-12 text-neutral-600">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-medium mb-2">No cities found</p>
              <p className="text-sm">Try searching for a different city name</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Discover Section */}
      <section 
        ref={discoverSectionRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.discover ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          '--scroll-progress': scrollProgress,
          '--section-depth': Math.max(0, Math.min(1, (scrollY - 1800) / 300))
        }}
      >
        {/* Geometric Pattern Background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.2) 1px, transparent 1px),
            radial-gradient(circle at 70% 70%, rgba(249, 115, 22, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 60px 60px',
          transform: `translateY(${scrollY * 0.2}px)`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="glassmorphism-depth rounded-2xl p-8 md:p-12 shadow-xl morphing-element">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="depth-layer-1">
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
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center border border-orange-100 morphing-element hover-reveal"
                         data-hover-text="Traditional Japanese noodle soup">
                      <span className="text-2xl mr-3">🍜</span>
                      <div>
                        <p className="font-medium text-neutral-900">Ramen</p>
                        <p className="text-sm text-orange-600">{isClient ? '30+' : '30+'} spots</p>
                      </div>
                    </div>
                    <div className="bg-white px-4 py-3 rounded-lg shadow-sm flex items-center border border-orange-100 morphing-element hover-reveal"
                         data-hover-text="Creamy seafood soup">
                      <span className="text-2xl mr-3">🥣</span>
                      <div>
                        <p className="font-medium text-neutral-900">Chowder</p>
                        <p className="text-sm text-orange-600">{isClient ? '42+' : '42+'} spots</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative depth-layer-2">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-lg morphing-element">
                    <img 
                      src="https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                      alt="Delicious ramen" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-5 -left-5 bg-white rounded-lg shadow-md p-3 hidden md:block depth-layer-3">
                    <div className="flex items-center">
                      <div className="bg-orange-500 rounded-full w-3 h-3 mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium">Live: {isClient ? '435+' : '435+'} active restaurants</span>
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