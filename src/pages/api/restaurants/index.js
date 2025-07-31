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
      sortBy = 'rating',
      sortOrder = 'desc' 
    } = req.query;
    
    // Calculate offset for pagination
    const offset = (page - 1) * parseInt(limit);
    
    console.log('API request params:', { 
      city, state, limit, page, featured, soupType, rating, sortBy, sortOrder, offset 
    });
    
    // First try to fetch featured restaurants if requested
    let restaurants = [];
    if (featured === 'true') {
      restaurants = await getRestaurants({
        city,
        state,
        soupType,
        rating: rating ? parseFloat(rating) : null,
        limit: parseInt(limit),
        offset,
        sortBy,
        sortOrder,
        featured: true
      });
      
      // If no featured restaurants found, fall back to top-rated restaurants
      if (restaurants.length === 0) {
        console.log('No featured restaurants found, falling back to top-rated');
        restaurants = await getRestaurants({
          city,
          state,
          soupType,
          rating: rating ? parseFloat(rating) : null,
          limit: parseInt(limit),
          offset,
          sortBy: 'rating',
          sortOrder: 'desc',
          featured: false
        });
      }
    } else {
      // Regular query without featured filter
      restaurants = await getRestaurants({
        city,
        state,
        soupType,
        rating: rating ? parseFloat(rating) : null,
        limit: parseInt(limit),
        offset,
        sortBy,
        sortOrder,
        featured: false
      });
    }
    
    console.log(`Retrieved ${restaurants.length} restaurants from database`);
    
    // Process the data for the frontend
    const processedRestaurants = restaurants.map(restaurant => {
      // Extract soup types from related soups
      const soup_types = restaurant.soups 
        ? [...new Set(restaurant.soups
            .filter(soup => soup && soup.soup_type) // Filter out null or undefined soups
            .map(soup => soup.soup_type))]
        : [];
      
      // Calculate review stats
      const reviews = restaurant.reviews || [];
      const reviewCount = reviews.length;
      const avgRating = reviewCount > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount
        : null;
      
      // Generate a fallback image URL using Unsplash
      // These URLs are known to be reliable
      const fallbackImages = [
        'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1607116667981-ff148a4e754d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1616501268209-edfff098fdd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
        'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80'
      ];
      
      // Use the restaurant ID to consistently assign the same fallback image
      const fallbackIndex = restaurant.id 
        ? parseInt(restaurant.id.replace(/[^0-9]/g, '').slice(0, 4) || '0', 16) % fallbackImages.length 
        : 0;
      const fallbackImage = fallbackImages[fallbackIndex];
      
      return {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, '-'),
        city: restaurant.city,
        state: restaurant.state,
        rating: restaurant.rating || avgRating || 0,
        review_count: reviewCount,
        soup_types,
        // Use restaurant's image if available, otherwise use a fallback
        image_url: restaurant.image_url || fallbackImage,
        address: restaurant.address,
        phone: restaurant.phone,
        website: restaurant.website,
        price_range: restaurant.price_range
      };
    });
    
    // Get total count for pagination
    let totalCount = 0;
    
    try {
      // Simplified query just to get the count
      let countQuery = supabase
        .from('restaurants')
        .select('id', { count: 'exact' });
      
      // Apply the same filters
      if (city) countQuery = countQuery.eq('city', city);
      if (state) countQuery = countQuery.eq('state', state);
      if (featured === 'true') countQuery = countQuery.eq('is_featured', true);
      if (soupType) countQuery = countQuery.eq('soups.soup_type', soupType);
      if (rating) countQuery = countQuery.gte('rating', parseFloat(rating));
      
      const { count, error } = await countQuery;
      
      if (!error && count !== null) {
        totalCount = count;
      } else {
        // If count query fails, use the length of current results
        totalCount = processedRestaurants.length;
      }
    } catch (countError) {
      console.error('Error getting count:', countError);
      totalCount = processedRestaurants.length;
    }
    
    // Return the data
    return res.status(200).json({
      restaurants: processedRestaurants,
      totalCount
    });
  } catch (error) {
    console.error('Error in restaurants API:', error);
    
    // Return an error response with fallback data for development
    return res.status(200).json({ 
      restaurants: [
        {
          id: '1',
          name: 'Soup Heaven (Fallback)',
          city: 'New York',
          state: 'NY',
          rating: 4.5,
          review_count: 120,
          soup_types: ['Ramen', 'Pho', 'Clam Chowder'],
          image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
          slug: 'soup-heaven'
        },
        {
          id: '2',
          name: 'Brothy Goodness (Fallback)',
          city: 'New York',
          state: 'NY',
          rating: 4.2,
          review_count: 85,
          soup_types: ['French Onion', 'Tomato Bisque'],
          image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
          slug: 'brothy-goodness'
        },
        {
          id: '3',
          name: 'Ladle & Spoon (Fallback)',
          city: 'New York',
          state: 'NY',
          rating: 4.7,
          review_count: 200,
          soup_types: ['Chicken Noodle', 'Minestrone', 'Beef Stew'],
          image_url: 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
          slug: 'ladle-and-spoon'
        }
      ],
      totalCount: 3,
      isErrorData: true
    });
  }
}