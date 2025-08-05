// src/pages/cities/index.js
import Head from 'next/head';
import Link from 'next/link';

// List of featured cities with their states
const featuredCities = [
  // Launch cities from your PRD
  { name: 'New York', state: 'NY', description: 'Diverse international options' },
  { name: 'Los Angeles', state: 'CA', description: 'Health-conscious options' },
  { name: 'Chicago', state: 'IL', description: 'Hearty winter soups' },
  { name: 'San Francisco', state: 'CA', description: 'Farm-to-table, organic' },
  { name: 'Seattle', state: 'WA', description: 'Seafood soups, ramen' },
  { name: 'Dallas', state: 'TX', description: 'Tex-Mex soups, chilis' },
  { name: 'Miami', state: 'FL', description: 'Cuban, Latin American soups' },
  { name: 'Philadelphia', state: 'PA', description: 'Historic establishments' },
  { name: 'San Diego', state: 'CA', description: 'Fish soups, Mexican options' },
  { name: 'Austin', state: 'TX', description: 'Food truck scene' },
  { name: 'Phoenix', state: 'AZ', description: 'Southwestern specialties' },
];

// Organize cities by state
const citiesByState = featuredCities.reduce((acc, city) => {
  if (!acc[city.state]) {
    acc[city.state] = [];
  }
  acc[city.state].push(city);
  return acc;
}, {});

// Sort states alphabetically
const sortedStates = Object.keys(citiesByState).sort();

export default function CitiesPage() {
  return (
    <>
      <Head>
        <title>Explore Soup by City | FindSoupNearMe</title>
        <meta name="description" content="Discover the best soup restaurants in cities across the United States." />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-soup-brown-900 mb-6">
          Explore Soup by City
        </h1>
        
        <p className="text-soup-brown-700 mb-8">
          Browse our curated list of cities to find the perfect bowl of soup near you.
          Each city offers unique flavors and specialties!
        </p>
        
        {/* Featured Cities */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-soup-brown-800 mb-4">
            Featured Cities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCities.slice(0, 6).map((city) => (
              <Link 
                key={`${city.state}-${city.name}`}
                href={`/${city.state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-soup-orange-100"
              >
                <h3 className="text-xl font-bold text-soup-brown-900 mb-1">
                  {city.name}, {city.state}
                </h3>
                <p className="text-soup-brown-600 mb-3">
                  {city.description}
                </p>
                <span className="text-soup-red-600 font-medium">
                  View restaurants &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>
        
        {/* All Cities by State */}
        <section>
          <h2 className="text-2xl font-bold text-soup-brown-800 mb-6">
            All Cities by State
          </h2>
          
          <div className="space-y-8">
            {sortedStates.map((state) => (
              <div key={state} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-soup-brown-900 mb-4">
                  {state}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {citiesByState[state].map((city) => (
                    <Link 
                      key={city.name}
                      href={`/${state.toLowerCase()}/${city.name.toLowerCase().replace(/\s+/g, '-')}/restaurants`}
                      className="text-soup-red-600 hover:text-soup-red-700 hover:underline font-medium"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}