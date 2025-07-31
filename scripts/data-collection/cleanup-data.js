// Cleanup script to remove test data from database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to delete data for a specific city
async function deleteDataForCity(city, state) {
  try {
    console.log(`\n==== Deleting data for ${city}, ${state} ====`);
    
    // 1. First, get all restaurants for this city
    const { data: restaurants, error: fetchError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('city', city)
      .eq('state', state);
      
    if (fetchError) {
      console.error(`Error fetching restaurants for ${city}, ${state}:`, fetchError);
      return;
    }
    
    if (!restaurants || restaurants.length === 0) {
      console.log(`No restaurants found for ${city}, ${state}`);
      return;
    }
    
    console.log(`Found ${restaurants.length} restaurants to delete in ${city}, ${state}`);
    
    // Get the restaurant IDs
    const restaurantIds = restaurants.map(r => r.id);
    
    // 2. Delete all soups for these restaurants
    const { error: soupError, count: deletedSoups } = await supabase
      .from('soups')
      .delete()
      .in('restaurant_id', restaurantIds)
      .select('id', { count: 'exact' });
      
    if (soupError) {
      console.error(`Error deleting soups for ${city}, ${state}:`, soupError);
    } else {
      console.log(`Deleted ${deletedSoups} soups for ${city}, ${state}`);
    }
    
    // 3. Delete the restaurants
    const { error: restaurantError, count: deletedRestaurants } = await supabase
      .from('restaurants')
      .delete()
      .in('id', restaurantIds)
      .select('id', { count: 'exact' });
      
    if (restaurantError) {
      console.error(`Error deleting restaurants for ${city}, ${state}:`, restaurantError);
    } else {
      console.log(`Deleted ${deletedRestaurants} restaurants for ${city}, ${state}`);
    }
    
    // 4. Delete storage files for this city/state (if needed)
    console.log(`NOTE: Storage files for ${state}/${city}/ will need to be deleted manually in the Supabase dashboard.`);
    
    console.log(`\n==== Cleanup for ${city}, ${state} complete ====`);
  } catch (error) {
    console.error(`Error cleaning up data for ${city}, ${state}:`, error);
  }
}

// Function to delete all data from the database
async function deleteAllData() {
  try {
    console.log('\n==== Deleting all data from database ====');
    
    // First, ask for confirmation
    if (process.argv[2] !== '--confirm-all') {
      console.log('\n⚠️ WARNING: This will delete ALL data from your database!');
      console.log('To proceed, run the script with the --confirm-all flag:');
      console.log('node scripts/data-collection/cleanup-data.js all --confirm-all');
      return;
    }
    
    // 1. Delete all soups
    console.log('Deleting all soups...');
    const { error: soupError, count: deletedSoups } = await supabase
      .from('soups')
      .delete()
      .neq('id', 'no-match-safe-delete-all')
      .select('id', { count: 'exact' });
      
    if (soupError) {
      console.error('Error deleting all soups:', soupError);
    } else {
      console.log(`Deleted ${deletedSoups} soups`);
    }
    
    // 2. Delete all restaurants
    console.log('Deleting all restaurants...');
    const { error: restaurantError, count: deletedRestaurants } = await supabase
      .from('restaurants')
      .delete()
      .neq('id', 'no-match-safe-delete-all')
      .select('id', { count: 'exact' });
      
    if (restaurantError) {
      console.error('Error deleting all restaurants:', restaurantError);
    } else {
      console.log(`Deleted ${deletedRestaurants} restaurants`);
    }
    
    // 3. Note about storage
    console.log('\nNOTE: Storage files will need to be deleted manually in the Supabase dashboard.');
    
    console.log('\n==== All data has been deleted ====');
  } catch (error) {
    console.error('Error deleting all data:', error);
  }
}

// Main function
async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('Please specify a command:');
    console.log('  node cleanup-data.js city "Chicago" "IL"    # Delete data for a specific city');
    console.log('  node cleanup-data.js all --confirm-all      # Delete ALL data (requires confirmation)');
    return;
  }
  
  if (command === 'city') {
    const city = process.argv[3];
    const state = process.argv[4];
    
    if (!city || !state) {
      console.log('Please specify a city and state:');
      console.log('  node cleanup-data.js city "Chicago" "IL"');
      return;
    }
    
    await deleteDataForCity(city, state);
  } else if (command === 'all') {
    await deleteAllData();
  } else {
    console.log('Unknown command. Available commands:');
    console.log('  city - Delete data for a specific city');
    console.log('  all - Delete ALL data (requires confirmation)');
  }
}

// Run the main function
main().catch(console.error);