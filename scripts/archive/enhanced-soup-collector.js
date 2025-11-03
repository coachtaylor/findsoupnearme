// Enhanced Restaurant Data Collector with Comprehensive Soup Detection
// This script collects restaurant data from Google Maps API with accurate soup type identification

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import slugify from 'slugify';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Comprehensive Soup Type Database with Enhanced Detection
const COMPREHENSIVE_SOUP_DATABASE = {
  // TIER 1 - Critical Soup Types (Launch Immediately)
  tier1: {
    'Chicken Noodle': {
      keywords: ['chicken noodle', 'chicken soup', 'chicken and noodle'],
      cuisines: ['american', 'comfort'],
      priority: 1,
      description: '#1 most purchased soup in US'
    },
    'Broccoli Cheddar': {
      keywords: ['broccoli cheddar', 'broccoli cheese', 'cheddar broccoli'],
      cuisines: ['american'],
      priority: 1,
      description: 'Most searched soup recipe nationally'
    },
    'Pho': {
      keywords: ['pho', 'phở', 'vietnamese beef noodle', 'beef pho', 'chicken pho'],
      cuisines: ['vietnamese'],
      priority: 1,
      description: '50% of US noodle soup searches'
    },
    'Ramen': {
      keywords: ['ramen', 'tonkotsu', 'shoyu', 'miso ramen', 'shio', 'japanese noodle'],
      cuisines: ['japanese'],
      priority: 1,
      description: '46% of US noodle searches'
    },
    'Tomato': {
      keywords: ['tomato soup', 'tomato basil', 'cream of tomato'],
      cuisines: ['american', 'comfort'],
      priority: 1,
      description: 'Classic comfort food'
    },
    'Clam Chowder': {
      keywords: ['clam chowder', 'new england clam', 'manhattan clam', 'seafood chowder'],
      cuisines: ['american', 'seafood'],
      priority: 1,
      description: 'Popular in Boston/Northeast'
    },
    'Butternut Squash': {
      keywords: ['butternut squash', 'butternut soup', 'squash soup'],
      cuisines: ['american', 'seasonal'],
      priority: 1,
      description: 'Top trending fall soup'
    }
  },
  
  // TIER 2 - Important Soup Types (Months 6-12)
  tier2: {
    'French Onion': {
      keywords: ['french onion', 'onion soup', 'french onion soup'],
      cuisines: ['french'],
      priority: 2,
      description: 'Upscale soup, popular in major metros'
    },
    'Minestrone': {
      keywords: ['minestrone', 'italian vegetable soup'],
      cuisines: ['italian'],
      priority: 2,
      description: 'Italian vegetable soup'
    },
    'Cream of Mushroom': {
      keywords: ['cream of mushroom', 'mushroom cream', 'creamy mushroom'],
      cuisines: ['american'],
      priority: 2,
      description: 'Popular in TX, MN, WI'
    },
    'Cream of Chicken': {
      keywords: ['cream of chicken', 'chicken cream soup'],
      cuisines: ['american'],
      priority: 2,
      description: 'Popular in Southern/Midwestern states'
    },
    'Potato': {
      keywords: ['potato soup', 'baked potato soup', 'loaded potato'],
      cuisines: ['american', 'comfort'],
      priority: 2,
      description: 'Comfort food staple'
    },
    'Potato Leek': {
      keywords: ['potato leek', 'leek potato', 'vichyssoise'],
      cuisines: ['french', 'american'],
      priority: 2,
      description: 'Midwest/Northeast favorite'
    },
    'Tortilla': {
      keywords: ['tortilla soup', 'chicken tortilla', 'mexican tortilla soup'],
      cuisines: ['mexican'],
      priority: 2,
      description: 'Most searched soup in the South'
    },
    'Chili': {
      keywords: ['chili', 'texas chili', 'chili con carne', 'beef chili'],
      cuisines: ['american', 'tex-mex'],
      priority: 2,
      description: 'Texas specialty, game day food'
    },
    'Beef Stew': {
      keywords: ['beef stew', 'beef and vegetable stew', 'hearty stew'],
      cuisines: ['american', 'comfort'],
      priority: 2,
      description: 'Hearty winter meal'
    },
    'Matzo Ball': {
      keywords: ['matzo ball', 'matzah ball', 'jewish penicillin'],
      cuisines: ['jewish'],
      priority: 2,
      description: 'Very popular in NYC'
    }
  },
  
  // TIER 3 - Secondary Soup Types (Months 12-24)
  tier3: {
    'Chicken and Rice': {
      keywords: ['chicken and rice', 'chicken rice soup'],
      cuisines: ['american'],
      priority: 3,
      description: 'Comfort food classic'
    },
    'Italian Wedding': {
      keywords: ['italian wedding', 'wedding soup'],
      cuisines: ['italian'],
      priority: 3,
      description: 'Italian-American favorite'
    },
    'Wonton': {
      keywords: ['wonton', 'won ton', 'wun tun'],
      cuisines: ['chinese'],
      priority: 3,
      description: 'Chinese dumpling soup'
    },
    'Miso': {
      keywords: ['miso', 'miso shiru'],
      cuisines: ['japanese'],
      priority: 3,
      description: 'Japanese fermented soybean soup'
    },
    'Lobster Bisque': {
      keywords: ['lobster bisque', 'lobster soup', 'seafood bisque'],
      cuisines: ['french', 'seafood'],
      priority: 3,
      description: 'Upscale seafood soup'
    },
    'Gumbo': {
      keywords: ['gumbo', 'seafood gumbo', 'chicken gumbo'],
      cuisines: ['cajun', 'creole'],
      priority: 3,
      description: 'Louisiana specialty'
    },
    'Pozole': {
      keywords: ['pozole', 'posole'],
      cuisines: ['mexican'],
      priority: 3,
      description: 'Mexican hominy soup'
    },
    'Hot and Sour': {
      keywords: ['hot and sour', 'hot & sour', 'suan la tang'],
      cuisines: ['chinese'],
      priority: 3,
      description: 'Chinese spicy and tangy soup'
    },
    'Egg Drop': {
      keywords: ['egg drop', 'egg flower', 'egg drop soup'],
      cuisines: ['chinese'],
      priority: 3,
      description: 'Chinese egg-based soup'
    }
  },
  
  // Additional Asian Soups (Expansion)
  asian: {
    'Tom Yum': {
      keywords: ['tom yum', 'tom yam'],
      cuisines: ['thai'],
      priority: 3,
      description: 'Thai hot and sour soup'
    },
    'Tom Kha': {
      keywords: ['tom kha', 'tom ka'],
      cuisines: ['thai'],
      priority: 3,
      description: 'Thai coconut soup'
    },
    'Udon': {
      keywords: ['udon', 'udon soup'],
      cuisines: ['japanese'],
      priority: 3,
      description: 'Japanese thick noodle soup'
    },
    'Bun Bo Hue': {
      keywords: ['bun bo hue', 'bun bo'],
      cuisines: ['vietnamese'],
      priority: 3,
      description: 'Vietnamese spicy beef noodle soup'
    },
    'Kimchi': {
      keywords: ['kimchi jjigae', 'kimchi stew', 'kimchi soup'],
      cuisines: ['korean'],
      priority: 3,
      description: 'Korean fermented cabbage stew'
    }
  }
};

