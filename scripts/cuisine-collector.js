// Cuisine-Targeted Restaurant Data Collector
// Pulls restaurants based on specific cuisine priorities with optimized search queries

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import slugify from 'slugify';

dotenv.config();

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('❌ GOOGLE_MAPS_API_KEY not found in environment variables');
  process.exit(1);
}

// Tier 1 - Critical Cuisines (Launch Immediately)
const TIER1_CUISINES = {
  Vietnamese: {
    priority: 1,
    searchQueries: [
      'vietnamese restaurant',
      'pho restaurant',
      'vietnamese noodle soup',
      'bun bo hue',
      'vietnamese soup',
      'banh mi pho'
    ],
    targetCities: ['San Jose, CA', 'Orange County, CA', 'Seattle, WA', 'Houston, TX', 'Denver, CO', 'Washington, DC'],
    perCityTarget: { min: 20, max: 30 }
  },
  
  Japanese: {
    priority: 1,
    searchQueries: [
      'ramen restaurant',
      'ramen near me',
      'ramen noodle shop',
      'ramen noodle soup restaurant',
      'ramen restaurant',
      'ramen shop',
      'japanese noodle',
      'udon restaurant',
      'tonkotsu ramen',
      'miso ramen',
      'shoyu ramen',
      'ramen izakaya',
      'japanese restaurant ramen'
    ],
    targetCities: ['New York, NY', 'Chicago, IL', 'San Francisco, CA', 'Los Angeles, CA'],
    perCityTarget: { min: 20, max: 30 }
  },
  
  Korean: {
    priority: 1,
    searchQueries: [
      'korean restaurant',
      'korean bbq',
      'korean soup',
      'sundubu restaurant',
      'tofu house',
      'korean stew'
    ],
    targetCities: ['Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Seattle, WA'],
    perCityTarget: { min: 20, max: 30 }
  },
  
  Thai: {
    priority: 1,
    searchQueries: [
      'thai restaurant',
      'tom yum restaurant',
      'tom kha gai',
      'thai soup',
      'thai noodle'
    ],
    targetCities: ['Los Angeles, CA', 'New York, NY', 'San Francisco, CA', 'Portland, OR', 'Seattle, WA'],
    perCityTarget: { min: 12, max: 20 }
  },
  
  Chinese: {
    priority: 1,
    searchQueries: [
      'chinese restaurant',
      'wonton soup restaurant',
      'dim sum',
      'chinese noodle',
      'hot and sour soup'
    ],
    targetCities: ['New York, NY', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Boston, MA'],
    perCityTarget: { min: 15, max: 25 }
  },
  
  Mexican: {
    priority: 1,
    searchQueries: [
      'mexican restaurant',
      'tortilla soup restaurant',
      'pozole restaurant',
      'menudo restaurant',
      'mexican soup'
    ],
    targetCities: ['Houston, TX', 'Dallas, TX', 'San Antonio, TX', 'Los Angeles, CA', 'Phoenix, AZ'],
    perCityTarget: { min: 15, max: 25 }
  },
  
  Italian: {
    priority: 1,
    searchQueries: [
      'italian restaurant',
      'minestrone restaurant',
      'italian soup',
      'italian wedding soup',
      'zuppa toscana'
    ],
    targetCities: ['New York, NY', 'Philadelphia, PA', 'Boston, MA', 'Chicago, IL'],
    perCityTarget: { min: 10, max: 20 }
  },
  
  American: {
    priority: 1,
    searchQueries: [
      'american diner',
      'comfort food restaurant',
      'chicken noodle soup restaurant',
      'clam chowder restaurant',
      'soup and sandwich',
      'broccoli cheddar soup'
    ],
    targetCities: ['New York, NY', 'Boston, MA', 'Chicago, IL', 'Philadelphia, PA', 'San Francisco, CA'],
    perCityTarget: { min: 20, max: 30 }
  }
};

// Tier 2 - Important Cuisines (Add Months 3-6)
const TIER2_CUISINES = {
  French: {
    priority: 2,
    searchQueries: [
      'french restaurant',
      'french bistro',
      'french onion soup',
      'bouillabaisse restaurant'
    ],
    targetCities: ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Boston, MA'],
    perCityTarget: { min: 8, max: 15 }
  },
  
  Indian: {
    priority: 2,
    searchQueries: [
      'indian restaurant',
      'dal soup',
      'mulligatawny soup',
      'indian curry'
    ],
    targetCities: ['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Houston, TX'],
    perCityTarget: { min: 10, max: 15 }
  },
  
  Jewish: {
    priority: 2,
    searchQueries: [
      'jewish deli',
      'matzo ball soup',
      'kosher restaurant',
      'jewish deli soup'
    ],
    targetCities: ['New York, NY', 'Los Angeles, CA', 'Miami, FL', 'Chicago, IL'],
    perCityTarget: { min: 5, max: 10 }
  },
  
  Mediterranean: {
    priority: 2,
    searchQueries: [
      'mediterranean restaurant',
      'greek restaurant',
      'middle eastern restaurant',
      'lentil soup restaurant',
      'avgolemono soup'
    ],
    targetCities: ['New York, NY', 'Los Angeles, CA', 'San Francisco, CA', 'Chicago, IL'],
    perCityTarget: { min: 8, max: 12 }
  },
  
  Filipino: {
    priority: 2,
    searchQueries: [
      'filipino restaurant',
      'filipino food near me',
      'filipino noodle soup',
      'sinigang restaurant',
      'filipino turo turo',
      'filipino comfort food',
      'lugaw restaurant',
      'arroz caldo',
      'tinola'
    ],
    targetCities: ['San Diego, CA', 'Los Angeles, CA', 'Phoenix, AZ', 'Seattle, WA'],
    perCityTarget: { min: 12, max: 18 }
  }
};

/**
 * Search for restaurants using Google Places API
 */
async function searchRestaurants(query, location) {
  const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const url = `${endpoint}?query=${encodeURIComponent(query + ' ' + location)}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.results || [];
    } else if (data.status === 'ZERO_RESULTS') {
      return [];
    } else {
      console.error(`API Error: ${data.status} - ${data.error_message || 'No message'}`);
      return [];
    }
  } catch (error) {
    console.error('Error searching restaurants:', error.message);
    return [];
  }
}

/**
 * Get restaurant details from Google Places
 */
async function getRestaurantDetails(placeId) {
  const endpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
  const fields = 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,geometry,editorial_summary,price_level';
  const url = `${endpoint}?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting restaurant details:', error.message);
    return null;
  }
}

