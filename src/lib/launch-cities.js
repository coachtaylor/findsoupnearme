// Launch cities configuration
// Only these cities will be shown in the UI during initial launch

export const LAUNCH_CITIES = [
  { name: 'Los Angeles', state: 'CA' },
  { name: 'San Diego', state: 'CA' },
  { name: 'Seattle', state: 'WA' },
  { name: 'Phoenix', state: 'AZ' },
];

// Helper function to check if a city is a launch city
export function isLaunchCity(cityName, stateCode) {
  if (!cityName || !stateCode) return false;
  const normalizedCity = cityName.toLowerCase().trim();
  const normalizedState = stateCode.toUpperCase().trim();
  
  return LAUNCH_CITIES.some(
    (city) =>
      city.name.toLowerCase() === normalizedCity &&
      city.state.toUpperCase() === normalizedState
  );
}

// Helper function to get city mapping for search
export function getCityMapping() {
  return {
    'los angeles': '/ca/los-angeles/restaurants',
    'san diego': '/ca/san-diego/restaurants',
    'seattle': '/wa/seattle/restaurants',
    'phoenix': '/az/phoenix/restaurants',
  };
}