// Enhanced Cuisine Detection Patterns
const ENHANCED_CUISINE_INDICATORS = {
  american: ['american', 'diner', 'comfort food', 'home style', 'classic american'],
  vietnamese: ['vietnam', 'vietnamese', 'saigon', 'hanoi', 'pho', 'nha trang'],
  japanese: ['japanese', 'japan', 'ramen', 'izakaya', 'tokyo', 'ippudo', 'ichiran'],
  chinese: ['chinese', 'china', 'szechuan', 'cantonese', 'dim sum', 'wonton'],
  thai: ['thai', 'thailand', 'bangkok'],
  korean: ['korean', 'korea', 'seoul', 'kimchi'],
  mexican: ['mexican', 'mexico', 'taco', 'burrito'],
  italian: ['italian', 'italy', 'trattoria', 'osteria'],
  french: ['french', 'france', 'bistro', 'brasserie'],
  jewish: ['jewish', 'kosher', 'deli'],
  cajun: ['cajun', 'creole', 'louisiana'],
  comfort: ['comfort', 'homestyle', 'home cooking'],
  seafood: ['seafood', 'fish house', 'oyster bar'],
  'tex-mex': ['tex-mex', 'texmex', 'southwestern']
};

/**
 * Construct a unique slug for a restaurant.
 */
