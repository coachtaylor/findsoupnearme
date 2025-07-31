/**
 * Data Enrichment Script for Soup Restaurants
 * 
 * This script enhances the raw restaurant data with:
 * - Soup-specific tags and categorization
 * - Generated descriptions using Claude
 * - Normalized data formatting for database import
 * 
 * Usage:
 * node enrich-data.js --input=./data/raw/newyork_ny.json --output=./data/enriched/newyork_ny.json
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('input', {
    description: 'Input JSON file with raw restaurant data',
    type: 'string',
    demandOption: true
  })
  .option('output', {
    description: 'Output file path for enriched data',
    type: 'string',
    default: './data/enriched/restaurants.json'
  })
  .option('anthropic-key', {
    description: 'Anthropic API key for Claude (or use ANTHROPIC_API_KEY env var)',
    type: 'string'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Anthropic API configuration
const ANTHROPIC_API_KEY = argv.anthropicKey || process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('Error: Anthropic API key not found. Please set ANTHROPIC_API_KEY in your .env.local file or pass with --anthropic-key');
  process.exit(1);
}

// Comprehensive list of soup types for categorization
const SOUP_TYPES = [
  // Asian Soups
  'Ramen',
  'Pho',
  'Miso',
  'Wonton',
  'Hot and Sour',
  'Egg Drop',
  'Tom Yum',
  'Tom Kha',
  'Laksa',
  'Udon',
  'Soba',
  'Kimchi',
  'Congee',
  'Bun Bo Hue',
  'Curry Laksa',
  'Shoyu',
  'Tonkotsu',
  'Samgyetang',
  'Dashi',
  'Sukiyaki',
  
  // European Soups
  'French Onion',
  'Borscht',
  'Minestrone',
  'Gazpacho',
  'Vichyssoise',
  'Bouillabaisse',
  'Goulash',
  'Ribollita',
  'Caldo Verde',
  'Cullen Skink',
  'Cock-a-leekie',
  'Scotch Broth',
  'Stracciatella',
  'Zuppa Toscana',
  'Leek and Potato',
  'Mushroom',
  
  // American Soups
  'Chicken Noodle',
  'Clam Chowder',
  'Tomato',
  'Broccoli Cheddar',
  'Split Pea',
  'Corn Chowder',
  'Lobster Bisque',
  'Maryland Crab',
  'Brunswick Stew',
  'Gumbo',
  'Jambalaya',
  'Burgoo',
  'Cioppino',
  'Senate Bean',
  'Oyster Stew',
  'Buffalo Chicken',
  
  // Latin American Soups
  'Pozole',
  'Tortilla',
  'Menudo',
  'Caldo de Res',
  'Sancocho',
  'Ajiaco',
  'Locro',
  'Sopa de Lima',
  'Caldo de Pollo',
  'Sopa de Frijol',
  'Mole de Olla',
  'Chupe de Camarones',
  
  // Middle Eastern/Mediterranean Soups
  'Lentil',
  'Harira',
  'Avgolemono',
  'Fasolada',
  'Mercimek',
  'Shorba',
  'Tarhana',
  
  // Eastern European Soups
  'Matzo Ball',
  'Cabbage',
  'Pickle',
  'Rassolnik',
  'Ukha',
  'Zurek',
  'Kapusniak',
  
  // Specialty/Health-Focused Soups
  'Bone Broth',
  'Detox',
  'Superfood',
  'Ancient Grain',
  'Immune Boost',
  'Vegetable',
  'Vegan',
  'Gluten-Free',
  'Paleo',
  'Keto',
  
  // Cream-Based Soups
  'Bisque',
  'Cream of Mushroom',
  'Cream of Chicken',
  'Cream of Celery',
  'Potato Leek',
  'Chowder',
  'Beer Cheese',
  'Cauliflower',
  'Asparagus',
  
  // Fruit-Based Soups
  'Fruit',
  'Berry',
  'Cherry',
  'Apple',
  'Watermelon',
  
  // Seasonal Soups
  'Butternut Squash',
  'Pumpkin',
  'Sweet Potato',
  'Chestnut'
];

// Restaurant features to detect
const RESTAURANT_FEATURES = [
  {
    name: 'outdoor_seating',
    keywords: ['outdoor', 'patio', 'terrace', 'sidewalk', 'al fresco', 'garden'],
    defaultValue: false
  },
  {
    name: 'takeout',
    keywords: ['takeout', 'take out', 'take-out', 'to go', 'to-go'],
    defaultValue: true
  },
  {
    name: 'delivery',
    keywords: ['delivery', 'deliver', 'doordash', 'ubereats', 'grubhub', 'postmates'],
    defaultValue: false
  },
  {
    name: 'vegetarian_options',
    keywords: ['vegetarian', 'vegan', 'plant-based', 'meatless'],
    defaultValue: false
  },
  {
    name: 'gluten_free_options',
    keywords: ['gluten free', 'gluten-free', 'gf'],
    defaultValue: false
  },
  {
    name: 'full_bar',
    keywords: ['bar', 'cocktail', 'alcohol', 'beer', 'wine', 'drinks'],
    defaultValue: false
  },
  {
    name: 'wifi',
    keywords: ['wifi', 'wi-fi', 'internet', 'wireless'],
    defaultValue: false
  }
];

// Enhanced function to detect potential soup types
function detectSoupTypes(restaurant) {
  const soupTypes = new Set();
  const textToAnalyze = [
    restaurant.name || '',
    restaurant.positiveReview?.text || '',
    restaurant.negativeReview?.text || ''
  ].join(' ').toLowerCase();
  
  // Check for exact matches first
  SOUP_TYPES.forEach(type => {
    // Convert multi-word types to regex-safe format
    const safeType = type.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    const typePattern = new RegExp(`\\b${safeType.toLowerCase()}\\b`, 'i');
    if (typePattern.test(textToAnalyze)) {
      soupTypes.add(type);
    }
  });
  
  // Check for related terms that might indicate specialty soups
  const soupRelatedTerms = {
    'noodle': ['Ramen', 'Pho', 'Udon'],
    'vietnamese': ['Pho', 'Bun Bo Hue'],
    'japanese': ['Ramen', 'Miso', 'Udon', 'Tonkotsu'],
    'chinese': ['Wonton', 'Hot and Sour', 'Egg Drop'],
    'thai': ['Tom Yum', 'Tom Kha'],
    'korean': ['Kimchi', 'Samgyetang'],
    'italian': ['Minestrone', 'Ribollita', 'Stracciatella'],
    'french': ['French Onion', 'Bouillabaisse', 'Vichyssoise'],
    'russian': ['Borscht'],
    'mexican': ['Pozole', 'Tortilla', 'Menudo'],
    'seafood': ['Clam Chowder', 'Lobster Bisque', 'Cioppino'],
    'cajun': ['Gumbo', 'Jambalaya'],
    'jewish': ['Matzo Ball'],
    'middle eastern': ['Lentil', 'Harira']
  };
  
  Object.entries(soupRelatedTerms).forEach(([term, associatedSoups]) => {
    if (textToAnalyze.includes(term)) {
      associatedSoups.forEach(soup => soupTypes.add(soup));
    }
  });
  
  // If we still don't have any soup types but the place is likely a soup restaurant
  // (contains words like "soup", "broth", "bowl", etc.)
  if (soupTypes.size === 0 && 
     /\b(soup|broth|bowl|stew|chowder|bisque)\b/i.test(textToAnalyze)) {
    // Add a generic "House Special" type
    soupTypes.add('House Special');
  }
  
  return [...soupTypes];
}

// Detect restaurant features based on reviews and name
function detectFeatures(restaurant) {
  const features = {};
  const textToAnalyze = [
    restaurant.name || '',
    restaurant.positiveReview?.text || '',
    restaurant.negativeReview?.text || ''
  ].join(' ').toLowerCase();

  RESTAURANT_FEATURES.forEach(feature => {
    let hasFeature = false;
    
    // Check if any keywords are present in the text
    for (const keyword of feature.keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        hasFeature = true;
        break;
      }
    }
    
    features[feature.name] = hasFeature || feature.defaultValue;
  });
  
  return features;
}

// Generate a restaurant description using Claude
async function generateDescription(restaurant) {
  try {
    const soupTypesText = restaurant.detectedSoupTypes?.length > 0 
      ? `Known for: ${restaurant.detectedSoupTypes.join(', ')}` 
      : '';
    
    const prompt = `
    Please write a brief, engaging description (2-3 sentences) for a soup restaurant directory listing.
    
    Restaurant name: ${restaurant.name}
    Location: ${restaurant.city}, ${restaurant.state}
    Rating: ${restaurant.rating}/5 (${restaurant.totalRatings} reviews)
    ${restaurant.positiveReview ? `Positive review: ${restaurant.positiveReview.text}` : ''}
    ${soupTypesText}
    
    Focus on what makes this restaurant special for soup lovers. Do not make up specific menu items unless mentioned in the reviews. Keep it factual but appealing.
    `;
    
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error(`Error generating description for ${restaurant.name}:`, error.message);
    return `${restaurant.name} offers delicious soups in ${restaurant.city}, ${restaurant.state}.`;
  }
}

// Extract delivery options based on website and reviews
function detectDeliveryOptions(restaurant) {
  const textToAnalyze = [
    restaurant.website || '',
    restaurant.positiveReview?.text || '',
    restaurant.negativeReview?.text || ''
  ].join(' ').toLowerCase();
  
  const deliveryServices = [
    { name: 'UberEats', keywords: ['uber eats', 'ubereats'] },
    { name: 'DoorDash', keywords: ['doordash', 'door dash'] },
    { name: 'GrubHub', keywords: ['grubhub', 'grub hub'] },
    { name: 'Postmates', keywords: ['postmates'] },
    { name: 'Seamless', keywords: ['seamless'] },
    { name: 'ChowNow', keywords: ['chownow', 'chow now'] }
  ];
  
  const detectedServices = [];
  
  deliveryServices.forEach(service => {
    for (const keyword of service.keywords) {
      if (textToAnalyze.includes(keyword)) {
        detectedServices.push(service.name);
        break;
      }
    }
  });
  
  // If we find "delivery" but no specific service, assume they have their own
  if (detectedServices.length === 0 && /\bdelivery\b/i.test(textToAnalyze)) {
    detectedServices.push('In-house Delivery');
  }
  
  return detectedServices;
}

// Main enrichment function
async function enrichRestaurantData(restaurant) {
  console.log(`Enriching data for: ${restaurant.name}`);
  
  // Generate a unique slug for the restaurant
  const slug = slugify(`${restaurant.name}-${restaurant.city}-${restaurant.state}`, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
  
  // Detect soup types
  const detectedSoupTypes = detectSoupTypes(restaurant);
  console.log(`  Detected soup types: ${detectedSoupTypes.join(', ') || 'None'}`);
  
  // Detect features
  const features = detectFeatures(restaurant);
  console.log(`  Detected features: ${Object.entries(features)
    .filter(([_, value]) => value)
    .map(([key, _]) => key)
    .join(', ')}`);
  
  // Detect delivery options
  const deliveryOptions = detectDeliveryOptions(restaurant);
  console.log(`  Detected delivery options: ${deliveryOptions.join(', ') || 'None'}`);
  
  // Generate AI description
  restaurant.detectedSoupTypes = detectedSoupTypes;
  const description = await generateDescription(restaurant);
  console.log(`  Generated description: ${description}`);
  
  // Return enriched data
  return {
    ...restaurant,
    slug,
    detectedSoupTypes,
    features,
    deliveryOptions,
    generatedDescription: description,
    lastEnriched: new Date().toISOString()
  };
}

// Main function
async function main() {
  try {
    console.log(`Starting data enrichment process...`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(argv.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Read input data
    console.log(`Reading data from: ${argv.input}`);
    const rawData = JSON.parse(fs.readFileSync(argv.input, 'utf8'));
    
    console.log(`Found ${rawData.length} restaurants to enrich`);
    
    // Process each restaurant
    const enrichedData = [];
    for (const restaurant of rawData) {
      try {
        const enriched = await enrichRestaurantData(restaurant);
        enrichedData.push(enriched);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error enriching data for ${restaurant.name}:`, error);
      }
    }
    
    // Write output data
    console.log(`Writing enriched data to: ${argv.output}`);
    fs.writeFileSync(argv.output, JSON.stringify(enrichedData, null, 2));
    
    console.log(`Enrichment complete! Processed ${enrichedData.length} restaurants.`);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the main function
main();