import { supabase } from '../../../lib/supabase'
import { LAUNCH_CITIES, isLaunchCity } from '../../../lib/launch-cities'

const slugifySoupName = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const ensureSlugVariants = (slug) => {
  const variants = new Set([slug])
  if (slug.endsWith('-soup')) {
    variants.add(slug.replace(/-soup$/, ''))
  } else if (!slug.includes('-soup')) {
    variants.add(`${slug}-soup`)
  }
  return Array.from(variants)
}

const toDisplayName = (value) =>
  (value || '')
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\w/g, (char) => char.toUpperCase())

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const launchStates = Array.from(new Set(LAUNCH_CITIES.map((city) => city.state.toUpperCase())))

    const { data, error } = await supabase
      .from('soups')
      .select('soup_type, restaurant_id, restaurants:restaurant_id!inner (city, state)')
      .in('restaurants.state', launchStates)

    if (error) {
      console.error('[api/soup-types/counts] Failed to fetch soups:', error)
      return res.status(500).json({ error: 'Failed to load soup counts' })
    }

    const countsMap = new Map()
    const namesMap = new Map()
    const displayMap = new Map()

    for (const row of data || []) {
      const slug = slugifySoupName(row?.soup_type)
      const restaurantId = row?.restaurant_id
      const restaurant = Array.isArray(row?.restaurants) ? row.restaurants[0] : row?.restaurants
      const city = restaurant?.city
      const state = restaurant?.state

      if (!slug || !restaurantId || !city || !state) continue
      if (!isLaunchCity(city, state)) continue

      const displayName = toDisplayName(row?.soup_type) || null

      const variants = ensureSlugVariants(slug)
      variants.forEach((variant) => {
        if (!countsMap.has(variant)) {
          countsMap.set(variant, new Set())
        }
        countsMap.get(variant).add(restaurantId)
        if (displayName && !namesMap.has(variant)) {
          namesMap.set(variant, displayName)
        }
      })

      if (displayName) {
        if (!displayMap.has(displayName)) {
          displayMap.set(displayName, new Set())
        }
        displayMap.get(displayName).add(restaurantId)
      }
    }

    const counts = Object.fromEntries(
      Array.from(countsMap.entries()).map(([slug, set]) => [slug, set.size])
    )
    const names = Object.fromEntries(namesMap.entries())
    const displayCounts = Object.fromEntries(
      Array.from(displayMap.entries()).map(([name, set]) => [name, set.size])
    )

    return res.status(200).json({ counts, names, displayCounts })
  } catch (err) {
    console.error('[api/soup-types/counts] Unexpected error:', err)
    return res.status(500).json({ error: 'Failed to load soup counts' })
  }
}
