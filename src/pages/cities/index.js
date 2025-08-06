// src/pages/cities/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

// List of featured cities with their states
const featuredCities = [
  // Launch cities from your PRD
  { name: 'New York', state: 'NY', description: 'Diverse international options' },
  { name: 'Los Angeles', state: 'CA', description: 'Health-conscious options' },
  { name: 'Chicago', state: 'IL', description: 'Hearty winter soups' },
  { name: 'San Francisco', state: 'CA', description: 'Farm-to-table, organic' },
  { name: 'Seattle', state: 'WA', description: 'Seafood soups, ramen' },
  { name: 'Dallas', state: 'TX', description: 'Tex-Mex soups, chilis' },
  { name: 'Miami', state: 'FL', description: 'Cuban, Latin American soups' },
  { name: 'Philadelphia', state: 'PA', description: 'Historic establishments' },
  { name: 'San Diego', state: 'CA', description: 'Fish soups, Mexican options' },
  { name: 'Austin', state: 'TX', description: 'Food truck scene' },
  { name: 'Phoenix', state: 'AZ', description: 'Southwestern specialties' },
];

// Organize cities by state
const citiesByState = featuredCities.reduce((acc, city) => {
  if (!acc[city.state]) {
    acc[city.state] = [];
  }
  acc[city.state].push(city);
  return acc;
}, {});

// Sort states alphabetically
const sortedStates = Object.keys(citiesByState).sort();

export default function CitiesPage() {
  const [isClient, setIsClient] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    featured: false,
    allCities: false
  });
  
  const headerRef = useRef(null);
  const featuredRef = useRef(null);
  const allCitiesRef = useRef(null);
  
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
    
    const refs = [
      { ref: headerRef, section: 'header' },
      { ref: featuredRef, section: 'featured' },
      { ref: allCitiesRef, section: 'allCities' }
    ];
    
    refs.forEach(({ ref, section }) => {
      if (ref.current) {
        ref.current.dataset.section = section;
        observer.observe(ref.current);
      }
    });
    
    return () => observer.disconnect();
  }, [isClient]);
  
  return (
    <div className="relative">
      <Head>
        <title>Explore Soup by City | FindSoupNearMe</title>
        <meta name="description" content="Discover the best soup restaurants in cities across the United States." />
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
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100/80 backdrop-blur-sm text-orange-600 rounded-full text-sm font-medium mb-4 border border-orange-200/50">
              🌆 City Explorer
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Explore Soup by City
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              Browse our curated list of cities to find the perfect bowl of soup near you. Each city offers unique flavors and specialties!
            </p>
          </div>
        </div>
      </section>
      
      {/* Featured Cities Section */}
      <section 
        ref={featuredRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.featured ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Featured Cities</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Discover the most popular soup destinations across the United States
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCities.slice(0, 6).map((city, index) => (
              <Link 
                key={`${city.state}-${city.name}`}
                href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                className="card-elevated p-6 rounded-xl hover-lift group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-neutral-900 group-hover:text-orange-600 transition-colors duration-300">
                    {city.name}, {city.state}
                  </h3>
                  <div className="map-pin-container">
                    <svg className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-neutral-600 mb-4">
                  {city.description}
                </p>
                <span className="text-orange-600 font-medium group-hover:text-orange-700 transition-colors duration-300">
                  View restaurants →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* All Cities by State Section */}
      <section 
        ref={allCitiesRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.allCities ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">All Cities by State</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Browse all available cities organized by state
            </p>
          </div>
          
          <div className="space-y-8">
            {sortedStates.map((state, stateIndex) => (
              <div key={state} className="glassmorphism-depth rounded-2xl p-8 shadow-xl morphing-element"
                   style={{ animationDelay: `${stateIndex * 50}ms` }}>
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">
                  {state}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {citiesByState[state].map((city, cityIndex) => (
                    <Link 
                      key={city.name}
                      href={`/${state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                      className="text-orange-600 hover:text-orange-700 hover:underline font-medium p-3 rounded-lg hover:bg-orange-50 transition-all duration-200 hover-lift"
                      style={{ animationDelay: `${(stateIndex * 50) + (cityIndex * 25)}ms` }}
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}