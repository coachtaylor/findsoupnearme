// Fixed Restaurant Data Collector for FindSoupNearMe
// This script uses the direct buffer method for image handling
// Claude API calls have been removed

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// City targets
const CITY_TARGETS = {
  'New York, NY': { min: 75, max: 100, state: 'NY', city: 'New York' },
  'Los Angeles, CA': { min: 60, max: 80, state: 'CA', city: 'Los Angeles' },
  'Chicago, IL': { min: 50, max: 70, state: 'IL', city: 'Chicago' },
  'San Francisco, CA': { min: 40, max: 60, state: 'CA', city: 'San Francisco' },
  'Seattle, WA': { min: 40, max: 60, state: 'WA', city: 'Seattle' },
  'Dallas, TX': { min: 30, max: 50, state: 'TX', city: 'Dallas' },
  'Miami, FL': { min: 30, max: 50, state: 'FL', city: 'Miami' },
  'Philadelphia, PA': { min: 30, max: 50, state: 'PA', city: 'Philadelphia' },
  'San Diego, CA': { min: 30, max: 40, state: 'CA', city: 'San Diego' },
  'Austin, TX': { min: 25, max: 40, state: 'TX', city: 'Austin' },
  'Phoenix, AZ': { min: 25, max: 40, state: 'AZ', city: 'Phoenix' }
};

// Soup types for categorization
const SOUP_TYPES = [
  'Ramen', 'Pho', 'Chowder', 'Bisque', 'Minestrone', 'French Onion',
  'Chicken Noodle', 'Tomato', 'Miso', 'Hot and Sour', 'Borscht',
  'Gumbo', 'Matzo Ball', 'Gazpacho', 'Lentil', 'Black Bean',
  'Split Pea', 'Wonton', 'Pozole', 'Cream of Mushroom', 'Beef Stew',
  'Vegetable', 'Tortilla', 'Udon', 'Laksa', 'Tom Yum', 'Caldo de Res',
  'Chicken Tortilla', 'Beef Pho', 'Seafood Chowder'
];

// Search query variations to find more soup restaurants
const SOUP_SEARCH_QUERIES = [
  'soup restaurant',
  'noodle soup',
  'ramen restaurant',
  'pho restaurant',
  'chowder house',
  'soup kitchen restaurant',
  'soup cafe',
  'soup bar',
  'asian soup',
  'vietnamese soup',
  'mexican soup',
  'soup deli',
  'soup takeout',
  'gourmet soup'
];

// Create storage bucket if it doesn&apos;t exist
async function createBucketIfNotExists(bucketName) {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message.includes('does not exist')) {
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
      
      console.log(`Created bucket: ${bucketName}`);
    } else if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      throw error;
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
  } catch (error) {
    console.error(`Error with bucket ${bucketName}:`, error);
  }
}

// Fetch an image from a URL and upload it to Supabase Storage using direct buffer method
async function fetchAndUploadImage(imageUrl, uploadPath, bucketName = 'restaurant-images') {
  try {
    console.log(`Fetching image from: ${imageUrl}`);
    
    // Use fetch with duplex option (required for Node.js 18+)
    const response = await fetch(imageUrl, {
      method: 'GET',
      duplex: 'half'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Get the image as an array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`Fetched image (${buffer.length} bytes)`);
    
    // Upload directly using the buffer
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading image to ${uploadPath}:`, error);
      return null;
    }
    
    console.log(`Uploaded image to ${uploadPath}`);
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error fetching/uploading image:`, error);
    return null;
  }
}

// Get restaurant data from Google Maps API
async function searchRestaurants(query, location) {
  console.log(`Searching for "${query}" in ${location}...`);
  
  const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const url = `${endpoint}?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&type=restaurant&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url, { 
      method: 'GET',
      duplex: 'half'  // Required for Node.js 18+
    });
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error(`Error from Google Maps API: ${data.status}`);
      return [];
    }
    
    console.log(`Found ${data.results.length} potential restaurants for query "${query}"`);
    return data.results;
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return [];
  }
}

// Get detailed restaurant data from Place Details API
async function getRestaurantDetails(placeId) {
  const endpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
  const url = `${endpoint}?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,geometry,opening_hours,price_level,rating,reviews,photos&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      duplex: 'half'  // Required for Node.js 18+
    });
    
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error(`Error from Google Maps API Details: ${data.status}`);
      return null;
    }
    
    return data.result;
  } catch (error) {
    console.error('Error getting restaurant details:', error);
    return null;
  }
}

