// Improved Soup Type Detection System
// This module provides enhanced logic for detecting soup types from restaurant data

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
  
  // Strategy 4: Aggressive fallback - assign soups even to generic restaurant names
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
    // If it has "bowl" or "broth" in name
    else if (/bowl|broth/i.test(nameLower)) {
      detectedSoups.add('House Special');
      console.log(`  ✓ Bowl/Broth restaurant fallback: House Special`);
    }
    // Aggressive fallback: Most restaurants likely have soup
    else if (/cafe|diner|bistro|kitchen|grill|tavern|bar|eatery/i.test(nameLower)) {
      // Generic restaurant - assume it has common American soups
      detectedSoups.add('Chicken Noodle');
      detectedSoups.add('Tomato');
      console.log(`  ✓ Generic restaurant fallback: Chicken Noodle, Tomato`);
    }
    else {
      // Last resort - any restaurant in the database probably serves at least one soup
      detectedSoups.add('House Special');
      console.log(`  ✓ Ultimate fallback: House Special`);
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

// Export functions
export {
  detectSoupTypesEnhanced,
  detectCuisineType,
  validateSoupAssignments,
  SOUP_DATABASE,
  CUISINE_INDICATORS
};