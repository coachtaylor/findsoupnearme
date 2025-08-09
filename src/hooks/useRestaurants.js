// src/hooks/useRestaurants.js
import { useState, useEffect } from 'react';

export default function useRestaurants({
  city = null,
  state = null,
  limit = 10,
  featured = false,
  soupType = null,
  rating = null,
  priceRange = null,
  page = 1
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      console.log('Fetching restaurants with params:', { 
        city, state, limit, featured, soupType, rating, priceRange, page 
      });
      
      setLoading(true);
      setError(null);
      
      try {
        // Build query string based on parameters
        const queryParams = new URLSearchParams();
        if (city) queryParams.append('city', city);
        if (state) queryParams.append('state', state);
        if (limit) queryParams.append('limit', limit.toString());
        if (featured) queryParams.append('featured', 'true');
        
        // Handle arrays for multiple selections
        if (soupType) {
          if (Array.isArray(soupType)) {
            soupType.forEach(type => queryParams.append('soupType', type));
          } else {
            queryParams.append('soupType', soupType);
          }
        }
        
        if (rating) {
          if (Array.isArray(rating)) {
            rating.forEach(r => queryParams.append('rating', r.toString()));
          } else {
            queryParams.append('rating', rating.toString());
          }
        }
        
        if (priceRange) {
          if (Array.isArray(priceRange)) {
            priceRange.forEach(p => queryParams.append('priceRange', p));
          } else {
            queryParams.append('priceRange', priceRange);
          }
        }
        
        if (page) queryParams.append('page', page.toString());
        
        // Make API request
        const response = await fetch(`/api/restaurants?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.restaurants && Array.isArray(data.restaurants)) {
          const normalized = data.restaurants.map((r) => ({
            ...r,
            price_range: r.price_range || '$$',
          }));
          console.log('Sample normalized restaurant:', normalized[0]);
          setRestaurants(normalized);
          setTotalCount(data.totalCount || data.restaurants.length);
          setError(null);
        } else {
          console.error('Invalid API response format:', data);
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err.message);
        
        // We don't need fallback data here anymore since the API 
        // will return fallback data if the real data fetch fails
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [city, state, limit, featured, soupType, rating, priceRange, page]);
  
  return { restaurants, loading, error, totalCount };
}