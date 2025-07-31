// src/pages/[state]/[city]/restaurants/index.js
import { useRouter } from 'next/router';
import RestaurantListingPage from '../../../../components/restaurant/RestaurantListingPage';
import Error from 'next/error';

// Map of state abbreviations to full names (same as in [state]/restaurants/index.js)
const stateNames = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming'
};

// Convert URL-friendly slug to proper city name
function formatCityName(citySlug) {
  return citySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CityRestaurantsPage() {
  const router = useRouter();
  const { state, city } = router.query;
  
  // Handle loading state
  if (router.isFallback || !state || !city) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  // Normalize state to uppercase
  const stateUpper = state.toUpperCase();
  
  // Format city name
  const cityName = formatCityName(city);
  
  // Get the full state name
  const stateName = stateNames[stateUpper] || stateUpper;
  
  return (
    <RestaurantListingPage 
      title={`Soup Restaurants in ${cityName}, ${stateName}`}
      description={`Find the best soup restaurants in ${cityName}, ${stateName}. Browse by soup type, rating, and more.`}
      city={cityName}
      state={stateUpper}
    />
  );
}

// Pre-render pages for popular city/state combinations
export async function getStaticPaths() {
  // Start with a subset of city/state combinations for static generation
  const popularCityStates = [
    { city: 'new-york', state: 'ny' },
    { city: 'los-angeles', state: 'ca' },
    { city: 'chicago', state: 'il' },
    { city: 'houston', state: 'tx' },
    { city: 'miami', state: 'fl' },
    { city: 'seattle', state: 'wa' },
  ];
  
  const paths = popularCityStates.map((location) => ({
    params: { 
      state: location.state.toLowerCase(),
      city: location.city.toLowerCase()
    }
  }));
  
  return {
    paths,
    fallback: true, // Generate other cities on demand
  };
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // Revalidate every hour
  };
}