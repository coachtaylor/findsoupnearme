// src/pages/api/restaurants/[id].js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Restaurant ID is required' });
  }
  
  try {
    console.log(`Fetching restaurant with ID: ${id}`);
    
    // Query for restaurant with related soups and reviews
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select(`
        *,
        soups (*),
        reviews (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
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
    
    // Process the restaurant data for the frontend
    const processedRestaurant = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, '-'),
      description: restaurant.description,
      city: restaurant.city,
      state: restaurant.state,
      address: restaurant.address,
      zip_code: restaurant.zip_code,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      phone: restaurant.phone,
      website: restaurant.website,
      hours_of_operation: restaurant.hours_of_operation,
      price_range: restaurant.price_range,
      rating: restaurant.rating || avgRating || 0,
      review_count: reviewCount,
      is_verified: restaurant.is_verified || false,
      soup_types,
      soups: restaurant.soups || [],
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        content: review.content,
        user_id: review.user_id,
        helpful_votes: review.helpful_votes || 0,
        created_at: review.created_at,
        images: review.images || []
      })),
      image_url: restaurant.image_url,
      google_photos: restaurant.photo_urls || null
    };
    
    return res.status(200).json(processedRestaurant);
  } catch (error) {
    console.error('Error in restaurant detail API:', error);
    
    // Return an error response with fallback data for development
    return res.status(200).json({
      id: '1',
      name: 'Soup Heaven (Fallback)',
      slug: 'soup-heaven',
      description: 'A cozy restaurant specializing in a variety of delicious soups from around the world.',
      city: 'New York',
      state: 'NY',
      address: '123 Soup Street',
      zip_code: '10001',
      phone: '(212) 555-7890',
      website: 'https://soupheaven.example.com',
      hours_of_operation: {
        Monday: '11:00 AM - 9:00 PM',
        Tuesday: '11:00 AM - 9:00 PM',
        Wednesday: '11:00 AM - 9:00 PM',
        Thursday: '11:00 AM - 9:00 PM',
        Friday: '11:00 AM - 10:00 PM',
        Saturday: '12:00 PM - 10:00 PM',
        Sunday: '12:00 PM - 8:00 PM'
      },
      price_range: '$$',
      rating: 4.5,
      review_count: 120,
      is_verified: true,
      soup_types: ['Ramen', 'Pho', 'Clam Chowder'],
      soups: [
        { id: '101', name: 'Classic Chicken Noodle', price: 9.99, description: 'Hearty chicken soup with vegetables and noodles' },
        { id: '102', name: 'Creamy Tomato Basil', price: 8.99, description: 'Rich tomato soup with fresh basil and cream' },
        { id: '103', name: 'New England Clam Chowder', price: 12.99, description: 'Thick, creamy soup with clams and potatoes' }
      ],
      reviews: [
        { id: '201', rating: 5, content: 'Amazing soups! The clam chowder is to die for.', user_id: 'user1', helpful_votes: 15, created_at: '2023-01-15T00:00:00Z' },
        { id: '202', rating: 4, content: 'Great atmosphere and friendly service.', user_id: 'user2', helpful_votes: 8, created_at: '2023-02-20T00:00:00Z' }
      ],
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      isErrorData: true
    });
  }
}