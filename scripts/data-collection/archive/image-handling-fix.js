// Test script for image handling
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Test image URL (Street View of Chicago)
const TEST_IMAGE_URL = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=41.8781,-87.6298&key=${GOOGLE_MAPS_API_KEY}`;

// Create storage bucket if it doesn&apos;t exist
async function createBucketIfNotExists(bucketName = 'restaurant-images') {
  try {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error && error.message.includes('does not exist')) {
      console.log(`Creating bucket: ${bucketName}`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB limit
      });
      
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`✅ Created bucket: ${bucketName}`);
      return true;
    } else if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      return false;
    } else {
      console.log(`✅ Bucket ${bucketName} already exists`);
      return true;
    }
  } catch (error) {
    console.error(`Error with bucket ${bucketName}:`, error);
    return false;
  }
}

// Method 1: Using fetch with arrayBuffer (modern approach)
async function fetchAndUploadImageModern(imageUrl, uploadPath, bucketName = 'restaurant-images') {
  console.log(`Trying modern fetch method for: ${imageUrl}`);
  
  try {
    // Use fetch with duplex option
    const response = await fetch(imageUrl, {
      method: 'GET',
      duplex: 'half'  // Required for Node.js 18+
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Get the image as an array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`✅ Successfully fetched image (${buffer.length} bytes)`);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading image to ${uploadPath}:`, error);
      return null;
    }
    
    console.log(`✅ Successfully uploaded image to ${uploadPath}`);
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error in modern fetch method:`, error);
    return null;
  }
}

// Method 2: Alternative approach using a temporary file
async function fetchAndUploadImageWithTempFile(imageUrl, uploadPath, bucketName = 'restaurant-images') {
  console.log(`Trying temp file method for: ${imageUrl}`);
  
  try {
    // Make sure temp directory exists
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }
    
    // Create a temp file path
    const tempFilePath = `./temp/temp_image_${Date.now()}.jpg`;
    
    // Use fetch with duplex option
    const response = await fetch(imageUrl, {
      method: 'GET',
      duplex: 'half'  // Required for Node.js 18+
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Get the image as an array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save to temp file
    fs.writeFileSync(tempFilePath, buffer);
    console.log(`✅ Saved image to temp file (${buffer.length} bytes)`);
    
    // Read the file as a stream
    const fileStream = fs.createReadStream(tempFilePath);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, fileStream, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    if (error) {
      console.error(`Error uploading image to ${uploadPath}:`, error);
      return null;
    }
    
    console.log(`✅ Successfully uploaded image to ${uploadPath}`);
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error in temp file method:`, error);
    return null;
  }
}

// Method 3: Direct buffer upload
async function fetchAndUploadImageDirectBuffer(imageUrl, uploadPath, bucketName = 'restaurant-images') {
  console.log(`Trying direct buffer method for: ${imageUrl}`);
  
  try {
    // Use fetch with duplex option
    const response = await fetch(imageUrl, {
      method: 'GET',
      duplex: 'half'  // Required for Node.js 18+
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    // Get the image as an array buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`✅ Successfully fetched image (${buffer.length} bytes)`);
    
    // Upload directly using the buffer
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uploadPath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading image to ${uploadPath}:`, error);
      return null;
    }
    
    console.log(`✅ Successfully uploaded image to ${uploadPath}`);
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadPath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error(`Error in direct buffer method:`, error);
    return null;
  }
}

// Test all methods
async function testImageMethods() {
  console.log('==== TESTING IMAGE HANDLING METHODS ====');
  
  // Make sure the bucket exists
  const bucketExists = await createBucketIfNotExists();
  if (!bucketExists) {
    console.error('Failed to create or verify bucket. Aborting tests.');
    return;
  }
  
  // Test paths
  const testPath1 = `test/method1_${Date.now()}.jpg`;
  const testPath2 = `test/method2_${Date.now()}.jpg`;
  const testPath3 = `test/method3_${Date.now()}.jpg`;
  
  console.log('\n1. Testing Modern Fetch Method:');
  const url1 = await fetchAndUploadImageModern(TEST_IMAGE_URL, testPath1);
  console.log('Result URL:', url1 || 'FAILED');
  
  console.log('\n2. Testing Temp File Method:');
  const url2 = await fetchAndUploadImageWithTempFile(TEST_IMAGE_URL, testPath2);
  console.log('Result URL:', url2 || 'FAILED');
  
  console.log('\n3. Testing Direct Buffer Method:');
  const url3 = await fetchAndUploadImageDirectBuffer(TEST_IMAGE_URL, testPath3);
  console.log('Result URL:', url3 || 'FAILED');
  
  console.log('\n==== TEST SUMMARY ====');
  console.log('Method 1 (Modern Fetch):', url1 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Method 2 (Temp File):', url2 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Method 3 (Direct Buffer):', url3 ? '✅ SUCCESS' : '❌ FAILED');
  
  // Determine best method
  if (url1) {
    console.log('\nRecommendation: Use Method 1 (Modern Fetch)');
  } else if (url2) {
    console.log('\nRecommendation: Use Method 2 (Temp File)');
  } else if (url3) {
    console.log('\nRecommendation: Use Method 3 (Direct Buffer)');
  } else {
    console.log('\n❌ All methods failed. Further debugging required.');
  }
}

// Run the tests
testImageMethods();