/**
 * Check if restaurant already exists in database
 */
async function restaurantExists(name, city, state) {
  const { data } = await supabase
    .from('restaurants')
    .select('id')
    .eq('name', name)
    .eq('city', city)
    .eq('state', state)
    .maybeSingle();
  
  return !!data;
}

/**
 * Parse city and state from location string
 */
function parseCityState(location) {
  const parts = location.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1]
    };
  }
  return null;
}

/**
 * Get default soups for a cuisine
 */
function getDefaultSoupsForCuisine(cuisine) {
  const soupMap = {
    'Vietnamese': ['Pho', 'Bun Bo Hue'],
    'Japanese': ['Ramen', 'Miso', 'Udon'],
    'Korean': ['Kimchi'],
    'Thai': ['Tom Yum', 'Tom Kha'],
    'Chinese': ['Wonton', 'Hot and Sour', 'Egg Drop'],
    'Mexican': ['Tortilla', 'Pozole'],
    'Italian': ['Minestrone'],
    'American': ['Chicken Noodle', 'Tomato', 'Clam Chowder'],
    'French': ['French Onion'],
    'Indian': ['Lentil'],
    'Jewish': ['Matzo Ball'],
    'Mediterranean': ['Lentil'],
    'Filipino': ['Sinigang', 'Arroz Caldo', 'Tinola']
  };
  
  return soupMap[cuisine] || ['House Special'];
}

/**
 * Construct a unique slug for a restaurant.
 */
function buildRestaurantSlug(name, city, state, restaurantId) {
  const base = slugify(`${name} ${city} ${state}`, {
    lower: true,
    strict: true,
    trim: true
  });
  return `${base}-${restaurantId.slice(0, 8)}`;
}

/**
 * Extract a zip/postal code from the formatted address.
 */
