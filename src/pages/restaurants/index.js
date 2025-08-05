// src/pages/restaurants/index.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import RestaurantListingPage from '../../components/restaurant/RestaurantListingPage';

export default function AllRestaurantsPage() {
  const router = useRouter();
  const { location, soupType } = router.query;
  const [title, setTitle] = useState('All Soup Restaurants');
  const [description, setDescription] = useState('Discover the best soup restaurants from across the United States.');
  
  // Update title and description based on search parameters
  useEffect(() => {
    if (location) {
      setTitle(`Soup Restaurants near ${location}`);
      setDescription(`Find the best soup restaurants near ${location}. Browse by soup type, rating, and more.`);
    } else {
      setTitle('All Soup Restaurants');
      setDescription('Discover the best soup restaurants from across the United States.');
    }
  }, [location]);
  
  return (
    <>
      <Head>
        <title>{title} | FindSoupNearMe</title>
        <meta name="description" content={description} />
      </Head>
      
      <RestaurantListingPage 
        title={title}
        description={description}
        searchLocation={location}
        searchSoupType={soupType}
      />
    </>
  );
}