// src/pages/api/search/locations.js
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawQuery = (req.query.q || '').toString().trim();

  if (rawQuery.length < 3) {
    return res.status(200).json({ suggestions: [] });
  }

  try {
    const sanitized = rawQuery.replace(/[%_]/g, (match) => `\\${match}`);

    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, city, state, address')
      .or(`city.ilike.%${sanitized}%,state.ilike.%${sanitized}%,name.ilike.%${sanitized}%,address.ilike.%${sanitized}%`)
      .limit(25);

    if (error) {
      throw error;
    }

    const suggestions = [];
    const seenLocations = new Set();
    const seenRestaurants = new Set();

    (data || []).forEach((row) => {
      const city = (row.city || '').trim();
      const state = (row.state || '').trim();
      if (!city || !state) return;

      const locationKey = `${city.toLowerCase()}__${state.toUpperCase()}`;
      if (seenLocations.has(locationKey)) return;

      seenLocations.add(locationKey);
      suggestions.push({
        type: 'location',
        label: `${city}, ${state}`,
        value: `${city}, ${state}`,
        city,
        state,
      });
    });

    (data || []).forEach((row) => {
      const name = (row.name || '').trim();
      if (!name) return;

      const restaurantKey = row.id || name.toLowerCase();
      if (seenRestaurants.has(restaurantKey)) return;

      seenRestaurants.add(restaurantKey);
      suggestions.push({
        type: 'restaurant',
        label: name,
        value: name,
        city: (row.city || '').trim(),
        state: (row.state || '').trim(),
      });
    });

    return res.status(200).json({ suggestions: suggestions.slice(0, 15) });
  } catch (error) {
    console.error('Error searching locations:', error);
    return res.status(500).json({ error: 'Failed to search locations' });
  }
}