function extractZipCode(formattedAddress) {
  if (!formattedAddress) return null;
  const match = formattedAddress.match(/\b\d{5}(?:-\d{4})?\b/);
  return match ? match[0] : null;
}

/**
 * Process and insert restaurant into database
 */
async function processRestaurant(place, cuisine, cityInfo) {
  try {
    // Check if exists
    if (await restaurantExists(place.name, cityInfo.city, cityInfo.state)) {
      console.log(`  ⏭️  Already exists: ${place.name}`);
      return null;
    }
    
    // Get detailed info
    const details = await getRestaurantDetails(place.place_id);
    if (!details) {
      console.log(`  ❌ Could not get details for: ${place.name}`);
      return null;
    }
    
    // Insert restaurant
    const restaurantId = uuidv4();
    const zipCode = extractZipCode(details.formatted_address);
    if (!zipCode) {
      console.warn(`  ⚠️  Skipping ${details.name}: unable to determine zip code from address.`);
      return null;
    }

    const { error: restError } = await supabase
      .from('restaurants')
      .insert({
        id: restaurantId,
        slug: buildRestaurantSlug(details.name, cityInfo.city, cityInfo.state, restaurantId),
        name: details.name,
        address: details.formatted_address,
        city: cityInfo.city,
        state: cityInfo.state,
        zip_code: zipCode,
        phone: details.formatted_phone_number,
        website: details.website,
        rating: details.rating,
        review_count: details.user_ratings_total,
        latitude: details.geometry?.location?.lat,
        longitude: details.geometry?.location?.lng,
        description: details.editorial_summary?.overview || `A ${cuisine} restaurant.`,
        price_range: '$'.repeat(details.price_level || 2),
        cuisines: [cuisine],
        google_place_id: place.place_id
      });
    
    if (restError) {
      console.error(`  ❌ Error inserting restaurant:`, restError.message);
      return null;
    }
    
    // Insert default soups for this cuisine
    const soups = getDefaultSoupsForCuisine(cuisine);
    const soupsToInsert = soups.map(soupType => ({
      id: uuidv4(),
      restaurant_id: restaurantId,
      name: soupType,
      description: `A delicious ${soupType.toLowerCase()}.`,
      price: 8 + Math.floor(Math.random() * 7),
      soup_type: soupType,
      dietary_info: [],
      is_seasonal: false,
      available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }));
    
    const { error: soupError } = await supabase
      .from('soups')
      .insert(soupsToInsert);
    
    if (soupError) {
      console.error(`  ❌ Error inserting soups:`, soupError.message);
    }
    
    console.log(`  ✅ Added: ${details.name} (${cuisine}) with ${soups.length} soup(s)`);
    return restaurantId;
    
  } catch (error) {
    console.error(`  ❌ Error processing ${place.name}:`, error.message);
    return null;
  }
}

/**
 * Collect restaurants for a specific cuisine in a city
 */
