// src/pages/404.js
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';

export default function NotFoundPage() {
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
  
  return (
    <div className="relative min-h-screen">
      <Head>
        <title>Page Not Found | FindSoupNearMe</title>
        <meta name="description" content="The page you are looking for does not exist." />
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
      
      {/* Enhanced 404 Content */}
      <section 
        ref={contentRef}
        className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden transition-all duration-1000 ${
          visibleSections.content ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
        
        <div className="text-center max-w-lg mx-auto relative z-10">
          <div className="glassmorphism-depth rounded-2xl p-8 md:p-12 shadow-xl morphing-element">
            <div className="relative mb-8">
              <div className="text-9xl font-bold text-orange-500 opacity-10 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 animate-floating">
                404
              </div>
              <h1 className="text-8xl font-bold text-orange-500 relative z-10 mb-4 animate-bounce">
                404
              </h1>
            </div>
            
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-orange-100/80 backdrop-blur-sm text-orange-600 rounded-full text-sm font-medium mb-4 border border-orange-200/50">
              🍜 Oops!
            </div>
            
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Page Not Found
            </h2>
            
            <p className="text-neutral-700 mb-10 max-w-md mx-auto text-lg">
              Sorry, we couldn't find the page you're looking for. The soup you're searching for might have been moved or doesn't exist.
            </p>
            
            <div className="flex flex-col space-y-4 items-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform btn-enhanced breathing-animation"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" 
                  />
                </svg>
                Return to Homepage
              </Link>
              
              <Link
                href="/restaurants"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 hover-lift"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 8l4 4m0 0l-4 4m4-4H3" 
                  />
                </svg>
                Browse All Restaurants
              </Link>
            </div>
            
            {/* Enhanced Bowl Illustration */}
            <div className="mt-12 max-w-xs mx-auto opacity-60 animate-floating-slow">
              <svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" fill="none" className="text-orange-500">
                <path d="M50,80 C90,95 210,95 250,80 L260,90 C260,90 280,90 280,70 C280,50 260,50 260,50 L40,50 C40,50 20,50 20,70 C20,90 40,90 40,90 L50,80" stroke="currentColor" strokeWidth="3"/>
                <path d="M60,45 C60,35 70,20 85,20 C95,20 105,25 105,35" stroke="currentColor" strokeWidth="2"/>
                <path d="M120,45 C120,30 130,15 150,15 C170,15 180,30 180,45" stroke="currentColor" strokeWidth="2"/>
                <path d="M195,45 C195,35 205,20 220,20 C230,20 240,25 240,35" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}