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
        <h1 className="text-3xl font-bold text-neutral-900 mb-6">
          About FindSoupNearMe
        </h1>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Our Mission</h2>
        <p className="text-neutral-700 mb-4">
          We're passionate about connecting soup lovers with the best local spots. Our platform curates authentic soup experiences across major US cities.
        </p>
        <p className="text-neutral-700 mb-4">
          From cozy neighborhood joints to upscale restaurants, we help you discover where to find your perfect bowl of soup.
        </p>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Why Soup?</h2>
        <p className="text-neutral-700 mb-4">
          Soup is more than just food—it's comfort, culture, and community in a bowl. Here's why we're soup-obsessed:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-accent-50 p-4 rounded-lg">
            <h3 className="font-bold text-neutral-800 mb-2">Emotional</h3>
            <p className="text-neutral-700">Soup connects us to memories, cultures, and traditions in a way few other foods can.</p>
          </div>
          <div className="bg-accent-50 p-4 rounded-lg">
            <h3 className="font-bold text-neutral-800 mb-2">Seasonal</h3>
            <p className="text-neutral-700">Different soups shine in different seasons, from cooling gazpacho to warming ramen.</p>
          </div>
          <div className="bg-accent-50 p-4 rounded-lg">
            <h3 className="font-bold text-neutral-800 mb-2">Universal</h3>
            <p className="text-neutral-700">Every culture has its own cherished soup traditions worth discovering.</p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Our Coverage</h2>
        <p className="text-neutral-700 mb-4">
          We currently cover 11 major US cities with plans to expand. Each city has been carefully researched to bring you the most authentic and delicious soup experiences.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/ny/new-york/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">New York, NY</Link>
          <Link href="/ca/los-angeles/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Los Angeles, CA</Link>
          <Link href="/il/chicago/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Chicago, IL</Link>
          <Link href="/ca/san-francisco/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">San Francisco, CA</Link>
          <Link href="/wa/seattle/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Seattle, WA</Link>
          <Link href="/tx/dallas/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Dallas, TX</Link>
          <Link href="/fl/miami/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Miami, FL</Link>
          <Link href="/pa/philadelphia/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Philadelphia, PA</Link>
          <Link href="/ca/san-diego/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">San Diego, CA</Link>
          <Link href="/tx/austin/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Austin, TX</Link>
          <Link href="/az/phoenix/restaurants" className="text-primary-500 hover:text-primary-600 hover:underline">Phoenix, AZ</Link>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">For Restaurant Owners</h2>
        <p className="text-neutral-700 mb-4">
          Are you a restaurant owner with amazing soup on your menu? We'd love to feature you! Our platform helps local businesses connect with soup enthusiasts in their area.
        </p>
        
        <div className="text-center mb-8">
          <Link 
            href="mailto:hello@findsoupnearme.com?subject=Restaurant%20Listing%20Request"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md transition-colors"
          >
            Get Listed
          </Link>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Contact Us</h2>
        <p className="text-neutral-700 mb-4">
          Have questions, suggestions, or just want to share your favorite soup spot? We'd love to hear from you!
        </p>
        
        <p className="text-neutral-700">
          Email: <a href="mailto:hello@findsoupnearme.com" className="text-primary-500 hover:underline">hello@findsoupnearme.com</a>
        </p>
      </div>
    </>
  );
}