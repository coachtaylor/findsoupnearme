// Quick script to delete incorrect Matzo Ball soup assignments

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteMatzoBalSoups() {
  console.log('Deleting all Matzo Ball soups...');
  
  const { data, error, count } = await supabase
    .from('soups')
    .delete()
    .eq('soup_type', 'Matzo Ball')
    .select('id', { count: 'exact' });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`✅ Deleted ${count} Matzo Ball soups`);
  }
}

deleteMatzoBalSoups().catch(console.error);