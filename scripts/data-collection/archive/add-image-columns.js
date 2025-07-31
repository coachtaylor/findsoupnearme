// Script to add missing image columns to database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addImageColumns() {
  console.log('Adding image columns to database...');
  
  try {
    // Check if restaurants table has exterior_image_url column
    console.log('Checking restaurants table columns...');
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1);
      
    if (restaurantError) {
      console.error('Error checking restaurants table:', restaurantError);
      return;
    }
    
    const sampleRestaurant = restaurantData && restaurantData.length > 0 ? restaurantData[0] : {};
    const restaurantColumns = Object.keys(sampleRestaurant);
    console.log('Current restaurant columns:', restaurantColumns);
    
    // Check if the columns already exist
    const hasExteriorImageUrl = restaurantColumns.includes('exterior_image_url');
    const hasPhotoUrls = restaurantColumns.includes('photo_urls');
    
    // Add exterior_image_url column if missing
    if (!hasExteriorImageUrl) {
      console.log('Adding exterior_image_url column to restaurants table...');
      
      try {
        // Try using RPC to execute SQL (requires appropriate permissions)
        const { error: addExteriorImageError } = await supabase.rpc('execute_sql', {
          sql: 'ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS exterior_image_url TEXT;'
        });
        
        if (addExteriorImageError) {
          console.error('Error adding exterior_image_url column:', addExteriorImageError);
          console.log('This requires SQL execution privileges. Please add the column manually:');
          console.log('ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS exterior_image_url TEXT;');
        } else {
          console.log('✅ Successfully added exterior_image_url column');
        }
      } catch (error) {
        console.error('Error executing SQL for exterior_image_url:', error);
      }
    } else {
      console.log('✅ exterior_image_url column already exists');
    }
    
    // Add photo_urls column if missing
    if (!hasPhotoUrls) {
      console.log('Adding photo_urls column to restaurants table...');
      
      try {
        // Try using RPC to execute SQL
        const { error: addPhotoUrlsError } = await supabase.rpc('execute_sql', {
          sql: 'ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS photo_urls TEXT[];'
        });
        
        if (addPhotoUrlsError) {
          console.error('Error adding photo_urls column:', addPhotoUrlsError);
          console.log('This requires SQL execution privileges. Please add the column manually:');
          console.log('ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS photo_urls TEXT[];');
        } else {
          console.log('✅ Successfully added photo_urls column');
        }
      } catch (error) {
        console.error('Error executing SQL for photo_urls:', error);
      }
    } else {
      console.log('✅ photo_urls column already exists');
    }
    
    // Check if soups table has image_url column
    console.log('\nChecking soups table columns...');
    const { data: soupData, error: soupError } = await supabase
      .from('soups')
      .select('*')
      .limit(1);
      
    if (soupError) {
      console.error('Error checking soups table:', soupError);
      return;
    }
    
    const sampleSoup = soupData && soupData.length > 0 ? soupData[0] : {};
    const soupColumns = Object.keys(sampleSoup);
    console.log('Current soup columns:', soupColumns);
    
    // Check if the column already exists
    const hasSoupImageUrl = soupColumns.includes('image_url');
    
    // Add image_url column if missing
    if (!hasSoupImageUrl) {
      console.log('Adding image_url column to soups table...');
      
      try {
        // Try using RPC to execute SQL
        const { error: addSoupImageError } = await supabase.rpc('execute_sql', {
          sql: 'ALTER TABLE soups ADD COLUMN IF NOT EXISTS image_url TEXT;'
        });
        
        if (addSoupImageError) {
          console.error('Error adding image_url column to soups table:', addSoupImageError);
          console.log('This requires SQL execution privileges. Please add the column manually:');
          console.log('ALTER TABLE soups ADD COLUMN IF NOT EXISTS image_url TEXT;');
        } else {
          console.log('✅ Successfully added image_url column to soups table');
        }
      } catch (error) {
        console.error('Error executing SQL for soup image_url:', error);
      }
    } else {
      console.log('✅ image_url column already exists in soups table');
    }
    
    console.log('\n==== Summary ====');
    console.log('Restaurant table:');
    console.log(`- exterior_image_url: ${hasExteriorImageUrl ? 'Already exists' : 'Added'}`);
    console.log(`- photo_urls: ${hasPhotoUrls ? 'Already exists' : 'Added'}`);
    console.log('Soups table:');
    console.log(`- image_url: ${hasSoupImageUrl ? 'Already exists' : 'Added'}`);
    
    console.log('\nIf any columns could not be added automatically, please run the SQL commands manually.');
    
  } catch (error) {
    console.error('Error in addImageColumns function:', error);
  }
}

// Run the function
addImageColumns();