function buildRestaurantSlug(name, city, state, restaurantId) {
  const base = slugify(`${name} ${city} ${state}`, {
    lower: true,
    strict: true,
    trim: true
  });

  // Append a short ID fragment to avoid collisions on similar names.
  return `${base}-${restaurantId.slice(0, 8)}`;
}

/**
 * Extract a ZIP code from a formatted address string.
 */
function extractZipCode(formattedAddress) {
  if (!formattedAddress) return null;
  const match = formattedAddress.match(/\b\d{5}(?:-\d{4})?\b/);
  return match ? match[0] : null;
}

// Map Google Places types to cuisine identifiers
const CUISINE_TYPE_MAP = {
  vietnamese: ['vietnamese_restaurant'],
  japanese: ['japanese_restaurant', 'ramen_restaurant', 'sushi_restaurant'],
  thai: ['thai_restaurant'],
  chinese: ['chinese_restaurant'],
  korean: ['korean_restaurant'],
  mexican: ['mexican_restaurant'],
  italian: ['italian_restaurant'],
  french: ['french_restaurant'],
  american: ['american_restaurant'],
  cajun: ['cajun_restaurant'],
  seafood: ['seafood_restaurant'],
  comfort: ['comfort_food_restaurant'],
  jewish: ['jewish_restaurant'],
  asian: ['asian_restaurant', 'asian_fusion_restaurant']
};

// Heuristics based on restaurant names or descriptions
const CUISINE_NAME_HINTS = [
  { regex: /\bpho\b/i, cuisine: 'vietnamese' },
  { regex: /\bphở\b/i, cuisine: 'vietnamese' },
  { regex: /\bramen\b/i, cuisine: 'japanese' },
  { regex: /\budon\b/i, cuisine: 'japanese' },
  { regex: /\bsoba\b/i, cuisine: 'japanese' },
  { regex: /\bkimchi\b/i, cuisine: 'korean' },
  { regex: /\bbibimbap\b/i, cuisine: 'korean' },
  { regex: /\bbanh mi\b/i, cuisine: 'vietnamese' },
  { regex: /\bpad thai\b/i, cuisine: 'thai' },
  { regex: /\bnoodle\b/i, cuisine: 'asian' },
  { regex: /\bdumpling\b/i, cuisine: 'chinese' },
  { regex: /\bszechuan\b/i, cuisine: 'chinese' },
  { regex: /\bbuffalo\b/i, cuisine: 'american' },
  { regex: /\bbrasserie\b/i, cuisine: 'french' }
];

