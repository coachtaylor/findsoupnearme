// src/pages/api/restaurants/index.js
import { supabase, getRestaurants } from '../../../lib/supabase';

export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { 
      city, 
      state, 
      limit = 10, 
      page = 1, 
      featured, 
      soupType, 
      rating,
      priceRange,
      sortBy = 'rating',
      sortOrder = 'desc' 
    } = req.query;
    
    // Handle multiple values for filters
    const soupTypes = Array.isArray(soupType) ? soupType : soupType ? [soupType] : [];
    const ratings = Array.isArray(rating) ? rating.map(r => parseFloat(r)) : rating ? [parseFloat(rating)] : [];
    const priceRanges = Array.isArray(priceRange) ? priceRange : priceRange ? [priceRange] : [];
    
    // Calculate offset for pagination
    const offset = (page - 1) * parseInt(limit);
    
    console.log('API request params:', { 
      city, state, limit, page, featured, soupTypes, ratings, priceRanges, sortBy, sortOrder, offset 
    });
    
    // Single optimized query instead of multiple queries
    const restaurants = await getRestaurants({
      city,
      state,
      rating: ratings.length > 0 ? Math.min(...ratings) : null,
      priceRange: priceRanges.length > 0 ? priceRanges : null,
      limit: parseInt(limit),
      offset,
      sortBy,
      sortOrder,
      featured: featured === 'true'
    });
    
    console.log(`Retrieved ${restaurants.length} restaurants from database`);
    
    // Process the data for the frontend
    const processedRestaurants = restaurants.map(restaurant => {
      // Extract soup types from soups relationship table
      const soup_types = restaurant.soups 
        ? restaurant.soups
            .filter(soup => soup && soup.soup_type)
            .map(soup => soup.soup_type)
        : [];
      
      return {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        city: restaurant.city,
        state: restaurant.state,
        rating: restaurant.rating,
        review_count: restaurant.review_count,
        price_range: restaurant.price_range,
        image_url: restaurant.image_url,
        is_verified: restaurant.is_verified,
        is_featured: restaurant.is_featured,
        soup_types: soup_types
      };
    });
    
    // Filter by soup type if specified (done in JavaScript since Supabase foreign key filtering is complex)
    let filteredRestaurants = processedRestaurants;
    if (soupTypes.length > 0) {
      filteredRestaurants = processedRestaurants.filter(restaurant => {
        return soupTypes.some(selectedType => restaurant.soup_types.includes(selectedType));
      });
    }
    
    // Get total count for pagination (simplified - in production you'd want a separate count query)
    const totalCount = filteredRestaurants.length;
    
    console.log(`Returning ${filteredRestaurants.length} restaurants to frontend`);
    
    res.status(200).json({
      restaurants: filteredRestaurants,
      totalCount: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}