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
      <div className="py-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-soup-red border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading restaurants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No restaurants found. Try adjusting your filters.</p>
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