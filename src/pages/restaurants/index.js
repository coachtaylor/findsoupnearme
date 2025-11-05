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
    content: false
  });
  
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
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title} | FindSoupNearMe</title>
        <meta name="description" content={description} />
      </Head>
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform origin-left transition-transform duration-300"
           style={{ transform: `scaleX(${scrollProgress})` }}></div>
      
      {/* Content Section */}
      <section 
        ref={contentRef}
        className={`relative overflow-hidden transition-all duration-1000 ${
          visibleSections.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {isClient && router.isReady && (
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