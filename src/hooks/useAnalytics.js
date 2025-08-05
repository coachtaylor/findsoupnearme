// src/hooks/useAnalytics.js
import { useRouter } from 'next/router';
import { useEffect, useCallback } from 'react';

/**
 * Hook for tracking page views and user interactions
 * Uses a minimal approach to avoid performance impact
 * Can be extended to use Google Analytics, Plausible, or custom backend
 */
export default function useAnalytics() {
  const router = useRouter();
  
  // Track page views
  useEffect(() => {
    const handleRouteChange = (url) => {
      // If this were connected to Google Analytics, we'd track here
      console.log(`📊 Page view: ${url}`);
      
      // Example: Send to your backend or analytics service
      // fetch('/api/analytics/pageview', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ path: url }),
      // }).catch(err => console.error('Analytics error:', err));
    };
    
    // Track initial page load
    if (router.isReady) {
      handleRouteChange(router.asPath);
    }
    
    // Track route changes
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.isReady, router.asPath, router.events]);
  
  // Track specific events
  const trackEvent = useCallback((eventName, eventData = {}) => {
    console.log(`📊 Event: ${eventName}`, eventData);
    
    // Example: Send to your backend or analytics service
    // fetch('/api/analytics/event', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ event: eventName, data: eventData }),
    // }).catch(err => console.error('Analytics error:', err));
  }, []);
  
  // Predefined event trackers for common actions
  const trackRestaurantView = useCallback((restaurantId, restaurantName) => {
    trackEvent('restaurant_view', { restaurantId, restaurantName });
  }, [trackEvent]);
  
  const trackSearch = useCallback((query, resultCount) => {
    trackEvent('search', { query, resultCount });
  }, [trackEvent]);
  
  const trackFilterUse = useCallback((filterType, filterValue) => {
    trackEvent('filter_use', { filterType, filterValue });
  }, [trackEvent]);
  
  const trackExternalLink = useCallback((url, linkType) => {
    trackEvent('external_link_click', { url, linkType });
  }, [trackEvent]);
  
  // Return all tracking functions
  return {
    trackEvent,
    trackRestaurantView,
    trackSearch,
    trackFilterUse,
    trackExternalLink
  };
}