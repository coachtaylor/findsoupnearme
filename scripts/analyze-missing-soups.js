// Analyze restaurants without soup assignments

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeRestaurantsWithoutSoups() {
  console.log('=== RESTAURANTS WITHOUT SOUP ASSIGNMENTS ===\n');
  
  // Get all restaurants
  const { data: allRestaurants, error: restError } = await supabase
    .from('restaurants')
    .select('id, name, city, state');
  
  if (restError) {
    console.error('Error fetching restaurants:', restError);
    return;
  }
  
  console.log(`Total restaurants: ${allRestaurants.length}`);
  
  // Get all restaurants with soups
  const { data: soupsData, error: soupError } = await supabase
    .from('soups')
    .select('restaurant_id');
  
  if (soupError) {
    console.error('Error fetching soups:', soupError);
    return;
  }
  
  // Create a set of restaurant IDs that have soups
  const restaurantsWithSoups = new Set(soupsData.map(s => s.restaurant_id));
  
  // Find restaurants without soups
  const restaurantsWithoutSoups = allRestaurants.filter(r => !restaurantsWithSoups.has(r.id));
  
  console.log(`Restaurants WITH soups: ${restaurantsWithSoups.size}`);
  console.log(`Restaurants WITHOUT soups: ${restaurantsWithoutSoups.length}`);
  console.log(`Percentage with soups: ${((restaurantsWithSoups.size / allRestaurants.length) * 100).toFixed(1)}%\n`);
  
  if (restaurantsWithoutSoups.length > 0) {
    console.log('=== RESTAURANTS WITHOUT SOUPS ===\n');
    
    // Show first 50 restaurants without soups
    const samplesToShow = Math.min(50, restaurantsWithoutSoups.length);
    console.log(`Showing first ${samplesToShow} of ${restaurantsWithoutSoups.length}:\n`);
    
    restaurantsWithoutSoups.slice(0, samplesToShow).forEach((r, index) => {
      console.log(`${index + 1}. ${r.name} (${r.city}, ${r.state})`);
    });
    
    if (restaurantsWithoutSoups.length > 50) {
      console.log(`\n... and ${restaurantsWithoutSoups.length - 50} more`);
    }
    
    // Group by city to see patterns
    console.log('\n=== BREAKDOWN BY CITY ===\n');
    const byCity = {};
    restaurantsWithoutSoups.forEach(r => {
      const key = `${r.city}, ${r.state}`;
      byCity[key] = (byCity[key] || 0) + 1;
    });
    
    Object.entries(byCity)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`${city}: ${count} restaurants without soups`);
      });
  }
}

analyzeRestaurantsWithoutSoups().catch(console.error);