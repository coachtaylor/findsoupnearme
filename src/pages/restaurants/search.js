// src/pages/restaurants/search.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function SearchPage() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [soupType, setSoupType] = useState('');
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  
  // Enable button when location has valid input
  useEffect(() => {
    setIsButtonEnabled(location.trim().length > 0);
  }, [location]);
  
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
    
    if (!isButtonEnabled) {
      return; // Prevent submission if button is disabled
    }
    
    // Construct search URL
    let searchUrl = '/restaurants';
    
    // Add query parameters if they exist
    const params = new URLSearchParams();
    
    if (location) {
      // Check if input is a ZIP code (5 digits)
      const isZipCode = /^\d{5}$/.test(location.trim());
      
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
      
      const normalizedLocation = location.toLowerCase().trim();
      
      if (cityMapping[normalizedLocation]) {
        // Direct match to a known city name
        searchUrl = cityMapping[normalizedLocation];
      } else if (isZipCode) {
        // For ZIP codes, we'll use query parameters
        // Phoenix ZIP codes are 85xxx
        if (location.startsWith('85')) {
          searchUrl = '/az/phoenix/restaurants';
        } else {
          // For other ZIP codes, pass as query parameter
          params.append('location', location);
          params.append('type', 'zip');
        }
      } else {
        // For any other location string, pass as query parameter
        params.append('location', location);
      }
    }
    
    if (soupType && soupType !== '') {
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
      
      <div className="container mx-auto px-4 py-8">
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
            
            {/* Submit Button - Disabled until location entered */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={!isButtonEnabled}
                className={`w-full font-medium py-3 px-4 rounded-md ${
                  isButtonEnabled 
                    ? 'bg-[#F87171] hover:bg-[#EF4444] text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Search Restaurants
              </button>
            </div>
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
    </>
  );
}