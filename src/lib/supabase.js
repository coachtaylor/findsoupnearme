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
  location = null,
  soupTypes = [],
  rating = null,
  priceRange = null,
  limit = 20,
  offset = 0,
  sortBy = 'rating',
  sortOrder = 'desc',
  featured = false,
} = {}) {
  try {
    const normalizedSoupTypes = Array.isArray(soupTypes)
      ? soupTypes.filter(Boolean)
      : soupTypes
        ? [soupTypes]
        : [];

    console.log('Fetching restaurants with params:', { 
      city, state, location, soupTypes: normalizedSoupTypes, rating, priceRange, limit, offset, sortBy, sortOrder, featured 
    });

    let soupTypeRestaurantIds = [];
    if (normalizedSoupTypes.length > 0) {
      const { data: soupRows, error: soupError } = await supabase
        .from('soups')
        .select('restaurant_id')
        .in('soup_type', normalizedSoupTypes);

      if (soupError) {
        console.error('Error fetching soup-type matches from Supabase:', soupError);
        return { data: [], totalCount: 0 };
      }

      soupTypeRestaurantIds = Array.from(
        new Set(
          (soupRows || [])
            .map((row) => row?.restaurant_id)
            .filter(Boolean)
        )
      );

      if (soupTypeRestaurantIds.length === 0) {
        console.log('No restaurants matched requested soup types.');
        return { data: [], totalCount: 0 };
      }
    }
    
    // Build the base query for both count and data
    let baseQuery = supabase
      .from('restaurants')
      .select('id', { count: 'exact' });
    
    // Apply filters to base query
    if (city) {
      baseQuery = baseQuery.eq('city', city);
    }
    
    if (state) {
      baseQuery = baseQuery.eq('state', state);
    }
    
    // Handle location search - search across multiple fields
    if (location) {
      const locationLower = location.toLowerCase();
      baseQuery = baseQuery.or(
        `city.ilike.%${locationLower}%,state.ilike.%${locationLower}%,name.ilike.%${locationLower}%`
      );
    }
    
    if (rating) {
      baseQuery = baseQuery.gte('rating', rating);
    }
    
    if (priceRange) {
      if (Array.isArray(priceRange)) {
        baseQuery = baseQuery.in('price_range', priceRange);
      } else {
        baseQuery = baseQuery.eq('price_range', priceRange);
      }
    }
    
    if (featured) {
      baseQuery = baseQuery.eq('is_featured', true);
    }

    if (soupTypeRestaurantIds.length > 0) {
      baseQuery = baseQuery.in('id', soupTypeRestaurantIds);
    }
    
    // Get total count
    const { count, error: countError } = await baseQuery;
    
    if (countError) {
      console.error('Error getting count from Supabase:', countError);
      return { data: [], totalCount: 0 };
    }
    
    // Build the data query with limit and offset
    let dataQuery = supabase
      .from('restaurants')
      .select(`
        *,
        soups (*)
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply the same filters to data query
    if (city) {
      dataQuery = dataQuery.eq('city', city);
    }
    
    if (state) {
      dataQuery = dataQuery.eq('state', state);
    }
    
    if (location) {
      const locationLower = location.toLowerCase();
      dataQuery = dataQuery.or(
        `city.ilike.%${locationLower}%,state.ilike.%${locationLower}%,name.ilike.%${locationLower}%`
      );
    }
    
    if (rating) {
      dataQuery = dataQuery.gte('rating', rating);
    }
    
    if (priceRange) {
      if (Array.isArray(priceRange)) {
        dataQuery = dataQuery.in('price_range', priceRange);
      } else {
        dataQuery = dataQuery.eq('price_range', priceRange);
      }
    }
    
    if (featured) {
      dataQuery = dataQuery.eq('is_featured', true);
    }

    if (soupTypeRestaurantIds.length > 0) {
      dataQuery = dataQuery.in('id', soupTypeRestaurantIds);
    }
    
    // Add limit and offset for pagination
    if (limit) {
      dataQuery = dataQuery.limit(limit);
    }
    
    if (offset > 0) {
      dataQuery = dataQuery.range(offset, offset + limit - 1);
    }
    
    // Execute the data query
    const { data, error: dataError } = await dataQuery;
    
    if (dataError) {
      console.error('Error fetching restaurants from Supabase:', dataError);
      return { data: [], totalCount: count || 0 };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} restaurants from Supabase (total: ${count})`);
    return { data: data || [], totalCount: count || 0 };
  } catch (err) {
    console.error('Exception when fetching restaurants:', err);
    return { data: [], totalCount: 0 };
  }
}

// Other helper functions remain the same...
