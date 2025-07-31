// Test script for Google Maps API
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Get the API key from environment variables
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

// Check for Claude/Anthropic API key
const claudeKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
const hasClaudeKey = !!claudeKey;

// Mask the API key for display (security best practice)
const maskedKey = apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'undefined';
console.log(`Using Google Maps API key: ${maskedKey}`);
console.log(`Claude/Anthropic API key available: ${hasClaudeKey ? 'Yes' : 'No'}`);


// Simple test function for the Places API
async function testPlacesAPI() {
  try {
    console.log('Testing Google Places API...');
    
    // Use a simple search query
    const query = 'restaurants in Chicago';
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    
    console.log(`Sending request to: ${url.replace(apiKey, 'YOUR_API_KEY')}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\nAPI Response Status:', data.status);
    
    if (data.status === 'OK') {
      console.log('✅ API test successful!');
      console.log(`Found ${data.results.length} results`);
      console.log('First result:', data.results[0].name);
    } else {
      console.log('❌ API test failed with status:', data.status);
      console.log('Error message:', data.error_message || 'No error message provided');
    }
  } catch (error) {
    console.error('Error testing Places API:', error);
  }
}

// Test function for the Geocoding API
async function testGeocodingAPI() {
  try {
    console.log('\nTesting Google Geocoding API...');
    
    const address = 'Chicago, IL';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    console.log(`Sending request to: ${url.replace(apiKey, 'YOUR_API_KEY')}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response Status:', data.status);
    
    if (data.status === 'OK') {
      console.log('✅ API test successful!');
      console.log('Location:', data.results[0].formatted_address);
      console.log('Coordinates:', data.results[0].geometry.location);
    } else {
      console.log('❌ API test failed with status:', data.status);
      console.log('Error message:', data.error_message || 'No error message provided');
    }
  } catch (error) {
    console.error('Error testing Geocoding API:', error);
  }
}

// Test function for the Street View API
async function testStreetViewAPI() {
  try {
    console.log('\nTesting Google Street View API...');
    
    // Chicago coordinates
    const lat = 41.8781;
    const lng = -87.6298;
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${apiKey}`;
    
    console.log(`Sending request to: ${url.replace(apiKey, 'YOUR_API_KEY')}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API Response Status:', data.status);
    
    if (data.status === 'OK') {
      console.log('✅ API test successful!');
      console.log('Street View available at these coordinates');
    } else {
      console.log('❌ API test failed with status:', data.status);
      console.log('Error message:', data.error_message || 'No error message provided');
    }
  } catch (error) {
    console.error('Error testing Street View API:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('==== GOOGLE MAPS API TEST ====\n');
  
  if (!apiKey) {
    console.error('❌ ERROR: No Google Maps API key found in environment variables.');
    console.error('Please make sure GOOGLE_MAPS_API_KEY is set in your .env file.');
    return;
  }
  
  await testPlacesAPI();
  await testGeocodingAPI();
  await testStreetViewAPI();
  
  console.log('\n==== TEST COMPLETE ====');
}

runAllTests();