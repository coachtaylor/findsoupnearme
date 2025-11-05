// src/pages/api/cities/popular.js
import { supabase, getRestaurants } from '../../../lib/supabase';
import { LAUNCH_CITIES } from '../../../lib/launch-cities';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 50;

const normalizeCityName = (value) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeStateCode = (value) =>
  typeof value === 'string' ? value.trim().toUpperCase() : '';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const citiesParam = req.query.cities;
  const limitParam = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  if (citiesParam) {
    try {
      const parsed = Array.isArray(citiesParam) ? citiesParam : [citiesParam];

      const requested = parsed
        .flatMap((entry) => {
          try {
            const value = JSON.parse(entry);
            return Array.isArray(value) ? value : [];
          } catch {
            return [];
          }
        })
        .filter((item) => item && typeof item.name === 'string')
        .map((item) => ({
          name: item.name.trim(),
          state: typeof item.state === 'string' ? item.state.trim().toUpperCase() : null,
        }))
        .filter((item) => item.name.length > 0);

      const results = await Promise.all(
        requested.map(async ({ name, state }) => {
          try {
            const { totalCount } = await getRestaurants({
              city: name,
              state,
              limit: 1,
            });

            return {
              name,
              state: state || null,
              count: totalCount || 0,
            };
          } catch (error) {
            console.error('[api/cities/popular] Failed to load count for city', { name, state, error });
            return {
              name,
              state: state || null,
              count: 0,
            };
          }
        })
      );

      const totals = results.reduce(
        (acc, city) => {
          acc.restaurants += city.count || 0;
          acc.cities += 1;
          return acc;
        },
        { restaurants: 0, cities: 0 }
      );

      return res.status(200).json({
        cities: results,
        totals,
      });
    } catch (err) {
      console.error('[api/cities/popular] Invalid cities payload:', err);
      return res.status(400).json({ error: 'Invalid cities parameter' });
    }
  }

  try {
    // Filter to only launch cities - use state filter then filter cities in JavaScript
    const launchStates = [...new Set(LAUNCH_CITIES.map(lc => lc.state.toUpperCase()))];
    const launchCitySet = new Set(LAUNCH_CITIES.map(lc => 
      `${lc.name.toLowerCase()}|${lc.state.toUpperCase()}`
    ));
    
    let query = supabase
      .from('restaurants')
      .select('city, state');
    
    if (launchStates.length > 0) {
      query = query.in('state', launchStates);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('[api/cities/popular] Failed to fetch restaurants:', error);
      return res.status(500).json({ error: 'Failed to load popular cities' });
    }

    const countsMap = new Map();
    let totalRestaurants = 0;

    // Initialize launch cities with 0 counts
    LAUNCH_CITIES.forEach((lc) => {
      const key = `${lc.name.toLowerCase()}|${lc.state.toUpperCase()}`;
      countsMap.set(key, { name: lc.name, state: lc.state, count: 0 });
    });

    // Filter to only launch cities (handle spaces in city names)
    const filteredData = (data || []).filter(row => {
      const cityName = normalizeCityName(row?.city);
      const stateCode = normalizeStateCode(row?.state);
      if (!cityName || !stateCode) return false;
      const key = `${cityName.toLowerCase()}|${stateCode}`;
      return launchCitySet.has(key);
    });

    for (const row of filteredData) {
      const cityName = normalizeCityName(row?.city);
      const stateCode = normalizeStateCode(row?.state);

      if (!cityName || !stateCode) {
        continue;
      }

      const key = `${cityName.toLowerCase()}|${stateCode}`;
      const currentCount = countsMap.get(key);
      if (currentCount) {
        currentCount.count += 1;
        countsMap.set(key, currentCount);
        totalRestaurants += 1;
      }
    }

    const sortedCities = Array.from(countsMap.values())
      .filter(city => city.count > 0) // Only return cities with restaurants
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const topCities = sortedCities.slice(0, limit);

    return res.status(200).json({
      cities: topCities,
      totals: {
        restaurants: totalRestaurants,
        cities: sortedCities.length,
      },
    });
  } catch (err) {
    console.error('[api/cities/popular] Unexpected error:', err);
    return res.status(500).json({ error: 'Failed to load popular cities' });
  }
}
