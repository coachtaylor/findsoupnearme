// Database Cleanup Script - Fix Soup Assignments
// This script re-analyzes restaurants and updates soup types with improved detection

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { detectSoupTypesEnhanced, validateSoupAssignments } from './improved-soup-detection.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Analyze and report on current soup assignments
 */
async function analyzeCurrentAssignments() {
  console.log('=== ANALYZING CURRENT SOUP ASSIGNMENTS ===\n');
  
  try {
    // Get all restaurants with their soups
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restError) throw restError;
    
    console.log(`Found ${restaurants.length} restaurants\n`);
    
    const issues = [];
    let totalSoups = 0;
    
    for (const restaurant of restaurants) {
      const { data: soups, error: soupError } = await supabase
        .from('soups')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (soupError) continue;
      
      totalSoups += soups.length;
      
      // Validate current assignments
      const soupTypes = soups.map(s => s.soup_type);
      const validation = validateSoupAssignments(restaurant, soupTypes);
      
      if (!validation.isValid) {
        issues.push({
          restaurant: restaurant.name,
          city: restaurant.city,
          state: restaurant.state,
          currentSoups: soupTypes,
          warnings: validation.warnings
        });
      }
    }
    
    console.log(`Total soups in database: ${totalSoups}`);
    console.log(`Restaurants with potential issues: ${issues.length}\n`);
    
    if (issues.length > 0) {
      console.log('DETECTED ISSUES:\n');
      issues.slice(0, 20).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.restaurant} (${issue.city}, ${issue.state})`);
        console.log(`   Current soups: ${issue.currentSoups.join(', ')}`);
        console.log(`   Warnings: ${issue.warnings.join('; ')}`);
        console.log('');
      });
      
      if (issues.length > 20) {
        console.log(`... and ${issues.length - 20} more issues\n`);
      }
    }
    
    return issues;
  } catch (error) {
    console.error('Error analyzing assignments:', error);
    return [];
  }
}

/**
 * Fix soup assignments for a single restaurant
 */
async function fixRestaurantSoups(restaurant, dryRun = true) {
  try {
    // Get current soups
    const { data: currentSoups, error: fetchError } = await supabase
      .from('soups')
      .select('*')
      .eq('restaurant_id', restaurant.id);
    
    if (fetchError) throw fetchError;
    
    // Detect improved soup types
    const newSoupTypes = detectSoupTypesEnhanced(restaurant);
    
    // Compare with current
    const currentTypes = currentSoups.map(s => s.soup_type);
    const hasChanged = JSON.stringify(currentTypes.sort()) !== JSON.stringify(newSoupTypes.sort());
    
    if (hasChanged) {
      console.log(`\n📝 ${restaurant.name} (${restaurant.city}, ${restaurant.state})`);
      console.log(`   OLD: ${currentTypes.join(', ') || 'None'}`);
      console.log(`   NEW: ${newSoupTypes.join(', ') || 'None'}`);
      
      if (!dryRun) {
        // Delete old soups
        const { error: deleteError } = await supabase
          .from('soups')
          .delete()
          .eq('restaurant_id', restaurant.id);
        
        if (deleteError) throw deleteError;
        
        // Insert new soups
        if (newSoupTypes.length > 0) {
          const soupsToInsert = newSoupTypes.map(soupType => ({
            id: uuidv4(),
            restaurant_id: restaurant.id,
            name: soupType,
            description: `A delicious ${soupType.toLowerCase()}.`,
            price: 8 + Math.floor(Math.random() * 7), // $8-$14
            soup_type: soupType,
            dietary_info: [],
            is_seasonal: false,
            available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          }));
          
          const { error: insertError } = await supabase
            .from('soups')
            .insert(soupsToInsert);
          
          if (insertError) throw insertError;
          
          console.log(`   ✅ Updated successfully`);
        }
      } else {
        console.log(`   [DRY RUN - No changes made]`);
      }
      
      return { changed: true, restaurant: restaurant.name };
    }
    
    return { changed: false };
  } catch (error) {
    console.error(`Error fixing soups for ${restaurant.name}:`, error);
    return { changed: false, error: error.message };
  }
}

/**
 * Fix all restaurants in the database
 */
async function fixAllRestaurants(dryRun = true) {
  console.log('\n=== FIXING SOUP ASSIGNMENTS ===\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (will update database)'}\n`);
  
  if (!dryRun) {
    console.log('⚠️  WARNING: This will modify the database!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  try {
    // Get all restaurants
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('*')
      .order('name');
    
    if (restError) throw restError;
    
    console.log(`Processing ${restaurants.length} restaurants...\n`);
    
    let changedCount = 0;
    let errorCount = 0;
    const changes = [];
    
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant = restaurants[i];
      
      // Progress indicator
      if (i % 10 === 0) {
        console.log(`Progress: ${i + 1}/${restaurants.length}`);
      }
      
      const result = await fixRestaurantSoups(restaurant, dryRun);
      
      if (result.changed) {
        changedCount++;
        changes.push(result.restaurant);
      }
      
      if (result.error) {
        errorCount++;
      }
      
      // Small delay to avoid overwhelming the database
      if (!dryRun) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('\n=== SUMMARY ===\n');
    console.log(`Total restaurants processed: ${restaurants.length}`);
    console.log(`Restaurants with changes: ${changedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    
    if (changes.length > 0 && changes.length <= 30) {
      console.log('\nRestaurants updated:');
      changes.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
      });
    }
    
    if (dryRun) {
      console.log('\n✓ This was a dry run. Run with --live flag to apply changes.');
    } else {
      console.log('\n✓ Database has been updated!');
    }
  } catch (error) {
    console.error('Error fixing restaurants:', error);
  }
}

/**
 * Fix a specific restaurant by name
 */
async function fixSpecificRestaurant(restaurantName, dryRun = true) {
  console.log(`\n=== FIXING: ${restaurantName} ===\n`);
  
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .ilike('name', `%${restaurantName}%`);
    
    if (error) throw error;
    
    if (!restaurants || restaurants.length === 0) {
      console.log(`❌ No restaurant found matching: ${restaurantName}`);
      return;
    }
    
    if (restaurants.length > 1) {
      console.log(`Found ${restaurants.length} matching restaurants:`);
      restaurants.forEach((r, index) => {
        console.log(`  ${index + 1}. ${r.name} (${r.city}, ${r.state})`);
      });
      console.log('\nPlease be more specific.');
      return;
    }
    
    const restaurant = restaurants[0];
    await fixRestaurantSoups(restaurant, dryRun);
    
    if (!dryRun) {
      console.log('\n✓ Restaurant updated successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Main execution
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

const dryRun = !process.argv.includes('--live');

async function main() {
  if (command === 'analyze') {
    await analyzeCurrentAssignments();
  } else if (command === 'fix-all') {
    await fixAllRestaurants(dryRun);
  } else if (command === 'fix-restaurant' && arg1) {
    await fixSpecificRestaurant(arg1, dryRun);
  } else {
    console.log('Usage:');
    console.log('  node cleanup-soup-assignments.js analyze');
    console.log('  node cleanup-soup-assignments.js fix-all [--live]');
    console.log('  node cleanup-soup-assignments.js fix-restaurant "Restaurant Name" [--live]');
    console.log('');
    console.log('Options:');
    console.log('  --live    Actually modify the database (default is dry run)');
    console.log('');
    console.log('Examples:');
    console.log('  node cleanup-soup-assignments.js analyze');
    console.log('  node cleanup-soup-assignments.js fix-restaurant "The Soup Bowl" --live');
    console.log('  node cleanup-soup-assignments.js fix-all --live');
  }
}

main().catch(console.error);