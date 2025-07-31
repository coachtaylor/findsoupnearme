// Complete Restaurant Data Collector for FindSoupNearMe
// This script collects restaurant data with both exterior and food photos

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Configure environment variables
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

// Create storage bucket if it doesn't exist
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

// Fetch an image from a URL and upload it to Supabase Storage
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
  console.log(`Getting details for place ID: ${placeId}`);
  
  const endpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
  const url = `${endpoint}?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,geometry,opening_hours,price_level,rating,reviews,photos,user_ratings_total&key=${GOOGLE_MAPS_API_KEY}`;
  
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
async function getStreetViewImage(restaurant, cityInfo) {
  if (!restaurant.latitude || !restaurant.longitude) {
    console.log(`Missing coordinates for restaurant: ${restaurant.name}`);
    return null;
  }
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${restaurant.latitude},${restaurant.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const uploadPath = `${cityInfo.state}/${cityInfo.city}/${restaurant.id}/exterior.jpg`;
  return await fetchAndUploadImage(streetViewUrl, uploadPath);
}
// Identify potential food photos from a set of photos
// We'll use heuristics like aspect ratio and attributions to guess which might be food photos
function identifyFoodPhotos(photos) {
    if (!photos || photos.length === 0) {
      return [];
    }
    
    // Clone the photos array
    const photosCopy = [...photos];
    
    // Sort photos by likelihood of being food photos using heuristics
    photosCopy.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      
      // Heuristic 1: Photos that are square or wider-than-tall are more likely to be food
      const aRatio = a.width / a.height;
      const bRatio = b.width / b.height;
      
      if (aRatio >= 1) aScore += 2; // Square or landscape
      if (bRatio >= 1) bScore += 2;
      
      if (aRatio > 0.8 && aRatio < 1) aScore += 1; // Nearly square
      if (bRatio > 0.8 && bRatio < 1) bScore += 1;
      
      // Heuristic 2: Check attributions for food-related keywords
      const aAttrib = a.html_attributions ? a.html_attributions.join(' ').toLowerCase() : '';
      const bAttrib = b.html_attributions ? b.html_attributions.join(' ').toLowerCase() : '';
      
      const foodKeywords = ['food', 'dish', 'meal', 'menu', 'cuisine', 'delicious', 'tasty', 'yummy', 'soup'];
      
      foodKeywords.forEach(keyword => {
        if (aAttrib.includes(keyword)) aScore += 3;
        if (bAttrib.includes(keyword)) bScore += 3;
      });
      
      return bScore - aScore; // Higher score first
    });
    
    console.log(`Sorted ${photosCopy.length} photos by food likelihood`);
    return photosCopy;
  }
  
  // Get food photos for a restaurant
  async function getFoodPhotos(photosData, restaurantId, cityInfo, maxPhotos = 2) {
    if (!photosData || photosData.length === 0) {
      console.log(`No photos available for restaurant ID: ${restaurantId}`);
      return [];
    }
    
    console.log(`Analyzing ${photosData.length} photos to find food photos...`);
    
    // Identify potential food photos
    const rankedPhotos = identifyFoodPhotos(photosData);
    
    // Get the top N photos
    const selectedPhotos = rankedPhotos.slice(0, maxPhotos);
    console.log(`Selected ${selectedPhotos.length} likely food photos`);
    
    const photoUrls = [];
    
    // Process each selected photo
    for (let i = 0; i < selectedPhotos.length; i++) {
      const photo = selectedPhotos[i];
      const photoReference = photo.photo_reference;
      
      if (photoReference) {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
        const uploadPath = `${cityInfo.state}/${cityInfo.city}/${restaurantId}/food_photo_${i + 1}.jpg`;
        
        const storedUrl = await fetchAndUploadImage(photoUrl, uploadPath);
        if (storedUrl) {
          photoUrls.push(storedUrl);
        }
        
        // Sleep to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return photoUrls;
  }
  
  // Function to validate if a place is a real restaurant
  function isValidRestaurant(placeResult, details) {
    // Skip validation if details are missing
    if (!details) {
      return false;
    }
    
    // Check for generic product names that aren't restaurants
    const productTerms = [
      'soup', 'broth', 'stock', 'recipe', 'mix', 'brand', 
      'package', 'container', 'can', 'box', 'ingredient'
    ];
    
    // Only flag if the name is very short AND contains product terms
    if (details.name && details.name.split(' ').length <= 3) {
      for (const term of productTerms) {
        if (details.name.toLowerCase().includes(term)) {
          console.log(`Rejected "${details.name}" - appears to be a product, not a restaurant`);
          return false;
        }
      }
    }
    
    // Check place types
    if (placeResult.types) {
      // Restaurant-related types
      const restaurantTypes = [
        'restaurant', 'food', 'meal_takeaway', 'meal_delivery', 
        'cafe', 'bakery', 'bar'
      ];
      
      // Non-restaurant types that should be excluded
      const nonRestaurantTypes = [
        'grocery_or_supermarket', 'store', 'supermarket', 
        'shopping_mall', 'convenience_store'
      ];
      
      // Check if any restaurant type is present
      const hasRestaurantType = placeResult.types.some(type => 
        restaurantTypes.includes(type)
      );
      
      // Check if any non-restaurant type is present
      const hasNonRestaurantType = placeResult.types.some(type => 
        nonRestaurantTypes.includes(type)
      );
      
      // If it has a non-restaurant type but no restaurant type, it's probably not a restaurant
      if (hasNonRestaurantType && !hasRestaurantType) {
        console.log(`Rejected "${details.name}" - place type suggests this is not a restaurant: ${placeResult.types.join(', ')}`);
        return false;
      }
    }
    
    // A valid restaurant should have either a phone number, reviews, or hours
    const hasPhone = !!details.formatted_phone_number;
    const hasReviews = !!(details.reviews && details.reviews.length > 0);
    const hasHours = !!(details.opening_hours && details.opening_hours.weekday_text);
    
    if (!hasPhone && !hasReviews && !hasHours) {
      console.log(`Rejected "${details.name}" - missing essential restaurant attributes (phone, reviews, hours)`);
      return false;
    }
    
    // Check if this has minimal reviews
    if (details.user_ratings_total === 0) {
      console.log(`Warning: "${details.name}" has no ratings - might not be a real restaurant`);
    }
    
    // If we've passed all checks, it's probably a valid restaurant
    return true;
  }
  
  // Process a restaurant and add it to the database
  async function processRestaurant(placeResult, cityInfo) {
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
      
      // ========== RESTAURANT VALIDATION ==========
      // First, perform basic validation to filter out non-restaurants
      if (!isValidRestaurant(placeResult, details)) {
        console.log(`❌ Invalid restaurant detected: ${placeResult.name} - Skipping`);
        return null;
      }
      
      // ========== END VALIDATION ==========
      
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
      
      // 2. Get food photos
      const foodPhotoUrls = await getFoodPhotos(details.photos, restaurantId, cityInfo);
      
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
        description: `${details.name} is a restaurant located in ${cityInfo.city}, ${cityInfo.state} that serves a variety of delicious soups.`,
        exterior_image_url: exteriorImageUrl,
        photo_urls: foodPhotoUrls
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
          
          console.log('Inserted restaurant without image columns.');
          return retryData.id;
        } else {
          return null;
        }
      }
      
      console.log('Successfully inserted restaurant with image columns.');
      
      // Add soups to the database
      console.log(`Adding ${randomSoupTypes.length} soups for ${details.name}...`);
      
      for (const soupType of randomSoupTypes) {
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
          image_url: null // For now, set to null
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
      console.log(`   Images: ${exteriorImageUrl ? '✓ Exterior' : '✗ No Exterior'}, ${foodPhotoUrls.length} Food Photos`);
      
      return data.id;
    } catch (error) {
      console.error(`Error processing restaurant ${placeResult.name}:`, error);
      return null;
    }
  }
  // Count existing restaurants in the database for a city
