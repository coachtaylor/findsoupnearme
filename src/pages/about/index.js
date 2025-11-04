// src/pages/about/index.js
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    mission: false,
    whySoup: false,
    coverage: false,
    contact: false
  });
  
  const headerRef = useRef(null);
  const missionRef = useRef(null);
  const whySoupRef = useRef(null);
  const coverageRef = useRef(null);
  const contactRef = useRef(null);
  
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
      { ref: missionRef, section: 'mission' },
      { ref: whySoupRef, section: 'whySoup' },
      { ref: coverageRef, section: 'coverage' },
      { ref: contactRef, section: 'contact' }
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
        <title>About FindSoupNearMe | Find The Best Soup Near You</title>
        <meta name="description" content="Learn about FindSoupNearMe, the #1 platform for discovering, rating, and ordering soup from restaurants across U.S. cities." />
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
              🍜 Our Story
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              About FindSoupNearMe
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              Connecting soup lovers with the best local spots across the United States
            </p>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section 
        ref={missionRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.mission ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="glassmorphism-depth rounded-2xl p-8 md:p-12 shadow-xl morphing-element">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Our Mission</h2>
            <p className="text-neutral-700 mb-6 text-lg leading-relaxed">
              We&apos;re passionate about connecting soup lovers with the best local spots. Our platform curates authentic soup experiences across major US cities.
            </p>
            <p className="text-neutral-700 text-lg leading-relaxed">
              From cozy neighborhood joints to upscale restaurants, we help you discover where to find your perfect bowl of soup.
            </p>
          </div>
        </div>
      </section>
      
      {/* Why Soup Section */}
      <section 
        ref={whySoupRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.whySoup ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Why Soup?</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              Soup is more than just food—it&apos;s comfort, culture, and community in a bowl. Here&apos;s why we&apos;re soup-obsessed:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-elevated p-6 rounded-xl hover-lift">
              <div className="text-3xl mb-4">💝</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Emotional</h3>
              <p className="text-neutral-700">Soup connects us to memories, cultures, and traditions in a way few other foods can.</p>
            </div>
            <div className="card-elevated p-6 rounded-xl hover-lift">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Seasonal</h3>
              <p className="text-neutral-700">Different soups shine in different seasons, from cooling gazpacho to warming ramen.</p>
            </div>
            <div className="card-elevated p-6 rounded-xl hover-lift">
              <div className="text-3xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Universal</h3>
              <p className="text-neutral-700">Every culture has its own cherished soup traditions worth discovering.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Coverage Section */}
      <section 
        ref={coverageRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.coverage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="glassmorphism-depth rounded-2xl p-8 md:p-12 shadow-xl morphing-element">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Our Coverage</h2>
            <p className="text-neutral-700 mb-8 text-lg leading-relaxed">
              We currently cover 11 major US cities with plans to expand. Each city has been carefully researched to bring you the most authentic and delicious soup experiences.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'New York, NY', href: '/ny/new-york/restaurants' },
                { name: 'Los Angeles, CA', href: '/ca/los-angeles/restaurants' },
                { name: 'Chicago, IL', href: '/il/chicago/restaurants' },
                { name: 'San Francisco, CA', href: '/ca/san-francisco/restaurants' },
                { name: 'Seattle, WA', href: '/wa/seattle/restaurants' },
                { name: 'Dallas, TX', href: '/tx/dallas/restaurants' },
                { name: 'Miami, FL', href: '/fl/miami/restaurants' },
                { name: 'Philadelphia, PA', href: '/pa/philadelphia/restaurants' },
                { name: 'San Diego, CA', href: '/ca/san-diego/restaurants' },
                { name: 'Austin, TX', href: '/tx/austin/restaurants' },
                { name: 'Phoenix, AZ', href: '/az/phoenix/restaurants' }
              ].map((city, index) => (
                <Link 
                  key={city.name}
                  href={city.href} 
                  className="text-orange-600 hover:text-orange-700 hover:underline transition-colors duration-200 p-2 rounded-lg hover:bg-orange-50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section 
        ref={contactRef}
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.contact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="glassmorphism-depth rounded-2xl p-8 md:p-12 shadow-xl morphing-element">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">For Restaurant Owners</h2>
            <p className="text-neutral-700 mb-8 text-lg leading-relaxed">
              Are you a restaurant owner with amazing soup on your menu? We&apos;d love to feature you! Our platform helps local businesses connect with soup enthusiasts in their area.
            </p>
            
            <div className="text-center mb-8">
              <Link 
                href="mailto:hello@findsoupnearme.com?subject=Restaurant%20Listing%20Request"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform btn-enhanced breathing-animation"
              >
                <span className="mr-2">Get Listed</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l4-4m0 0l4 4m-4-4v18" />
                </svg>
              </Link>
            </div>
            
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h3>
            <p className="text-neutral-700 mb-4 text-lg">
              Have questions, suggestions, or just want to share your favorite soup spot? We&apos;d love to hear from you!
            </p>
            
            <p className="text-neutral-700 text-lg">
              Email: <a href="mailto:hello@findsoupnearme.com" className="text-orange-600 hover:text-orange-700 hover:underline transition-colors duration-200">hello@findsoupnearme.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
