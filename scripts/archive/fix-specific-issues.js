// Fix specific soup assignment issues

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSpecificIssues() {
  console.log('=== FIXING SPECIFIC SOUP ASSIGNMENT ISSUES ===\n');
  
  // Issue #1: Remove French Onion from Chengdu Bistro
  console.log('1. Fixing Chengdu Bistro...');
  const { data: chengdu } = await supabase
    .from('restaurants')
    .select('id')
    .eq('name', 'Chengdu Bistro 蓉小馆')
    .eq('city', 'Chicago')
    .single();
  
  if (chengdu) {
    const { error } = await supabase
      .from('soups')
      .delete()
      .eq('restaurant_id', chengdu.id)
      .eq('soup_type', 'French Onion');
    
    if (error) {
      console.error('  Error:', error);
    } else {
      console.log('  ✅ Removed French Onion from Chengdu Bistro');
    }
  }
  
  // Issue #2: Delete Gyu-Kaku Japanese BBQ (not a soup restaurant)
  console.log('\n2. Removing Gyu-Kaku Japanese BBQ (BBQ restaurant, not soup-focused)...');
  const { data: gyukaku } = await supabase
    .from('restaurants')
    .select('id')
    .eq('name', 'Gyu-Kaku Japanese BBQ')
    .eq('city', 'Miami')
    .single();
  
  if (gyukaku) {
    // Delete soups first
    await supabase
      .from('soups')
      .delete()
      .eq('restaurant_id', gyukaku.id);
    
    // Then delete restaurant
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', gyukaku.id);
    
    if (error) {
      console.error('  Error:', error);
    } else {
      console.log('  ✅ Removed Gyu-Kaku Japanese BBQ');
    }
  }
  
  // Issue #3: Harumama - No action needed, it's correct
  console.log('\n3. Harumama Noodles + Buns - No changes needed (Asian noodle restaurant is correct)');
  
  // Issue #4: Remove Chicken Noodle and Tomato from Frank's Noodle House
  console.log('\n4. Fixing Frank\'s Noodle House...');
  const { data: franks } = await supabase
    .from('restaurants')
    .select('id')
    .ilike('name', '%Frank%Noodle%')
    .eq('city', 'Portland')
    .single();
  
  if (franks) {
    const { error } = await supabase
      .from('soups')
      .delete()
      .eq('restaurant_id', franks.id)
      .in('soup_type', ['Chicken Noodle', 'Tomato']);
    
    if (error) {
      console.error('  Error:', error);
    } else {
      console.log('  ✅ Removed Chicken Noodle and Tomato from Frank\'s Noodle House');
    }
  }
  
  console.log('\n=== FIXES COMPLETE ===');
  console.log('\nRun this to verify:');
  console.log('  node cleanup-soup-assignments.js analyze');
}

fixSpecificIssues().catch(console.error);