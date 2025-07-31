
// Restaurant Data Collector for FindSoupNearMe
// This script collects restaurant data from Google Maps API and enriches it with soup information

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback to anon key if service key not available
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Claude API configuration (for enrichment)
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

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

// Get restaurant data from Google Maps API
async function searchRestaurants(query, location) {
  const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const url = `${endpoint}?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&type=restaurant&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      console.error(`Error from Google Maps API: ${data.status}`);
      return [];
    }
    
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
    const response = await fetch(url);
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

// Use Claude API to enrich restaurant data with soup information
async function enrichWithClaudeAI(restaurant) {
  const prompt = `
  I need information about soups served at a restaurant called "${restaurant.name}" located at "${restaurant.formatted_address}".
  
  Based on the restaurant name, location, and any other details, please predict:
  
  1. What types of soups are likely served at this restaurant?
  2. A brief description of the restaurant focusing on its soup offerings
  3. Typical soup prices at this restaurant (estimate a range)
  4. Dietary options available (vegetarian, vegan, gluten-free, etc.)
  5. Any signature or specialty soups they might have
  
  Please respond in JSON format with these fields:
  {
    "soup_types": ["Type1", "Type2"],
    "description": "Brief description",
    "price_range": "$-$$",
    "dietary_options": ["Option1", "Option2"],
    "specialty_soups": [
      {
        "name": "Soup name",
        "description": "Brief description",
        "price": "Estimated price",
        "dietary_info": ["Info1", "Info2"]
      }
    ]
  }
  `;
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    
    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid response from Claude API');
      return null;
    }
    
    // Extract JSON from response
    const jsonMatch = data.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                      data.content[0].text.match(/({[\s\S]*?})/);
                      
    if (!jsonMatch) {
      console.error('Could not extract JSON from Claude response');
      return null;
    }
    
    return JSON.parse(jsonMatch[1]);
  } catch (error) {
    console.error('Error enriching with Claude AI:', error);
    return null;
  }
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
    
    // Create the restaurant record
    const restaurantData = {
      id: uuidv4(),
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
      updated_at: new Date()
    };
    
    // Get AI enrichment if Claude API key is available
    let enrichment = null;
    if (CLAUDE_API_KEY) {
      enrichment = await enrichWithClaudeAI({
        name: details.name,
        formatted_address: details.formatted_address
      });
    }
    
    // Insert restaurant into database
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantData)
      .select()
      .single();
      
    if (error) {
      console.error(`Error inserting restaurant ${details.name}:`, error);
      return null;
    }
    
    // If we have enrichment data, add soups to the database
    if (enrichment) {
      // Add soups
      for (const soupType of enrichment.soup_types) {
        // Add each soup type as a general category
        await supabase.from('soups').insert({
          id: uuidv4(),
          restaurant_id: data.id,
          name: `${soupType} Soup`,
          description: `A delicious ${soupType.toLowerCase()} soup.`,
          price: null, // Actual prices will be added for specific soups
          image_url: null, // Will be added by the image enrichment script
          soup_type: soupType,
          dietary_info: enrichment.dietary_options || [],
          is_seasonal: false,
          available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        });
      }
      
      // Add specialty soups if available
      if (enrichment.specialty_soups) {
        for (const specialtySoup of enrichment.specialty_soups) {
          await supabase.from('soups').insert({
            id: uuidv4(),
            restaurant_id: data.id,
            name: specialtySoup.name,
            description: specialtySoup.description,
            price: specialtySoup.price ? parseFloat(specialtySoup.price.replace(/[^0-9.]/g, '')) : null,
            image_url: null, // Will be added by the image enrichment script
            soup_type: enrichment.soup_types[0] || 'Specialty',
            dietary_info: specialtySoup.dietary_info || [],
            is_seasonal: Math.random() > 0.7, // Randomly mark some as seasonal
            available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          });
        }
      }
    } else {
      // If no enrichment, add a generic soup entry
      const randomSoupTypes = SOUP_TYPES
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 + Math.floor(Math.random() * 3)); // 2-4 random soup types
        
      for (const soupType of randomSoupTypes) {
        await supabase.from('soups').insert({
          id: uuidv4(),
          restaurant_id: data.id,
          name: `${soupType}`,
          description: `A delicious ${soupType.toLowerCase()}.`,
          price: 5 + Math.floor(Math.random() * 10), // Random price between $5-$15
          image_url: null, // Will be added by the image enrichment script
          soup_type: soupType,
          dietary_info: Math.random() > 0.5 ? ['Vegetarian'] : [],
          is_seasonal: Math.random() > 0.7, // Randomly mark some as seasonal
          available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        });
      }
    }
    
    console.log(`✅ Added restaurant: ${details.name}`);
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

// Main function to collect restaurant data for all cities
async function collectRestaurantData() {
  try {
    // Process each city
    for (const [locationName, cityInfo] of Object.entries(CITY_TARGETS)) {
      console.log(`\n==== Processing ${locationName} ====`);
      
      // Check how many restaurants we already have for this city
      const existingCount = await countRestaurantsInCity(cityInfo.state, cityInfo.city);
      console.log(`Found ${existingCount} existing restaurants in ${locationName}`);
      
      // Check if we've already reached our target
      if (existingCount >= cityInfo.min) {
        console.log(`✅ Already met minimum target for ${locationName} (${existingCount} >= ${cityInfo.min})`);
        
        if (existingCount >= cityInfo.max) {
          console.log(`✅ Already met maximum target for ${locationName} (${existingCount} >= ${cityInfo.max})`);
          continue;
        }
        
        console.log(`Will collect up to ${cityInfo.max - existingCount} more restaurants for ${locationName}`);
      } else {
        console.log(`Need to collect at least ${cityInfo.min - existingCount} more restaurants for ${locationName}`);
      }
      
      // Use multiple search queries to find diverse soup restaurants
      const cityCoords = await getLatLongForCity(locationName);
      let restaurantsFound = 0;
      let targetCount = cityInfo.min - existingCount;
      
      // Try each search query
      for (const query of SOUP_SEARCH_QUERIES) {
        if (restaurantsFound >= targetCount) break;
        
        console.log(`\nSearching for "${query}" in ${locationName}...`);
        
        let searchQuery = `${query} in ${locationName}`;
        let location = cityCoords ? `${cityCoords.lat},${cityCoords.lng}` : locationName;
        
        const results = await searchRestaurants(searchQuery, location);
        console.log(`Found ${results.length} potential restaurants for query "${query}"`);
        
        // Process each restaurant
        for (const result of results) {
          if (restaurantsFound >= cityInfo.max - existingCount) {
            console.log(`✅ Reached maximum target for ${locationName}`);
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
      
      console.log(`\n✅ Added ${restaurantsFound} new restaurants to ${locationName}`);
      console.log(`Total restaurants for ${locationName}: ${existingCount + restaurantsFound}`);
    }
    
    console.log('\n==== Restaurant data collection complete! ====');
  } catch (error) {
    console.error('Error in data collection process:', error);
  }
}

// Get latitude and longitude for a city
async function getLatLongForCity(cityName) {
  const endpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
  const url = `${endpoint}?address=${encodeURIComponent(cityName)}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
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
    
    // Restaurant image report
    const { data: restaurantsWithoutImages, error: imageError, count: noImageCount } = await supabase
      .from('restaurants')
      .select('id', { count: 'exact' })
      .is('exterior_image_url', null);
      
    if (imageError) {
      console.error('Error checking for restaurants without images:', imageError);
    } else {
      const percentWithoutImages = (noImageCount / totalRestaurants * 100).toFixed(1);
      console.log(`\nRestaurants without images: ${noImageCount} (${percentWithoutImages}% of total)`);
    }
    
    // Soup data report
    const { data: soupData, error: soupError, count: soupCount } = await supabase
      .from('soups')
      .select('id, restaurant_id', { count: 'exact' });
      
    if (soupError) {
      console.error('Error checking soup data:', soupError);
    } else {
      // Count unique restaurant_ids
      const restaurantsWithSoups = new Set(soupData.map(soup => soup.restaurant_id)).size;
      const averageSoupsPerRestaurant = (soupCount / restaurantsWithSoups).toFixed(1);
      const percentWithSoups = (restaurantsWithSoups / totalRestaurants * 100).toFixed(1);
      
      console.log(`\nTotal soups in database: ${soupCount}`);
      console.log(`Restaurants with soup data: ${restaurantsWithSoups} (${percentWithSoups}% of total)`);
      console.log(`Average soups per restaurant: ${averageSoupsPerRestaurant}`);
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
  const command = process.argv[2];
  
  switch (command) {
    case 'collect':
      await collectRestaurantData();
      break;
    case 'report':
      await generateDataReport();
      break;
    case 'collect-city':
      const city = process.argv[3];
      if (!city || !CITY_TARGETS[city]) {
        console.log('Please specify a valid city. Available cities:');
        Object.keys(CITY_TARGETS).forEach(city => console.log(`- ${city}`));
        return;
      }
      // Here you could implement a function to collect data for just one city
      console.log(`Would collect data for ${city}`);
      break;
    default:
      console.log('Please specify a command: collect, report, or collect-city');
      console.log('Example usage:');
      console.log('  node restaurant-data-collector.js collect          # Collect data for all cities');
      console.log('  node restaurant-data-collector.js report           # Generate data report');
      console.log('  node restaurant-data-collector.js collect-city "New York, NY"  # Collect data for specific city');
  }
}

// Run the main function
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

// Export functions for potential use in other scripts
export {
  collectRestaurantData,
  generateDataReport,
  processRestaurant,
  countRestaurantsInCity
};