// src/components/search/SearchBar.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ className = '', placeholder = 'Search for soup, restaurants, or locations...' }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecent(Array.isArray(saved) ? saved.slice(0, 5) : []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!searchQuery) { setSuggestions([]); return; }
    const base = ['Ramen', 'Pho', 'Chowder', 'Tomato', 'Chicken Noodle', 'Miso', 'Udon', 'Wonton'];
    const filtered = base.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6);
    setSuggestions(filtered);
  }, [searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const updated = [searchQuery, ...saved.filter((q) => q !== searchQuery)].slice(0, 8);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecent(updated.slice(0,5));
    } catch {}
    
    // Check if input is a ZIP code (5 digits)
    const isZipCode = /^\d{5}$/.test(searchQuery.trim());
    
    // Map of known city names to their state/city URL paths
    const cityMapping = {
      'new york': '/ny/new-york/restaurants',
      'los angeles': '/ca/los-angeles/restaurants',
      'chicago': '/il/chicago/restaurants',
      'houston': '/tx/houston/restaurants',
      'miami': '/fl/miami/restaurants',
      'seattle': '/wa/seattle/restaurants',
      'phoenix': '/az/phoenix/restaurants',
      'austin': '/tx/austin/restaurants',
      'dallas': '/tx/dallas/restaurants',
      'san francisco': '/ca/san-francisco/restaurants',
      'san diego': '/ca/san-diego/restaurants',
      'philadelphia': '/pa/philadelphia/restaurants'
    };
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    // First check if it&apos;s a direct city match
    if (cityMapping[normalizedQuery]) {
      router.push(cityMapping[normalizedQuery]);
      return;
    }
    
    // Then check if it&apos;s a Phoenix ZIP code
    if (isZipCode && searchQuery.startsWith('85')) {
      router.push('/az/phoenix/restaurants');
      return;
    }
    
    // Otherwise, go to the restaurant search page with the query
    router.push(`/restaurants?location=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className={`relative ${className}`} onBlur={() => setTimeout(()=>setOpen(false), 100)}>
      <form onSubmit={handleSubmit} className="w-full" onFocus={() => setOpen(true)}>
        <div className="flex items-center rounded-full bg-white p-1 shadow-lg">
          <input
            type="text"
            placeholder={placeholder}
            className="flex-grow px-5 py-3 text-gray-700 focus:outline-none rounded-full min-h-[44px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="flex items-center justify-center p-3 min-h-[44px] min-w-[44px] bg-soup-red rounded-full text-white hover:bg-red-700 transition-colors"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </form>

      {open && (suggestions.length > 0 || recent.length > 0) && (
        <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden">
          {suggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-neutral-500">Autocomplete</div>
              {suggestions.map((s) => (
                <button key={s} className="w-full text-left px-4 py-3 hover:bg-neutral-50 min-h-[44px]" onMouseDown={() => { setSearchQuery(s); setOpen(false); setTimeout(()=>handleSubmit(new Event('submit')), 0); }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {recent.length > 0 && (
            <div className="border-t border-neutral-200">
              <div className="px-4 py-2 text-xs text-neutral-500">Recent</div>
              {recent.map((r) => (
                <button key={r} className="w-full text-left px-4 py-3 hover:bg-neutral-50 min-h-[44px]" onMouseDown={() => { setSearchQuery(r); setOpen(false); setTimeout(()=>handleSubmit(new Event('submit')), 0); }}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}