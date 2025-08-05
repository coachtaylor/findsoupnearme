// src/pages/about/index.js
import Head from 'next/head';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About FindSoupNearMe | Find The Best Soup Near You</title>
        <meta name="description" content="Learn about FindSoupNearMe, the #1 platform for discovering, rating, and ordering soup from restaurants across U.S. cities." />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-soup-brown-900 mb-6">
          About FindSoupNearMe
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-soup-brown-800 mb-4">Our Mission</h2>
          <p className="text-soup-brown-700 mb-4">
            FindSoupNearMe aims to become the #1 soup discovery platform in the United States, offering an emotional, trusted, and user-driven guide to warm, nourishing meals.
          </p>
          <p className="text-soup-brown-700 mb-4">
            We believe that soup is more than just food—it's comfort, tradition, and care in a bowl. Whether you're craving a hearty bowl of chowder on a cold day, searching for the perfect pho, or looking to discover unique ramen spots in your city, we're here to help you find your perfect bowl.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-soup-brown-800 mb-4">Why Soup?</h2>
          <p className="text-soup-brown-700 mb-4">
            Users searching for "soup near me" are underserved by current tools like Yelp or Google Maps, which are too broad and not optimized for comfort food discovery. Soup is emotional, nostalgic, seasonal—and deserves a specialized platform that helps users find exactly what they're craving.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-soup-orange-50 p-4 rounded-lg">
              <h3 className="font-bold text-soup-brown-800 mb-2">Emotional</h3>
              <p className="text-soup-brown-700">Soup connects us to memories, cultures, and traditions in a way few other foods can.</p>
            </div>
            <div className="bg-soup-orange-50 p-4 rounded-lg">
              <h3 className="font-bold text-soup-brown-800 mb-2">Seasonal</h3>
              <p className="text-soup-brown-700">Different soups shine in different seasons, from cooling gazpacho to warming ramen.</p>
            </div>
            <div className="bg-soup-orange-50 p-4 rounded-lg">
              <h3 className="font-bold text-soup-brown-800 mb-2">Universal</h3>
              <p className="text-soup-brown-700">Every culture has its own cherished soup traditions worth discovering.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-soup-brown-800 mb-4">Our Coverage</h2>
          <p className="text-soup-brown-700 mb-4">
            We're currently focused on these metropolitan areas with strong food cultures:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/ny/new-york/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">New York, NY</Link>
            <Link href="/ca/los-angeles/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Los Angeles, CA</Link>
            <Link href="/il/chicago/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Chicago, IL</Link>
            <Link href="/ca/san-francisco/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">San Francisco, CA</Link>
            <Link href="/wa/seattle/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Seattle, WA</Link>
            <Link href="/tx/dallas/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Dallas, TX</Link>
            <Link href="/fl/miami/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Miami, FL</Link>
            <Link href="/pa/philadelphia/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Philadelphia, PA</Link>
            <Link href="/ca/san-diego/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">San Diego, CA</Link>
            <Link href="/tx/austin/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Austin, TX</Link>
            <Link href="/az/phoenix/restaurants" className="text-soup-red-600 hover:text-soup-red-700 hover:underline">Phoenix, AZ</Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-soup-brown-800 mb-4">For Restaurant Owners</h2>
          <p className="text-soup-brown-700 mb-4">
            Are you a restaurant owner proud of your soup offerings? FindSoupNearMe helps connect hungry customers with your delicious creations.
          </p>
          <div className="mt-4">
            <Link 
              href="/restaurant/claim" 
              className="inline-block bg-soup-red-600 hover:bg-soup-red-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Claim Your Restaurant
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-soup-brown-800 mb-4">Contact Us</h2>
          <p className="text-soup-brown-700 mb-4">
            Have questions, suggestions, or just want to talk soup? We'd love to hear from you!
          </p>
          <p className="text-soup-brown-700">
            Email: <a href="mailto:hello@findsoupnearme.com" className="text-soup-red-600 hover:underline">hello@findsoupnearme.com</a>
          </p>
        </div>
      </div>
    </>
  );
}