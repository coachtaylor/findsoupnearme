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
      
      {/* Floating Navigation with Blur Background */}
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolling ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="bg-white/80 backdrop-blur-md border-b border-orange-100/50 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Link href="/" className="text-xl font-bold text-orange-600">
                  FindSoupNearMe
                </Link>
                <nav className="hidden md:flex space-x-6">
                  <Link href="/restaurants" className="text-neutral-700 hover:text-orange-600 transition-colors">
                    All Restaurants
                  </Link>
                  <Link href="/cities" className="text-neutral-700 hover:text-orange-600 transition-colors">
                    Cities
                  </Link>
                  <Link href="/about" className="text-neutral-700 hover:text-orange-600 transition-colors">
                    About
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-orange-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform origin-left transition-transform duration-300"
           style={{ transform: `scaleX(${scrollProgress})` }}></div>
      
      {/* Organic Blob Shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-orange-300/15 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-orange-100/25 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
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
          
          {/* City Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCities.map((city, index) => (
              <div
                key={city.name}
                className="city-card relative group cursor-pointer transition-all duration-500 hover:scale-105 transform rounded-xl overflow-hidden magnetic-hover"
                  style={{
                    background: city.name === 'New York' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' :
                              city.name === 'Los Angeles' ? 'linear-gradient(135deg, #ec4899, #f97316)' :
                              city.name === 'Chicago' ? 'linear-gradient(135deg, #2563eb, #4f46e5)' :
                              city.name === 'San Francisco' ? 'linear-gradient(135deg, #10b981, #3b82f6)' :
                              city.name === 'Seattle' ? 'linear-gradient(135deg, #6b7280, #3b82f6)' :
                              city.name === 'Miami' ? 'linear-gradient(135deg, #f472b6, #fb923c)' :
                              city.name === 'Phoenix' ? 'linear-gradient(135deg, #f97316, #dc2626)' :
                              city.name === 'Houston' ? 'linear-gradient(135deg, #3b82f6, #10b981)' :
                              city.name === 'Austin' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' :
                              city.name === 'Dallas' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' :
                              city.name === 'San Diego' ? 'linear-gradient(135deg, #60a5fa, #06b6d4)' :
                              city.name === 'Philadelphia' ? 'linear-gradient(135deg, #1d4ed8, #3730a3)' :
                              'linear-gradient(135deg, #f97316, #ea580c)',
                    animationDelay: `${index * 100}ms`,
                    minHeight: '280px'
                  }}
                  onClick={(e) => {
                    createRippleEffect(e, e.currentTarget);
                    router.push(`/restaurants?location=${encodeURIComponent(city.name)}`);
                  }}
                  onMouseMove={(e) => handleMagneticHover(e, e.currentTarget)}
                  onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}
                  data-hover-text={`Explore ${city.name} restaurants`}
                >

                  

                  
                  <div className="relative z-10 p-6 text-white h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">{city.name}</h3>
                      <div className="map-pin-container">
                        <svg className="h-5 w-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* City Info - Always Visible */}
                    <div className="mt-auto">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                          🍜 {isClient ? `${Math.floor(Math.random() * 50) + 20}+` : '20+'} spots
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Reveal Information */}
                  <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                    onClick={() => router.push(`/restaurants?location=${encodeURIComponent(city.name)}`)}
                  >
                    <div className="text-center text-white">
                      <div className="text-2xl mb-2">🍲</div>
                      <p className="text-sm font-medium">Explore {city.name}</p>
                      <p className="text-xs opacity-80">Click to discover</p>
                    </div>
                  </div>
                  
                  {/* Ambient Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/30 via-transparent to-orange-600/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-sm"></div>
                </div>
            ))}
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