async function collectCuisineInCity(cuisine, cuisineData, location) {
  const cityInfo = parseCityState(location);
  if (!cityInfo) {
    console.error(`Invalid location format: ${location}`);
    return 0;
  }
  
  console.log(`\n==== ${cuisine} in ${location} ====`);
  
  // Check current count
  const { count: existingCount } = await supabase
    .from('restaurants')
    .select('id', { count: 'exact', head: true })
    .eq('city', cityInfo.city)
    .eq('state', cityInfo.state)
    .contains('cuisines', [cuisine]);
  
  console.log(`Current ${cuisine} restaurants: ${existingCount}`);
  console.log(`Target: ${cuisineData.perCityTarget.min}-${cuisineData.perCityTarget.max}`);
  
  if (existingCount >= cuisineData.perCityTarget.max) {
    console.log(`✅ Target already met!`);
    return 0;
  }
  
  const needed = cuisineData.perCityTarget.min - existingCount;
  console.log(`Need: ${needed} more\n`);
  
  let collected = 0;
  const processedPlaces = new Set();
  
  // Try each search query for this cuisine
  for (const query of cuisineData.searchQueries) {
    if (collected >= needed) break;
    
    console.log(`Searching: "${query}"...`);
    
    const results = await searchRestaurants(query, location);
    console.log(`Found ${results.length} results`);
    
    for (const place of results) {
      if (collected >= needed) break;
      if (processedPlaces.has(place.place_id)) continue;
      
      processedPlaces.add(place.place_id);
      const restaurantId = await processRestaurant(place, cuisine, cityInfo);
      
      if (restaurantId) {
        collected++;
      }
      
      // Rate limiting - be nice to Google API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n✅ Collected ${collected} new ${cuisine} restaurants in ${location}`);
  return collected;
}

/**
 * Collect all Tier 1 cuisines
 */
async function collectTier1() {
  console.log('=== COLLECTING TIER 1 CUISINES ===\n');
  
  let totalCollected = 0;
  
  for (const [cuisine, data] of Object.entries(TIER1_CUISINES)) {
    console.log(`\n━━━ ${cuisine} (Priority ${data.priority}) ━━━`);
    
    for (const city of data.targetCities) {
      const collected = await collectCuisineInCity(cuisine, data, city);
      totalCollected += collected;
      
      // Delay between cities
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n\n=== TIER 1 COLLECTION COMPLETE ===`);
  console.log(`Total restaurants collected: ${totalCollected}`);
}

/**
 * Collect all Tier 2 cuisines
 */
async function collectTier2() {
  console.log('=== COLLECTING TIER 2 CUISINES ===\n');
  
  let totalCollected = 0;
  
  for (const [cuisine, data] of Object.entries(TIER2_CUISINES)) {
    console.log(`\n━━━ ${cuisine} (Priority ${data.priority}) ━━━`);
    
    for (const city of data.targetCities) {
      const collected = await collectCuisineInCity(cuisine, data, city);
      totalCollected += collected;
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`\n\n=== TIER 2 COLLECTION COMPLETE ===`);
  console.log(`Total restaurants collected: ${totalCollected}`);
}

/**
 * Collect specific cuisine in specific city
 */
async function collectSpecific(cuisine, location) {
  const allCuisines = { ...TIER1_CUISINES, ...TIER2_CUISINES };
  
  if (!allCuisines[cuisine]) {
    console.error(`Unknown cuisine: ${cuisine}`);
    console.log('Available cuisines:', Object.keys(allCuisines).join(', '));
    return;
  }
  
  await collectCuisineInCity(cuisine, allCuisines[cuisine], location);
}

/**
 * Generate collection report
 */
async function generateReport() {
  console.log('\n=== COLLECTION REPORT ===\n');
  
  // Get total counts
  const { count: totalRestaurants } = await supabase
    .from('restaurants')
    .select('id', { count: 'exact', head: true });
  
  const { count: totalSoups } = await supabase
    .from('soups')
    .select('id', { count: 'exact', head: true });
  
  console.log(`Total restaurants: ${totalRestaurants}`);
  console.log(`Total soups: ${totalSoups}\n`);
  
  // Get cuisine breakdown
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('cuisines');
  
  const cuisineCount = {};
  restaurants.forEach(r => {
    if (r.cuisines) {
      r.cuisines.forEach(cuisine => {
        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
      });
    }
  });
  
  console.log('=== CUISINE BREAKDOWN ===\n');
  Object.entries(cuisineCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cuisine, count]) => {
      console.log(`${cuisine}: ${count} restaurants`);
    });
}

// Main execution
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

async function main() {
  if (command === 'tier1') {
    await collectTier1();
  } else if (command === 'tier2') {
    await collectTier2();
  } else if (command === 'specific' && arg1 && arg2) {
    await collectSpecific(arg1, arg2);
  } else if (command === 'report') {
    await generateReport();
  } else {
    console.log('Usage:');
    console.log('  node cuisine-collector.js tier1                              # Collect all Tier 1 cuisines');
    console.log('  node cuisine-collector.js tier2                              # Collect all Tier 2 cuisines');
    console.log('  node cuisine-collector.js specific "Vietnamese" "Seattle, WA"  # Collect specific cuisine/city');
    console.log('  node cuisine-collector.js report                             # Generate collection report');
    console.log('');
    console.log('Available cuisines:');
    console.log('  Tier 1:', Object.keys(TIER1_CUISINES).join(', '));
    console.log('  Tier 2:', Object.keys(TIER2_CUISINES).join(', '));
  }
}

main().catch(console.error);
