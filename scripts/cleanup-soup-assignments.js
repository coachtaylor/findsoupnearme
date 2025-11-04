// Database Cleanup Script - Fix Soup Assignments
// This script re-analyzes restaurants and updates soup types with improved detection

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced soup types with cuisine associations
const SOUP_DATABASE = {
  // Asian Soups
  asian: {
    keywords: ['asian', 'oriental', 'noodle'],
    soups: [
      { name: 'Ramen', keywords: ['ramen', 'japanese noodle'], cuisines: ['japanese'] },
      { name: 'Pho', keywords: ['pho', 'phở', 'vietnamese noodle'], cuisines: ['vietnamese'] },
      { name: 'Miso', keywords: ['miso'], cuisines: ['japanese'] },
      { name: 'Wonton', keywords: ['wonton', 'won ton', 'wun tun'], cuisines: ['chinese'] },
      { name: 'Hot and Sour', keywords: ['hot and sour', 'hot & sour'], cuisines: ['chinese'] },
      { name: 'Egg Drop', keywords: ['egg drop', 'egg flower'], cuisines: ['chinese'] },
      { name: 'Tom Yum', keywords: ['tom yum', 'tom yam'], cuisines: ['thai'] },
      { name: 'Tom Kha', keywords: ['tom kha', 'tom ka'], cuisines: ['thai'] },
      { name: 'Udon', keywords: ['udon'], cuisines: ['japanese'] },
      { name: 'Bun Bo Hue', keywords: ['bun bo hue', 'bun bo'], cuisines: ['vietnamese'] },
      { name: 'Kimchi', keywords: ['kimchi jjigae', 'kimchi stew'], cuisines: ['korean'] },
    ]
  },
  
  // Western Soups
  western: {
    keywords: ['american', 'diner', 'cafe', 'comfort'],
    soups: [
      { name: 'Chicken Noodle', keywords: ['chicken noodle', 'chicken soup'], cuisines: ['american'] },
      { name: 'Tomato', keywords: ['tomato soup', 'tomato basil'], cuisines: ['american', 'italian'] },
      { name: 'Clam Chowder', keywords: ['clam chowder', 'new england'], cuisines: ['american'] },
      { name: 'French Onion', keywords: ['french onion', 'onion soup'], cuisines: ['french'] },
      { name: 'Minestrone', keywords: ['minestrone'], cuisines: ['italian'] },
      { name: 'Broccoli Cheddar', keywords: ['broccoli cheddar', 'broccoli cheese'], cuisines: ['american'] },
      { name: 'Pozole', keywords: ['pozole'], cuisines: ['mexican'] },
      { name: 'Menudo', keywords: ['menudo'], cuisines: ['mexican'] },
      { name: 'Chicken Tortilla', keywords: ['chicken tortilla', 'tortilla soup'], cuisines: ['mexican'] },
      { name: 'Lobster Bisque', keywords: ['lobster bisque', 'lobster soup'], cuisines: ['american', 'french'] },
    ]
  },
  
  // Mediterranean/Middle Eastern
  mediterranean: {
    keywords: ['mediterranean', 'middle eastern', 'greek', 'turkish'],
    soups: [
      { name: 'Lentil', keywords: ['lentil soup', 'lentil'], cuisines: ['mediterranean', 'middle_eastern'] },
      { name: 'Avgolemono', keywords: ['avgolemono', 'egg lemon'], cuisines: ['greek'] },
      { name: 'Harira', keywords: ['harira'], cuisines: ['moroccan'] },
    ]
  },
  
  // Jewish/Deli
  jewish: {
    keywords: ['jewish deli', 'kosher deli', 'jewish cuisine'],
    soups: [
      { name: 'Matzo Ball', keywords: ['matzo ball', 'matzah ball', 'matzo'], cuisines: ['jewish'] },
      { name: 'Chicken Soup', keywords: ['chicken soup', 'jewish penicillin'], cuisines: ['jewish'] },
    ]
  },
  
  // Generic/Multi-cuisine
  generic: {
    keywords: ['soup', 'bowl', 'broth'],
    soups: [
      { name: 'Vegetable', keywords: ['vegetable soup', 'veggie soup'], cuisines: [] },
      { name: 'House Special', keywords: ['house soup', 'specialty soup', 'signature soup'], cuisines: [] },
    ]
  }
};

