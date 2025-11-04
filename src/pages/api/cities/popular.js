// src/pages/api/cities/popular.js
import { supabase, getRestaurants } from '../../../lib/supabase';

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
    const { data, error } = await supabase
      .from('restaurants')
      .select('city, state');

    if (error) {
      console.error('[api/cities/popular] Failed to fetch restaurants:', error);
      return res.status(500).json({ error: 'Failed to load popular cities' });
    }

    const countsMap = new Map();
    let totalRestaurants = 0;

    for (const row of data || []) {
      const cityName = normalizeCityName(row?.city);
      const stateCode = normalizeStateCode(row?.state);

      if (!cityName || !stateCode) {
        continue;
      }

      const key = `${cityName.toLowerCase()}|${stateCode}`;
      const currentCount = countsMap.get(key) ?? { name: cityName, state: stateCode, count: 0 };
      currentCount.count += 1;
      countsMap.set(key, currentCount);
      totalRestaurants += 1;
    }

    const sortedCities = Array.from(countsMap.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
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
