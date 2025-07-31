// Data debugging script for FindSoupNearMe
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// City targets from our main script
const CITY_TARGETS = {
  'New York, NY': { state: 'NY', city: 'New York' },
  'Los Angeles, CA': { state: 'CA', city: 'Los Angeles' },
  'Chicago, IL': { state: 'IL', city: 'Chicago' },
  'San Francisco, CA': { state: 'CA', city: 'San Francisco' },
  'Seattle, WA': { state: 'WA', city: 'Seattle' },
  'Dallas, TX': { state: 'TX', city: 'Dallas' },
  'Miami, FL': { state: 'FL', city: 'Miami' },
  'Philadelphia, PA': { state: 'PA', city: 'Philadelphia' },
  'San Diego, CA': { state: 'CA', city: 'San Diego' },
  'Austin, TX': { state: 'TX', city: 'Austin' },
  'Phoenix, AZ': { state: 'AZ', city: 'Phoenix' }
};

async function debugRestaurantData() {
  try {
    console.log('\n==== DATABASE DEBUG REPORT ====');
    
    // 1. Get total count of all restaurants
    const { count: totalCount, error: totalError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });
      
    if (totalError) {
      console.error('Error getting total restaurant count:', totalError);
    } else {
      console.log(`\nTotal restaurants in database: ${totalCount}`);
    }
    
    // 2. Count by city and state
    console.log('\nRestaurant counts by city:');
    console.log('-------------------------');
    
    let trackedCityCount = 0;
    
    for (const [locationName, cityInfo] of Object.entries(CITY_TARGETS)) {
      const { count, error } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true })
        .eq('state', cityInfo.state)
        .eq('city', cityInfo.city);
        
      if (error) {
        console.error(`Error counting restaurants in ${cityInfo.city}, ${cityInfo.state}:`, error);
      } else {
        console.log(`${locationName}: ${count} restaurants`);
        trackedCityCount += count;
      }
    }
    
    console.log(`\nTotal restaurants in tracked cities: ${trackedCityCount}`);
    
    if (trackedCityCount < totalCount) {
      console.log(`\n⚠️ Found ${totalCount - trackedCityCount} restaurants not assigned to target cities!`);
      
      // 3. Find restaurants not in target cities
      const { data: unassignedRestaurants, error: unassignedError } = await supabase
        .from('restaurants')
        .select('id, name, city, state');
        
      if (unassignedError) {
        console.error('Error getting all restaurants:', unassignedError);
      } else {
        const untrackedRestaurants = unassignedRestaurants.filter(restaurant => {
          // Check if this restaurant's city/state combo is in our target list
          return !Object.values(CITY_TARGETS).some(cityInfo => 
            cityInfo.city === restaurant.city && cityInfo.state === restaurant.state
          );
        });
        
        if (untrackedRestaurants.length > 0) {
          console.log('\nRestaurants not in target cities:');
          console.log('----------------------------------');
          
          untrackedRestaurants.forEach(restaurant => {
            console.log(`- ${restaurant.name} (${restaurant.city}, ${restaurant.state})`);
          });
        }
      }
    }
    
    // 4. Check for restaurants without images
    const { count: noImageCount, error: imageError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .is('exterior_image_url', null);
      
    if (imageError) {
      console.error('Error checking for restaurants without images:', imageError);
    } else {
      console.log(`\nRestaurants without images: ${noImageCount}`);
      
      if (noImageCount > totalCount) {
        console.log(`⚠️ This is more than the total restaurant count (${totalCount})!`);
        console.log('Checking for potential database inconsistencies...');
        
        // Additional check for exterior_image_url column
        const { data: columns, error: columnsError } = await supabase
          .rpc('get_columns', { table_name: 'restaurants' });
          
        if (columnsError) {
          console.error('Error getting table columns:', columnsError);
        } else {
          const hasExteriorImageColumn = columns.some(col => col.column_name === 'exterior_image_url');
          console.log(`The 'exterior_image_url' column ${hasExteriorImageColumn ? 'exists' : 'does not exist'} in the restaurants table.`);
        }
      }
    }
    
    // 5. Check soup data
    const { count: soupCount, error: soupError } = await supabase
      .from('soups')
      .select('*', { count: 'exact', head: true });
      
    if (soupError) {
      console.error('Error checking soup data:', soupError);
    } else {
      console.log(`\nTotal soups in database: ${soupCount}`);
      
      // Count unique restaurant_ids in soups table
      const { data: soupData, error: soupDataError } = await supabase
        .from('soups')
        .select('restaurant_id');
        
      if (soupDataError) {
        console.error('Error fetching soup data:', soupDataError);
      } else {
        const uniqueRestaurantIds = new Set(soupData.map(soup => soup.restaurant_id));
        console.log(`Restaurants with soup data: ${uniqueRestaurantIds.size}`);
        
        if (uniqueRestaurantIds.size > totalCount) {
          console.log(`⚠️ This is more than the total restaurant count (${totalCount})!`);
          console.log('Possible database inconsistency - might have orphaned soup records.');
        }
      }
    }
    
    console.log('\n==== END OF DEBUG REPORT ====');
  } catch (error) {
    console.error('Error in debug process:', error);
  }
}

// Run the debug function
debugRestaurantData().catch(console.error);
