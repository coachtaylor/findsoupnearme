// src/hooks/useRestaurants.js
import { useState, useEffect } from 'react';

export default function useRestaurants({
  city = null,
  state = null,
  limit = 10,
  featured = false,
  soupType = null,
  rating = null,
  page = 1
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      console.log('Fetching restaurants with params:', { 
        city, state, limit, featured, soupType, rating, page 
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
        if (soupType) queryParams.append('soupType', soupType);
        if (rating) queryParams.append('rating', rating.toString());
        if (page) queryParams.append('page', page.toString());
        
        // Make API request
        const response = await fetch(`/api/restaurants?${queryParams.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.restaurants && Array.isArray(data.restaurants)) {
          setRestaurants(data.restaurants);
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
  }, [city, state, limit, featured, soupType, rating, page]);
  
  return { restaurants, loading, error, totalCount };
}