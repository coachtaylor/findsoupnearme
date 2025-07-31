// scripts/data-migration/process-all-cities.js
const { execSync } = require('child_process');
const path = require('path');

// List of cities to process
const cities = [
  // Skip New York since we've already done it
  // { name: 'New York', state: 'NY' },
  // Skip Los Angeles if you've already done it
  // { name: 'Los Angeles', state: 'CA' },
  { name: 'Chicago', state: 'IL' },
  { name: 'San Francisco', state: 'CA' },
  { name: 'Seattle', state: 'WA' },
  { name: 'Dallas', state: 'TX' },
  { name: 'Miami', state: 'FL' },
  { name: 'Philadelphia', state: 'PA' },
  { name: 'San Diego', state: 'CA' },
  { name: 'Austin', state: 'TX' },
  { name: 'Phoenix', state: 'AZ' }
];

// Process each city
async function processCities() {
  const dataDir = path.resolve(process.cwd(), 'data');
  
  for (const city of cities) {
    const safeCityName = city.name.toLowerCase().replace(/\s+/g, '');
    const safeStateName = city.state.toLowerCase();
    const rawFile = path.join(dataDir, 'raw', `${safeCityName}_${safeStateName}.json`);
    const enrichedFile = path.join(dataDir, 'enriched', `${safeCityName}_${safeStateName}.json`);
    
    try {
      console.log(`\n\n=============================================`);
      console.log(`Processing ${city.name}, ${city.state}...`);
      
      // Step 1: Scrape data
      console.log(`\nScraping data...`);
      execSync(`node scripts/data-collection/scrape-google-maps.js --city="${city.name}" --state="${city.state}" --output="${rawFile}" --limit=25`, { stdio: 'inherit' });
      
      // Step 2: Enrich data
      console.log(`\nEnriching data...`);
      execSync(`node scripts/data-collection/enrich-data.js --input="${rawFile}" --output="${enrichedFile}"`, { stdio: 'inherit' });
      
      // Step 3: Import data
      console.log(`\nImporting data...`);
      execSync(`node scripts/data-migration/import-to-supabase.js --input="${enrichedFile}"`, { stdio: 'inherit' });
      
      console.log(`\nCompleted processing for ${city.name}, ${city.state}`);
    } catch (error) {
      console.error(`\nError processing ${city.name}, ${city.state}:`, error.message);
      // Continue with next city instead of stopping
    }
  }
  
  console.log('\nAll cities have been processed!');
}

processCities();