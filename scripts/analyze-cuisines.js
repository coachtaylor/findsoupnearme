// Analyze restaurant cuisine assignments in database

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCuisineAssignments() {
  console.log('=== ANALYZING RESTAURANT CUISINE ASSIGNMENTS ===\n');
  
  // First, check if cuisine column exists
  const { data: sampleRestaurant } = await supabase
    .from('restaurants')
    .select('*')
    .limit(1)
    .single();
  
  if (sampleRestaurant) {
    console.log('Sample restaurant columns:');
    console.log(Object.keys(sampleRestaurant).join(', '));
    console.log('');
  }
  
  // Check if cuisine_type or similar column exists
  const hasCuisineColumn = sampleRestaurant && ('cuisine_type' in sampleRestaurant || 'cuisine' in sampleRestaurant || 'cuisines' in sampleRestaurant);
  
  if (!hasCuisineColumn) {
    console.log('❌ No cuisine column found in restaurants table!');
    console.log('');
    console.log('Possible column names to check:');
    console.log('  - cuisine_type');
    console.log('  - cuisine');
    console.log('  - cuisines');
    console.log('');
    console.log('We need to ADD a cuisine column to your database.');
    console.log('');
    console.log('Suggested schema:');
    console.log('  ALTER TABLE restaurants ADD COLUMN cuisine_type TEXT;');
    console.log('  -- Or for multiple cuisines:');
    console.log('  ALTER TABLE restaurants ADD COLUMN cuisines TEXT[];');
    return;
  }
  
  // If column exists, analyze it
  const cuisineColumn = 'cuisine_type' in sampleRestaurant ? 'cuisine_type' : 
                       'cuisine' in sampleRestaurant ? 'cuisine' : 'cuisines';
  
  console.log(`✅ Found cuisine column: ${cuisineColumn}\n`);
  
  // Get all restaurants
  const { data: allRestaurants } = await supabase
    .from('restaurants')
    .select(`id, name, city, state, ${cuisineColumn}`);
  
  console.log(`Total restaurants: ${allRestaurants.length}\n`);
  
  // Analyze cuisine assignments
  const withCuisine = allRestaurants.filter(r => r[cuisineColumn] && r[cuisineColumn].length > 0);
  const withoutCuisine = allRestaurants.filter(r => !r[cuisineColumn] || r[cuisineColumn].length === 0);
  
  console.log(`Restaurants WITH cuisine: ${withCuisine.length} (${((withCuisine.length / allRestaurants.length) * 100).toFixed(1)}%)`);
  console.log(`Restaurants WITHOUT cuisine: ${withoutCuisine.length} (${((withoutCuisine.length / allRestaurants.length) * 100).toFixed(1)}%)\n`);
  
  if (withCuisine.length > 0) {
    // Show cuisine distribution
    console.log('=== CUISINE DISTRIBUTION ===\n');
    const cuisineCount = {};
    
    withCuisine.forEach(r => {
      const cuisine = Array.isArray(r[cuisineColumn]) ? r[cuisineColumn].join(', ') : r[cuisineColumn];
      cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
    });
    
    Object.entries(cuisineCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cuisine, count]) => {
        console.log(`${cuisine}: ${count} restaurants`);
      });
    console.log('');
  }
  
  if (withoutCuisine.length > 0) {
    console.log('=== SAMPLE RESTAURANTS WITHOUT CUISINE ===\n');
    console.log(`Showing first 30 of ${withoutCuisine.length}:\n`);
    
    withoutCuisine.slice(0, 30).forEach((r, i) => {
      console.log(`${i + 1}. ${r.name} (${r.city}, ${r.state})`);
    });
    
    if (withoutCuisine.length > 30) {
      console.log(`\n... and ${withoutCuisine.length - 30} more`);
    }
  }
}

analyzeCuisineAssignments().catch(console.error);