// Soup hints derived from the search query the result came from
const QUERY_SOUP_HINTS = [
  { regex: /\bpho\b/i, soups: ['Pho'], cuisine: 'vietnamese' },
  { regex: /\bphở\b/i, soups: ['Pho'], cuisine: 'vietnamese' },
  { regex: /\bramen\b/i, soups: ['Ramen'], cuisine: 'japanese' },
  { regex: /\btonkotsu\b/i, soups: ['Ramen'], cuisine: 'japanese' },
  { regex: /\bmiso\b/i, soups: ['Miso'], cuisine: 'japanese' },
  { regex: /\bhot and sour\b/i, soups: ['Hot and Sour'], cuisine: 'chinese' },
  { regex: /\bwonton\b/i, soups: ['Wonton'], cuisine: 'chinese' },
  { regex: /\btom yum\b/i, soups: ['Tom Yum'], cuisine: 'thai' },
  { regex: /\btom kha\b/i, soups: ['Tom Kha'], cuisine: 'thai' },
  { regex: /\btortilla\b/i, soups: ['Tortilla'], cuisine: 'mexican' },
  { regex: /\bclam chowder\b/i, soups: ['Clam Chowder'], cuisine: 'american' },
  { regex: /\bmatzo\b/i, soups: ['Matzo Ball'], cuisine: 'jewish' },
  { regex: /\bgumbo\b/i, soups: ['Gumbo'], cuisine: 'cajun' },
  { regex: /\blobster\b/i, soups: ['Lobster Bisque'], cuisine: 'seafood' }
];

// Search queries for different soup types
const SOUP_SEARCH_QUERIES = [
  // Tier 1 - High Priority
  'chicken noodle soup restaurant',
  'broccoli cheddar soup',
  'pho restaurant',
  'ramen restaurant',
  'tomato soup restaurant',
  'clam chowder restaurant',
  'butternut squash soup',
  
  // Tier 2 - Medium Priority
  'french onion soup restaurant',
  'minestrone soup',
  'potato soup restaurant',
  'tortilla soup mexican',
  'chili restaurant',
  'matzo ball soup deli',
  
  // General soup searches
  'soup restaurant',
  'soup and salad',
  'soup bar',
  'gourmet soup',
  'soup kitchen restaurant',
  
  // Asian soup focused
  'vietnamese noodle soup',
  'japanese ramen',
  'asian noodle soup',
  'chinese soup',
  'thai soup',
  
  // Comfort food
  'comfort food soup',
  'homemade soup restaurant'
];

// City targets with expansion
const CITY_TARGETS = {
  // Major metros - High priority
  'New York, NY': { min: 100, max: 150, state: 'NY', city: 'New York' },
  'Los Angeles, CA': { min: 80, max: 120, state: 'CA', city: 'Los Angeles' },
  'Chicago, IL': { min: 70, max: 100, state: 'IL', city: 'Chicago' },
  'Houston, TX': { min: 60, max: 90, state: 'TX', city: 'Houston' },
  'Phoenix, AZ': { min: 50, max: 80, state: 'AZ', city: 'Phoenix' },
  'Philadelphia, PA': { min: 50, max: 80, state: 'PA', city: 'Philadelphia' },
  'San Antonio, TX': { min: 40, max: 70, state: 'TX', city: 'San Antonio' },
  'San Diego, CA': { min: 50, max: 80, state: 'CA', city: 'San Diego' },
  'Dallas, TX': { min: 50, max: 80, state: 'TX', city: 'Dallas' },
  'San Francisco, CA': { min: 60, max: 90, state: 'CA', city: 'San Francisco' },
  
  // Secondary markets
  'Seattle, WA': { min: 50, max: 75, state: 'WA', city: 'Seattle' },
  'Boston, MA': { min: 50, max: 75, state: 'MA', city: 'Boston' },
  'Miami, FL': { min: 40, max: 70, state: 'FL', city: 'Miami' },
  'Denver, CO': { min: 40, max: 60, state: 'CO', city: 'Denver' },
  'Austin, TX': { min: 40, max: 60, state: 'TX', city: 'Austin' },
  'Portland, OR': { min: 150, max: 255, state: 'OR', city: 'Portland' },
  'Las Vegas, NV': { min: 35, max: 55, state: 'NV', city: 'Las Vegas' }
};

/**
 * Detect soup types from restaurant data using comprehensive detection
 */