// Cuisine indicators in restaurant names/descriptions
const CUISINE_INDICATORS = {
  vietnamese: ['vietnam', 'vietnamese', 'saigon', 'hanoi', 'nha trang', 'ngon', 'bánh mì', 'bún bò'],
  japanese: ['japanese', 'japan', 'izakaya', 'tokyo', 'kyoto', 'osaka', 'sapporo'],
  chinese: ['chinese', 'china', 'beijing', 'shanghai', 'szechuan', 'sichuan', 'canton', 'cantonese', 'hunan', 'dim sum', 'nom wah'],
  thai: ['thai', 'thailand', 'bangkok', 'siam'],
  korean: ['korean', 'korea', 'seoul', 'kimchi jjigae', 'bulgogi'],
  italian: ['italian', 'italy', 'trattoria', 'osteria', 'ristorante', 'pizzeria'],
  french: ['french', 'france', 'bistro français', 'brasserie française'],
  mexican: ['mexican', 'mexico', 'taqueria', 'cantina mexicana'],
  american: ['american diner', 'steakhouse', 'burger bar', 'american grill'],
  jewish: ['jewish deli', 'kosher restaurant', 'jewish cuisine', 'kosher deli'],
  greek: ['greek taverna', 'greek restaurant', 'hellenic'],
  mediterranean: ['mediterranean cuisine', 'mediterranean restaurant'],
  middle_eastern: ['middle eastern', 'lebanese restaurant', 'persian cuisine']
};

/**
 * Detect the primary cuisine type of a restaurant
 */
function detectCuisineType(restaurant) {
  const textToAnalyze = [
    restaurant.name || '',
    restaurant.description || ''
  ].join(' ').toLowerCase();
  
  const detectedCuisines = [];
  const nameLower = restaurant.name.toLowerCase();
  
  // First pass: Check explicit cuisine indicators in full text
  for (const [cuisine, indicators] of Object.entries(CUISINE_INDICATORS)) {
    for (const indicator of indicators) {
      if (textToAnalyze.includes(indicator.toLowerCase())) {
        detectedCuisines.push(cuisine);
        break;
      }
    }
  }
  
  // Second pass: Strong name-based indicators (EXPANDED)
  if (/\bpho\b|phở/.test(nameLower) && !detectedCuisines.includes('vietnamese')) {
    detectedCuisines.push('vietnamese');
  }
  if (/ramen|tonkotsu|shoyu|miso.*ramen|ippudo|ichiran|kajiken|tonchin/.test(nameLower) && !detectedCuisines.includes('japanese')) {
    detectedCuisines.push('japanese');
  }
  if (/wonton|won.*ton|wun.*tun|dumpling.*house|dim.*sum/.test(nameLower) && !detectedCuisines.includes('chinese')) {
    detectedCuisines.push('chinese');
  }
  if (/\budon\b|soba/.test(nameLower) && !detectedCuisines.includes('japanese')) {
    detectedCuisines.push('japanese');
  }
  if (/tom yum|tom kha|pad thai/.test(nameLower) && !detectedCuisines.includes('thai')) {
    detectedCuisines.push('thai');
  }
  if (/kimchi|bulgogi|korean bbq|sul.*lung.*tang|kalguksu/.test(nameLower) && !detectedCuisines.includes('korean')) {
    detectedCuisines.push('korean');
  }
  
  // Third pass: Infer from common Asian restaurant name patterns
  if (detectedCuisines.length === 0) {
    // Vietnamese patterns
    if (/banh mi|bun bo|goi cuon|^nam |^nha |^sapa|^madame vo|^tú lan|^tâm tâm/.test(nameLower)) {
      detectedCuisines.push('vietnamese');
    }
    // Japanese patterns
    if (/marugame|okiboru|tsukemen|katsu|teriyaki|bento|taishoken/.test(nameLower)) {
      detectedCuisines.push('japanese');
    }
    // Chinese patterns
    if (/szechuan|sichuan|hunan|canton|peking|beijing|shanghai|hand.*drawn.*noodle|pulled.*noodle|chengdu|chow.*mein/.test(nameLower)) {
      detectedCuisines.push('chinese');
    }
    // Korean patterns
    if (/bibimbap|tofu.*house|korean.*bbq/.test(nameLower)) {
      detectedCuisines.push('korean');
    }
    // Thai patterns
    if (/pad.*thai|curry/.test(nameLower)) {
      detectedCuisines.push('thai');
    }
  }
  
  // Fourth pass: Generic "noodle" restaurants - infer Chinese as default
  if (detectedCuisines.length === 0 && /noodle/i.test(nameLower)) {
    // Look for Asian noodle indicators - default to Chinese
    if (/house|village|bar|shop|kitchen|express|fresh|tasty|king|queen|papa|mike|julie|maxi|min/.test(nameLower)) {
      detectedCuisines.push('chinese');
    }
  }
  
  return detectedCuisines;
}