// Get Google Street View image for a restaurant
async function getStreetViewImage(restaurant, cityInfo) {
  if (!restaurant.latitude || !restaurant.longitude) {
    console.log(`Missing coordinates for restaurant: ${restaurant.name}`);
    return null;
  }
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${restaurant.latitude},${restaurant.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const uploadPath = `${cityInfo.state}/${cityInfo.city}/${restaurant.id}/exterior.jpg`;
  return await fetchAndUploadImage(streetViewUrl, uploadPath);
}

// Get Google Places photos for a restaurant
async function getPlacePhotos(photosData, restaurantId, cityInfo, limit = 3) {
  if (!photosData || photosData.length === 0) {
    console.log(`No photos available for restaurant ID: ${restaurantId}`);
    return [];
  }
  
  const photoUrls = [];
  const photosToProcess = Math.min(limit, photosData.length);
  
  for (let i = 0; i < photosToProcess; i++) {
    const photo = photosData[i];
    const photoReference = photo.photo_reference;
    
    if (photoReference) {
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
      const uploadPath = `${cityInfo.state}/${cityInfo.city}/${restaurantId}/photo_${i + 1}.jpg`;
      
      const storedUrl = await fetchAndUploadImage(photoUrl, uploadPath);
      if (storedUrl) {
        photoUrls.push(storedUrl);
      }
      
      // Slow down to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return photoUrls;
}

// Process a restaurant and add it to the database
async function processRestaurant(placeResult, cityInfo) {
  try {
    // Check if restaurant already exists in the database by Google Place ID
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('google_place_id', placeResult.place_id)
      .maybeSingle();
      
    if (existingRestaurant) {
      console.log(`Restaurant already exists: ${placeResult.name}`);
      return existingRestaurant.id;
    }
    
    // Get detailed information
    const details = await getRestaurantDetails(placeResult.place_id);
    
    if (!details) {
      console.log(`Could not get details for: ${placeResult.name}`);
      return null;
    }
    
    // Create a slug from the restaurant name
    const slug = details.name.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      + '-' + cityInfo.city.toLowerCase().replace(/\s+/g, '-');
    
    // Parse address components
    const addressParts = details.formatted_address.split(',');
    const streetAddress = addressParts[0].trim();
    const zipMatch = addressParts[addressParts.length - 1].match(/\d{5}(-\d{4})?/);
    const zipCode = zipMatch ? zipMatch[0] : '';
    
    // Map Google price level to our format
    const priceMap = {
      1: '$',
      2: '$$',
      3: '$$$',
      4: '$$$$'
    };
    
    // Parse opening hours if available
    const hoursOfOperation = details.opening_hours ? 
      details.opening_hours.weekday_text : [];
    
    // Generate a unique ID for this restaurant
    const restaurantId = uuidv4();
    
    console.log(`Getting images for ${details.name}...`);
    
    // 1. Get Street View exterior image
    const exteriorImageUrl = await getStreetViewImage({
      id: restaurantId,
      name: details.name,
      latitude: details.geometry.location.lat, 
      longitude: details.geometry.location.lng
    }, cityInfo);
    
    // 2. Get Google Places photos
    const photoUrls = await getPlacePhotos(details.photos, restaurantId, cityInfo);
    
    // Generate random soup types for this restaurant
    const randomSoupTypes = SOUP_TYPES
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 3)); // 2-4 random soup types
    
    // Create the restaurant record with image URLs
    const restaurantData = {
      id: restaurantId,
      name: details.name,
      slug,
      google_place_id: placeResult.place_id,
      address: streetAddress,
      city: cityInfo.city,
      state: cityInfo.state,
      zip_code: zipCode,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      phone: details.formatted_phone_number || '',
      website: details.website || '',
      hours_of_operation: hoursOfOperation.length > 0 ? JSON.stringify(hoursOfOperation) : null,
      price_range: details.price_level ? priceMap[details.price_level] : null,
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date(),
      description: `${details.name} is a restaurant located in ${cityInfo.city}, ${cityInfo.state} that serves a variety of soups.`,
      exterior_image_url: exteriorImageUrl,
      photo_urls: photoUrls
    };
    
    // Insert restaurant into database
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();
      
    if (error) {
      console.error(`Error inserting restaurant ${details.name}:`, error);
      
      // If error mentions missing column, try again without the image columns
      if (error.message && (error.message.includes('photo_urls') || error.message.includes('exterior_image_url'))) {
        console.log('Trying again without image columns...');
        
        // Remove problematic columns
        delete restaurantData.photo_urls;
        delete restaurantData.exterior_image_url;
        
        // Try insert again
        const { data: retryData, error: retryError } = await supabase
          .from('restaurants')
          .insert(restaurantData)
          .select()
          .single();
          
        if (retryError) {
          console.error(`Error on retry for ${details.name}:`, retryError);
          return null;
        }
        
        data = retryData;
      } else {
        return null;
      }
    }
    
    // Add soups to the database
    for (const soupType of randomSoupTypes) {
      // Get a soup image URL (could be implemented to use stock images)
      const soupImageUrl = null; // For now, set to null
      
      const soupData = {
        id: uuidv4(),
        restaurant_id: data.id,
        name: `${soupType}`,
        description: `A delicious ${soupType.toLowerCase()}.`,
        price: 5 + Math.floor(Math.random() * 10), // Random price between $5-$15
        soup_type: soupType,
        dietary_info: Math.random() > 0.5 ? ['Vegetarian'] : [],
        is_seasonal: Math.random() > 0.7, // Randomly mark some as seasonal
        available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        image_url: soupImageUrl
      };
      
      const { error: soupError } = await supabase
        .from('soups')
        .insert(soupData);
        
      if (soupError) {
        // If error mentions missing column, try again without the image_url column
        if (soupError.message && soupError.message.includes('image_url')) {
          console.log('Trying soup insert again without image_url column...');
          
          // Remove problematic column
          delete soupData.image_url;
          
          // Try insert again
          const { error: retrySoupError } = await supabase
            .from('soups')
            .insert(soupData);
            
          if (retrySoupError) {
            console.error(`Error on soup retry for ${soupType}:`, retrySoupError);
          }
        } else {
          console.error(`Error inserting soup ${soupType} for ${details.name}:`, soupError);
        }
      }
    }
    
    console.log(`✅ Added restaurant: ${details.name} with ${randomSoupTypes.length} soups`);
    console.log(`   Images: ${exteriorImageUrl ? '✓ Exterior' : '✗ No Exterior'}, ${photoUrls.length} Photos`);
    
    return data.id;
  } catch (error) {
    console.error(`Error processing restaurant ${placeResult.name}:`, error);
    return null;
  }
}