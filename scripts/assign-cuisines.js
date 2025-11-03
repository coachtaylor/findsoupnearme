// Detect and assign cuisines to all restaurants

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive cuisine detection patterns
const CUISINE_PATTERNS = {
  // Asian Cuisines
  Vietnamese: {
    keywords: ['vietnam', 'vietnamese', 'saigon', 'hanoi', 'pho', 'bánh mì', 'bun bo', 'banh mi', 'goi cuon', 'nha trang', 'hue'],
    namePatterns: [/\bpho\b/i, /phở/i, /saigon/i, /hanoi/i, /viet/i, /nam son/i, /madame vo/i],
    priority: 1
  },
  
  Japanese: {
    keywords: ['japan', 'japanese', 'ramen', 'sushi', 'izakaya', 'tokyo', 'kyoto', 'osaka', 'udon', 'soba', 'tempura', 'teriyaki', 'katsu', 'bento'],
    namePatterns: [/ramen/i, /sushi/i, /izakaya/i, /ippudo/i, /ichiran/i, /kajiken/i, /tonchin/i, /marugame/i, /okiboru/i, /tsukemen/i, /tonkotsu/i, /shoyu/i, /miso.*ramen/i],
    priority: 1
  },
  
  Chinese: {
    keywords: ['chinese', 'china', 'beijing', 'shanghai', 'szechuan', 'sichuan', 'hunan', 'canton', 'cantonese', 'mandarin', 'dim sum', 'wonton', 'peking'],
    namePatterns: [/wonton/i, /won.*ton/i, /wun.*tun/i, /dim.*sum/i, /szechuan/i, /sichuan/i, /dumpling/i, /chengdu/i, /chow.*mein/i, /hand.*drawn.*noodle/i, /pulled.*noodle/i],
    priority: 1
  },
  
  Thai: {
    keywords: ['thai', 'thailand', 'bangkok', 'siam', 'pad thai', 'tom yum', 'tom kha', 'curry'],
    namePatterns: [/\bthai\b/i, /bangkok/i, /siam/i, /pad.*thai/i, /tom.*yum/i, /tom.*kha/i],
    priority: 1
  },
  
  Korean: {
    keywords: ['korean', 'korea', 'seoul', 'kimchi', 'bulgogi', 'bibimbap', 'bbq'],
    namePatterns: [/\bkorean\b/i, /kimchi/i, /bulgogi/i, /bibimbap/i, /korean.*bbq/i, /sul.*lung.*tang/i, /kalguksu/i, /tofu.*house/i],
    priority: 1
  },
  
  // Western Cuisines
  American: {
    keywords: ['american', 'diner', 'grill', 'burger', 'steakhouse', 'bbq', 'comfort food', 'home style', 'classic'],
    namePatterns: [/diner/i, /grill/i, /burger/i, /steakhouse/i, /american/i, /tavern/i, /smokehouse/i],
    priority: 2
  },
  
  Italian: {
    keywords: ['italian', 'italy', 'pizza', 'pasta', 'trattoria', 'osteria', 'ristorante', 'pizzeria', 'romano', 'napoli'],
    namePatterns: [/\bitalian\b/i, /pizza/i, /pasta/i, /trattoria/i, /osteria/i, /ristorante/i, /pizzeria/i, /spaghetti/i],
    priority: 1
  },
  
  French: {
    keywords: ['french', 'france', 'bistro', 'brasserie', 'café', 'parisian', 'provence'],
    namePatterns: [/\bfrench\b/i, /bistro/i, /brasserie/i, /café.*français/i, /parisian/i],
    priority: 1
  },
  
  Mexican: {
    keywords: ['mexican', 'mexico', 'taco', 'burrito', 'quesadilla', 'enchilada', 'taqueria', 'cantina', 'salsa', 'tex-mex', 'tortilla'],
    namePatterns: [/\bmexican\b/i, /taco/i, /burrito/i, /taqueria/i, /cantina/i, /tortilla/i, /pozole/i, /menudo/i],
    priority: 1
  },
  
  // Other Cuisines
  Mediterranean: {
    keywords: ['mediterranean', 'greek', 'lebanese', 'turkish', 'falafel', 'hummus', 'gyro', 'kebab'],
    namePatterns: [/mediterranean/i, /greek/i, /gyro/i, /kebab/i, /falafel/i, /shawarma/i],
    priority: 2
  },
  
  Indian: {
    keywords: ['indian', 'india', 'curry', 'tandoori', 'biryani', 'masala', 'naan'],
    namePatterns: [/\bindian\b/i, /curry/i, /tandoori/i, /masala/i, /biryani/i],
    priority: 1
  },
  
  'Middle Eastern': {
    keywords: ['middle eastern', 'persian', 'lebanese', 'mediterranean', 'shawarma', 'kebab'],
    namePatterns: [/middle.*eastern/i, /persian/i, /lebanese/i, /shawarma/i],
    priority: 2
  },
  
  Jewish: {
    keywords: ['jewish', 'kosher', 'matzo', 'pastrami', 'knish'],
    namePatterns: [/jewish.*deli/i, /kosher/i, /matzo/i, /katz.*deli/i],
    priority: 1
  },
  
  Cajun: {
    keywords: ['cajun', 'creole', 'louisiana', 'gumbo', 'jambalaya', 'po boy', 'étouffée'],
    namePatterns: [/cajun/i, /creole/i, /louisiana/i, /gumbo/i, /jambalaya/i],
    priority: 1
  },
  
  // Catch-all categories
  'Asian Fusion': {
    keywords: ['asian fusion', 'pan asian', 'asian'],
    namePatterns: [/asian.*fusion/i, /pan.*asian/i],
    priority: 3
  },
  
  'Comfort Food': {
    keywords: ['comfort food', 'home cooking', 'homestyle'],
    namePatterns: [/comfort/i, /homestyle/i, /home.*cooking/i],
    priority: 3
  },
  
  'Cafe': {
    keywords: ['cafe', 'coffee shop', 'coffeehouse'],
    namePatterns: [/\bcafe\b/i, /\bcafé\b/i, /coffee.*shop/i],
    priority: 4
  }
};