function detectSoupTypes(restaurant, searchQuery = '') {
  const textToAnalyze = [
    restaurant.name || '',
    restaurant.types?.join(' ') || '',
    restaurant.description || '',
    restaurant.editorialSummary?.overview || '',
    searchQuery || ''
  ].join(' ').toLowerCase();
  
  const detectedSoups = new Set();
  let cuisineType = detectCuisine(restaurant, searchQuery);
  
  console.log(`Analyzing: ${restaurant.name}`);
  console.log(`Detected cuisine: ${cuisineType || 'Unknown'}`);
  
  // Search through all tiers
  for (const soups of Object.values(COMPREHENSIVE_SOUP_DATABASE)) {
    for (const [soupName, soupData] of Object.entries(soups)) {
      // Check if keywords match
      let keywordMatch = false;
      for (const keyword of soupData.keywords) {
        if (textToAnalyze.includes(keyword)) {
          keywordMatch = true;
          break;
        }
      }
      
      if (!keywordMatch) {
        continue;
      }
      
      const cuisineMatch = soupData.cuisines.includes(cuisineType) || 
                         soupData.cuisines.length === 0 ||
                         cuisineType === 'unknown';
      
      if (cuisineMatch) {
        if (!detectedSoups.has(soupName)) {
          console.log(`  ✓ Found: ${soupName} (${soupData.description})`);
        }
        detectedSoups.add(soupName);
      }
    }
  }
  
  if (searchQuery) {
    for (const hint of QUERY_SOUP_HINTS) {
      if (hint.regex.test(searchQuery)) {
        hint.soups.forEach(soupName => {
          if (!detectedSoups.has(soupName)) {
            console.log(`  ✓ Query hint: ${soupName}`);
          }
          detectedSoups.add(soupName);
        });
        if (cuisineType === 'unknown' && hint.cuisine) {
          cuisineType = hint.cuisine;
          console.log(`  ↳ Cuisine adjusted from query: ${cuisineType}`);
        }
      }
    }
  }
  
  // Apply smart defaults based on cuisine if no soups detected
  if (detectedSoups.size === 0) {
    const defaults = getDefaultSoupsForCuisine(cuisineType, restaurant.name, searchQuery);
    defaults.forEach(soup => {
      if (!detectedSoups.has(soup)) {
        console.log(`  ✓ Default: ${soup}`);
      }
      detectedSoups.add(soup);
    });
  }
  
  const result = Array.from(detectedSoups);
  console.log(`Total soups detected: ${result.length}`);
  console.log('');
  
  return result;
}

/**
 * Detect cuisine type from restaurant data
 */
function detectCuisine(restaurant, searchQuery = '') {
  const typesList = (restaurant.types || []).map(type => type.toLowerCase());
  
  for (const [cuisine, typeMatches] of Object.entries(CUISINE_TYPE_MAP)) {
    if (typesList.some(type => typeMatches.includes(type))) {
      return cuisine;
    }
  }
  
  const textToAnalyze = [
    restaurant.name || '',
    typesList.join(' '),
    restaurant.editorialSummary?.overview || '',
    searchQuery || ''
  ].join(' ').toLowerCase();
  
  for (const [cuisine, indicators] of Object.entries(ENHANCED_CUISINE_INDICATORS)) {
    if (indicators.some(indicator => textToAnalyze.includes(indicator))) {
      return cuisine;
    }
  }
  
  for (const hint of CUISINE_NAME_HINTS) {
    if (hint.regex.test(textToAnalyze)) {
      return hint.cuisine;
    }
  }
  
  if (searchQuery) {
    for (const hint of CUISINE_NAME_HINTS) {
      if (hint.regex.test(searchQuery)) {
        return hint.cuisine;
      }
    }
    if (/asian/i.test(searchQuery)) {
      return 'asian';
    }
  }
  
  return 'unknown';
}

/**
 * Get default soups for a cuisine type
 */
