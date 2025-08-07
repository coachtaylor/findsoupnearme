/**
 * Restaurant API utility functions for fetching restaurant data
 */

// Cache for API responses to prevent redundant fetches
const apiCache = new Map();

/**
 * Fetch restaurants with optional filters
 * @param {Object} options - Query options 
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function fetchRestaurants(options = {}) {
  try {
    // Create cache key from options
    const cacheKey = `restaurants-${JSON.stringify(options)}`;
    
    // Return cached data if available and not older than 5 minutes
    if (apiCache.has(cacheKey)) {
      const { data, timestamp } = apiCache.get(cacheKey);
      const isCacheValid = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes
      
      if (isCacheValid) {
        return { data, error: null };
      }
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (options.state) queryParams.append('state', options.state);
    if (options.city) queryParams.append('city', options.city);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.offset) queryParams.append('offset', options.offset);
    if (options.soupType) queryParams.append('soupType', options.soupType);
    if (options.search) queryParams.append('search', options.search);
    
    // Fetch data from API
    const url = `/api/restaurants?${queryParams.toString()}`;
    
    console.time(`API call: ${url}`); // Performance logging
    const response = await fetch(url);
    console.timeEnd(`API call: ${url}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    apiCache.set(cacheKey, { 
      data, 
      timestamp: Date.now() 
    });
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Fetch a single restaurant by its slug
 * @param {string} slug - Restaurant slug
 * @param {string} state - State abbreviation
 * @param {string} city - City name
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function fetchRestaurantBySlug(slug, state, city) {
  try {
    // Create cache key
    const cacheKey = `restaurant-${slug}-${state}-${city}`;
    
    // Return cached data if available and not older than 5 minutes
    if (apiCache.has(cacheKey)) {
      const { data, timestamp } = apiCache.get(cacheKey);
      const isCacheValid = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes
      
      if (isCacheValid) {
        return { data, error: null };
      }
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      slug,
      state,
      city
    });
    
    // Fetch data from API
    const url = `/api/restaurants/by-slug?${queryParams.toString()}`;
    
    console.time(`API call: ${url}`); // Performance logging
    const response = await fetch(url);
    console.timeEnd(`API call: ${url}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    apiCache.set(cacheKey, { 
      data, 
      timestamp: Date.now() 
    });
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching restaurant by slug:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Clear the API cache
 */
export function clearApiCache() {
  apiCache.clear();
}