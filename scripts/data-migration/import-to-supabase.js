// scripts/data-migration/import-to-supabase.js
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('input', {
    description: 'Input JSON file with enriched restaurant data',
    type: 'string',
    demandOption: true
  })
  .help()
  .alias('help', 'h')
  .argv;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData(filePath) {
  try {
    console.log(`Importing data from ${filePath}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    console.log(`Found ${data.length} restaurants to import`);
    
    // Process each restaurant
    for (const restaurant of data) {
      try {
        // Extract restaurant data
        const restaurantData = {
          name: restaurant.name,
          slug: restaurant.slug || restaurant.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: restaurant.generatedDescription || '',
          address: restaurant.streetAddress || restaurant.fullAddress || '',
          city: restaurant.city,
          state: restaurant.state,
          zip_code: restaurant.zipCode || '',
          latitude: restaurant.latitude || 0,
          longitude: restaurant.longitude || 0,
          phone: restaurant.phoneNumber || '',
          website: restaurant.website || '',
          hours_of_operation: JSON.stringify(restaurant.openingHours || []),
          price_range: restaurant.priceLevel ? '$'.repeat(restaurant.priceLevel) : '$',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subscription_tier: 'basic',
          is_verified: false
        };
        
        // Insert restaurant
        const { data: insertedRestaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .insert(restaurantData)
          .select()
          .single();
        
        if (restaurantError) {
          console.error(`Error inserting restaurant ${restaurant.name}:`, restaurantError);
          continue; // This will skip to the next iteration of the for loop
        }
        
        console.log(`Inserted restaurant: ${restaurant.name}`);
        
        // Extract and insert soups
        if (restaurant.detectedSoupTypes && restaurant.detectedSoupTypes.length > 0) {
          for (const soupType of restaurant.detectedSoupTypes) {
            const soupData = {
              restaurant_id: insertedRestaurant.id,
              name: `${soupType} Soup`,
              description: `${restaurant.name}'s ${soupType} soup`,
              soup_type: soupType,
              dietary_info: [],
              is_seasonal: false,
              available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            };
            
            const { error: soupError } = await supabase
              .from('soups')
              .insert(soupData);
            
            if (soupError) {
              console.error(`Error inserting soup for ${restaurant.name}:`, soupError);
            } else {
              console.log(`Inserted ${soupType} soup for ${restaurant.name}`);
            }
          }
        } else {
          console.log(`No specific soup types detected for ${restaurant.name}; skipping soup insertion.`);
        }
      } catch (error) {
        console.error(`Error processing restaurant ${restaurant.name}:`, error);
        // Continue with next restaurant
      }
    }
    
    console.log(`Successfully imported data from ${filePath}`);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

// Main function
async function main() {
  await importData(argv.input);
}

// Run the main function
main();
