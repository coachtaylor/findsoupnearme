// src/pages/restaurants/search.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getCityMapping } from '../../lib/launch-cities';

export default function SearchPage() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [soupType, setSoupType] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  useEffect(() => {
    setIsButtonEnabled(location.trim().length > 0);
  }, [location]);

  const soupTypes = [
    { value: '', label: 'Any Soup Type' },
    { value: 'Ramen', label: 'Ramen' },
    { value: 'Pho', label: 'Pho' },
    { value: 'Chowder', label: 'Chowder' },
    { value: 'French Onion', label: 'French Onion' },
    { value: 'Tomato', label: 'Tomato' },
    { value: 'Chicken Noodle', label: 'Chicken Noodle' },
    { value: 'Minestrone', label: 'Minestrone' },
    { value: 'Beef Stew', label: 'Beef Stew' },
    { value: 'Vegetable', label: 'Vegetable' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isButtonEnabled) return;

    let searchUrl = '/restaurants';
    const params = new URLSearchParams();

    if (location) {
      const isZipCode = /^\d{5}$/.test(location.trim());
      const cityMapping = getCityMapping();

      const normalizedLocation = location.toLowerCase().trim();

      if (cityMapping[normalizedLocation]) {
        searchUrl = cityMapping[normalizedLocation];
      } else if (isZipCode) {
        if (location.startsWith('85')) {
          searchUrl = '/az/phoenix/restaurants';
        } else {
          params.append('location', location);
          params.append('type', 'zip');
        }
      } else {
        params.append('location', location);
      }
    }

    if (soupType && soupType !== '') {
      params.append('soupType', soupType);
    }

    const queryString = params.toString();
    if (queryString) {
      searchUrl += `?${queryString}`;
    }
    router.push(searchUrl);
  };

  return (
    <>
      <Head>
        <title>Find Soup Near Me | FindSoupNearMe</title>
        <meta name="description" content="Search for the perfect bowl of soup in your area. Filter by location, soup type, and more." />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6 text-center">
            Find the Perfect Bowl of Soup Near You
          </h1>

          <p className="text-neutral-700 mb-8 text-center">
            Enter your location and preferences to discover delicious soup options in your area.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="location" className="block text-neutral-800 font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                placeholder="Enter city, state, or ZIP code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="soupType" className="block text-neutral-800 font-medium mb-2">
                Soup Type
              </label>
              <select
                id="soupType"
                value={soupType}
                onChange={(e) => setSoupType(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {soupTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={!isButtonEnabled}
                className={`w-full font-medium py-3 px-4 rounded-md ${
                  isButtonEnabled
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Search Restaurants
              </button>
            </div>
          </form>

          <div className="mt-12">
            <h2 className="text-lg font-semibold text-neutral-800 mb-3">
              Popular Searches
            </h2>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/ny/new-york/restaurants"
                className="inline-block px-3 py-1 bg-orange-100 text-neutral-700 rounded-full hover:bg-orange-200"
              >
                Ramen in New York
              </Link>
              <Link
                href="/ca/los-angeles/restaurants"
                className="inline-block px-3 py-1 bg-orange-100 text-neutral-700 rounded-full hover:bg-orange-200"
              >
                Pho in Los Angeles
              </Link>
              <Link
                href="/il/chicago/restaurants"
                className="inline-block px-3 py-1 bg-orange-100 text-neutral-700 rounded-full hover:bg-orange-200"
              >
                Chowder in Chicago
              </Link>
              <Link
                href="/wa/seattle/restaurants"
                className="inline-block px-3 py-1 bg-orange-100 text-neutral-700 rounded-full hover:bg-orange-200"
              >
                Ramen in Seattle
              </Link>
              <Link
                href="/tx/austin/restaurants"
                className="inline-block px-3 py-1 bg-orange-100 text-neutral-700 rounded-full hover:bg-orange-200"
              >
                Tortilla Soup in Austin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
