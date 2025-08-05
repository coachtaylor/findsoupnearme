// src/components/search/SearchBar.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ className = '', placeholder = 'Search for soup, restaurants, or locations...' }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
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
    
    // First check if it's a direct city match
    if (cityMapping[normalizedQuery]) {
      router.push(cityMapping[normalizedQuery]);
      return;
    }
    
    // Then check if it's a Phoenix ZIP code
    if (isZipCode && searchQuery.startsWith('85')) {
      router.push('/az/phoenix/restaurants');
      return;
    }
    
    // Otherwise, go to the restaurant search page with the query
    router.push(`/restaurants?location=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="flex items-center rounded-full bg-white p-1 shadow-lg">
        <input
          type="text"
          placeholder={placeholder}
          className="flex-grow px-5 py-3 text-gray-700 focus:outline-none rounded-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="flex items-center justify-center p-3 bg-soup-red rounded-full text-white hover:bg-red-700 transition-colors"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}