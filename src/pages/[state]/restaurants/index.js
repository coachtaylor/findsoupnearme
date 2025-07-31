// src/pages/[state]/restaurants/index.js
import { useRouter } from 'next/router';
import RestaurantListingPage from '../../../components/restaurant/RestaurantListingPage';
import Error from 'next/error';

// List of valid state abbreviations
const validStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Map of state abbreviations to full names
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

export default function StateRestaurantsPage() {
  const router = useRouter();
  const { state } = router.query;
  
  // Handle loading state
  if (router.isFallback || !state) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }
  
  // Normalize state to uppercase
  const stateUpper = state.toUpperCase();
  
  // Check if the state is valid
  if (!validStates.includes(stateUpper)) {
    return <Error statusCode={404} title="State not found" />;
  }
  
  // Get the full state name
  const stateName = stateNames[stateUpper] || stateUpper;
  
  return (
    <RestaurantListingPage 
      title={`Soup Restaurants in ${stateName}`}
      description={`Find the best soup restaurants in ${stateName}. Browse by city, soup type, and more.`}
      state={stateUpper}
    />
  );
}

// Pre-render pages for popular states
export async function getStaticPaths() {
  // Start with a subset of states for static generation
  const popularStates = ['NY', 'CA', 'IL', 'TX', 'FL', 'WA'];
  
  const paths = popularStates.map((state) => ({
    params: { state: state.toLowerCase() }
  }));
  
  return {
    paths,
    fallback: true, // Generate other states on demand
  };
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 3600, // Revalidate every hour
  };
}