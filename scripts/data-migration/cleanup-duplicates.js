// scripts/data-migration/cleanup-duplicates.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDuplicates() {
  try {
    console.log('Looking for duplicate restaurants...');
    
    // Get all restaurants
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('id, name, city, state, slug, address')
      .order('name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${restaurants.length} total restaurants`);
    
    // Group restaurants by name and location (city+state)
    const restaurantGroups = {};
    
    restaurants.forEach(restaurant => {
      const key = `${restaurant.name.toLowerCase()}-${restaurant.city.toLowerCase()}-${restaurant.state.toLowerCase()}`;
      
      if (!restaurantGroups[key]) {
        restaurantGroups[key] = [];
      }
      
      restaurantGroups[key].push(restaurant);
    });
    
    // Find groups with duplicates
    const duplicateGroups = Object.entries(restaurantGroups)
      .filter(([_, group]) => group.length > 1)
      .map(([key, group]) => ({ key, restaurants: group }));
    
    console.log(`Found ${duplicateGroups.length} groups with duplicate restaurants`);
    
    if (duplicateGroups.length > 0) {
      console.log('\nDuplicate groups:');
      duplicateGroups.forEach(group => {
        console.log(`\nGroup: ${group.key}`);
        group.restaurants.forEach(r => {
          console.log(`  - ID: ${r.id}, Name: ${r.name}, Address: ${r.address}, Slug: ${r.slug}`);
        });
      });
    }
    
    return duplicateGroups;
  } catch (error) {
    console.error('Error finding duplicates:', error);
    return [];
  }
}

async function cleanupDuplicates() {
  try {
    const duplicateGroups = await findDuplicates();
    
    if (duplicateGroups.length === 0) {
      console.log('No duplicates to clean up.');
      return;
    }
    
    console.log('\n=== Starting duplicate cleanup ===\n');
    
    for (const group of duplicateGroups) {
      try {
        console.log(`Processing group: ${group.key}`);
        
        // Sort by ID to find the oldest entry (likely the first one added)
        const sortedRestaurants = [...group.restaurants].sort((a, b) => a.id.localeCompare(b.id));
        
        // Keep the first one, remove the rest
        const [keeper, ...duplicatesToRemove] = sortedRestaurants;
        
        console.log(`Keeping: ${keeper.name} (${keeper.id})`);
        console.log(`Removing ${duplicatesToRemove.length} duplicates`);
        
        // For each duplicate, first get its soups
        for (const duplicate of duplicatesToRemove) {
          // Get soups from the duplicate
          const { data: soups, error: soupError } = await supabase
            .from('soups')
            .select('*')
            .eq('restaurant_id', duplicate.id);
          
          if (soupError) {
            console.error(`Error getting soups for ${duplicate.name} (${duplicate.id}):`, soupError);
            continue;
          }
          
          console.log(`Found ${soups?.length || 0} soups for duplicate ${duplicate.name} (${duplicate.id})`);
          
          // Transfer unique soups to the keeper
          if (soups && soups.length > 0) {
            // Get existing soups for the keeper
            const { data: keeperSoups, error: keeperSoupError } = await supabase
              .from('soups')
              .select('soup_type')
              .eq('restaurant_id', keeper.id);
            
            if (keeperSoupError) {
              console.error(`Error getting soups for keeper ${keeper.name} (${keeper.id}):`, keeperSoupError);
              continue;
            }
            
            // Create a set of existing soup types
            const existingSoupTypes = new Set((keeperSoups || []).map(s => s.soup_type));
            
            // Filter out soups that already exist on the keeper
            const uniqueSoups = soups.filter(soup => !existingSoupTypes.has(soup.soup_type));
            
            if (uniqueSoups.length > 0) {
              console.log(`Transferring ${uniqueSoups.length} unique soups to keeper`);
              
              // Prepare soups for transfer (change restaurant_id)
              const soupsToTransfer = uniqueSoups.map(soup => ({
                ...soup,
                id: undefined, // Remove ID to create new entries
                restaurant_id: keeper.id
              }));
              
              // Insert soups to keeper
              const { error: transferError } = await supabase
                .from('soups')
                .insert(soupsToTransfer);
              
              if (transferError) {
                console.error(`Error transferring soups to keeper:`, transferError);
              } else {
                console.log(`Successfully transferred soups`);
              }
            } else {
              console.log(`No unique soups to transfer`);
            }
          }
          
          // Delete soups from the duplicate
          const { error: deleteSoupError } = await supabase
            .from('soups')
            .delete()
            .eq('restaurant_id', duplicate.id);
          
          if (deleteSoupError) {
            console.error(`Error deleting soups for ${duplicate.name} (${duplicate.id}):`, deleteSoupError);
          } else {
            console.log(`Deleted soups for ${duplicate.name} (${duplicate.id})`);
          }
          
          // Delete the duplicate restaurant
          const { error: deleteRestaurantError } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', duplicate.id);
          
          if (deleteRestaurantError) {
            console.error(`Error deleting restaurant ${duplicate.name} (${duplicate.id}):`, deleteRestaurantError);
          } else {
            console.log(`Deleted restaurant ${duplicate.name} (${duplicate.id})`);
          }
        }
      } catch (error) {
        console.error(`Error processing group ${group.key}:`, error);
      }
    }
    
    console.log('\n=== Duplicate cleanup complete ===\n');
    
    // Final check to verify cleanup
    const remainingDuplicates = await findDuplicates();
    if (remainingDuplicates.length > 0) {
      console.log(`Warning: ${remainingDuplicates.length} duplicate groups remain. May need additional cleanup.`);
    } else {
      console.log('Success! All duplicates have been cleaned up.');
    }
  } catch (error) {
    console.error('Error during cleanup process:', error);
  }
}

// Run the cleanup
cleanupDuplicates();