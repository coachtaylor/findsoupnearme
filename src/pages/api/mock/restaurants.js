// src/pages/api/mock/restaurants.js
export default function handler(req, res) {
  // Sample data for development with better image handling
  const mockRestaurants = [
    {
      id: '1',
      name: 'Soup Heaven',
      city: 'New York',
      state: 'NY',
      rating: 4.5,
      review_count: 120,
      soup_types: ['Ramen', 'Pho', 'Clam Chowder'],
      // Using reliable image URLs
      image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      slug: 'soup-heaven'
    },
    {
      id: '2',
      name: 'Brothy Goodness',
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
      name: 'Ladle & Spoon',
      city: 'New York',
      state: 'NY',
      rating: 4.7,
      review_count: 200,
      soup_types: ['Chicken Noodle', 'Minestrone', 'Beef Stew'],
      image_url: 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      slug: 'ladle-and-spoon'
    },
    {
      id: '4',
      name: 'Souper Bowl',
      city: 'Los Angeles',
      state: 'CA',
      rating: 4.6,
      review_count: 150,
      soup_types: ['Clam Chowder', 'Lobster Bisque', 'Corn Chowder'],
      image_url: 'https://images.unsplash.com/photo-1607116667981-ff148a4e754d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      slug: 'souper-bowl'
    },
    {
      id: '5',
      name: 'The Soup Kitchen',
      city: 'Chicago',
      state: 'IL',
      rating: 4.3,
      review_count: 180,
      soup_types: ['French Onion', 'Split Pea', 'Beef Barley'],
      image_url: 'https://images.unsplash.com/photo-1616501268209-edfff098fdd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      slug: 'the-soup-kitchen'
    },
    {
      id: '6',
      name: 'Urban Soup',
      city: 'San Francisco',
      state: 'CA',
      rating: 4.8,
      review_count: 220,
      soup_types: ['Vegan Lentil', 'Butternut Squash', 'Miso'],
      image_url: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80',
      slug: 'urban-soup'
    }
  ];

  // Get query parameters
  const { city, state, featured, limit = 10, page = 1 } = req.query;
  
  // Filter restaurants based on query parameters
  let filteredRestaurants = [...mockRestaurants];
  
  if (city) {
    filteredRestaurants = filteredRestaurants.filter(
      r => r.city.toLowerCase() === city.toLowerCase()
    );
  }
  
  if (state) {
    filteredRestaurants = filteredRestaurants.filter(
      r => r.state.toLowerCase() === state.toLowerCase()
    );
  }
  
  if (featured === 'true') {
    // For mock data, let's just return restaurants with rating > 4.5 as "featured"
    filteredRestaurants = filteredRestaurants.filter(r => r.rating > 4.5);
  }
  
  // Apply pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedRestaurants = filteredRestaurants.slice(
    startIndex, 
    startIndex + parseInt(limit)
  );

  // Send the response
  res.status(200).json({
    restaurants: paginatedRestaurants,
    totalCount: filteredRestaurants.length
  });
}