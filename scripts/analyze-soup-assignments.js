// Analyze Soup Assignments Script
// This script examines how soup types are currently assigned to restaurants

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeRestaurant(restaurantName) {
  try {
    // Find the restaurant
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .ilike('name', `%${restaurantName}%`);
    
    if (restaurantError) throw restaurantError;
    
    if (!restaurants || restaurants.length === 0) {
      console.log(`No restaurant found matching: ${restaurantName}`);
      return;
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Found ${restaurants.length} restaurant(s):`);
    
    for (const restaurant of restaurants) {
      console.log(`\n${restaurant.name}`);
      console.log(`Location: ${restaurant.city}, ${restaurant.state}`);
      console.log(`Address: ${restaurant.address}`);
      console.log(`Website: ${restaurant.website || 'N/A'}`);
      console.log(`Google Place ID: ${restaurant.google_place_id || 'N/A'}`);
      
      // Get soups for this restaurant
      const { data: soups, error: soupError } = await supabase
        .from('soups')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (soupError) {
        console.log(`Error fetching soups: ${soupError.message}`);
        continue;
      }
      
      console.log(`\nSoups (${soups?.length || 0}):`);
      if (soups && soups.length > 0) {
        soups.forEach((soup, index) => {
          console.log(`  ${index + 1}. ${soup.name}`);
          console.log(`     Type: ${soup.soup_type}`);
          console.log(`     Description: ${soup.description}`);
          console.log(`     Price: ${soup.price ? `$${soup.price}` : 'N/A'}`);
        });
      } else {
        console.log('  No soups found');
      }
      
      // Analyze how these soups might have been assigned
      console.log(`\nDetection Analysis:`);
      console.log(`  Restaurant name contains 'soup': ${restaurant.name.toLowerCase().includes('soup')}`);
      console.log(`  Restaurant name contains 'bowl': ${restaurant.name.toLowerCase().includes('bowl')}`);
      
      // Check for cuisine indicators in name
      const cuisineKeywords = {
        'vietnamese': ['Pho', 'Bun Bo Hue'],
        'japanese': ['Ramen', 'Miso', 'Udon'],
        'chinese': ['Wonton', 'Hot and Sour'],
        'italian': ['Minestrone'],
        'french': ['French Onion'],
        'american': ['Chicken Noodle', 'Tomato', 'Clam Chowder']
      };
      
      for (const [cuisine, expectedSoups] of Object.entries(cuisineKeywords)) {
        if (restaurant.name.toLowerCase().includes(cuisine)) {
          console.log(`  Name suggests ${cuisine} cuisine -> Expected: ${expectedSoups.join(', ')}`);
        }
      }
      
      console.log(`\n${'='.repeat(60)}`);
    }
  } catch (error) {
    console.error('Error analyzing restaurant:', error);
  }
}

async function analyzeSoupDistribution() {
  try {
    console.log('\n=== SOUP TYPE DISTRIBUTION ANALYSIS ===\n');
    
    // Get all soups grouped by type
    const { data: soups, error } = await supabase
      .from('soups')
      .select('soup_type, restaurant_id');
    
    if (error) throw error;
    
    // Count occurrences
    const typeCount = {};
    soups.forEach(soup => {
      typeCount[soup.soup_type] = (typeCount[soup.soup_type] || 0) + 1;
    });
    
    // Sort by frequency
    const sorted = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1]);
    
    console.log('Top 20 Most Common Soup Types:');
    sorted.slice(0, 20).forEach(([type, count], index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${type.padEnd(25)} - ${count} restaurants`);
    });
    
    console.log(`\nTotal unique soup types: ${sorted.length}`);
    console.log(`Total soup entries: ${soups.length}`);
    
    // Find unusual combinations
    console.log('\n=== UNUSUAL SOUP ASSIGNMENTS ===\n');
    
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('id, name, city, state');
    
    if (restError) throw restError;
    
    const restaurantMap = new Map(restaurants.map(r => [r.id, r]));
    
    // Group soups by restaurant
    const soupsByRestaurant = {};
    soups.forEach(soup => {
      if (!soupsByRestaurant[soup.restaurant_id]) {
        soupsByRestaurant[soup.restaurant_id] = [];
      }
      soupsByRestaurant[soup.restaurant_id].push(soup.soup_type);
    });
    
    // Find restaurants with unusual soup type combinations
    for (const [restaurantId, soupTypes] of Object.entries(soupsByRestaurant)) {
      const restaurant = restaurantMap.get(restaurantId);
      if (!restaurant) continue;
      
      // Check for conflicting cuisine types
      const hasAsian = soupTypes.some(type => 
        ['Ramen', 'Pho', 'Miso', 'Wonton', 'Udon'].includes(type)
      );
      const hasWestern = soupTypes.some(type => 
        ['Chicken Noodle', 'Tomato', 'Clam Chowder'].includes(type)
      );
      
      if (hasAsian && hasWestern) {
        console.log(`⚠️  ${restaurant.name} (${restaurant.city}, ${restaurant.state})`);
        console.log(`   Has both Asian and Western soups: ${soupTypes.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing soup distribution:', error);
  }
}

// Main execution
const command = process.argv[2];
const restaurantName = process.argv[3];

if (command === 'restaurant' && restaurantName) {
  analyzeRestaurant(restaurantName);
} else if (command === 'distribution') {
  analyzeSoupDistribution();
} else {
  console.log('Usage:');
  console.log('  node analyze-soup-assignments.js restaurant "Restaurant Name"');
  console.log('  node analyze-soup-assignments.js distribution');
}