function getDefaultSoupsForCuisine(cuisine, restaurantName, searchQuery = '') {
  const nameLower = restaurantName.toLowerCase();
  const queryLower = (searchQuery || '').toLowerCase();
  
  const defaults = {
    vietnamese: ['Pho'],
    japanese: ['Ramen', 'Miso'],
    chinese: ['Wonton', 'Hot and Sour'],
    thai: ['Tom Yum', 'Tom Kha'],
    korean: ['Kimchi'],
    mexican: ['Tortilla', 'Pozole'],
    italian: ['Minestrone'],
    french: ['French Onion'],
    american: ['Chicken Noodle', 'Tomato'],
    comfort: ['Chicken Noodle', 'Tomato'],
    cajun: ['Gumbo'],
    seafood: ['Clam Chowder', 'Lobster Bisque'],
    jewish: ['Matzo Ball'],
    asian: ['Pho', 'Ramen'],
    unknown: []
  };
  
  if (/ramen/.test(nameLower) || /ramen/.test(queryLower)) return ['Ramen'];
  if (/pho|phở/.test(nameLower) || /pho/.test(queryLower)) return ['Pho'];
  if (/tom yum/.test(nameLower) || /tom yum/.test(queryLower)) return ['Tom Yum'];
  if (/tom kha/.test(nameLower) || /tom kha/.test(queryLower)) return ['Tom Kha'];
  if (/gumbo/.test(nameLower) || /gumbo/.test(queryLower)) return ['Gumbo'];
  if (/wonton/.test(nameLower) || /wonton/.test(queryLower)) return ['Wonton'];
  if (cuisine === 'asian' && (/noodle/.test(nameLower) || /noodle/.test(queryLower))) {
    return ['Pho'];
  }
  
  if (/soup|broth/i.test(nameLower)) {
    return defaults[cuisine] || ['House Special'];
  }
  
  return defaults[cuisine] || [];
}

/**
 * Search for restaurants using Google Places API
 */
async function searchRestaurants(query, location, cityInfo) {
  const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
  const url = `${endpoint}?query=${encodeURIComponent(query + ' ' + location)}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.results || [];
    } else {
      console.error(`API Error: ${data.status}`);
      return [];
    }
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return [];
  }
}

/**
 * Get detailed restaurant information
 */
async function getRestaurantDetails(placeId) {
  const endpoint = 'https://maps.googleapis.com/maps/api/place/details/json';
  const url = `${endpoint}?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,types,geometry,editorial_summary&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.result;
    } else {
      console.error(`Details API Error: ${data.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error getting restaurant details:', error);
    return null;
  }
}

/**
 * Process and store restaurant in database
 */
async function processRestaurant(placeResult, cityInfo, searchQuery = '') {
  try {
    // Check if restaurant already exists
    const { data: existing } = await supabase
      .from('restaurants')
      .select('id')
      .eq('name', placeResult.name)
      .eq('city', cityInfo.city)
      .eq('state', cityInfo.state)
      .single();
    
    if (existing) {
      console.log(`  ⏭️  Already exists: ${placeResult.name}`);
      return existing.id;
    }
    
    // Get detailed information
    const details = await getRestaurantDetails(placeResult.place_id);
    if (!details) return null;
    
    // Detect soup types
    const combinedTypes = Array.from(
      new Set([...(details.types || []), ...(placeResult.types || [])])
    );

    const soupTypes = detectSoupTypes({
      name: details.name,
      types: combinedTypes,
      description: details.editorial_summary?.overview,
      editorialSummary: details.editorial_summary
    }, searchQuery);
    
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
        description: details.editorial_summary?.overview || `A restaurant serving ${soupTypes.join(', ')}.`,
        price_range: '$'.repeat(placeResult.price_level || 2)
      });
    
    if (restError) throw restError;
    
    // Insert soups
    if (soupTypes.length > 0) {
      const soupsToInsert = soupTypes.map(soupType => ({
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
      
      if (soupError) throw soupError;
    }
    
    console.log(`✅ Added: ${details.name} with ${soupTypes.length} soup(s)`);
    return restaurantId;
    
  } catch (error) {
    console.error(`Error processing ${placeResult.name}:`, error);
    return null;
  }
}

/**
 * Collect restaurant data for a specific city
 */
async function collectRestaurantDataForCity(locationName, cityInfo) {
  console.log(`\n==== Processing ${locationName} ====`);
  
  // Check current count
  const { count: existingCount } = await supabase
    .from('restaurants')
    .select('id', { count: 'exact', head: true })
    .eq('city', cityInfo.city)
    .eq('state', cityInfo.state);
  
  console.log(`Current restaurants: ${existingCount}`);
  console.log(`Target: ${cityInfo.min}-${cityInfo.max}`);
  
  if (existingCount >= cityInfo.max) {
    console.log(`✅ Target already met!`);
    return;
  }
  
  const needed = cityInfo.min - existingCount;
  console.log(`Need to collect: ${needed} more restaurants\n`);
  
  let collected = 0;
  const processedPlaces = new Set();
  
  // Try different search queries
  for (const query of SOUP_SEARCH_QUERIES) {
    if (collected >= needed) break;
    
    console.log(`Searching: "${query}" in ${locationName}...`);
    
    const results = await searchRestaurants(query, locationName, cityInfo);
    
    for (const place of results) {
      if (collected >= needed) break;
      if (processedPlaces.has(place.place_id)) continue;
      
      processedPlaces.add(place.place_id);
      const restaurantId = await processRestaurant(place, cityInfo, query);
      
      if (restaurantId) {
        collected++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n✅ Collected ${collected} new restaurants for ${locationName}`);
}

