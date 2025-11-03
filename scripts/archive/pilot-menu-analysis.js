// Pilot Menu Analysis Script
// Analyzes 20-30 restaurants to extract real soup types from menus

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const fs = require('fs');

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Soup extraction patterns
const SOUP_PATTERNS = [
  // Explicit soup mentions
  /([a-zA-Z\s&]+)\s+soup/gi,
  /soup\s+of\s+([a-zA-Z\s]+)/gi,
  
  // Specific soup types
  /\b(pho|ramen|udon|miso|tonkotsu)\b/gi,
  /\b(chowder|bisque|gazpacho|minestrone)\b/gi,
  /\b(gumbo|jambalaya|pozole|menudo)\b/gi,
  /\b(borscht|matzo\s+ball|wonton)\b/gi,
  
  // Common patterns
  /cream\s+of\s+([a-zA-Z\s]+)/gi,
  /([a-zA-Z\s]+)\s+chowder/gi,
  /([a-zA-Z\s]+)\s+bisque/gi,
  /([a-zA-Z\s]+)\s+stew/gi,
  
  // Menu section headers
  /soups?\s*&?\s*stews?/gi,
  /hot\s+soups?/gi,
  /soup\s+selection/gi
];

// Get sample restaurants for pilot analysis
async function getPilotRestaurants(limit = 25) {
  try {
    console.log('Fetching pilot restaurants...');
    
    // Get restaurants with websites first (higher chance of menu data)
    const { data: restaurantsWithWebsites, error: websiteError } = await supabase
      .from('restaurants')
      .select('id, name, website, city, state, phone')
      .not('website', 'is', null)
      .neq('website', '')
      .limit(Math.floor(limit * 0.7)); // 70% with websites
    
    if (websiteError) {
      console.error('Error fetching restaurants with websites:', websiteError);
      return [];
    }
    
    // Get some restaurants without websites too (for review analysis)
    const { data: restaurantsWithoutWebsites, error: noWebsiteError } = await supabase
      .from('restaurants')
      .select('id, name, website, city, state, phone')
      .or('website.is.null,website.eq.')
      .limit(Math.ceil(limit * 0.3)); // 30% without websites
    
    if (noWebsiteError) {
      console.error('Error fetching restaurants without websites:', noWebsiteError);
    }
    
    const allRestaurants = [
      ...(restaurantsWithWebsites || []),
      ...(restaurantsWithoutWebsites || [])
    ].slice(0, limit);
    
    console.log(`Selected ${allRestaurants.length} restaurants for pilot analysis`);
    console.log(`- ${restaurantsWithWebsites?.length || 0} with websites`);
    console.log(`- ${restaurantsWithoutWebsites?.length || 0} without websites`);
    
    return allRestaurants;
  } catch (error) {
    console.error('Error in getPilotRestaurants:', error);
    return [];
  }
}

// Analyze website menu for soup mentions
async function analyzeWebsiteMenu(restaurant) {
  if (!restaurant.website) {
    return { soups: [], source: 'none', error: 'No website' };
  }
  
  try {
    console.log(`Analyzing website: ${restaurant.website}`);
    
    // Use Node.js native HTTP modules
    const url = new URL(restaurant.website);
    const client = url.protocol === 'https:' ? https : http;
    
    const content = await new Promise((resolve, reject) => {
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RestaurantAnalyzer/1.0)'
        },
        timeout: 10000
      }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
    
    const soups = extractSoupsFromText(content);
    
    return { 
      soups, 
      source: 'website', 
      error: null,
      contentLength: content.length 
    };
    
  } catch (error) {
    console.log(`Error analyzing website for ${restaurant.name}: ${error.message}`);
    return { soups: [], source: 'website', error: error.message };
  }
}

// Extract Google Reviews for soup mentions
async function analyzeGoogleReviews(restaurant) {
  try {
    // This would require Google Places API to get detailed reviews
    // For pilot, we'll use the existing review data in the database
    const { data: soups, error } = await supabase
      .from('soups')
      .select('name, soup_type')
      .eq('restaurant_id', restaurant.id);
    
    if (error) {
      return { soups: [], source: 'reviews', error: error.message };
    }
    
    // Extract soup mentions from existing data
    const reviewSoups = soups?.map(s => s.name || s.soup_type) || [];
    
    return { 
      soups: reviewSoups, 
      source: 'existing_data', 
      error: null 
    };
    
  } catch (error) {
    return { soups: [], source: 'reviews', error: error.message };
  }
}