/**
 * Enhanced soup type detection with cuisine-aware logic
 */
function detectSoupTypesEnhanced(restaurant) {
  const textToAnalyze = [
    restaurant.name || '',
    restaurant.description || '',
    restaurant.positiveReview?.text || '',
    restaurant.negativeReview?.text || ''
  ].join(' ').toLowerCase();
  
  const detectedSoups = new Set();
  const cuisines = detectCuisineType(restaurant);
  
  console.log(`Detecting soups for: ${restaurant.name}`);
  console.log(`Detected cuisines: ${cuisines.join(', ') || 'None'}`);
  
  // Define cuisine families for smart matching
  const asianCuisines = ['vietnamese', 'japanese', 'chinese', 'thai', 'korean'];
  const westernCuisines = ['american', 'french', 'italian'];
  const isAsianRestaurant = cuisines.some(c => asianCuisines.includes(c));
  const isWesternRestaurant = cuisines.some(c => westernCuisines.includes(c));
  
  // Strategy 1: Direct keyword matching WITH cuisine filtering
  for (const category of Object.values(SOUP_DATABASE)) {
    for (const soupDef of category.soups) {
      // Check for keyword match first
      let keywordMatch = false;
      for (const keyword of soupDef.keywords) {
        if (textToAnalyze.includes(keyword.toLowerCase())) {
          keywordMatch = true;
          break;
        }
      }
      
      if (keywordMatch) {
        // Now check cuisine compatibility
        let allowSoup = true;
        
        if (soupDef.cuisines.length > 0) {
          // Soup has specific cuisine requirements
          if (cuisines.length > 0) {
            // Restaurant has detected cuisines - must match
            const cuisineMatch = soupDef.cuisines.some(c => cuisines.includes(c));
            
            // Block cross-cultural contamination
            const soupIsAsian = soupDef.cuisines.some(c => asianCuisines.includes(c));
            const soupIsWestern = soupDef.cuisines.some(c => westernCuisines.includes(c));
            
            if (soupIsAsian && isWesternRestaurant && !cuisineMatch) {
              allowSoup = false;
            }
            if (soupIsWestern && isAsianRestaurant && !cuisineMatch) {
              allowSoup = false;
            }
            if (!cuisineMatch && !textToAnalyze.includes('fusion')) {
              allowSoup = false;
            }
          }
          // If restaurant has no detected cuisines, allow the soup (benefit of doubt)
        }
        
        if (allowSoup) {
          detectedSoups.add(soupDef.name);
          console.log(`  ✓ Found: ${soupDef.name} (keyword match, cuisine compatible)`);
        } else {
          console.log(`  ✗ Blocked: ${soupDef.name} (keyword match, but cuisine mismatch)`);
        }
      }
    }
  }
  
  // Strategy 1.5: Cuisine-based defaults when no keywords found
  if (detectedSoups.size === 0 && cuisines.length > 0) {
    console.log('  No soup keywords found, using cuisine-based defaults...');
    
    if (cuisines.includes('vietnamese')) {
      detectedSoups.add('Pho');
      console.log(`  ✓ Default Vietnamese: Pho`);
    }
    if (cuisines.includes('japanese')) {
      detectedSoups.add('Ramen');
      detectedSoups.add('Miso');
      console.log(`  ✓ Default Japanese: Ramen, Miso`);
    }
    if (cuisines.includes('chinese')) {
      detectedSoups.add('Wonton');
      detectedSoups.add('Hot and Sour');
      console.log(`  ✓ Default Chinese: Wonton, Hot and Sour`);
    }
    if (cuisines.includes('thai')) {
      detectedSoups.add('Tom Yum');
      console.log(`  ✓ Default Thai: Tom Yum`);
    }
    if (cuisines.includes('korean')) {
      detectedSoups.add('Kimchi');
      console.log(`  ✓ Default Korean: Kimchi Jjigae`);
    }
  }
  
  // Strategy 2: Smart fallbacks based on restaurant name patterns
  if (detectedSoups.size === 0) {
    const nameLower = restaurant.name.toLowerCase();
    
    // PHO restaurants
    if (/\bpho\b/i.test(nameLower)) {
      detectedSoups.add('Pho');
      console.log(`  ✓ Name-based: Pho`);
    }
    
    // RAMEN restaurants
    if (/ramen|tonkotsu|shoyu|miso ramen/i.test(nameLower)) {
      detectedSoups.add('Ramen');
      if (/miso/i.test(nameLower)) detectedSoups.add('Miso');
      console.log(`  ✓ Name-based: Ramen`);
    }
    
    // WONTON/Chinese soup
    if (/wonton|won ton/i.test(nameLower) || (cuisines.includes('chinese') && /noodle/i.test(nameLower))) {
      detectedSoups.add('Wonton');
      console.log(`  ✓ Name-based: Wonton`);
    }
    
    // UDON restaurants
    if (/udon/i.test(nameLower)) {
      detectedSoups.add('Udon');
      console.log(`  ✓ Name-based: Udon`);
    }
  }
  
  // Strategy 3: Cuisine-based defaults for "soup" restaurants
  if (detectedSoups.size === 0) {
    const nameLower = restaurant.name.toLowerCase();
    
    if (/\b(soup|broth|bowl)\b/i.test(nameLower)) {
      if (cuisines.includes('vietnamese')) {
        detectedSoups.add('Pho');
        console.log(`  ✓ Soup restaurant default Vietnamese: Pho`);
      } else if (cuisines.includes('japanese')) {
        detectedSoups.add('Ramen');
        detectedSoups.add('Miso');
        console.log(`  ✓ Soup restaurant default Japanese: Ramen, Miso`);
      } else if (cuisines.includes('chinese')) {
        detectedSoups.add('Wonton');
        detectedSoups.add('Hot and Sour');
        console.log(`  ✓ Soup restaurant default Chinese: Wonton, Hot and Sour`);
      } else if (cuisines.includes('thai')) {
        detectedSoups.add('Tom Yum');
        console.log(`  ✓ Soup restaurant default Thai: Tom Yum`);
      } else if (cuisines.includes('american')) {
        detectedSoups.add('Chicken Noodle');
        detectedSoups.add('Tomato');
        console.log(`  ✓ Soup restaurant default American: Chicken Noodle, Tomato`);
      } else if (cuisines.includes('italian')) {
        detectedSoups.add('Minestrone');
        console.log(`  ✓ Soup restaurant default Italian: Minestrone`);
      } else {
        detectedSoups.add('House Special');
        console.log(`  ✓ Soup restaurant default Generic: House Special`);
      }
    }
  }
  
  // Strategy 4: Final fallback - if still nothing but it&apos;s clearly a soup restaurant
  if (detectedSoups.size === 0) {
    const nameLower = restaurant.name.toLowerCase();
    
    // If it has "soup" in the name, give it popular American soups
    if (/soup/i.test(nameLower)) {
      detectedSoups.add('Chicken Noodle');
      detectedSoups.add('Tomato');
      console.log(`  ✓ Soup restaurant fallback: Chicken Noodle, Tomato`);
    }
    // If it has "noodle" in the name, default to Chinese soups
    else if (/noodle/i.test(nameLower)) {
      detectedSoups.add('Wonton');
      detectedSoups.add('Hot and Sour');
      console.log(`  ✓ Noodle restaurant fallback: Wonton, Hot and Sour`);
    }
    // If it has "bowl" or "broth" in name, give it House Special
    else if (/bowl|broth/i.test(nameLower)) {
      detectedSoups.add('House Special');
      console.log(`  ✓ Bowl/Broth restaurant fallback: House Special`);
    }
  }
  
  const result = Array.from(detectedSoups);
  console.log(`Final result: ${result.length} soup(s) - ${result.join(', ')}`);
  console.log('');
  
  return result;
}

