import { useState } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ className = '', placeholder = 'Search for soup, restaurants, or locations...' }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
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