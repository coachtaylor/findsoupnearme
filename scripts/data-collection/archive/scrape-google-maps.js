/**
 * Google Maps Scraper for Soup Restaurants
 * 
 * This script uses the Google Maps API to collect data about soup restaurants
 * in specified cities. It extracts name, address, ratings, reviews, and other
 * essential information.
 * 
 * Usage:
 * node scrape-google-maps.js --city="New York" --state="NY"
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('city', {
    description: 'City to search for soup restaurants',
    type: 'string',
    demandOption: true
  })
  .option('state', {
    description: 'State abbreviation (e.g., NY, CA)',
    type: 'string',
    demandOption: true
  })
  .option('limit', {
    description: 'Maximum number of results to return',
    type: 'number',
    default: 50
  })
  .option('output', {
    description: 'Output file path',
    type: 'string',
    default: './data/restaurants.json'
  })
  .help()
  .alias('help', 'h')
  .argv;

// Google Maps API Key
const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;

if (!apiKey) {
  console.error('Error: Google Maps API key not found. Please set GOOGLE_MAPS_SERVER_API_KEY in your .env.local file');
  process.exit(1);
}

// Function to search for soup restaurants in a specific city
async function searchSoupRestaurants(city, state, limit) {
  try {
    // Initial search for places
    const searchQuery = `soup restaurants in ${city}, ${state}`;
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    console.log(`Searching for soup restaurants in ${city}, ${state}...`);
    
    const searchResponse = await axios.get(searchUrl);
    
    if (searchResponse.data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${searchResponse.data.status}`);
    }
    
    const places = searchResponse.data.results;
    let nextPageToken = searchResponse.data.next_page_token;
    
    console.log(`Found ${places.length} results on first page`);
    
    // If we have a next page token, get additional pages
    while (nextPageToken && places.length < limit) {
      // Google requires a delay before using the next_page_token
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nextPageUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
      const nextPageResponse = await axios.get(nextPageUrl);
      
      if (nextPageResponse.data.status !== 'OK') {
        console.warn(`Warning: Could not fetch next page: ${nextPageResponse.data.status}`);
        break;
      }
      
      places.push(...nextPageResponse.data.results);
      nextPageToken = nextPageResponse.data.next_page_token;
      
      console.log(`Added ${nextPageResponse.data.results.length} more results, total: ${places.length}`);
    }
    
    // Truncate to limit if needed
    const limitedPlaces = places.slice(0, limit);
    
    // Get detailed information for each place
    const detailedRestaurants = await Promise.all(
      limitedPlaces.map(async (place) => {
        return await getRestaurantDetails(place);
      })
    );
    
    return detailedRestaurants;
  } catch (error) {
    console.error('Error searching for restaurants:', error);
    throw error;
  }
}

// Function to get detailed information about a restaurant
async function getRestaurantDetails(place) {
  try {
    const placeId = place.place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,place_id,formatted_address,formatted_phone_number,website,opening_hours,rating,user_ratings_total,reviews,geometry,price_level,photos&key=${apiKey}`;
    
    const detailsResponse = await axios.get(detailsUrl);
    
    if (detailsResponse.data.status !== 'OK') {
      console.warn(`Warning: Could not fetch details for ${place.name}: ${detailsResponse.data.status}`);
      return null;
    }
    
    const details = detailsResponse.data.result;
    
    // Parse address components
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';
    let country = '';
    
    // Extract address components from formatted_address
    const addressParts = details.formatted_address.split(', ');
    if (addressParts.length >= 3) {
      street = addressParts[0];
      city = addressParts[1];
      
      // Handle state and zip code (usually in format "STATE ZIP")
      const stateZipParts = addressParts[2].split(' ');
      if (stateZipParts.length >= 2) {
        state = stateZipParts[0];
        zipCode = stateZipParts[1];
      }
      
      if (addressParts.length >= 4) {
        country = addressParts[3];
      }
    }
    
    // Get a photo reference (if available)
    let photoReference = null;
    if (details.photos && details.photos.length > 0) {
      photoReference = details.photos[0].photo_reference;
    }
    
    // Get positive and negative reviews
    let positiveReview = null;
    let negativeReview = null;
    
    if (details.reviews && details.reviews.length > 0) {
      // Sort by rating
      const sortedReviews = [...details.reviews].sort((a, b) => b.rating - a.rating);
      
      // Get highest rated review
      if (sortedReviews.length > 0 && sortedReviews[0].rating >= 4) {
        positiveReview = {
          author: sortedReviews[0].author_name,
          rating: sortedReviews[0].rating,
          text: sortedReviews[0].text,
          time: sortedReviews[0].time
        };
      }
      
      // Get lowest rated review
      if (sortedReviews.length > 1) {
        const lowestRatedReview = sortedReviews[sortedReviews.length - 1];
        if (lowestRatedReview.rating <= 3) {
          negativeReview = {
            author: lowestRatedReview.author_name,
            rating: lowestRatedReview.rating,
            text: lowestRatedReview.text,
            time: lowestRatedReview.time
          };
        }
      }
    }
    
    // Format restaurant data
    return {
      name: details.name,
      placeId: details.place_id,
      fullAddress: details.formatted_address,
      streetAddress: street,
      city: city,
      state: state,
      zipCode: zipCode,
      country: country || 'USA',
      phoneNumber: details.formatted_phone_number || '',
      website: details.website || '',
      latitude: details.geometry?.location?.lat || 0,
      longitude: details.geometry?.location?.lng || 0,
      rating: details.rating || 0,
      totalRatings: details.user_ratings_total || 0,
      priceLevel: details.price_level || 0,
      photoReference: photoReference,
      positiveReview: positiveReview,
      negativeReview: negativeReview,
      openingHours: details.opening_hours?.weekday_text || [],
    };
  } catch (error) {
    console.error(`Error getting details for ${place.name}:`, error);
    return null;
  }
}

// Main function
async function main() {
  const { city, state, limit, output } = argv;
  
  try {
    console.log(`Starting scraping process for ${city}, ${state}...`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Search for soup restaurants
    const restaurants = await searchSoupRestaurants(city, state, limit);
    
    // Filter out null results (failed detail fetches)
    const validRestaurants = restaurants.filter(restaurant => restaurant !== null);
    
    console.log(`Found ${validRestaurants.length} valid soup restaurants in ${city}, ${state}`);
    
    // Write results to output file
    fs.writeFileSync(output, JSON.stringify(validRestaurants, null, 2));
    
    console.log(`Data saved to ${output}`);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the main function
main();