// Improved Soup Type Detection System
// This module provides enhanced logic for detecting soup types from restaurant data

// Enhanced soup types with cuisine associations
const SOUP_DATABASE = {
    // Asian Soups
    asian: {
      keywords: ['asian', 'oriental', 'noodle'],
      soups: [
        { name: 'Ramen', keywords: ['ramen', 'japanese noodle'], cuisines: ['japanese'] },
        { name: 'Pho', keywords: ['pho', 'vietnamese noodle'], cuisines: ['vietnamese'] },
        { name: 'Miso', keywords: ['miso'], cuisines: ['japanese'] },
        { name: 'Wonton', keywords: ['wonton', 'won ton'], cuisines: ['chinese'] },
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
        { name: 'Chicken Tortilla', keywords: ['chicken tortilla', 'tortilla soup'], cuisines: ['mexican'] },
        { name: 'Lobster Bisque', keywords: ['lobster bisque', 'lobster soup'], cuisines: ['american', 'french'] },
      ]
    },
    
    // Mediterranean/Middle Eastern
    mediterranean: {
      keywords: ['mediterranean', 'middle eastern', 'greek', 'turkish'],
      soups: [
        { name: 'Lentil', keywords: ['lentil soup', 'lentil'], cuisines: ['mediterranean', 'middle eastern'] },
        { name: 'Avgolemono', keywords: ['avgolemono', 'egg lemon'], cuisines: ['greek'] },
        { name: 'Harira', keywords: ['harira'], cuisines: ['moroccan'] },
      ]
    },
    
    // Jewish/Deli
    jewish: {
      keywords: ['deli', 'jewish', 'kosher'],
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
    vietnamese: ['viet', 'saigon', 'hanoi', 'pho'],
    japanese: ['japan', 'sushi', 'ramen', 'tokyo', 'kyoto'],
    chinese: ['china', 'chinese', 'beijing', 'shanghai', 'szechuan', 'canton'],
    thai: ['thai', 'bangkok', 'siam'],
    korean: ['korea', 'seoul'],
    italian: ['italian', 'pizza', 'pasta', 'trattoria', 'osteria'],
    french: ['french', 'bistro', 'brasserie', 'cafe'],
    mexican: ['mexican', 'taco', 'burrito', 'cantina'],
    american: ['american', 'diner', 'grill', 'tavern'],
    jewish: ['deli', 'jewish', 'kosher', 'bagel'],
    greek: ['greek', 'gyro', 'taverna'],
    mediterranean: ['mediterranean', 'med'],
    middle_eastern: ['middle eastern', 'lebanese', 'persian']
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
    
    for (const [cuisine, indicators] of Object.entries(CUISINE_INDICATORS)) {
      for (const indicator of indicators) {
        if (textToAnalyze.includes(indicator.toLowerCase())) {
          detectedCuisines.push(cuisine);
          break;
        }
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
    
    // Strategy 1: Cuisine-specific detection
    if (cuisines.length > 0) {
      for (const category of Object.values(SOUP_DATABASE)) {
        for (const soupDef of category.soups) {
          // Check if this soup matches the restaurant's cuisine
          const cuisineMatch = soupDef.cuisines.length === 0 || 
                              soupDef.cuisines.some(c => cuisines.includes(c));
          
          if (cuisineMatch) {
            // Check if soup keywords are in the text
            for (const keyword of soupDef.keywords) {
              if (textToAnalyze.includes(keyword.toLowerCase())) {
                detectedSoups.add(soupDef.name);
                console.log(`  ✓ Found: ${soupDef.name} (keyword: "${keyword}")`);
                break;
              }
            }
          }
        }
      }
    }
    
    // Strategy 2: Fallback based on restaurant name
    if (detectedSoups.size === 0) {
      // If the name suggests soup but no specific types found
      if (/\b(soup|broth|bowl)\b/i.test(restaurant.name)) {
        // Assign cuisine-appropriate defaults
        if (cuisines.includes('vietnamese')) {
          detectedSoups.add('Pho');
          console.log(`  ✓ Default Vietnamese: Pho`);
        } else if (cuisines.includes('japanese')) {
          detectedSoups.add('Ramen');
          detectedSoups.add('Miso');
          console.log(`  ✓ Default Japanese: Ramen, Miso`);
        } else if (cuisines.includes('chinese')) {
          detectedSoups.add('Wonton');
          detectedSoups.add('Hot and Sour');
          console.log(`  ✓ Default Chinese: Wonton, Hot and Sour`);
        } else if (cuisines.includes('american')) {
          detectedSoups.add('Chicken Noodle');
          detectedSoups.add('Tomato');
          console.log(`  ✓ Default American: Chicken Noodle, Tomato`);
        } else {
          // Generic soup restaurant
          detectedSoups.add('House Special');
          console.log(`  ✓ Default Generic: House Special`);
        }
      }
    }
    
    // Strategy 3: If still nothing, check if it's really a soup restaurant
    if (detectedSoups.size === 0) {
      if (/soup/i.test(restaurant.name)) {
        // It has "soup" in the name but we couldn't detect specifics
        // This might be a soup-focused place serving multiple types
        detectedSoups.add('House Special');
        console.log(`  ✓ Fallback: House Special (soup in name)`);
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