// Extract soup types from text content
function extractSoupsFromText(text) {
  const soups = new Set();
  const lowerText = text.toLowerCase();
  
  // Apply each pattern
  SOUP_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = cleanSoupName(match);
        if (cleaned && cleaned.length > 2 && cleaned.length < 50) {
          soups.add(cleaned);
        }
      });
    }
  });
  
  return Array.from(soups);
}

// Clean and normalize soup names
function cleanSoupName(soupName) {
  return soupName
    .replace(/soup/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/\s+(cup|bowl)$/i, '')
    .trim();
}

// Analyze a single restaurant
async function analyzeSingleRestaurant(restaurant) {
  console.log(`\n=== Analyzing: ${restaurant.name} (${restaurant.city}, ${restaurant.state}) ===`);
  
  const results = {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      city: restaurant.city,
      state: restaurant.state,
      website: restaurant.website
    },
    analysis: {}
  };
  
  // 1. Website analysis
  const websiteResult = await analyzeWebsiteMenu(restaurant);
  results.analysis.website = websiteResult;
  console.log(`Website analysis: ${websiteResult.soups.length} soups found`);
  if (websiteResult.soups.length > 0) {
    console.log(`  Soups: ${websiteResult.soups.join(', ')}`);
  }
  
  // 2. Review analysis (using existing data for now)
  const reviewResult = await analyzeGoogleReviews(restaurant);
  results.analysis.reviews = reviewResult;
  console.log(`Review analysis: ${reviewResult.soups.length} soups found`);
  
  // 3. Combine results
  const allSoups = new Set([
    ...websiteResult.soups,
    ...reviewResult.soups
  ]);
  
  results.combined_soups = Array.from(allSoups);
  console.log(`Total unique soups: ${results.combined_soups.length}`);
  
  return results;
}

// Main pilot analysis function
async function runPilotAnalysis() {
  try {
    console.log('🚀 Starting Pilot Menu Analysis...\n');
    
    // 1. Get pilot restaurants
    const restaurants = await getPilotRestaurants(25);
    
    if (restaurants.length === 0) {
      console.log('No restaurants found for analysis');
      return;
    }
    
    // 2. Analyze each restaurant
    const results = [];
    const soupFrequency = new Map();
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`\nProgress: ${i + 1}/${restaurants.length}`);
      
      try {
        const result = await analyzeSingleRestaurant(restaurant);
        results.push(result);
        
        // Track soup frequency
        result.combined_soups.forEach(soup => {
          soupFrequency.set(soup, (soupFrequency.get(soup) || 0) + 1);
        });
        
        // Small delay to be respectful to websites
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error analyzing ${restaurant.name}:`, error);
      }
    }
    
    // 3. Generate frequency report
    const sortedSoups = Array.from(soupFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50); // Top 50
    
    // 4. Save results
    const outputData = {
      summary: {
        total_restaurants: restaurants.length,
        total_unique_soups: soupFrequency.size,
        analysis_date: new Date().toISOString()
      },
      soup_frequency: sortedSoups,
      detailed_results: results
    };
    
    const outputFile = `data/pilot-analysis-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    
    // 5. Print summary
    console.log('\n' + '='.repeat(50));
    console.log('🎯 PILOT ANALYSIS COMPLETE');
    console.log('='.repeat(50));
    console.log(`📊 Restaurants analyzed: ${restaurants.length}`);
    console.log(`🍲 Unique soup types found: ${soupFrequency.size}`);
    console.log(`💾 Results saved to: ${outputFile}`);
    
    console.log('\n📈 TOP 20 SOUP TYPES:');
    sortedSoups.slice(0, 20).forEach(([ soup, count ], index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${soup} (${count} restaurants)`);
    });
    
    return outputData;
    
  } catch (error) {
    console.error('Error in pilot analysis:', error);
  }
}

// Export for use
module.exports = { runPilotAnalysis, analyzeSingleRestaurant };

// Run if called directly
if (require.main === module) {
  runPilotAnalysis();
}