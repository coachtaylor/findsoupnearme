// Setup script to create Supabase Storage bucket for restaurant images
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createStorageBucket() {
  try {
    console.log('Creating restaurant-images storage bucket...');
    
    // Check if bucket already exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === 'restaurant-images');
    
    if (bucketExists) {
      console.log('✅ Bucket "restaurant-images" already exists');
      return;
    }
    
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('restaurant-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });
    
    if (error) {
      console.error('Error creating bucket:', error);
      return;
    }
    
    console.log('✅ Successfully created restaurant-images bucket');
    console.log('Bucket details:', data);
    
  } catch (error) {
    console.error('Error in createStorageBucket:', error);
  }
}

// Run the setup
createStorageBucket(); 