/**
 * Validate if detected soups make sense for the restaurant
 */
function validateSoupAssignments(restaurant, detectedSoups) {
  const cuisines = detectCuisineType(restaurant);
  const warnings = [];
  
  // Check for cuisine mismatches
  const asianSoups = ['Ramen', 'Pho', 'Miso', 'Wonton', 'Udon', 'Tom Yum'];
  const westernSoups = ['Chicken Noodle', 'Tomato', 'Clam Chowder', 'French Onion'];
  
  const hasAsianSoup = detectedSoups.some(s => asianSoups.includes(s));
  const hasWesternSoup = detectedSoups.some(s => westernSoups.includes(s));
  
  const isAsianRestaurant = cuisines.some(c => 
    ['vietnamese', 'japanese', 'chinese', 'thai', 'korean'].includes(c)
  );
  const isWesternRestaurant = cuisines.some(c => 
    ['american', 'french', 'italian'].includes(c)
  );
  
  if (hasAsianSoup && isWesternRestaurant) {
    warnings.push(`Asian soup(s) assigned to Western restaurant`);
  }
  
  if (hasWesternSoup && isAsianRestaurant) {
    warnings.push(`Western soup(s) assigned to Asian restaurant`);
  }
  
  if (hasAsianSoup && hasWesternSoup && !restaurant.name.toLowerCase().includes('fusion')) {
    warnings.push(`Mixed Asian and Western soups without fusion indicator`);
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Analyze and report on current soup assignments
 */
async function analyzeCurrentAssignments() {
  console.log('=== ANALYZING CURRENT SOUP ASSIGNMENTS ===\n');
  
  try {
    // Get all restaurants with their soups
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restError) throw restError;
    
    console.log(`Found ${restaurants.length} restaurants\n`);
    
    const issues = [];
    let totalSoups = 0;
    
    for (const restaurant of restaurants) {
      const { data: soups, error: soupError } = await supabase
        .from('soups')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (soupError) continue;
      
      totalSoups += soups.length;
      
      // Validate current assignments
      const soupTypes = soups.map(s => s.soup_type);
      const validation = validateSoupAssignments(restaurant, soupTypes);
      
      if (!validation.isValid) {
        issues.push({
          restaurant: restaurant.name,
          city: restaurant.city,
          state: restaurant.state,
          currentSoups: soupTypes,
          warnings: validation.warnings
        });
      }
    }
    
    console.log(`Total soups in database: ${totalSoups}`);
    console.log(`Restaurants with potential issues: ${issues.length}\n`);
    
    if (issues.length > 0) {
      console.log('DETECTED ISSUES:\n');
      issues.slice(0, 20).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.restaurant} (${issue.city}, ${issue.state})`);
        console.log(`   Current soups: ${issue.currentSoups.join(', ')}`);
        console.log(`   Warnings: ${issue.warnings.join('; ')}`);
        console.log('');
      });
      
      if (issues.length > 20) {
        console.log(`... and ${issues.length - 20} more issues\n`);
      }
    }
    
    return issues;
  } catch (error) {
    console.error('Error analyzing assignments:', error);
    return [];
  }
}

/**
 * Fix soup assignments for a single restaurant
 */
async function fixRestaurantSoups(restaurant, dryRun = true) {
  try {
    // Get current soups
    const { data: currentSoups, error: fetchError } = await supabase
      .from('soups')
      .select('*')
      .eq('restaurant_id', restaurant.id);
    
    if (fetchError) throw fetchError;
    
    // Detect improved soup types
    const newSoupTypes = detectSoupTypesEnhanced(restaurant);
    
    // Compare with current
    const currentTypes = currentSoups.map(s => s.soup_type);
    const hasChanged = JSON.stringify(currentTypes.sort()) !== JSON.stringify(newSoupTypes.sort());
    
    if (hasChanged) {
      console.log(`\n📝 ${restaurant.name} (${restaurant.city}, ${restaurant.state})`);
      console.log(`   OLD: ${currentTypes.join(', ') || 'None'}`);
      console.log(`   NEW: ${newSoupTypes.join(', ') || 'None'}`);
      
      if (!dryRun) {
        // Delete old soups
        const { error: deleteError } = await supabase
          .from('soups')
          .delete()
          .eq('restaurant_id', restaurant.id);
        
        if (deleteError) throw deleteError;
        
        // Insert new soups
        if (newSoupTypes.length > 0) {
          const soupsToInsert = newSoupTypes.map(soupType => ({
            id: uuidv4(),
            restaurant_id: restaurant.id,
            name: soupType,
            description: `A delicious ${soupType.toLowerCase()}.`,
            price: 8 + Math.floor(Math.random() * 7), // $8-$14
            soup_type: soupType,
            dietary_info: [],
            is_seasonal: false,
            available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          }));
          
          const { error: insertError } = await supabase
            .from('soups')
            .insert(soupsToInsert);
          
          if (insertError) throw insertError;
          
          console.log(`   ✅ Updated successfully`);
        }
      } else {
        console.log(`   [DRY RUN - No changes made]`);
      }
      
      return { changed: true, restaurant: restaurant.name };
    }
    
    return { changed: false };
  } catch (error) {
    console.error(`Error fixing soups for ${restaurant.name}:`, error);
    return { changed: false, error: error.message };
  }
}

/**
 * Fix all restaurants in the database
 */
async function fixAllRestaurants(dryRun = true) {
  console.log('\n=== FIXING SOUP ASSIGNMENTS ===\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);
  
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) throw error;
    
    console.log(`Processing ${restaurants.length} restaurants...\n`);
    
    let changedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < restaurants.length; i++) {
      if (i > 0 && i % 10 === 0) {
        console.log(`Progress: ${i}/${restaurants.length}`);
      }
      
      const result = await fixRestaurantSoups(restaurants[i], dryRun);
      
      if (result.changed) {
        changedCount++;
      }
      if (result.error) {
        errorCount++;
      }
    }
    
    console.log('\n=== SUMMARY ===\n');
    console.log(`Total restaurants processed: ${restaurants.length}`);
    console.log(`Restaurants with changes: ${changedCount}`);
    console.log(`Errors encountered: ${errorCount}\n`);
    
    if (dryRun) {
      console.log('✓ This was a dry run. Run with --live flag to apply changes.');
    } else {
      console.log('✓ Database has been updated!');
    }
  } catch (error) {
    console.error('Error in fixAllRestaurants:', error);
  }
}

/**
 * Fix a specific restaurant by name
 */
async function fixSpecificRestaurant(restaurantName, dryRun = true) {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .ilike('name', `%${restaurantName}%`);
    
    if (error) throw error;
    
    if (restaurants.length === 0) {
      console.log(`No restaurants found matching "${restaurantName}"`);
      return;
    }
    
    if (restaurants.length > 1) {
      console.log(`Found ${restaurants.length} restaurants matching "${restaurantName}":`);
      restaurants.forEach(r => {
        console.log(`  - ${r.name} (${r.city}, ${r.state})`);
      });
      console.log('\nPlease be more specific.');
      return;
    }
    
    const restaurant = restaurants[0];
    await fixRestaurantSoups(restaurant, dryRun);
    
    if (!dryRun) {
      console.log('\n✓ Restaurant updated successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Main execution
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

const dryRun = !process.argv.includes('--live');

async function main() {
  if (command === 'analyze') {
    await analyzeCurrentAssignments();
  } else if (command === 'fix-all') {
    await fixAllRestaurants(dryRun);
  } else if (command === 'fix-restaurant' && arg1) {
    await fixSpecificRestaurant(arg1, dryRun);
  } else {
    console.log('Usage:');
    console.log('  node cleanup-soup-assignments.js analyze');
    console.log('  node cleanup-soup-assignments.js fix-all [--live]');
    console.log('  node cleanup-soup-assignments.js fix-restaurant "Restaurant Name" [--live]');
    console.log('');
    console.log('Options:');
    console.log('  --live    Actually modify the database (default is dry run)');
    console.log('');
    console.log('Examples:');
    console.log('  node cleanup-soup-assignments.js analyze');
    console.log('  node cleanup-soup-assignments.js fix-restaurant "The Soup Bowl" --live');
    console.log('  node cleanup-soup-assignments.js fix-all --live');
  }
}

main().catch(console.error);