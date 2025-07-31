// Debug script to troubleshoot data collection issues
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function checkConnections() {
  console.log('=== Debug Connection Test ===');
  
  // 1. Check Supabase connection
  console.log('\nTesting Supabase connection...');
  try {
    // Simple query to test connection
    const { count, error } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('❌ Supabase connection error:', error);
    } else {
      console.log(`✅ Supabase connection successful. Found ${count} restaurants.`);
    }
  } catch (error) {
    console.error('❌ Supabase error:', error);
  }
  
  // 2. Check Google Maps API
  console.log('\nTesting Google Maps API connection...');
  try {
    const endpoint = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
    const url = `${endpoint}?query=soup+restaurant+in+Chicago&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      duplex: 'half'  // Required for Node.js 18+
    });
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log(`✅ Google Maps API connection successful. Found ${data.results.length} restaurants.`);
    } else {
      console.error(`❌ Google Maps API error: ${data.status}`, data.error_message);
    }
  } catch (error) {
    console.error('❌ Google Maps API error:', error);
  }
  
  // 3. Check Supabase Storage
  console.log('\nTesting Supabase Storage access...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Supabase Storage error:', error);
    } else {
      console.log(`✅ Supabase Storage access successful. Found ${buckets.length} buckets.`);
      
      // Check for restaurant-images bucket
      const restaurantImagesBucket = buckets.find(bucket => bucket.name === 'restaurant-images');
      if (restaurantImagesBucket) {
        console.log('✅ restaurant-images bucket exists.');
        
        // Try to list files in the bucket
        const { data: files, error: listError } = await supabase.storage
          .from('restaurant-images')
          .list('', {
            limit: 5
          });
          
        if (listError) {
          console.error('❌ Error listing files in restaurant-images bucket:', listError);
        } else {
          console.log(`✅ Successfully listed files in bucket. Found ${files.length} files/folders.`);
        }
      } else {
        console.log('❌ restaurant-images bucket does not exist.');
      }
    }
  } catch (error) {
    console.error('❌ Supabase Storage error:', error);
  }
  
  // 4. Check database schema
  console.log('\nChecking database schema...');
  try {
    // Check restaurants table
    const { data: restaurantSample, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1);
      
    if (restaurantError) {
      console.error('❌ Error querying restaurants table:', restaurantError);
    } else {
      if (restaurantSample && restaurantSample.length > 0) {
        const columns = Object.keys(restaurantSample[0]);
        console.log('✅ Restaurants table columns:', columns);
        
        // Check for image columns
        const hasExteriorImageUrl = columns.includes('exterior_image_url');
        const hasPhotoUrls = columns.includes('photo_urls');
        
        console.log(`Exterior image URL column: ${hasExteriorImageUrl ? '✅ Present' : '❌ Missing'}`);
        console.log(`Photo URLs column: ${hasPhotoUrls ? '✅ Present' : '❌ Missing'}`);
      } else {
        console.log('⚠️ Restaurants table is empty.');
      }
    }
    
    // Check soups table
    const { data: soupSample, error: soupError } = await supabase
      .from('soups')
      .select('*')
      .limit(1);
      
    if (soupError) {
      console.error('❌ Error querying soups table:', soupError);
    } else {
      if (soupSample && soupSample.length > 0) {
        const columns = Object.keys(soupSample[0]);
        console.log('✅ Soups table columns:', columns);
        
        // Check for image column
        const hasImageUrl = columns.includes('image_url');
        
        console.log(`Soup image URL column: ${hasImageUrl ? '✅ Present' : '❌ Missing'}`);
      } else {
        console.log('⚠️ Soups table is empty.');
      }
    }
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
  }
  
  console.log('\n=== Debug Complete ===');
}

// Run the debug function
checkConnections().catch(console.error);