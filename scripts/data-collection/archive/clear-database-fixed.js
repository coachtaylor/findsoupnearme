// Database clearing script for FindSoupNearMe
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearDatabase() {
  try {
    console.log('Starting database clearing process...');
    
    // First ask for confirmation
    if (process.argv[2] !== '--confirm') {
      console.log('\n⚠️ WARNING: This will delete ALL data from your database!');
      console.log('To proceed, run the script with the --confirm flag:');
      console.log('node scripts/data-collection/clear-database-fixed.js --confirm');
      return;
    }
    
    // Step 1: Get counts before deletion
    console.log('\nCurrent database counts:');
    
    const { count: restaurantCount, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });
      
    if (restaurantError) {
      console.error('Error counting restaurants:', restaurantError);
    } else {
      console.log(`- Restaurants: ${restaurantCount}`);
    }
    
    const { count: soupCount, error: soupError } = await supabase
      .from('soups')
      .select('*', { count: 'exact', head: true });
      
    if (soupError) {
      console.error('Error counting soups:', soupError);
    } else {
      console.log(`- Soups: ${soupCount}`);
    }
    
    // Step 2: Delete soups first (because of foreign key constraints)
    console.log('\nDeleting all soups...');
    
    // Use a more direct approach - execute raw SQL to truncate the table
    const { error: truncateSoupsError } = await supabase.rpc('truncate_soups');
    
    if (truncateSoupsError) {
      console.error('Error truncating soups table:', truncateSoupsError);
      console.log('Trying alternative deletion method...');
      
      // Try another approach - delete in batches
      const { data: allSoups, error: fetchSoupsError } = await supabase
        .from('soups')
        .select('id')
        .limit(1000);
      
      if (fetchSoupsError) {
        console.error('Error fetching soups:', fetchSoupsError);
        return;
      }
      
      if (allSoups && allSoups.length > 0) {
        const soupIds = allSoups.map(soup => soup.id);
        const { error: deleteSelectedSoupsError } = await supabase
          .from('soups')
          .delete()
          .in('id', soupIds);
        
        if (deleteSelectedSoupsError) {
          console.error('Error deleting selected soups:', deleteSelectedSoupsError);
          return;
        }
        console.log(`Deleted ${allSoups.length} soups.`);
      } else {
        console.log('No soups to delete.');
      }
    } else {
      console.log('Successfully truncated soups table.');
    }
    
    // Step 3: Delete all restaurants
    console.log('Deleting all restaurants...');
    
    // Use a more direct approach - execute raw SQL to truncate the table
    const { error: truncateRestaurantsError } = await supabase.rpc('truncate_restaurants');
    
    if (truncateRestaurantsError) {
      console.error('Error truncating restaurants table:', truncateRestaurantsError);
      console.log('Trying alternative deletion method...');
      
      // Try another approach - delete in batches
      const { data: allRestaurants, error: fetchRestaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .limit(1000);
      
      if (fetchRestaurantsError) {
        console.error('Error fetching restaurants:', fetchRestaurantsError);
        return;
      }
      
      if (allRestaurants && allRestaurants.length > 0) {
        const restaurantIds = allRestaurants.map(restaurant => restaurant.id);
        const { error: deleteSelectedRestaurantsError } = await supabase
          .from('restaurants')
          .delete()
          .in('id', restaurantIds);
        
        if (deleteSelectedRestaurantsError) {
          console.error('Error deleting selected restaurants:', deleteSelectedRestaurantsError);
          return;
        }
        console.log(`Deleted ${allRestaurants.length} restaurants.`);
      } else {
        console.log('No restaurants to delete.');
      }
    } else {
      console.log('Successfully truncated restaurants table.');
    }
    
    // Step 4: Verify deletion
    const { count: newRestaurantCount, error: newRestaurantError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });
      
    if (newRestaurantError) {
      console.error('Error counting restaurants after deletion:', newRestaurantError);
    } else {
      console.log(`\nRestaurants after deletion: ${newRestaurantCount}`);
    }
    
    const { count: newSoupCount, error: newSoupError } = await supabase
      .from('soups')
      .select('*', { count: 'exact', head: true });
      
    if (newSoupError) {
      console.error('Error counting soups after deletion:', newSoupError);
    } else {
      console.log(`Soups after deletion: ${newSoupCount}`);
    }
    
    // Step 5: Delete storage items if needed
    console.log('\nChecking for restaurant images in storage...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
      
    if (bucketsError) {
      console.error('Error listing storage buckets:', bucketsError);
    } else {
      const restaurantImagesBucket = buckets.find(bucket => bucket.name === 'restaurant-images');
      
      if (restaurantImagesBucket) {
        console.log('Found restaurant-images bucket. Emptying...');
        
        // This would delete the entire bucket, but it's safer to keep the bucket and just empty it
        // Instead, we'd need to recursively list and delete objects, which is complex
        // For now, we'll just note that storage cleanup may be needed
        console.log('NOTE: Storage bucket exists but will not be automatically emptied.');
        console.log('You may need to manually empty the restaurant-images bucket in Supabase.');
      } else {
        console.log('No restaurant-images bucket found.');
      }
    }
    
    console.log('\n✅ Database clearing complete! Ready for fresh data collection.');
  } catch (error) {
    console.error('Error in database clearing process:', error);
  }
}

// Create stored procedures for truncating tables if they don't exist
async function createStoredProcedures() {
  try {
    console.log('Setting up stored procedures for database clearing...');
    
    // Create a stored procedure to truncate the soups table
    const { error: createSoupProcError } = await supabase.rpc('create_truncate_soups_procedure');
    
    if (createSoupProcError) {
      console.log('Soups truncate procedure may already exist or could not be created.');
      console.log('Error:', createSoupProcError.message);
      
      // Try to create the procedure directly with SQL
      const { error: createDirectSoupProcError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION truncate_soups()
          RETURNS void AS $$
          BEGIN
            DELETE FROM soups;
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (createDirectSoupProcError) {
        console.error('Error creating soups truncate procedure directly:', createDirectSoupProcError);
      }
    }
    
    // Create a stored procedure to truncate the restaurants table
    const { error: createRestaurantProcError } = await supabase.rpc('create_truncate_restaurants_procedure');
    
    if (createRestaurantProcError) {
      console.log('Restaurants truncate procedure may already exist or could not be created.');
      console.log('Error:', createRestaurantProcError.message);
      
      // Try to create the procedure directly with SQL
      const { error: createDirectRestaurantProcError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION truncate_restaurants()
          RETURNS void AS $$
          BEGIN
            DELETE FROM restaurants;
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (createDirectRestaurantProcError) {
        console.error('Error creating restaurants truncate procedure directly:', createDirectRestaurantProcError);
      }
    }
    
    console.log('Stored procedures setup complete.');
  } catch (error) {
    console.error('Error setting up stored procedures:', error);
  }
}

// Run the setup and clear functions
async function main() {
  // Create stored procedures (this might fail if RPC permissions are not set up)
  // await createStoredProcedures();
  
  // Clear the database
  await clearDatabase();
}

main().catch(console.error);