import { useState, useEffect } from 'react';
import RestaurantCard from './RestaurantCard';

export default function RestaurantList({ 
  initialRestaurants = [], 
  city = null,
  state = null,
  soupType = null,
  isLoading = false
}) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have initial restaurants and no filters, don't fetch
    if (initialRestaurants.length > 0 && !city && !state && !soupType) {
      return;
    }

    async function fetchRestaurants() {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (city) params.append('city', city);
        if (state) params.append('state', state);
        if (soupType) params.append('soup_type', soupType);
        
        // Fetch restaurants
        const response = await fetch(`/api/restaurants?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        
        const data = await response.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, [initialRestaurants, city, state, soupType]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-neutral-600">Loading delicious soup spots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center bg-neutral-50 rounded-2xl">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-neutral-700 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-soft hover:shadow-md transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="py-12 text-center bg-neutral-50 rounded-2xl">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-neutral-700 mb-4">No restaurants found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}