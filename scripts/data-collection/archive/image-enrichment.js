// Image Enrichment Script for FindSoupNearMe
// This script adds images to restaurant data in Supabase

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Directory of stock soup images organized by soup type
const STOCK_IMAGES_DIR = './data/stock-images';

// Create Supabase Storage bucket if it doesn't exist
async function createBucketIfNotExists() {
  const { data, error } = await supabase.storage.getBucket('restaurant-images');
  
  if (error && error.message.includes('does not exist')) {
    const { data, error: createError } = await supabase.storage.createBucket('restaurant-images', {
      public: true,
      fileSizeLimit: 5242880 // 5MB limit
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError);
      throw createError;
    }
    
    console.log('Created bucket: restaurant-images');
  } else if (error) {
    console.error('Error checking bucket:', error);
    throw error;
  }
}

// Get Street View image for a restaurant
async function getStreetViewImage(restaurant) {
  if (!restaurant.latitude || !restaurant.longitude) {
    console.log(`Missing coordinates for restaurant: ${restaurant.name}`);
    return null;
  }
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${restaurant.latitude},${restaurant.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  
  try {
    const response = await fetch(streetViewUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch street view image: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const fileName = `${restaurant.id}-exterior.jpg`;
    const filePath = path.join('./temp', fileName);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }
    
    // Save image to temp file
    fs.writeFileSync(filePath, buffer);
    
    // Upload to Supabase Storage
    const storageDir = `${restaurant.state}/${restaurant.city}/${restaurant.id}`;
    const { data, error } = await supabase.storage
      .from('restaurant-images')
      .upload(`${storageDir}/exterior.jpg`, fs.createReadStream(filePath), {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading image for ${restaurant.name}:`, error);
      return null;
    }
    
    // Clean up temp file
    fs.unlinkSync(filePath);
    
    // Return the public URL
    const { data: publicUrl } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(`${storageDir}/exterior.jpg`);
      
    return publicUrl.publicUrl;
  } catch (error) {
    console.error(`Error getting street view for ${restaurant.name}:`, error);
    return null;
  }
}

// Get stock soup images based on restaurant soup types
async function getStockSoupImages(restaurant, soupTypes) {
  const stockImageUrls = [];
  
  // If we have specific soup types for this restaurant, use those
  // Otherwise, use generic soup images
  const typesToUse = soupTypes.length > 0 ? soupTypes : ['generic'];
  
  for (const soupType of typesToUse) {
    // Look for stock images matching this soup type
    const typeDir = path.join(STOCK_IMAGES_DIR, soupType.toLowerCase().replace(/\s+/g, '-'));
    
    if (!fs.existsSync(typeDir)) {
      console.log(`No stock images for soup type: ${soupType}, using generic`);
      continue;
    }
    
    // Get a random image from this directory
    const files = fs.readdirSync(typeDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
    );
    
    if (files.length === 0) continue;
    
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const filePath = path.join(typeDir, randomFile);
    
    // Upload to Supabase Storage
    const storageDir = `${restaurant.state}/${restaurant.city}/${restaurant.id}/soups`;
    const fileName = `${soupType.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('restaurant-images')
      .upload(`${storageDir}/${fileName}`, fs.createReadStream(filePath), {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (error) {
      console.error(`Error uploading soup image for ${restaurant.name}:`, error);
      continue;
    }
    
    // Get the public URL
    const { data: publicUrl } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(`${storageDir}/${fileName}`);
      
    stockImageUrls.push(publicUrl.publicUrl);
  }
  
  return stockImageUrls;
}

// Get soup types for a restaurant
async function getSoupTypesForRestaurant(restaurantId) {
  const { data, error } = await supabase
    .from('soups')
    .select('soup_type')
    .eq('restaurant_id', restaurantId);
    
  if (error) {
    console.error(`Error getting soup types for restaurant ${restaurantId}:`, error);
    return [];
  }
  
  return data.map(soup => soup.soup_type);
}

// Update restaurant with image URLs
async function updateRestaurantImages(restaurant, exteriorUrl, soupImageUrls) {
  // First, check if the restaurant has an images field, if not, add it
  const { data, error } = await supabase
    .from('restaurants')
    .update({
      exterior_image_url: exteriorUrl,
      soup_image_urls: soupImageUrls
    })
    .eq('id', restaurant.id);
    
  if (error) {
    console.error(`Error updating images for ${restaurant.name}:`, error);
    return false;
  }
  
  return true;
}

// Main function to enrich all restaurants with images
async function enrichAllRestaurantsWithImages() {
  try {
    // Create storage bucket if needed
    await createBucketIfNotExists();
    
    // Get all restaurants without images
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .is('exterior_image_url', null);
      
    if (error) {
      throw error;
    }
    
    console.log(`Found ${restaurants.length} restaurants without images`);
    
    // Process each restaurant
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      console.log(`Processing ${i+1}/${restaurants.length}: ${restaurant.name}`);
      
      // Get exterior image
      const exteriorUrl = await getStreetViewImage(restaurant);
      
      // Get soup types for this restaurant
      const soupTypes = await getSoupTypesForRestaurant(restaurant.id);
      
      // Get soup images
      const soupImageUrls = await getStockSoupImages(restaurant, soupTypes);
      
      // Update restaurant with image URLs
      const updated = await updateRestaurantImages(restaurant, exteriorUrl, soupImageUrls);
      
      if (updated) {
        console.log(`✅ Updated images for ${restaurant.name}`);
      } else {
        console.log(`❌ Failed to update images for ${restaurant.name}`);
      }
      
      // Sleep to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Image enrichment complete!');
  } catch (error) {
    console.error('Error in image enrichment process:', error);
  }
}

// Download and organize stock images for soup types
async function downloadStockImages() {
  // This function would download free stock images for different soup types
  // For production, you might want to use a stock photo API or manually curate images
  console.log('This function would download stock images for different soup types');
  console.log('For production, manually curate a collection of soup type images');
}

// Run the main function
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'download-stock':
      await downloadStockImages();
      break;
    case 'enrich':
      await enrichAllRestaurantsWithImages();
      break;
    default:
      console.log('Please specify a command: download-stock or enrich');
  }
}

main().catch(console.error);