async function countRestaurantsInCity(state, city) {
    const { data, error, count } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact' })
      .eq('state', state)
      .eq('city', city);
      
    if (error) {
      console.error(`Error counting restaurants in ${city}, ${state}:`, error);
      return 0;
    }
    
    return count;
  }
  
  // Collect restaurant data for a specific city
  async function collectRestaurantDataForCity(locationName, cityInfo, maxRestaurants = null) {
    try {
      console.log(`\n==== Processing ${locationName} ====`);
      
      // Check how many restaurants we already have for this city
      const existingCount = await countRestaurantsInCity(cityInfo.state, cityInfo.city);
      console.log(`Found ${existingCount} existing restaurants in ${locationName}`);
      
      // Define the target
      let targetCount;
      if (maxRestaurants !== null) {
        // Use the provided maximum if specified
        targetCount = Math.max(0, maxRestaurants - existingCount);
        console.log(`Will collect up to ${targetCount} more restaurants for ${locationName} (limited by maxRestaurants)`);
      } else {
        // Otherwise, use the targets from CITY_TARGETS
        if (existingCount >= cityInfo.min) {
          console.log(`✅ Already met minimum target for ${locationName} (${existingCount} >= ${cityInfo.min})`);
          
          if (existingCount >= cityInfo.max) {
            console.log(`✅ Already met maximum target for ${locationName} (${existingCount} >= ${cityInfo.max})`);
            return existingCount;
          }
          
          targetCount = cityInfo.max - existingCount;
          console.log(`Will collect up to ${targetCount} more restaurants for ${locationName}`);
        } else {
          targetCount = cityInfo.min - existingCount;
          console.log(`Need to collect at least ${targetCount} more restaurants for ${locationName}`);
        }
      }
      
      if (targetCount <= 0) {
        console.log(`No more restaurants needed for ${locationName}`);
        return existingCount;
      }
      
      // Use multiple search queries to find diverse soup restaurants
      const cityCoords = await getLatLongForCity(locationName);
      let restaurantsFound = 0;
      
      // Try each search query
      for (const query of SOUP_SEARCH_QUERIES) {
        if (restaurantsFound >= targetCount) break;
        
        let searchQuery = `${query} in ${locationName}`;
        let location = cityCoords ? `${cityCoords.lat},${cityCoords.lng}` : locationName;
        
        const results = await searchRestaurants(searchQuery, location);
        
        // Process each restaurant
        for (const result of results) {
          if (restaurantsFound >= targetCount) {
            console.log(`✅ Reached target for ${locationName}`);
            break;
          }
          
          const restaurantId = await processRestaurant(result, cityInfo);
          
          if (restaurantId) {
            restaurantsFound++;
          }
          
          // Sleep to avoid hitting API rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const totalCount = existingCount + restaurantsFound;
      console.log(`\n✅ Added ${restaurantsFound} new restaurants to ${locationName}`);
      console.log(`Total restaurants for ${locationName}: ${totalCount}`);
      
      return totalCount;
    } catch (error) {
      console.error(`Error collecting data for ${locationName}:`, error);
      return 0;
    }
  }
  
  // Get latitude and longitude for a city
  async function getLatLongForCity(cityName) {
    const endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
    const url = `${endpoint}?address=${encodeURIComponent(cityName)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        duplex: 'half'  // Required for Node.js 18+
      });
      
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.error(`Error geocoding ${cityName}: ${data.status}`);
        return null;
      }
      
      return data.results[0].geometry.location;
    } catch (error) {
      console.error(`Error geocoding ${cityName}:`, error);
      return null;
    }
  }
  
  // Main function to collect restaurant data for all cities
  async function collectRestaurantData() {
    try {
      // Create the storage bucket if it doesn't exist
      await createBucketIfNotExists('restaurant-images');
      
      console.log('Starting restaurant data collection for all cities...');
      
      let totalRestaurants = 0;
      let citiesWithLowData = [];
      
      // Process each city
      for (const [locationName, cityInfo] of Object.entries(CITY_TARGETS)) {
        const cityCount = await collectRestaurantDataForCity(locationName, cityInfo);
        totalRestaurants += cityCount;
        
        if (cityCount < cityInfo.min) {
          citiesWithLowData.push({
            location: locationName,
            current: cityCount,
            target: cityInfo.min,
            deficit: cityInfo.min - cityCount
          });
        }
        
        // Pause between cities to avoid rate limits
        console.log(`Pausing for 5 seconds before processing next city...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      console.log('\n==== Restaurant data collection complete! ====');
      console.log(`Total restaurants collected: ${totalRestaurants}`);
      
      // Report on cities that still need more data
      if (citiesWithLowData.length > 0) {
        console.log('\nCities still needing more data:');
        console.log('------------------------------');
        
        citiesWithLowData.forEach(city => {
          console.log(`${city.location}: Need ${city.deficit} more restaurants (Current: ${city.current}, Target: ${city.target})`);
        });
        
        console.log('\nConsider running the script again to collect more data for these cities.');
      } else {
        console.log('\n✅ All cities have met their minimum targets!');
      }
    } catch (error) {
      console.error('Error in data collection process:', error);
    }
  }
  // Collect a small sample of restaurants for testing
async function collectSampleData(city, state, count = 3) {
    try {
      console.log(`\n==== Collecting sample of ${count} restaurants from ${city}, ${state} ====`);
      
      // Create the storage bucket if it doesn't exist
      await createBucketIfNotExists('restaurant-images');
      
      // Build city info object
      const cityInfo = {
        city: city,
        state: state
      };
      
      // Format the location name
      const locationName = `${city}, ${state}`;
      
      // Call the city collection function with a maximum limit
      await collectRestaurantDataForCity(locationName, cityInfo, count);
      
      console.log('\n==== Sample data collection complete! ====');
    } catch (error) {
      console.error('Error collecting sample data:', error);
    }
  }
  
  // Generate a report of the current data in the database
  async function generateDataReport() {
    try {
      console.log('\n==== DATABASE REPORT ====');
      
      // Get counts for each city
      console.log('\nRestaurant counts by city:');
      console.log('-------------------------');
      
      let totalRestaurants = 0;
      let citiesWithLowData = [];
      
      for (const [locationName, cityInfo] of Object.entries(CITY_TARGETS)) {
        const count = await countRestaurantsInCity(cityInfo.state, cityInfo.city);
        totalRestaurants += count;
        
        const status = count >= cityInfo.min 
          ? (count >= cityInfo.max ? '✅ COMPLETE' : '✓ MINIMUM MET') 
          : '❌ BELOW TARGET';
          
        console.log(`${locationName}: ${count} restaurants (Target: ${cityInfo.min}-${cityInfo.max}) ${status}`);
        
        if (count < cityInfo.min) {
          citiesWithLowData.push({
            location: locationName,
            current: count,
            target: cityInfo.min,
            deficit: cityInfo.min - count
          });
        }
      }
      
      console.log(`\nTotal restaurants in database: ${totalRestaurants}`);
      
      // Image report
      try {
        // Check for restaurants with exterior images
        const { count: withExteriorImages, error: exteriorError } = await supabase
          .from('restaurants')
          .select('id', { count: 'exact' })
          .not('exterior_image_url', 'is', null);
        
        if (!exteriorError) {
          const percentWithExterior = totalRestaurants > 0 ? 
            ((withExteriorImages / totalRestaurants) * 100).toFixed(1) : '0.0';
          console.log(`\nRestaurants with exterior images: ${withExteriorImages} (${percentWithExterior}%)`);
        }
      } catch (error) {
        console.log('Could not check for exterior images - column might not exist');
      }
      
      try {
        // Check for restaurants with photos
        const { count: withPhotos, error: photosError } = await supabase
          .from('restaurants')
          .select('id', { count: 'exact' })
          .not('photo_urls', 'is', null);
        
        if (!photosError) {
          const percentWithPhotos = totalRestaurants > 0 ? 
            ((withPhotos / totalRestaurants) * 100).toFixed(1) : '0.0';
          console.log(`Restaurants with food photos: ${withPhotos} (${percentWithPhotos}%)`);
        }
      } catch (error) {
        console.log('Could not check for photo_urls - column might not exist');
      }
      
      // Soup data report
      const { data: soupData, error: soupError, count: soupCount } = await supabase
        .from('soups')
        .select('id, restaurant_id', { count: 'exact' });
        
      if (soupError) {
        console.error('Error checking soup data:', soupError);
      } else {
        // Count unique restaurant_ids
        const restaurantsWithSoups = soupData ? new Set(soupData.map(soup => soup.restaurant_id)).size : 0;
        const averageSoupsPerRestaurant = restaurantsWithSoups > 0 ? (soupCount / restaurantsWithSoups).toFixed(1) : '0.0';
        const percentWithSoups = totalRestaurants > 0 ? (restaurantsWithSoups / totalRestaurants * 100).toFixed(1) : '0.0';
        
        console.log(`\nTotal soups in database: ${soupCount}`);
        console.log(`Restaurants with soup data: ${restaurantsWithSoups} (${percentWithSoups}% of total)`);
        console.log(`Average soups per restaurant: ${averageSoupsPerRestaurant}`);
      }
      
      try {
        // Check for soups with images
        const { count: soupsWithImages, error: soupImagesError } = await supabase
          .from('soups')
          .select('id', { count: 'exact' })
          .not('image_url', 'is', null);
        
        if (!soupImagesError) {
          const percentSoupsWithImages = soupCount > 0 ? 
            ((soupsWithImages / soupCount) * 100).toFixed(1) : '0.0';
          console.log(`Soups with images: ${soupsWithImages} (${percentSoupsWithImages}%)`);
        }
      } catch (error) {
        console.log('Could not check for soup images - column might not exist');
      }
      
      // Cities needing attention
      if (citiesWithLowData.length > 0) {
        console.log('\nCities needing more data:');
        console.log('------------------------');
        
        // Sort by largest deficit first
        citiesWithLowData.sort((a, b) => b.deficit - a.deficit);
        
        for (const city of citiesWithLowData) {
          console.log(`${city.location}: Need ${city.deficit} more restaurants (Current: ${city.current}, Target: ${city.target})`);
        }
      } else {
        console.log('\n✅ All cities have met their minimum targets!');
      }
      
      console.log('\n==== END OF REPORT ====');
    } catch (error) {
      console.error('Error generating data report:', error);
    }
  }
  
  // Main function
  async function main() {
    try {
      console.log('Starting complete restaurant collector script...');
      
      const command = process.argv[2];
      console.log(`Command: ${command}`);
      
      switch (command) {
        case 'collect':
          console.log('Executing collect command for all cities...');
          await collectRestaurantData();
          break;
        case 'report':
          console.log('Executing report command...');
          await generateDataReport();
          break;
        case 'collect-city':
          const city = process.argv[3];
          console.log(`Executing collect-city command for: ${city}`);
          
          if (!city || !CITY_TARGETS[city]) {
            console.log('Invalid city specified. Available cities:');
            Object.keys(CITY_TARGETS).forEach(city => console.log(`- ${city}`));
            return;
          }
          
          // Create the storage bucket if it doesn't exist
          console.log('Creating/checking storage bucket...');
          await createBucketIfNotExists('restaurant-images');
          
          console.log(`Starting data collection for ${city}...`);
          await collectRestaurantDataForCity(city, CITY_TARGETS[city]);
          break;
        case 'sample':
          const sampleCity = process.argv[3];
          const sampleState = process.argv[4];
          const sampleCount = parseInt(process.argv[5] || '3', 10);
          
          if (!sampleCity || !sampleState) {
            console.log('Please specify a city and state for the sample:');
            console.log('  node complete-restaurant-collector.js sample "Chicago" "IL" 3');
            return;
          }
          
          console.log(`Collecting sample of ${sampleCount} restaurants from ${sampleCity}, ${sampleState}...`);
          await collectSampleData(sampleCity, sampleState, sampleCount);
          break;
        default:
          console.log('Please specify a command: collect, report, collect-city, or sample');
          console.log('Example usage:');
          console.log('  node complete-restaurant-collector.js collect          # Collect data for all cities');
          console.log('  node complete-restaurant-collector.js report           # Generate data report');
          console.log('  node complete-restaurant-collector.js collect-city "New York, NY"  # Collect data for specific city');
          console.log('  node complete-restaurant-collector.js sample "Chicago" "IL" 3      # Collect a sample of restaurants');
      }
      
      console.log('Script execution completed successfully.');
    } catch (error) {
      console.error('Error in main function:', error);
    }
  }
  
  // Run the main function
  console.log('Starting complete restaurant data collector...');
  main().catch(error => {
    console.error('Unhandled error in main function:', error);
  });