/**
 * Detect cuisines for a restaurant
 */
function detectCuisines(restaurant) {
  const textToAnalyze = [
    restaurant.name || '',
    restaurant.description || '',
    restaurant.address || ''
  ].join(' ').toLowerCase();
  
  const nameLower = restaurant.name.toLowerCase();
  const detectedCuisines = new Map(); // Use map to track priority
  
  // Check each cuisine type
  for (const [cuisine, patterns] of Object.entries(CUISINE_PATTERNS)) {
    let matched = false;
    
    // Check name patterns first (highest confidence)
    for (const pattern of patterns.namePatterns) {
      if (pattern.test(nameLower)) {
        matched = true;
        break;
      }
    }
    
    // If no name match, check keywords in full text
    if (!matched) {
      for (const keyword of patterns.keywords) {
        if (textToAnalyze.includes(keyword.toLowerCase())) {
          matched = true;
          break;
        }
      }
    }
    
    if (matched) {
      detectedCuisines.set(cuisine, patterns.priority);
    }
  }
  
  // Sort by priority (lower number = higher priority)
  const sortedCuisines = Array.from(detectedCuisines.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([cuisine]) => cuisine);
  
  // If still no cuisines detected, apply smart fallbacks
  if (sortedCuisines.length === 0) {
    // Check for generic "noodle" restaurants
    if (/noodle/i.test(nameLower)) {
      return ['Chinese']; // Most generic noodle places are Chinese
    }
    
    // Check for generic restaurant indicators
    if (/restaurant|kitchen|eatery|house/i.test(nameLower)) {
      return ['American']; // Default to American
    }
    
    // Soup-focused places
    if (/soup|broth/i.test(nameLower)) {
      return ['American', 'Comfort Food'];
    }
    
    // Last resort
    return ['American'];
  }
  
  // Return top 2 cuisines max (avoid over-tagging)
  return sortedCuisines.slice(0, 2);
}

/**
 * Assign cuisines to all restaurants
 */
async function assignCuisines(dryRun = true) {
  console.log('=== ASSIGNING CUISINES TO RESTAURANTS ===\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);
  
  try {
    // Get all restaurants
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, description, address, city, state');
    
    if (error) throw error;
    
    console.log(`Processing ${restaurants.length} restaurants...\n`);
    
    const cuisineDistribution = {};
    let updatedCount = 0;
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      if (i > 0 && i % 50 === 0) {
        console.log(`Progress: ${i}/${restaurants.length}`);
      }
      
      // Detect cuisines
      const cuisines = detectCuisines(restaurant);
      
      console.log(`${restaurant.name}: ${cuisines.join(', ')}`);
      
      // Track distribution
      cuisines.forEach(cuisine => {
        cuisineDistribution[cuisine] = (cuisineDistribution[cuisine] || 0) + 1;
      });
      
      // Update database
      if (!dryRun) {
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ cuisines: cuisines })
          .eq('id', restaurant.id);
        
        if (updateError) {
          console.error(`  ❌ Error updating ${restaurant.name}:`, updateError.message);
        } else {
          updatedCount++;
        }
      }
    }
    
    console.log('\n=== SUMMARY ===\n');
    console.log(`Total restaurants processed: ${restaurants.length}`);
    console.log(`Restaurants updated: ${dryRun ? 'N/A (dry run)' : updatedCount}\n`);
    
    console.log('=== CUISINE DISTRIBUTION ===\n');
    Object.entries(cuisineDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cuisine, count]) => {
        console.log(`${cuisine}: ${count} restaurants`);
      });
    
    if (dryRun) {
      console.log('\n✓ This was a dry run. Run with --live flag to apply changes.');
    } else {
      console.log('\n✓ Cuisines have been assigned!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Main execution
const dryRun = !process.argv.includes('--live');

assignCuisines(dryRun).catch(console.error);