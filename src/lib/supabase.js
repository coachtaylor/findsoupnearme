// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';
import { LAUNCH_CITIES, isLaunchCity } from './launch-cities';

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
    const normalizedSoupTypes = (Array.isArray(soupTypes) ? soupTypes : soupTypes ? [soupTypes] : [])
      .filter((type) => typeof type === 'string' && type.trim().length > 0)
      .map((type) => type.trim());

    console.log('Fetching restaurants with params:', { 
      city, state, location, soupTypes: normalizedSoupTypes, rating, priceRange, limit, offset, sortBy, sortOrder, featured 
    });

    let soupTypeRestaurantIds = [];
    if (normalizedSoupTypes.length > 0) {
      const soupTypeVariants = Array.from(
        new Set(
          normalizedSoupTypes.flatMap((type) => {
            const trimmed = type.trim();
            const lower = trimmed.toLowerCase();
            const upper = trimmed.toUpperCase();
            const title = trimmed
              .split(' ')
              .filter(Boolean)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            return [trimmed, lower, upper, title];
          })
        )
      );

      const { data: soupRows, error: soupError } = await supabase
        .from('soups')
        .select('restaurant_id')
        .in('soup_type', soupTypeVariants);

      if (soupError) {
        console.error('Error fetching soup-type matches from Supabase:', soupError);
        return { data: [], totalCount: 0, soupTypeFilterApplied: normalizedSoupTypes.length > 0 };
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
        return { data: [], totalCount: 0, soupTypeFilterApplied: true };
      }
    }

    const restrictToIds = soupTypeRestaurantIds.length > 0 ? soupTypeRestaurantIds : null;
    const soupTypeFilterApplied = !!restrictToIds;

    const applyFilters = (query) => {
      if (restrictToIds) {
        query = query.in('id', restrictToIds);
      }

      // Launch city filtering: Only show restaurants from launch cities
      // Build OR condition for launch cities
      const launchCityConditions = LAUNCH_CITIES.map(
        (lc) => `(city.eq.${lc.name},state.eq.${lc.state})`
      ).join(',');
      
      // Apply launch city filter first
      query = query.or(launchCityConditions);

      // Then apply additional filters
      if (city) {
        // Validate that the requested city is a launch city
        const cityState = state || LAUNCH_CITIES.find(lc => 
          lc.name.toLowerCase() === city.toLowerCase()
        )?.state;
        if (cityState && isLaunchCity(city, cityState)) {
          query = query.eq('city', city);
        }
        // If city is not a launch city, the launch city filter will already exclude it
      }

      if (state) {
        // Validate that the requested state has launch cities
        const hasLaunchCities = LAUNCH_CITIES.some(lc => lc.state === state.toUpperCase());
        if (hasLaunchCities) {
          query = query.eq('state', state);
        }
        // If state has no launch cities, the launch city filter will already exclude it
      }

      if (location && !city && !state) {
        // Only apply location filter if not already filtering by city/state
        const locationLower = location.toLowerCase();
        // The launch city filter already applied will ensure only launch cities are returned
        // We just need to match the location text
        query = query.or(
          `city.ilike.%${locationLower}%,name.ilike.%${locationLower}%`
        );
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

      return query;
    };

    const { count, error: countError } = await applyFilters(
      supabase.from('restaurants').select('id', { count: 'exact', head: true })
    );

    if (countError) {
      console.error('Error getting filtered restaurant count from Supabase:', countError);
      return { data: [], totalCount: 0, soupTypeFilterApplied };
    }

    let totalMatches = typeof count === 'number' ? count : 0;

    if (totalMatches === 0) {
      // As a fallback, attempt to compute count manually if head=true was not supported
      const { data: filteredIdRows, error: idError } = await applyFilters(
        supabase.from('restaurants').select('id')
      );

      if (idError) {
        console.error('Error retrieving filtered restaurant ids:', idError);
        return { data: [], totalCount: 0, soupTypeFilterApplied };
      }

      totalMatches = new Set((filteredIdRows || []).map((row) => row?.id).filter(Boolean)).size;
    }

    if (!totalMatches) {
      console.log('Filters resulted in zero matching restaurants.');
      return { data: [], totalCount: 0, soupTypeFilterApplied };
    }

    let dataQuery = applyFilters(
      supabase
        .from('restaurants')
        .select(
          `
          *,
          soups (*)
        `
        )
        .order(sortBy, { ascending: sortOrder === 'asc' })
    );

    if (limit) {
      const start = Math.max(0, offset);
      const end = Math.max(start, start + limit - 1);
      dataQuery = dataQuery.range(start, end);
    }

    const { data, error: dataError } = await dataQuery;

    if (dataError) {
      console.error('Error fetching restaurants from Supabase:', dataError);
      return { data: [], totalCount: totalMatches, soupTypeFilterApplied };
    }

    console.log(`Successfully fetched ${data?.length || 0} restaurants from Supabase (matches: ${totalMatches})`);
    return { data: data || [], totalCount: totalMatches, soupTypeFilterApplied };
  } catch (err) {
    console.error('Exception when fetching restaurants:', err);
    const filterApplied = (Array.isArray(soupTypes) ? soupTypes : soupTypes ? [soupTypes] : []).length > 0;
    return { data: [], totalCount: 0, soupTypeFilterApplied: filterApplied };
  }
}

// Other helper functions remain the same...
