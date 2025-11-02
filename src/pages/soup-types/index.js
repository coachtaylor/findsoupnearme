// src/pages/soup-types/index.js
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const slugifySoupName = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function SoupTypes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [soupCounts, setSoupCounts] = useState({});

  // Comprehensive soup types organized by category
  const soupCategories = {
    asian: {
      name: 'Asian Soups',
      description: 'Rich broths and noodles from East and Southeast Asia',
      color: 'from-red-500 to-orange-500',
      soups: [
        { 
          name: 'Ramen', 
          description: 'Japanese noodle soup with rich pork or chicken broth',
          origin: 'Japan',
          popular: true,
          count: 234
        },
        { 
          name: 'Pho', 
          description: 'Vietnamese beef or chicken noodle soup with herbs',
          origin: 'Vietnam',
          popular: true,
          count: 198
        },
        { 
          name: 'Miso Soup', 
          description: 'Japanese soup with fermented soybean paste',
          origin: 'Japan',
          aliases: ['Miso'],
          count: 156
        },
        { 
          name: 'Wonton Soup', 
          description: 'Chinese soup with meat-filled dumplings',
          origin: 'China',
          aliases: ['Wonton'],
          count: 143
        },
        { 
          name: 'Tom Yum', 
          description: 'Spicy and sour Thai soup with lemongrass',
          origin: 'Thailand',
          count: 89
        },
        { 
          name: 'Tom Kha', 
          description: 'Thai coconut soup with galangal and lime',
          origin: 'Thailand',
          aliases: ['Tom Kha Gai'],
          count: 76
        },
        { 
          name: 'Udon Soup', 
          description: 'Japanese soup with thick wheat noodles',
          origin: 'Japan',
          count: 67
        },
        { 
          name: 'Hot and Sour Soup', 
          description: 'Chinese soup with vinegar, spices, and tofu',
          origin: 'China',
          aliases: ['Hot and Sour'],
          count: 54
        },
      ]
    },
    american: {
      name: 'American Classics',
      description: 'Comfort soups from across the United States',
      color: 'from-blue-500 to-indigo-500',
      soups: [
        { 
          name: 'Clam Chowder', 
          description: 'Creamy New England soup with clams and potatoes',
          origin: 'United States',
          popular: true,
          count: 187
        },
        { 
          name: 'Chicken Noodle', 
          description: 'Classic American soup with chicken, vegetables, and noodles',
          origin: 'United States',
          popular: true,
          count: 234
        },
        { 
          name: 'Tomato Soup', 
          description: 'Smooth and creamy tomato-based soup',
          origin: 'United States',
          aliases: ['Tomato'],
          count: 145
        },
        { 
          name: 'Corn Chowder', 
          description: 'Creamy soup with sweet corn and bacon',
          origin: 'United States',
          count: 98
        },
        { 
          name: 'Gumbo', 
          description: 'Louisiana stew with seafood, sausage, and okra',
          origin: 'United States',
          count: 76
        },
      ]
    },
    seafood: {
      name: 'Seafood Soups',
      description: 'Fresh from the ocean to your bowl',
      color: 'from-teal-500 to-cyan-500',
      soups: [
        { 
          name: 'Lobster Bisque', 
          description: 'Rich and creamy French soup with lobster',
          origin: 'France',
          popular: true,
          count: 123
        },
        { 
          name: 'Cioppino', 
          description: 'Italian-American seafood stew from San Francisco',
          origin: 'United States',
          count: 87
        },
        { 
          name: 'Bouillabaisse', 
          description: 'Traditional Provençal fish stew',
          origin: 'France',
          count: 65
        },
        { 
          name: 'Seafood Chowder', 
          description: 'Creamy soup with mixed seafood',
          origin: 'United States',
          count: 98
        },
      ]
    },
    european: {
      name: 'European Soups',
      description: 'Traditional recipes from across Europe',
      color: 'from-purple-500 to-pink-500',
      soups: [
        { 
          name: 'French Onion', 
          description: 'Caramelized onions in beef broth with cheese',
          origin: 'France',
          popular: true,
          count: 156
        },
        { 
          name: 'Borscht', 
          description: 'Eastern European beet soup',
          origin: 'Ukraine',
          count: 67
        },
        { 
          name: 'Minestrone', 
          description: 'Italian vegetable soup with pasta or rice',
          origin: 'Italy',
          count: 112
        },
        { 
          name: 'Gazpacho', 
          description: 'Cold Spanish tomato soup',
          origin: 'Spain',
          count: 89
        },
        { 
          name: 'Vichyssoise', 
          description: 'Cold French potato and leek soup',
          origin: 'France',
          count: 45
        },
      ]
    },
    latin: {
      name: 'Latin American',
      description: 'Bold flavors from Mexico and South America',
      color: 'from-green-500 to-lime-500',
      soups: [
        { 
          name: 'Chicken Tortilla', 
          description: 'Mexican soup with tortilla strips and avocado',
          origin: 'Mexico',
          popular: true,
          count: 134
        },
        { 
          name: 'Pozole', 
          description: 'Mexican hominy soup with pork or chicken',
          origin: 'Mexico',
          count: 87
        },
        { 
          name: 'Caldo de Res', 
          description: 'Mexican beef soup with vegetables',
          origin: 'Mexico',
          count: 76
        },
        { 
          name: 'Ajiaco', 
          description: 'Colombian chicken and potato soup',
          origin: 'Colombia',
          count: 43
        },
      ]
    },
    vegetarian: {
      name: 'Vegetarian & Vegan',
      description: 'Plant-based soups full of flavor',
      color: 'from-emerald-500 to-green-500',
      soups: [
        { 
          name: 'Lentil Soup', 
          description: 'Hearty soup with lentils and vegetables',
          origin: 'Various',
          aliases: ['Lentil'],
          popular: true,
          count: 145
        },
        { 
          name: 'Split Pea', 
          description: 'Thick and creamy pea soup',
          origin: 'Various',
          count: 98
        },
        { 
          name: 'Butternut Squash', 
          description: 'Creamy roasted squash soup',
          origin: 'Various',
          count: 112
        },
        { 
          name: 'Vegetable Soup', 
          description: 'Classic mixed vegetable soup',
          origin: 'Various',
          aliases: ['Vegetable'],
          count: 167
        },
        { 
          name: 'Mushroom Soup', 
          description: 'Creamy soup with various mushrooms',
          origin: 'Various',
          aliases: ['Mushroom'],
          count: 123
        },
      ]
    },
  };

  const soupDefinitions = useMemo(() => {
    const definitions = [];

    Object.entries(soupCategories).forEach(([categoryKey, category]) => {
      category.soups.forEach((soup) => {
        const slugVariants = new Set();
        const baseSlug = slugifySoupName(soup.name);
        if (baseSlug) slugVariants.add(baseSlug);

        if (!baseSlug.includes('soup')) {
          const withSuffix = slugifySoupName(`${soup.name} Soup`);
          if (withSuffix) slugVariants.add(withSuffix);
        }

        (soup.aliases || []).forEach((alias) => {
          const aliasSlug = slugifySoupName(alias);
          if (aliasSlug) slugVariants.add(aliasSlug);
          if (!aliasSlug.includes('soup')) {
            const aliasWithSuffix = slugifySoupName(`${alias} Soup`);
            if (aliasWithSuffix) slugVariants.add(aliasWithSuffix);
          }
        });

        if (baseSlug.includes('-soup')) {
          const withoutSuffix = baseSlug.replace(/-soup$/, '');
          if (withoutSuffix) slugVariants.add(withoutSuffix);
        }

        definitions.push({
          name: soup.name,
          categoryKey,
          slugVariants,
        });
      });
    });

    return definitions;
  }, []);

  const slugToDisplayNames = useMemo(() => {
    const map = new Map();
    soupDefinitions.forEach((definition) => {
      definition.slugVariants.forEach((slug) => {
        if (!map.has(slug)) {
          map.set(slug, new Set());
        }
        map.get(slug).add(definition.name);
      });
    });
    return map;
  }, [soupDefinitions]);

  const slugKeys = useMemo(() => Array.from(slugToDisplayNames.keys()), [slugToDisplayNames]);

  const definitionByName = useMemo(() => {
    const map = new Map();
    soupDefinitions.forEach((definition) => {
      map.set(definition.name, definition);
    });
    return map;
  }, [soupDefinitions]);

  const enhanceSoup = (soup) => {
    const variants = [
      soup.name,
      ...(soup.aliases || []),
    ];

    if (/\b(soup|stew)\b$/i.test(soup.name.trim())) {
      variants.push(soup.name.replace(/\s+(soup|stew)\s*$/i, '').trim());
    } else {
      variants.push(`${soup.name} Soup`);
    }

    const slugs = Array.from(
      new Set(
        variants
          .map(slugifySoupName)
          .filter(Boolean)
      )
    );

    let resolvedCount = soupCounts[soup.name];
    if (typeof resolvedCount !== 'number') {
      const values = slugs
        .map((slug) => soupCounts[slug])
        .filter((value) => typeof value === 'number');

      if (values.length > 0) {
        resolvedCount = values.reduce((sum, value) => sum + value, 0);
      } else {
        resolvedCount = 0;
      }
    }

    return {
      ...soup,
      count: resolvedCount,
      slugs,
    };
  };

  const enhancedCategories = useMemo(() => {
    return Object.fromEntries(
      Object.entries(soupCategories).map(([key, category]) => [
        key,
        {
          ...category,
          soups: category.soups.map(enhanceSoup),
        },
      ])
    );
  }, [soupCounts]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const response = await fetch('/api/restaurants?soupTypes=all&limit=1000');
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();

        const countsByName = new Map();

        (data.restaurants || []).forEach((restaurant) => {
          const restaurantId = restaurant.id;
          if (!restaurantId) return;

          const matchedNames = new Set();

          (restaurant.soups || []).forEach((soup) => {
            const slug = slugifySoupName(soup?.soup_type);
            if (!slug) return;

            const directMatches = slugToDisplayNames.get(slug);
            if (directMatches?.size) {
              directMatches.forEach((name) => matchedNames.add(name));
              return;
            }

            slugKeys.forEach((key) => {
              if (slug.startsWith(key) || key.startsWith(slug)) {
                const names = slugToDisplayNames.get(key);
                names?.forEach((name) => matchedNames.add(name));
              }
            });
          });

          matchedNames.forEach((name) => {
            if (!countsByName.has(name)) {
              countsByName.set(name, new Set());
            }
            countsByName.get(name).add(restaurantId);
          });
        });

        const nextCounts = {};
        countsByName.forEach((set, name) => {
          const count = set.size;
          nextCounts[name] = count;
          const definition = definitionByName.get(name);
          definition?.slugVariants.forEach((slug) => {
            nextCounts[slug] = count;
          });
        });

        setSoupCounts(nextCounts);
      } catch (error) {
        console.error('Failed to load soup counts:', error);
      }
    };

    loadCounts();
  }, [definitionByName, slugKeys, slugToDisplayNames]);

  // Get all soups in a flat array for searching
  const allSoups = Object.entries(enhancedCategories).flatMap(([categoryKey, category]) =>
    category.soups.map(soup => ({
      ...soup,
      category: category.name,
      categoryKey,
      categoryColor: category.color
    }))
  );

  // Filter soups based on search and category
  const filteredSoups = allSoups.filter(soup => {
    const matchesSearch = searchQuery === '' || 
      soup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soup.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || soup.categoryKey === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get popular soups
  const popularSoups = allSoups.filter(soup => soup.popular);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Soup Types | FindSoupNearMe</title>
        <meta name="description" content="Explore different types of soup from around the world. Find restaurants serving ramen, pho, chowder, bisque, and more." />
      </Head>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-orange-50 to-white pt-32 pb-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-['Outfit'] font-bold text-neutral-900 mb-6 leading-tight">
              Explore Soup Types
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-neutral-600 max-w-3xl mx-auto">
              Discover soups from around the world and find restaurants near you serving your favorites
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
              <input
                type="text"
                placeholder="Search soup types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg font-['Inter'] rounded-2xl border-2 border-neutral-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-['Inter'] font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-orange-300'
              }`}
            >
              All Types
            </button>
            {Object.entries(enhancedCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-['Inter'] font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:border-orange-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Soups Section */}
      {searchQuery === '' && selectedCategory === 'all' && (
        <section className="py-12 bg-gradient-to-b from-white to-orange-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-4">
                <span className="text-sm font-['Inter'] font-semibold text-orange-700">Most Popular</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-['Outfit'] font-bold text-neutral-900 mb-4">
                Fan Favorites
              </h2>
              <p className="text-lg font-['Inter'] text-neutral-600">
                The most searched soup types on FindSoupNearMe
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularSoups.map((soup, index) => (
                <Link
                  key={index}
                  href={{ pathname: '/restaurants', query: { soupType: soup.name } }}
                  className="group relative bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${soup.categoryColor} rounded-t-2xl`}></div>
                  <div className="pt-2">
                    <h3 className="text-xl font-['Outfit'] font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {soup.name}
                    </h3>
                    <p className="text-sm font-['Inter'] text-neutral-600 mb-3">
                      {soup.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-['Inter'] font-medium text-neutral-500">
                        {soup.origin}
                      </span>
                      <span className="text-sm font-['Inter'] font-semibold text-orange-600">
                        {soup.count} spots
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Soup Types by Category */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchQuery === '' && selectedCategory === 'all' ? (
            // Show by category
            Object.entries(enhancedCategories).map(([categoryKey, category]) => (
              <div key={categoryKey} className="mb-16 last:mb-0">
                <div className="mb-8">
                  <div className={`inline-block px-4 py-1 bg-gradient-to-r ${category.color} text-white rounded-full text-sm font-['Inter'] font-semibold mb-3`}>
                    {category.name}
                  </div>
                  <h2 className="text-3xl font-['Outfit'] font-bold text-neutral-900 mb-2">
                    {category.name}
                  </h2>
                  <p className="text-lg font-['Inter'] text-neutral-600">
                    {category.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {category.soups.map((soup, index) => (
                    <Link
                      key={index}
                      href={{ pathname: '/restaurants', query: { soupType: soup.name } }}
                      className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                    >
                      <h3 className="text-lg font-['Outfit'] font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {soup.name}
                      </h3>
                      <p className="text-sm font-['Inter'] text-neutral-600 mb-3">
                        {soup.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-['Inter'] text-neutral-500">{soup.origin}</span>
                        <span className="font-['Inter'] font-semibold text-orange-600">{soup.count} spots</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Show filtered results
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-['Outfit'] font-bold text-neutral-900 mb-2">
                  {filteredSoups.length} {filteredSoups.length === 1 ? 'Result' : 'Results'}
                </h2>
                {searchQuery && (
                  <p className="text-lg font-['Inter'] text-neutral-600">
                    Searching for &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>

              {filteredSoups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredSoups.map((soup, index) => (
                    <Link
                      key={index}
                      href={{ pathname: '/restaurants', query: { soupType: soup.name } }}
                      className="group bg-white rounded-xl p-6 border border-neutral-200 hover:border-orange-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className={`inline-block px-2 py-1 bg-gradient-to-r ${soup.categoryColor} text-white rounded text-xs font-['Inter'] font-semibold mb-3`}>
                        {soup.category}
                      </div>
                      <h3 className="text-lg font-['Outfit'] font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {soup.name}
                      </h3>
                      <p className="text-sm font-['Inter'] text-neutral-600 mb-3">
                        {soup.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-['Inter'] text-neutral-500">{soup.origin}</span>
                        <span className="font-['Inter'] font-semibold text-orange-600">{soup.count} spots</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-['Outfit'] font-bold text-neutral-900 mb-2">
                    No soup types found
                  </h3>
                  <p className="text-lg font-['Inter'] text-neutral-600 mb-6">
                    Try adjusting your search or filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-6 py-3 bg-orange-500 text-white font-['Inter'] font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-['Outfit'] font-bold mb-6">
            Ready to Find Your Soup?
          </h2>
          <p className="text-xl font-['Inter'] mb-10 text-orange-50">
            Search thousands of restaurants serving your favorite soups
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/restaurants"
              className="px-8 py-4 bg-white text-orange-600 font-['Inter'] font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center"
            >
              <MagnifyingGlassIcon className="w-6 h-6 mr-2" />
              Search Restaurants
            </Link>
            <Link
              href="/cities"
              className="px-8 py-4 bg-orange-700/50 backdrop-blur-sm text-white font-['Inter'] font-semibold rounded-2xl border-2 border-white/30 hover:bg-orange-700/70 transition-all duration-300 inline-flex items-center justify-center"
            >
              Browse by City
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