/**
 * Collect data for all cities
 */
async function collectAllCities() {
  console.log('=== STARTING COMPREHENSIVE SOUP RESTAURANT COLLECTION ===\n');
  
  for (const [locationName, cityInfo] of Object.entries(CITY_TARGETS)) {
    await collectRestaurantDataForCity(locationName, cityInfo);
    
    // Delay between cities
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n=== COLLECTION COMPLETE ===');
}

/**
 * Generate data report
 */
async function generateReport() {
  console.log('\n=== DATA COLLECTION REPORT ===\n');
  
  const { count: totalRestaurants } = await supabase
    .from('restaurants')
    .select('id', { count: 'exact', head: true });
  
  const { count: totalSoups } = await supabase
    .from('soups')
    .select('id', { count: 'exact', head: true });
  
  console.log(`Total restaurants: ${totalRestaurants}`);
  console.log(`Total soups: ${totalSoups}`);
  console.log(`Average soups per restaurant: ${(totalSoups / totalRestaurants).toFixed(1)}`);
  
  // Soup type distribution
  const { data: soupTypes } = await supabase
    .from('soups')
    .select('soup_type');
  
  const distribution = {};
  soupTypes.forEach(s => {
    distribution[s.soup_type] = (distribution[s.soup_type] || 0) + 1;
  });
  
  console.log('\nSoup Type Distribution:');
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
}

// Main execution
const command = process.argv[2];

async function main() {
  if (command === 'collect') {
    await collectAllCities();
  } else if (command === 'collect-city') {
    const cityName = process.argv[3];
    if (!cityName || !CITY_TARGETS[cityName]) {
      console.log('Available cities:');
      Object.keys(CITY_TARGETS).forEach(city => console.log(`  - ${city}`));
      return;
    }
    await collectRestaurantDataForCity(cityName, CITY_TARGETS[cityName]);
  } else if (command === 'report') {
    await generateReport();
  } else {
    console.log('Usage:');
    console.log('  node enhanced-soup-collector.js collect              # Collect all cities');
    console.log('  node enhanced-soup-collector.js collect-city "City"  # Collect specific city');
    console.log('  node enhanced-soup-collector.js report               # Generate report');
  }
}

main().catch(console.error);
