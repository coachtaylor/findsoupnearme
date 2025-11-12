// src/pages/soup-types/index.js
import { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import useDebouncedValue from '../../hooks/useDebouncedValue';

// Map soup types to their correct cuisines
const getCuisineForSoupType = (soupType) => {
  if (!soupType) return null;
  
  const normalized = soupType.toLowerCase().trim();
  
  // Vietnamese soups
  if (normalized.includes('pho') || normalized.includes('phở') || 
      normalized.includes('bun bo') || normalized.includes('bún bò')) {
    return 'Vietnamese';
  }
  
  // Japanese soups
  if (normalized.includes('ramen') || normalized.includes('miso') || 
      normalized.includes('udon') || normalized.includes('tonkotsu') ||
      normalized.includes('shoyu') || normalized.includes('shio')) {
    return 'Japanese';
  }
  
  // Chinese soups
  if (normalized.includes('wonton') || normalized.includes('won ton') ||
      normalized.includes('hot and sour') || normalized.includes('hot & sour') ||
      normalized.includes('egg drop') || normalized.includes('egg flower') ||
      normalized.includes('szechuan') || normalized.includes('sichuan')) {
    return 'Chinese';
  }
  
  // Thai soups
  if (normalized.includes('tom yum') || normalized.includes('tom yam') ||
      normalized.includes('tom kha') || normalized.includes('tom ka')) {
    return 'Thai';
  }
  
  // Korean soups
  if (normalized.includes('kimchi') || normalized.includes('kimchee') ||
      normalized.includes('jjigae') || normalized.includes('sul lung tang') ||
      normalized.includes('kalguksu')) {
    return 'Korean';
  }
  
  // Mexican soups
  if (normalized.includes('pozole') || normalized.includes('posole') ||
      normalized.includes('tortilla') || normalized.includes('caldo')) {
    return 'Mexican';
  }
  
  // Italian soups
  if (normalized.includes('minestrone') || normalized.includes('stracciatella') ||
      normalized.includes('pasta fagioli')) {
    return 'Italian';
  }
  
  // French soups
  if (normalized.includes('french onion') || normalized.includes('bouillabaisse') ||
      normalized.includes('bisque') || normalized.includes('vichyssoise')) {
    return 'French';
  }
  
  // American soups
  if (normalized.includes('chicken noodle') || normalized.includes('clam chowder') ||
      normalized.includes('corn chowder') || normalized.includes('gumbo') ||
      normalized.includes('chili') || normalized.includes('chowder')) {
    return 'American';
  }
  
  // Spanish soups
  if (normalized.includes('gazpacho') || normalized.includes('paella')) {
    return 'Spanish';
  }
  
  // Return null if no match - these will be grouped separately or not shown
  return null;
};

// Get brief description for soup types
const getSoupDescription = (soupType) => {
  if (!soupType) return '';
  
  const normalized = soupType.toLowerCase().trim();
  
  // Vietnamese
  if (normalized.includes('pho')) return 'Traditional Vietnamese noodle soup with aromatic beef or chicken broth, rice noodles, fresh herbs, and tender meat. Often served with bean sprouts, lime, and hoisin sauce.';
  if (normalized.includes('bun bo')) return 'Spicy Vietnamese beef noodle soup from Hue, featuring lemongrass, shrimp paste, and a complex broth with beef shank and pork knuckle.';
  
  // Japanese
  if (normalized.includes('ramen')) return 'Japanese noodle soup with rich, umami-packed broth made from pork, chicken, or fish bones. Served with wheat noodles, soft-boiled eggs, nori, and various toppings.';
  if (normalized.includes('miso')) return 'Japanese soup made with fermented soybean paste, dashi stock, and seaweed. Often includes tofu, wakame, and scallions. A staple of Japanese cuisine.';
  if (normalized.includes('udon')) return 'Japanese soup featuring thick, chewy wheat noodles in a mild, savory broth. Typically served with tempura, fish cakes, or vegetables.';
  if (normalized.includes('tonkotsu')) return 'Rich Japanese ramen with creamy pork bone broth that\'s simmered for hours. Known for its milky appearance and intense umami flavor.';
  
  // Chinese
  if (normalized.includes('wonton')) return 'Chinese soup with delicate, paper-thin dumplings filled with seasoned pork or shrimp. Served in a clear, light broth with bok choy and scallions.';
  if (normalized.includes('hot and sour') || normalized.includes('hot & sour')) return 'Tangy Chinese soup balancing spicy chili heat with vinegar sourness. Features tofu, mushrooms, bamboo shoots, and egg ribbons in a complex, flavorful broth.';
  if (normalized.includes('egg drop') || normalized.includes('egg flower')) return 'Silky Chinese soup with ribbons of beaten egg swirled into hot chicken broth. Often includes corn, peas, and green onions for texture and flavor.';
  
  // Thai
  if (normalized.includes('tom yum') || normalized.includes('tom yam')) return 'Spicy and sour Thai soup with lemongrass, kaffir lime leaves, galangal, and chili. Often includes shrimp, chicken, or mushrooms in a fragrant, tangy broth.';
  if (normalized.includes('tom kha') || normalized.includes('tom ka')) return 'Creamy Thai coconut soup with galangal, lemongrass, and lime leaves. Sweet, tangy, and aromatic, typically made with chicken or seafood.';
  
  // Korean
  if (normalized.includes('kimchi')) return 'Korean stew featuring fermented kimchi vegetables in a spicy, tangy broth. Often includes pork, tofu, and vegetables, creating a deeply flavorful and warming dish.';
  if (normalized.includes('jjigae')) return 'Korean spicy stew with a bold, savory broth. Variations include kimchi, soybean paste, or spicy pepper paste, typically served with rice and banchan.';
  
  // Mexican
  if (normalized.includes('pozole') || normalized.includes('posole')) return 'Traditional Mexican hominy soup with pork or chicken, simmered with chilies and spices. Served with radishes, cabbage, lime, and oregano for a festive, hearty meal.';
  if (normalized.includes('tortilla')) return 'Mexican soup with crispy fried tortilla strips, often topped with avocado, cheese, and sour cream. Can be made with chicken, vegetables, or a tomato-based broth.';
  if (normalized.includes('caldo')) return 'Hearty Mexican broth soup with chunks of meat, vegetables, and aromatic spices. A comforting, nourishing dish often served with rice and warm tortillas.';
  
  // Italian
  if (normalized.includes('minestrone')) return 'Italian vegetable soup with pasta or rice, beans, and seasonal vegetables. A hearty, nutritious dish that varies by region and season, often finished with fresh herbs and Parmesan.';
  
  // French
  if (normalized.includes('french onion')) return 'Classic French soup with deeply caramelized onions in rich beef broth, topped with crusty bread and melted Gruyère cheese. A decadent, satisfying comfort food.';
  if (normalized.includes('bouillabaisse')) return 'Traditional Provençal fish stew from Marseille, featuring multiple types of fish and shellfish in a saffron-infused broth. Served with rouille and crusty bread.';
  if (normalized.includes('bisque')) return 'Rich and creamy French soup, typically made with shellfish like lobster or crab. Known for its smooth, velvety texture and luxurious flavor profile.';
  
  // American
  if (normalized.includes('chicken noodle')) return 'Classic American comfort soup with tender chicken, egg noodles, carrots, celery, and herbs in a warm, savory broth. The ultimate feel-good meal.';
  if (normalized.includes('clam chowder')) return 'Creamy New England soup with fresh clams, potatoes, onions, and bacon in a rich, milky broth. A beloved coastal specialty, often served in a bread bowl.';
  if (normalized.includes('corn chowder')) return 'Creamy soup featuring sweet corn kernels, potatoes, and bacon in a rich, velvety broth. A summertime favorite that celebrates fresh, sweet corn.';
  if (normalized.includes('gumbo')) return 'Louisiana stew with seafood, sausage, and okra in a dark roux-based broth. Thickened with filé powder and served over rice, representing Creole and Cajun traditions.';
  if (normalized.includes('chili')) return 'Hearty American stew with ground or chunks of meat, beans, tomatoes, and a blend of spices including chili powder and cumin. A warming, satisfying dish.';
  
  // Spanish
  if (normalized.includes('gazpacho')) return 'Cold Spanish tomato soup originating from Andalusia. Made with fresh tomatoes, cucumbers, bell peppers, garlic, and olive oil. Refreshing and perfect for warm weather.';
  
  // Default
  return 'Delicious soup from our collection, crafted with care and authentic flavors.';
};

export default function SoupTypes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const suggestionBlurTimeoutRef = useRef(null);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [viewMode, setViewMode] = useState('cuisine'); // 'cuisine' or 'soupType'
  const [soupTypes, setSoupTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch actual data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/soup-types/counts');
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();

        const counts = data?.counts || {};
        const namesMap = data?.names || {};
        const displayCounts = new Map();

        if (data?.displayCounts) {
          Object.entries(data.displayCounts).forEach(([name, count]) => {
            if (typeof count !== 'number') return;
            const normalizedName = (name || '').toString().trim();
            const displayName = normalizedName
              .split(' ')
              .filter(Boolean)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            if (!displayName) return;
            displayCounts.set(displayName, count);
          });
        } else {
          Object.entries(counts).forEach(([slug, count]) => {
            if (typeof count !== 'number') return;
            const rawName = namesMap[slug] || slug.replace(/-/g, ' ');
            const displayName = rawName
              .split(' ')
              .filter(Boolean)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            if (!displayName) return;
            const existing = displayCounts.get(displayName) || 0;
            displayCounts.set(displayName, Math.max(existing, count));
          });
        }

        const soupTypesArray = Array.from(displayCounts.entries())
          .map(([name, count]) => ({
            name,
            count,
            description: getSoupDescription(name)
          }))
          .filter((item) => item.count > 0)
          .sort((a, b) => b.count - a.count);

        const cuisineMap = new Map();
        soupTypesArray.forEach((item) => {
          const cuisine = getCuisineForSoupType(item.name) || 'Other Favorites';
          if (!cuisineMap.has(cuisine)) {
            cuisineMap.set(cuisine, []);
          }
          cuisineMap.get(cuisine).push(item);
        });

        const cuisinesArray = Array.from(cuisineMap.entries())
          .map(([cuisineName, soupList]) => {
            const uniqueSoups = new Map();
            soupList.forEach((soup) => {
              if (!uniqueSoups.has(soup.name) || uniqueSoups.get(soup.name).count < soup.count) {
                uniqueSoups.set(soup.name, soup);
              }
            });
            const ordered = Array.from(uniqueSoups.values()).sort((a, b) => b.count - a.count);
            return {
              name: cuisineName,
              soupTypes: ordered,
              totalCount: ordered.reduce((sum, st) => sum + st.count, 0)
            };
          })
          .filter((cuisine) => cuisine.soupTypes.length > 0)
          .sort((a, b) => b.totalCount - a.totalCount);

        setSoupTypes(soupTypesArray);
        setCuisines(cuisinesArray);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  // Filter based on search query
  const trimmedSearchQuery = searchQuery.trim();
  const searchQueryHasMinChars = trimmedSearchQuery.length >= 3;

  const filteredSoupTypes = useMemo(() => {
    if (!searchQueryHasMinChars) return soupTypes;
    const query = trimmedSearchQuery.toLowerCase();
    return soupTypes.filter((soup) => soup.name.toLowerCase().includes(query));
  }, [soupTypes, trimmedSearchQuery, searchQueryHasMinChars]);

  const filteredCuisines = useMemo(() => {
    if (!searchQueryHasMinChars) return cuisines;
    const query = trimmedSearchQuery.toLowerCase();
    return cuisines
      .map((cuisine) => ({
        ...cuisine,
        soupTypes: cuisine.soupTypes.filter(
          (soup) =>
            soup.name.toLowerCase().includes(query) ||
            (cuisine.name || '').toLowerCase().includes(query),
        ),
      }))
      .filter((cuisine) => cuisine.soupTypes.length > 0);
  }, [cuisines, trimmedSearchQuery, searchQueryHasMinChars]);

  const displayData = viewMode === 'cuisine' ? filteredCuisines : filteredSoupTypes;

  const searchSuggestions = useMemo(() => {
    const term = debouncedSearchQuery.trim().toLowerCase();
    if (term.length < 3) return [];

    const matches = [];
    const seen = new Set();

    cuisines.forEach((cuisine) => {
      const cuisineName = (cuisine?.name || '').trim();
      if (cuisineName) {
        const key = `cuisine:${cuisineName.toLowerCase()}`;
        if (!seen.has(key) && cuisineName.toLowerCase().includes(term)) {
          seen.add(key);
          matches.push({ type: 'cuisine', label: cuisineName });
        }
      }

      (cuisine?.soupTypes || []).forEach((soup) => {
        const soupName = (soup?.name || '').trim();
        if (!soupName) return;
        const soupKey = `soup:${soupName.toLowerCase()}`;
        if (seen.has(soupKey)) return;
        if (soupName.toLowerCase().includes(term)) {
          seen.add(soupKey);
          matches.push({ type: 'soupType', label: soupName, cuisine: cuisine?.name || '' });
        }
      });
    });

    soupTypes.forEach((soup) => {
      const soupName = (soup?.name || '').trim();
      if (!soupName) return;
      const soupKey = `soup:${soupName.toLowerCase()}`;
      if (seen.has(soupKey)) return;
      if (soupName.toLowerCase().includes(term)) {
        seen.add(soupKey);
        matches.push({ type: 'soupType', label: soupName });
      }
    });

    return matches.slice(0, 10);
  }, [debouncedSearchQuery, cuisines, soupTypes]);

  const searchSuggestionList = searchSuggestions.slice(0, 8);

  const handleSearchSuggestionSelect = (suggestion) => {
    if (!suggestion) return;
    if (suggestionBlurTimeoutRef.current) {
      clearTimeout(suggestionBlurTimeoutRef.current);
      suggestionBlurTimeoutRef.current = null;
    }
    setSearchQuery(suggestion.label);
    setSuggestionsOpen(false);
    setSearchFocused(false);
    if (suggestion.type === 'cuisine') {
      setViewMode('cuisine');
    } else {
      setViewMode('soupType');
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <Head>
        <title>Soup Types | FindSoupNearMe</title>
        <meta name="description" content="Explore different types of soup from around the world. Find restaurants serving ramen, pho, chowder, bisque, and more." />
      </Head>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-16 pb-16 md:pb-20 bg-gradient-to-br from-[rgb(var(--bg))] via-[rgb(var(--accent-light-light))] to-[rgb(var(--bg))] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[rgb(var(--accent))]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[rgb(var(--primary))]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          {/* Main Content */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-6 leading-[1.1]">
              Explore Soup Types
            </h1>
            
            <p className="text-xl md:text-2xl text-[rgb(var(--muted))] leading-relaxed max-w-3xl mx-auto mb-10">
              Discover soups from around the world and find restaurants near you serving your favorites
            </p>
            
            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-10">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[rgb(var(--accent))] mb-2">
                  {soupTypes.length}+
                </div>
                <div className="text-sm md:text-base text-[rgb(var(--muted))] font-medium">Soup Types</div>
              </div>
              <div className="w-px h-12 bg-black/10"></div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[rgb(var(--primary))] mb-2">
                  {cuisines.length}+
                </div>
                <div className="text-sm md:text-base text-[rgb(var(--muted))] font-medium">Cuisines</div>
              </div>
              <div className="w-px h-12 bg-black/10"></div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[rgb(var(--accent))] mb-2">
                  Global
                </div>
                <div className="text-sm md:text-base text-[rgb(var(--muted))] font-medium">Flavors</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--accent))]" />
              <input
                type="text"
                placeholder="Search soup types or cuisines..."
                value={searchQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchQuery(value);
                  if (value.trim().length === 0) {
                    setSuggestionsOpen(false);
                  } else {
                    setSuggestionsOpen(true);
                  }
                }}
                onFocus={(event) => {
                  if (suggestionBlurTimeoutRef.current) {
                    clearTimeout(suggestionBlurTimeoutRef.current);
                    suggestionBlurTimeoutRef.current = null;
                  }
                  setSearchFocused(true);
                  if (event.target.value.trim().length > 0) {
                    setSuggestionsOpen(true);
                  }
                }}
                onBlur={() => {
                  suggestionBlurTimeoutRef.current = setTimeout(() => {
                    setSearchFocused(false);
                    setSuggestionsOpen(false);
                  }, 150);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSuggestionsOpen(false);
                  }
                }}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[rgb(var(--surface))] ring-2 ring-[rgb(var(--accent-light))]/30 focus:ring-2 focus:ring-[rgb(var(--accent))]/50 outline-none placeholder:text-[rgb(var(--muted))] transition shadow-lg text-base"
              />

              {suggestionsOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-[rgb(var(--accent-light))]/40 bg-white shadow-xl">
                  {searchQueryHasMinChars ? (
                    searchSuggestionList.length > 0 ? (
                      <ul className="max-h-72 overflow-y-auto py-1">
                        {searchSuggestionList.map((suggestion, index) => (
                          <li key={`${suggestion.type}-${suggestion.label}-${index}`}>
                            <button
                              type="button"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                handleSearchSuggestionSelect(suggestion);
                              }}
                              className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition hover:bg-[rgb(var(--accent-light))]/20 focus:outline-none focus-visible:bg-[rgb(var(--accent-light))]/30"
                            >
                              <span className="text-sm font-semibold text-[rgb(var(--ink))]">
                                {suggestion.label}
                              </span>
                              <span className="text-xs text-[rgb(var(--muted))]">
                                {suggestion.type === 'cuisine'
                                  ? 'Cuisine'
                                  : suggestion.cuisine
                                    ? `${suggestion.cuisine} cuisine`
                                    : 'Soup type'}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-3 text-sm text-[rgb(var(--muted))]">
                        No matches yet. Try another soup or cuisine name.
                      </div>
                    )
                  ) : (
                    <div className="px-4 py-3 text-sm text-[rgb(var(--muted))]">
                      {trimmedSearchQuery.length > 0
                        ? 'Type at least 3 characters to see suggestions.'
                        : 'Start typing to find a soup or cuisine.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setViewMode('cuisine')}
              className={`inline-flex items-center justify-center h-11 px-5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                viewMode === 'cuisine'
                  ? 'bg-[rgb(var(--primary))] text-white hover:opacity-90 focus:ring-[rgb(var(--primary))]/40'
                  : 'border border-black/10 text-[rgb(var(--ink))] bg-[rgb(var(--surface))] hover:bg-black/5 focus:ring-[rgb(var(--primary))]/30'
              }`}
            >
              Browse by Cuisine
            </button>
            <button
              onClick={() => setViewMode('soupType')}
              className={`inline-flex items-center justify-center h-11 px-5 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                viewMode === 'soupType'
                  ? 'bg-[rgb(var(--primary))] text-white hover:opacity-90 focus:ring-[rgb(var(--primary))]/40'
                  : 'border border-black/10 text-[rgb(var(--ink))] bg-[rgb(var(--surface))] hover:bg-black/5 focus:ring-[rgb(var(--primary))]/30'
              }`}
            >
              Browse by Soup Type
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 bg-[rgb(var(--surface))]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[rgb(var(--primary))] border-r-transparent"></div>
              <p className="mt-4 text-[rgb(var(--muted))]">Loading soup types...</p>
            </div>
          ) : viewMode === 'cuisine' ? (
            // Browse by Cuisine
            filteredCuisines.length > 0 ? (
              <div className="space-y-16">
                {filteredCuisines.map((cuisine) => (
                  <div key={cuisine.name} className="mb-16 last:mb-0">
                    <div className="mb-8">
                      <div className="inline-flex items-center gap-2 mb-2">
                        <span className="inline-block w-1 h-6 bg-[rgb(var(--accent))] rounded-full"></span>
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[rgb(var(--ink))]">
                          {cuisine.name}
                        </h2>
                      </div>
                      <p className="text-base md:text-[17px] leading-7 text-[rgb(var(--muted))]">
                        {cuisine.soupTypes.length} {cuisine.soupTypes.length === 1 ? 'soup type' : 'soup types'} available
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                      {cuisine.soupTypes.map((soup) => (
                        <Link
                          key={soup.name}
                          href={`/restaurants?soupType=${encodeURIComponent(soup.name)}`}
                          className="group rounded-2xl bg-[rgb(var(--surface))] ring-1 ring-black/5 hover:ring-[rgb(var(--accent-light))]/40 shadow-sm hover:shadow-lg transition-all duration-300 p-5 hover:p-6 hover:scale-105 hover:z-10 relative focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 focus:ring-offset-0"
                        >
                          <h3 className="text-lg font-semibold text-[rgb(var(--ink))] mb-2 group-hover:text-[rgb(var(--accent))] transition-colors line-clamp-1">
                            {soup.name}
                          </h3>
                          {soup.description && (
                            <p className="text-sm text-[rgb(var(--muted))] mb-3 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                              {soup.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm mt-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[rgb(var(--accent-light))]/30 text-[rgb(var(--muted))] text-xs font-medium">{cuisine.name}</span>
                            <span className="font-medium text-[rgb(var(--accent))]">{soup.count} {soup.count === 1 ? 'spot' : 'spots'}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-2">
                  No cuisines found
                </h3>
                <p className="text-base md:text-[17px] leading-7 text-[rgb(var(--muted))] mb-6">
                  {searchQuery ? 'Try adjusting your search' : 'No cuisine data available'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[rgb(var(--primary))] text-white hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:ring-offset-0"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )
          ) : (
            // Browse by Soup Type
            filteredSoupTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredSoupTypes.map((soup) => (
                  <Link
                    key={soup.name}
                    href={`/restaurants?soupType=${encodeURIComponent(soup.name)}`}
                    className="group rounded-2xl bg-[rgb(var(--surface))] ring-1 ring-black/5 hover:ring-[rgb(var(--accent-light))]/40 shadow-sm hover:shadow-lg transition-all duration-300 p-5 hover:p-6 hover:scale-105 hover:z-10 relative focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 focus:ring-offset-0"
                  >
                    <h3 className="text-lg font-semibold text-[rgb(var(--ink))] mb-2 group-hover:text-[rgb(var(--accent))] transition-colors line-clamp-1">
                      {soup.name}
                    </h3>
                    {soup.description && (
                      <p className="text-sm text-[rgb(var(--muted))] mb-3 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                        {soup.description}
                      </p>
                    )}
                    <div className="flex items-center justify-end text-sm mt-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[rgb(var(--accent-light))]/40 text-[rgb(var(--accent))] font-medium">{soup.count} {soup.count === 1 ? 'spot' : 'spots'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-2">
                  No soup types found
                </h3>
                <p className="text-base md:text-[17px] leading-7 text-[rgb(var(--muted))] mb-6">
                  {searchQuery ? 'Try adjusting your search' : 'No soup type data available'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[rgb(var(--primary))] text-white hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/40 focus:ring-offset-0"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[rgb(var(--bg))]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[rgb(var(--ink))] mb-4">
            Ready to Find Your Soup?
          </h2>
          <p className="text-base md:text-[17px] leading-7 text-[rgb(var(--muted))] mb-8 max-w-2xl mx-auto">
            Search thousands of restaurants serving your favorite soups
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/restaurants"
              className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-[rgb(var(--accent))] text-white hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/40 focus:ring-offset-0"
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Search Restaurants
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
