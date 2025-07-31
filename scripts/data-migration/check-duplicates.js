// scripts/data-migration/check-duplicates.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    // Check restaurants table
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name, city, state, slug');
    
    if (restaurantError) {
      throw restaurantError;
    }
    
    console.log(`Total restaurants in database: ${restaurants.length}`);
    
    // Check for duplicate slugs
    const slugCounts = {};
    const duplicateSlugs = [];
    
    restaurants.forEach(restaurant => {
      if (slugCounts[restaurant.slug]) {
        slugCounts[restaurant.slug]++;
        duplicateSlugs.push(restaurant.slug);
      } else {
        slugCounts[restaurant.slug] = 1;
      }
    });
    
    const uniqueDuplicateSlugs = [...new Set(duplicateSlugs)];
    
    if (uniqueDuplicateSlugs.length > 0) {
      console.log(`Found ${uniqueDuplicateSlugs.length} duplicate slugs:`);
      uniqueDuplicateSlugs.forEach(slug => {
        console.log(`- "${slug}" appears ${slugCounts[slug]} times`);
        
        // Find the restaurants with this slug
        const dupes = restaurants.filter(r => r.slug === slug);
        dupes.forEach(d => {
          console.log(`  * ${d.name} (${d.city}, ${d.state})`);
        });
      });
    } else {
      console.log('No duplicate slugs found.');
    }
    
    // Check soups table
    const { data: soups, error: soupError } = await supabase
      .from('soups')
      .select('id, restaurant_id, name, soup_type');
    
    if (soupError) {
      throw soupError;
    }
    
    console.log(`Total soups in database: ${soups.length}`);
    
    // Count soups per restaurant
    const soupsByRestaurant = {};
    soups.forEach(soup => {
      if (soupsByRestaurant[soup.restaurant_id]) {
        soupsByRestaurant[soup.restaurant_id]++;
      } else {
        soupsByRestaurant[soup.restaurant_id] = 1;
      }
    });
    
    // Calculate some stats
    const restaurantsWithSoups = Object.keys(soupsByRestaurant).length;
    const avgSoupsPerRestaurant = restaurantsWithSoups > 0 
      ? (soups.length / restaurantsWithSoups).toFixed(2) 
      : 0;
    
    console.log(`Restaurants with soups: ${restaurantsWithSoups}/${restaurants.length}`);
    console.log(`Average soups per restaurant: ${avgSoupsPerRestaurant}`);
    
    // Check for any potential orphaned soups (soups without restaurants)
    const restaurantIds = new Set(restaurants.map(r => r.id));
    const orphanedSoups = soups.filter(s => !restaurantIds.has(s.restaurant_id));
    
    if (orphanedSoups.length > 0) {
      console.log(`Found ${orphanedSoups.length} orphaned soups (soups without restaurants)`);
    } else {
      console.log('No orphaned soups found.');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();