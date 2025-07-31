// Update src/pages/restaurants/index.js
import RestaurantListingPage from '../../components/restaurant/RestaurantListingPage';

export default function AllRestaurantsPage() {
  return (
    <RestaurantListingPage 
      title="All Soup Restaurants" 
      description="Discover the best soup restaurants from across the United States."
    />
  );
}