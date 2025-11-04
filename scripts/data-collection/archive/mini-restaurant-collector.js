// Mini Restaurant Data Collector for FindSoupNearMe
// This is a limited version that collects just a few restaurants
// to test the process without wasting API calls

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

// Soup types for categorization
const SOUP_TYPES = [
  'Ramen', 'Pho', 'Chowder', 'Bisque', 'Minestrone', 'French Onion',
  'Chicken Noodle', 'Tomato', 'Miso', 'Hot and Sour', 'Borscht',
  'Gumbo', 'Matzo Ball', 'Gazpacho', 'Lentil', 'Black Bean'
];

// Create storage bucket if it doesn&apos;t exist
async function createBucketIfNotExists(bucketName) {
  try {
    console.log(`Checking if bucket ${bucketName} exists...`);
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message.includes('does not exist')) {
      console.log(`Bucket ${bucketName} does not exist. Creating...`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
      
      console.log(`✅ Created bucket: ${bucketName}`);
    } else if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      throw error;
    } else {
      console.log(`✅ Bucket ${bucketName} already exists`);
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

// Get restaurant data from Google Maps API - LIMITING TO JUST ONE QUERY
async function searchRestaurants(city) {
  console.log(`Searching for soup restaurants in ${city}...`);
  
  const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const query = `soup restaurant in ${city}`;
  const url = `${endpoint}?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
  
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
    
    // Only return the first 3 restaurants to limit API usage
    return data.results.slice(0, 3);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return [];
  }
}

// Get detailed restaurant data from Place Details API
async function getRestaurantDetails(placeId) {
  console.log(`Getting details for place ID: ${placeId}`);
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
    
    console.log(`Successfully got details for: ${data.result.name}`);
    return data.result;
  } catch (error) {
    console.error('Error getting restaurant details:', error);
    return null;
  }
}

// Get Google Street View image for a restaurant
async function getStreetViewImage(restaurant, city, state) {
  if (!restaurant.latitude || !restaurant.longitude) {
    console.log(`Missing coordinates for restaurant: ${restaurant.name}`);
    return null;
  }
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${restaurant.latitude},${restaurant.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const uploadPath = `${state}/${city}/${restaurant.id}/exterior.jpg`;
  return await fetchAndUploadImage(streetViewUrl, uploadPath);
}

// Get Google Places photos for a restaurant - LIMITING TO JUST ONE PHOTO
async function getPlacePhotos(photosData, restaurantId, city, state) {
  if (!photosData || photosData.length === 0) {
    console.log(`No photos available for restaurant ID: ${restaurantId}`);
    return [];
  }
  
  const photoUrls = [];
  const photosToProcess = Math.min(1, photosData.length); // Just get one photo to save API calls
  
  for (let i = 0; i < photosToProcess; i++) {
    const photo = photosData[i];
    const photoReference = photo.photo_reference;
    
    if (photoReference) {
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
      const uploadPath = `${state}/${city}/${restaurantId}/photo_${i + 1}.jpg`;
      
      const storedUrl = await fetchAndUploadImage(photoUrl, uploadPath);
      if (storedUrl) {
        photoUrls.push(storedUrl);
      }
    }
  }
  
  return photoUrls;
}

// Process a restaurant and add it to the database
async function processRestaurant(placeResult, city, state) {
  try {
    console.log(`Processing restaurant: ${placeResult.name}`);
    
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
      + '-' + city.toLowerCase().replace(/\s+/g, '-');
    
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
    }, city, state);
    
    // 2. Get Google Places photos (just one)
    const photoUrls = await getPlacePhotos(details.photos, restaurantId, city, state);
    
    // Generate random soup types for this restaurant
    const randomSoupTypes = SOUP_TYPES
      .sort(() => 0.5 - Math.random())
      .slice(0, 2); // Just 2 random soup types to keep it simple
    
    // Create the restaurant record with image URLs
    const restaurantData = {
      id: restaurantId,
      name: details.name,
      slug,
      google_place_id: placeResult.place_id,
      address: streetAddress,
      city: city,
      state: state,
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
      description: `${details.name} is a restaurant located in ${city}, ${state} that serves a variety of soups.`,
      exterior_image_url: exteriorImageUrl,
      photo_urls: photoUrls
    };
    
    console.log('Inserting restaurant into database...');
    
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
        console.log('Inserted restaurant without image columns.');
      } else {
        return null;
      }
    } else {
      console.log('Successfully inserted restaurant with image columns.');
    }
    
    // Add soups to the database
    console.log(`Adding ${randomSoupTypes.length} soups for ${details.name}...`);
    
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
          } else {
            console.log(`Added soup ${soupType} without image column.`);
          }
        } else {
          console.error(`Error inserting soup ${soupType} for ${details.name}:`, soupError);
        }
      } else {
        console.log(`Added soup ${soupType} with image column.`);
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

// Collect a small number of restaurants from Chicago
async function collectMiniRestaurantData() {
  try {
    console.log('Starting mini restaurant data collection...');
    
    // Create the storage bucket if it doesn&apos;t exist
    await createBucketIfNotExists('restaurant-images');
    
    // Set the city information
    const city = 'Chicago';
    const state = 'IL';
    
    console.log(`\n==== Processing ${city}, ${state} ====`);
    
    // Search for restaurants in Chicago - this will only return 3 restaurants
    const results = await searchRestaurants(city);
    
    if (results.length === 0) {
      console.log('No restaurants found. Exiting.');
      return;
    }
    
    console.log(`\nProcessing ${results.length} restaurants...`);
    
    // Process each restaurant
    let successCount = 0;
    for (const result of results) {
      const restaurantId = await processRestaurant(result, city, state);
      
      if (restaurantId) {
        successCount++;
      }
      
      // Sleep to avoid hitting API rate limits
      console.log('Pausing for 1 second before next restaurant...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n==== Mini Restaurant data collection complete! ====`);
    console.log(`Successfully added ${successCount} out of ${results.length} restaurants.`);
    
  } catch (error) {
    console.error('Error in data collection process:', error);
  }
}

