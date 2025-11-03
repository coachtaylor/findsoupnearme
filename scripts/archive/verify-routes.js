// scripts/verify-routes.js
// A utility script to test API endpoints and critical routes

// Run with: node scripts/verify-routes.js
// This script will check if key API endpoints are responding correctly

import fetch from 'node-fetch';
import chalk from 'chalk';

// URLs to check (add your local development URL)
const BASE_URL = 'http://localhost:3000';

// List of API endpoints to check
const API_ENDPOINTS = [
  '/api/restaurants',
  '/api/restaurants?city=New%20York&state=NY',
  '/api/search?query=soup',
  '/api/test-supabase',
];

// List of important pages to check
const IMPORTANT_PAGES = [
  '/',
  '/restaurants',
  '/ny/new-york/restaurants',
  // Add more important routes here
];

// Function to test a URL and report its status
async function testUrl(url) {
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    const statusColor = response.ok ? chalk.green : chalk.red;
    const status = `${response.status} ${response.statusText}`;
    
    console.log(`${chalk.blue(url)} - ${statusColor(status)}`);
    
    if (response.ok && url.startsWith('/api/')) {
      // For API endpoints, we want to check the response structure
      try {
        const data = await response.json();
        
        if (url === '/api/restaurants') {
          console.log(`  - Found ${chalk.yellow(data.restaurants?.length || 0)} restaurants`);
          console.log(`  - Total count: ${chalk.yellow(data.totalCount || 0)}`);
        } else if (url === '/api/search') {
          console.log(`  - Found ${chalk.yellow(data.restaurants?.length || 0)} search results`);
        } else if (url === '/api/test-supabase') {
          console.log(`  - Supabase connection: ${chalk.yellow(data.success ? 'OK' : 'FAILED')}`);
        }
      } catch (jsonError) {
        console.log(`  - ${chalk.red('Error parsing JSON response:')} ${jsonError.message}`);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.log(`${chalk.blue(url)} - ${chalk.red('ERROR:')} ${error.message}`);
    return false;
  }
}

// Main function to run the tests
async function runTests() {
  console.log(chalk.bold('\nTesting API Endpoints:'));
  console.log('======================');
  
  let apiSuccessCount = 0;
  for (const endpoint of API_ENDPOINTS) {
    if (await testUrl(endpoint)) {
      apiSuccessCount++;
    }
  }
  
  console.log(chalk.bold('\nTesting Important Pages:'));
  console.log('======================');
  
  let pageSuccessCount = 0;
  for (const page of IMPORTANT_PAGES) {
    if (await testUrl(page)) {
      pageSuccessCount++;
    }
  }
  
  // Report summary
  console.log(chalk.bold('\nTest Summary:'));
  console.log('======================');
  console.log(`API Endpoints: ${chalk.blue(apiSuccessCount)}/${chalk.blue(API_ENDPOINTS.length)} successful`);
  console.log(`Important Pages: ${chalk.blue(pageSuccessCount)}/${chalk.blue(IMPORTANT_PAGES.length)} successful`);
  
  const totalSuccess = apiSuccessCount + pageSuccessCount;
  const totalTests = API_ENDPOINTS.length + IMPORTANT_PAGES.length;
  
  if (totalSuccess === totalTests) {
    console.log(chalk.green('\n✅ All tests passed!'));
  } else {
    console.log(chalk.yellow(`\n⚠️ ${totalSuccess}/${totalTests} tests passed. Some routes may need attention.`));
  }
}

// Run the tests
console.log(chalk.bold.blue('FindSoupNearMe Route Verification Tool'));
console.log(chalk.bold.blue('====================================='));
console.log(`Testing against: ${chalk.yellow(BASE_URL)}`);

runTests().catch(error => {
  console.error(chalk.red('Error running tests:'), error);
});