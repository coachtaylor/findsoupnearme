// src/pages/restaurants/search.js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SearchPage() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [soupType, setSoupType] = useState('');
  
  // Common soup types for the dropdown
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
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct search URL
    let searchUrl = '/restaurants';
    
    // Add query parameters if they exist
    const params = new URLSearchParams();
    
    if (location) {
      // For simplicity, we'll just redirect to a city page if location matches a city
      // In a real app, you'd want to use a proper geocoding service
      const cityMapping = {
        'new york': '/ny/new-york/restaurants',
        'los angeles': '/ca/los-angeles/restaurants',
        'chicago': '/il/chicago/restaurants',
        'houston': '/tx/houston/restaurants',
        'miami': '/fl/miami/restaurants',
        'seattle': '/wa/seattle/restaurants',
        // Add more mappings as needed
      };
      
      const normalizedLocation = location.toLowerCase();
      
      if (cityMapping[normalizedLocation]) {
        searchUrl = cityMapping[normalizedLocation];
      } else {
        params.append('location', location);
      }
    }
    
    if (soupType) {
      params.append('soupType', soupType);
    }
    
    // Add query string if there are parameters
    const queryString = params.toString();
    if (queryString) {
      searchUrl += `?${queryString}`;
    }
    
    // Navigate to the search results
    router.push(searchUrl);
  };
  
  return (
    <>
      <Head>
        <title>Find Soup Near Me | FindSoupNearMe</title>
        <meta name="description" content="Search for the perfect bowl of soup in your area. Filter by location, soup type, and more." />
      </Head>
      
      <div className="bg-soup-orange-50 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-soup-brown-900 mb-6 text-center">
              Find the Perfect Bowl of Soup Near You
            </h1>
            
            <p className="text-soup-brown-700 mb-8 text-center">
              Enter your location and preferences to discover delicious soup options in your area.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Location Input */}
              <div>
                <label htmlFor="location" className="block text-soup-brown-800 font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  placeholder="Enter city, state, or ZIP code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-soup-brown-300 rounded-lg focus:ring-2 focus:ring-soup-red-500 focus:border-soup-red-500"
                />
              </div>
              
              {/* Soup Type Dropdown */}
              <div>
                <label htmlFor="soupType" className="block text-soup-brown-800 font-medium mb-2">
                  Soup Type
                </label>
                <select
                  id="soupType"
                  value={soupType}
                  onChange={(e) => setSoupType(e.target.value)}
                  className="w-full px-4 py-3 border border-soup-brown-300 rounded-lg focus:ring-2 focus:ring-soup-red-500 focus:border-soup-red-500"
                >
                  {soupTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-soup-red-600 hover:bg-soup-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Search Restaurants
              </button>
            </form>
            
            {/* Popular Searches */}
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-soup-brown-800 mb-3">
                Popular Searches
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <a 
                  href="/ny/new-york/restaurants"
                  className="inline-block px-3 py-1 bg-soup-orange-100 text-soup-brown-700 rounded-full hover:bg-soup-orange-200"
                >
                  Ramen in New York
                </a>
                <a 
                  href="/ca/los-angeles/restaurants"
                  className="inline-block px-3 py-1 bg-soup-orange-100 text-soup-brown-700 rounded-full hover:bg-soup-orange-200"
                >
                  Pho in Los Angeles
                </a>
                <a 
                  href="/il/chicago/restaurants"
                  className="inline-block px-3 py-1 bg-soup-orange-100 text-soup-brown-700 rounded-full hover:bg-soup-orange-200"
                >
                  Chowder in Chicago
                </a>
                <a 
                  href="/wa/seattle/restaurants"
                  className="inline-block px-3 py-1 bg-soup-orange-100 text-soup-brown-700 rounded-full hover:bg-soup-orange-200"
                >
                  Ramen in Seattle
                </a>
                <a 
                  href="/tx/austin/restaurants"
                  className="inline-block px-3 py-1 bg-soup-orange-100 text-soup-brown-700 rounded-full hover:bg-soup-orange-200"
                >
                  Tortilla Soup in Austin
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}