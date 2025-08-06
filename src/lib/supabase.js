// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client for interacting with the database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Improved error handling for missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using dummy client for development.');
}

// Always create a real client if possible, fall back to dummy if necessary
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? createDummyClient()
  : createClient(supabaseUrl, supabaseAnonKey);

// Create a dummy client for development when env vars are missing
function createDummyClient() {
  console.log('Creating dummy Supabase client for development');
  
  // This dummy client mimics the real Supabase client's chainable methods
  const dummyResponse = { data: [], error: null };
  
  const dummyQuery = {
    eq: () => dummyQuery,
    neq: () => dummyQuery,
    gt: () => dummyQuery,
    gte: () => dummyQuery,
    lt: () => dummyQuery,
    lte: () => dummyQuery,
    like: () => dummyQuery,
    ilike: () => dummyQuery,
    is: () => dummyQuery,
    in: () => dummyQuery,
    contains: () => dummyQuery,
    containedBy: () => dummyQuery,
    rangeGt: () => dummyQuery,
    rangeGte: () => dummyQuery,
    rangeLt: () => dummyQuery,
    rangeLte: () => dummyQuery,
    rangeAdjacent: () => dummyQuery,
    overlaps: () => dummyQuery,
    textSearch: () => dummyQuery,
    filter: () => dummyQuery,
    not: () => dummyQuery,
    or: () => dummyQuery,
    and: () => dummyQuery,
    order: () => dummyQuery,
    limit: () => dummyQuery,
    range: () => dummyQuery,
    single: async () => dummyResponse,
    maybeSingle: async () => dummyResponse,
    select: () => dummyQuery,
    insert: async () => dummyResponse,
    upsert: async () => dummyResponse,
    update: async () => dummyResponse,
    delete: async () => dummyResponse,
    then: (callback) => Promise.resolve(dummyResponse).then(callback),
  };
  
  return {
    from: () => dummyQuery,
    rpc: () => dummyQuery,
    auth: {
      signIn: async () => ({ user: null, session: null, error: null }),
      signOut: async () => ({ error: null }),
      session: () => null,
      user: () => null,
      onAuthStateChange: () => ({ data: null, error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        download: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ publicURL: '' }),
        list: async () => ({ data: [], error: null }),
      }),
    },
  };
}

// Helper functions for common database operations
export async function getRestaurants({
  city = null,
  state = null,
  soupType = null,
  rating = null,
  priceRange = null,
  limit = 20,
  offset = 0,
  sortBy = 'rating',
  sortOrder = 'desc',
  featured = false,
} = {}) {
  try {
    console.log('Fetching restaurants with params:', { 
      city, state, soupType, rating, priceRange, limit, offset, sortBy, sortOrder, featured 
    });
    
    // Start building the query
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        soups (*),
        reviews (*)
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .limit(limit);
    
    // Add range/offset for pagination
    if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    // Apply filters if provided
    if (city) {
      query = query.eq('city', city);
    }
    
    if (state) {
      query = query.eq('state', state);
    }
    
    if (rating) {
      query = query.gte('rating', rating);
    }
    
    if (priceRange) {
      if (Array.isArray(priceRange)) {
        query = query.in('price_range', priceRange);
      } else {
        query = query.eq('price_range', priceRange);
      }
    }
    
    if (featured) {
      query = query.eq('is_featured', true);
    }

    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching restaurants from Supabase:', error);
      // Return empty array on error
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} restaurants from Supabase`);
    return data || [];
  } catch (err) {
    console.error('Exception when fetching restaurants:', err);
    return [];
  }
}

// Other helper functions remain the same...