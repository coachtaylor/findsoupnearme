import { createClient } from '@supabase/supabase-js';

// Get the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing! Please check your .env file.');
}

// Create the Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch data from Supabase with error handling
 * @param {string} table - The table name to query
 * @param {Object} options - Query options
 * @param {Object} options.filters - Key-value pairs for eq filters
 * @param {number} options.limit - Number of results to return
 * @param {string} options.orderBy - Column to order by
 * @param {boolean} options.ascending - Order direction
 * @param {Array} options.select - Columns to select
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export async function fetchFromSupabase(table, options = {}) {
  try {
    // Start with basic select
    let query = supabaseClient.from(table).select(
      options.select ? options.select.join(', ') : '*'
    );
    
    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    
    // Apply order if provided
    if (options.orderBy) {
      query = query.order(options.orderBy, { 
        ascending: options.ascending !== false 
      });
    }
    
    // Apply limit if provided
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Fetch a single item by its ID
 * @param {string} table - The table name
 * @param {string} id - The item ID
 * @param {Array} select - Optional columns to select
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function fetchById(table, id, select = null) {
  try {
    const query = supabaseClient
      .from(table)
      .select(select ? select.join(', ') : '*')
      .eq('id', id)
      .single();
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching ${table} by ID:`, error);
    return { data: null, error: error.message };
  }
}

/**
 * Fetch a single item by its slug
 * @param {string} table - The table name
 * @param {string} slug - The item slug
 * @param {Array} select - Optional columns to select
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export async function fetchBySlug(table, slug, select = null) {
  try {
    const query = supabaseClient
      .from(table)
      .select(select ? select.join(', ') : '*')
      .eq('slug', slug)
      .single();
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching ${table} by slug:`, error);
    return { data: null, error: error.message };
  }
}