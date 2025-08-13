// src/pages/api/search.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query = '', limit = 10, page = 1 } = req.query;
  
  if (!query.trim()) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  try {
    console.log(`Searching for restaurants with query: "${query}"`);
    
    // Calculate offset for pagination
    const offset = (page - 1) * parseInt(limit);
    
    // Build the search query
    const searchTerm = `%${query}%`;
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        soups (*),
        reviews (*)
      `)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},city.ilike.${searchTerm}`)
      .order('rating', { ascending: false })
      .limit(parseInt(limit))
      .range(offset, offset + parseInt(limit) - 1);
    
    if (error) {
      console.error('Error searching restaurants:', error);
      throw error;
    }
    
    // Process the data for the frontend
    const processedRestaurants = restaurants.map(restaurant => {
      // Extract soup types from related soups
      const soup_types = restaurant.soups 
        ? [...new Set(restaurant.soups
            .filter(soup => soup && soup.soup_type)
            .map(soup => soup.soup_type))]
        : [];
      
      // Calculate review stats
      const reviews = restaurant.reviews || [];
      const reviewCount = reviews.length;
      const avgRating = reviewCount > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount
        : null;
      
      return {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, '-'),
        city: restaurant.city,
        state: restaurant.state,
        rating: restaurant.rating || avgRating || 0,
        review_count: reviewCount,
        soup_types,
        image_url: restaurant.image_url || null,
        google_photos: restaurant.photo_urls || null,
        address: restaurant.address
      };
    });
    
    // Get the total count
    const { count, error: countError } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact' })
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},city.ilike.${searchTerm}`);
    
    return res.status(200).json({
      restaurants: processedRestaurants,
      totalCount: countError ? processedRestaurants.length : count,
      query
    });
  } catch (error) {
    console.error('Error in search API:', error);
    
    // Return mock data for development
    return res.status(200).json({
      restaurants: [
        {
          id: '1',
          name: 'Soup Heaven (Search Result)',
          city: 'New York',
          state: 'NY',
          rating: 4.5,
          review_count: 120,
          soup_types: ['Ramen', 'Pho', 'Clam Chowder'],
          image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
          slug: 'soup-heaven'
        }
      ],
      totalCount: 1,
      query,
      isErrorData: true
    });
  }
}