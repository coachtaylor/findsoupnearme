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
    
    // Fetch restaurants
    let restaurants = await getRestaurants({
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
    
    // If no featured restaurants found and this is a featured request, fall back to top-rated restaurants
    if (featured === 'true' && restaurants.length === 0) {
      console.log('No featured restaurants found, falling back to top-rated restaurants');
      restaurants = await getRestaurants({
        city,
        state,
        rating: ratings.length > 0 ? Math.min(...ratings) : null,
        priceRange: priceRanges.length > 0 ? priceRanges : null,
        limit: parseInt(limit),
        offset,
        sortBy: 'rating',
        sortOrder: 'desc',
        featured: false
      });
    }
    
    // If still no restaurants found, return fallback data for development
    if (restaurants.length === 0) {
      console.log('No restaurants found in database, returning fallback data');
      return res.status(200).json({
        restaurants: [
          {
            id: '1',
            name: 'Soup Heaven',
            city: 'New York',
            state: 'NY',
            rating: 4.5,
            review_count: 120,
            soup_types: ['Ramen', 'Pho', 'Clam Chowder'],
            image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
            slug: 'soup-heaven',
            price_range: '$$'
          },
          {
            id: '2',
            name: 'Brothy Goodness',
            city: 'Los Angeles',
            state: 'CA',
            rating: 4.2,
            review_count: 85,
            soup_types: ['French Onion', 'Tomato Bisque'],
            image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
            slug: 'brothy-goodness',
            price_range: '$'
          },
          {
            id: '3',
            name: 'Ladle & Spoon',
            city: 'Chicago',
            state: 'IL',
            rating: 4.7,
            review_count: 200,
            soup_types: ['Chicken Noodle', 'Minestrone', 'Beef Stew'],
            image_url: 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
            slug: 'ladle-and-spoon',
            price_range: '$$$'
          },
          {
            id: '4',
            name: 'Pho Palace',
            city: 'San Francisco',
            state: 'CA',
            rating: 4.6,
            review_count: 150,
            soup_types: ['Pho', 'Bun Bo Hue', 'Tom Yum'],
            image_url: 'https://images.unsplash.com/photo-1607116667981-ff148a4e754d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
            slug: 'pho-palace',
            price_range: '$$'
          },
          {
            id: '5',
            name: 'Ramen House',
            city: 'Seattle',
            state: 'WA',
            rating: 4.4,
            review_count: 95,
            soup_types: ['Ramen', 'Miso', 'Tonkotsu'],
            image_url: 'https://images.unsplash.com/photo-1616501268209-edfff098fdd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
            slug: 'ramen-house',
            price_range: '$$'
          },
          {
            id: '6',
            name: 'Chowder Corner',
            city: 'Miami',
            state: 'FL',
            rating: 4.3,
            review_count: 75,
            soup_types: ['Clam Chowder', 'Lobster Bisque', 'Seafood Stew'],
            image_url: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
            slug: 'chowder-corner',
            price_range: '$$$'
          }
        ],
        totalCount: 6,
        isFallbackData: true
      });
    }
    
    console.log(`Retrieved ${restaurants.length} restaurants from database`);
    console.log('Sample restaurant data:', restaurants[0]);
    
    // Process the data for the frontend
    let processedRestaurants = restaurants.map(restaurant => {
      // Extract soup types from soups relationship table
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
        price_range: restaurant.price_range || '$$'
      };
    });
    
    // Filter by soup type if specified (done in JavaScript since Supabase foreign key filtering is complex)
    if (soupTypes.length > 0) {
      processedRestaurants = processedRestaurants.filter(restaurant => {
        // Use soups from the database, not detectedSoupTypes from data files
        const restaurantSoupTypes = restaurant.soups 
          ? restaurant.soups
              .filter(soup => soup && soup.soup_type)
              .map(soup => soup.soup_type)
          : [];
        return soupTypes.some(selectedType => restaurantSoupTypes.includes(selectedType));
      });
    }
    
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
      if (ratings.length > 0) countQuery = countQuery.in('rating', ratings);
      if (priceRanges.length > 0) countQuery = countQuery.in('price_range', priceRanges);
      
      const { count, error } = await countQuery;
      
      if (!error && count !== null) {
        totalCount = count;
        // If soup type filtering is applied, we need to adjust the count
        // This is a simplified approach - in production you might want a more accurate count
        if (soupTypes.length > 0) {
          // For now, we'll use the length of filtered results as the count
          totalCount = processedRestaurants.length;
        }
      } else {
        // If count query fails, use the length of current results
        totalCount = processedRestaurants.length;
      }
    } catch (countError) {
      console.error('Error getting count:', countError);
      totalCount = processedRestaurants.length;
    }
    
    // Return the data
    console.log('API returning:', {
      restaurantsCount: processedRestaurants.length,
      totalCount,
      sampleRestaurant: processedRestaurants[0]
    });
    
    return res.status(200).json({
      restaurants: processedRestaurants,
      totalCount
    });
    
  } catch (error) {
    console.error('Error in restaurants API:', error);
    console.log('Returning fallback data due to error');
    
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
          slug: 'soup-heaven',
          price_range: '$$'
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
          slug: 'brothy-goodness',
          price_range: '$'
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
          slug: 'ladle-and-spoon',
          price_range: '$$$'
        }
      ],
      totalCount: 3,
      isErrorData: true
    });
  }
}