// Generate a mini report
async function generateMiniReport() {
  try {
    console.log('\n==== MINI DATABASE REPORT ====');
    
    // Count restaurants in Chicago
    const { count: chicagoCount, error: chicagoError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('state', 'IL')
      .eq('city', 'Chicago');
      
    if (chicagoError) {
      console.error('Error counting Chicago restaurants:', chicagoError);
    } else {
      console.log(`Chicago restaurants: ${chicagoCount}`);
    }
    
    // Get all restaurants with details
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*');
      
    if (restError) {
      console.error('Error fetching restaurants:', restError);
    } else {
      console.log(`\nAll restaurants (${restaurants.length}):`);
      
      restaurants.forEach(restaurant => {
        console.log(`- ${restaurant.name} (${restaurant.city}, ${restaurant.state})`);
        console.log(`  Exterior image: ${restaurant.exterior_image_url ? '✓' : '✗'}`);
        console.log(`  Photo URLs: ${restaurant.photo_urls ? `✓ (${restaurant.photo_urls.length})` : '✗'}`);
      });
    }
    
    // Count soups
    const { count: soupCount, error: soupError } = await supabase
      .from('soups')
      .select('*', { count: 'exact', head: true });
      
    if (soupError) {
      console.error('Error counting soups:', soupError);
    } else {
      console.log(`\nTotal soups: ${soupCount}`);
      
      // Get soup types
      const { data: soups, error: soupDataError } = await supabase
        .from('soups')
        .select('name, soup_type, restaurant_id');
        
      if (soupDataError) {
        console.error('Error fetching soups:', soupDataError);
      } else {
        console.log('Soup types:');
        
        // Group by restaurant
        const soupsByRestaurant = {};
        soups.forEach(soup => {
          if (!soupsByRestaurant[soup.restaurant_id]) {
            soupsByRestaurant[soup.restaurant_id] = [];
          }
          soupsByRestaurant[soup.restaurant_id].push(soup);
        });
        
        // Display soups by restaurant
        for (const [restaurantId, restaurantSoups] of Object.entries(soupsByRestaurant)) {
          const restaurant = restaurants.find(r => r.id === restaurantId);
          if (restaurant) {
            console.log(`- ${restaurant.name}: ${restaurantSoups.map(s => s.name).join(', ')}`);
          }
        }
      }
    }
    
    console.log('\n==== END OF MINI REPORT ====');
  } catch (error) {
    console.error('Error generating mini report:', error);
  }
}

// Main function
async function main() {
  try {
    console.log('Starting mini restaurant collector script...');
    
    const command = process.argv[2];
    console.log(`Command: ${command}`);
    
    switch (command) {
      case 'collect':
        console.log('Executing mini collect command...');
        await collectMiniRestaurantData();
        break;
      case 'report':
        console.log('Executing mini report command...');
        await generateMiniReport();
        break;
      default:
        console.log('Please specify a command: collect or report');
        console.log('Example usage:');
        console.log('  node mini-restaurant-collector.js collect  # Collect a small set of restaurants');
        console.log('  node mini-restaurant-collector.js report   # Generate a mini report');
    }
    
    console.log('Script execution completed successfully.');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
console.log('Starting mini restaurant data collector...');
main().catch(error => {
  console.error('Unhandled error in main function:', error);
});