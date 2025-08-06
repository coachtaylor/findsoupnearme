// src/pages/restaurants/index.js
import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import RestaurantListingPage from '../../components/restaurant/RestaurantListingPage';

export default function AllRestaurantsPage() {
  const router = useRouter();
  const { location, soupType } = router.query;
  const [title, setTitle] = useState('All Soup Restaurants');
  const [description, setDescription] = useState('Discover the best soup restaurants from across the United States.');
  const [isClient, setIsClient] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    content: false
  });
  
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  
  // Client-side detection
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Scroll position tracking
  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      setScrollY(scrollY);
      setScrollProgress(scrollY / (documentHeight - windowHeight));
      setIsScrolling(true);
      
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
    
    if (headerRef.current) {
      headerRef.current.dataset.section = 'header';
      observer.observe(headerRef.current);
    }
    if (contentRef.current) {
      contentRef.current.dataset.section = 'content';
      observer.observe(contentRef.current);
    }
    
    return () => observer.disconnect();
  }, [isClient]);
  
  // Parse location and update title and description based on search parameters
  useEffect(() => {
    if (location) {
      // Parse location to extract city and state
      const locationParts = location.split(',').map(part => part.trim());
      const city = locationParts[0];
      const state = locationParts[1] || null;
      
      setTitle(`Soup Restaurants near ${location}`);
      setDescription(`Find the best soup restaurants near ${location}. Browse by soup type, rating, and more.`);
    } else {
      setTitle('All Soup Restaurants');
      setDescription('Discover the best soup restaurants from across the United States.');
    }
  }, [location]);
  
  // Parse location for component props
  const locationParts = location ? location.split(',').map(part => part.trim()) : [];
  const city = locationParts[0] || null;
  const state = locationParts[1] || null;
  
  return (
    <div className="relative">
      <Head>
        <title>{title} | FindSoupNearMe</title>
        <meta name="description" content={description} />
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
      
      {/* Enhanced Header Section */}
      <section 
        ref={headerRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.header ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          '--scroll-progress': scrollProgress,
          '--section-depth': Math.max(0, Math.min(1, scrollY / 300))
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
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100/80 backdrop-blur-sm text-orange-600 rounded-full text-sm font-medium mb-4 border border-orange-200/50">
              🍜 Restaurant Explorer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              {title}
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              {description}
            </p>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section 
        ref={contentRef}
        className={`relative overflow-hidden transition-all duration-1000 ${
          visibleSections.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {isClient && (
          <RestaurantListingPage 
            title={title}
            description={description}
            city={city}
            state={state}
          />
        )}
      </section>
    </div>
  );
}