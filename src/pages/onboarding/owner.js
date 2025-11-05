// src/pages/onboarding/owner.js
/**
 * Restaurant Owner Onboarding Wizard
 * Helps owners claim existing restaurants or create new ones
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';

export default function OwnerOnboarding() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1: Choose path, 2: Search/Create, 3: Confirmation
  const [path, setPath] = useState(null); // 'claim' or 'create'
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  
  // Create state
  const [newRestaurantData, setNewRestaurantData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    website: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  // Search for restaurants
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const { data, error: searchError } = await supabase
        .from('restaurants')
        .select('id, name, address, city, state, phone, is_active')
        .or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .eq('is_active', true)
        .limit(10);
      
      if (searchError) throw searchError;
      
      setSearchResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search restaurants');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Submit claim
  const handleSubmitClaim = async () => {
    if (!selectedRestaurant) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create a claim
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .insert({
          restaurant_id: selectedRestaurant.id,
          user_id: user.id,
          status: 'pending',
          evidence: {
            user_email: user.email,
            user_phone: user.user_metadata?.phone_number || '',
            restaurant_name: user.user_metadata?.restaurant_name || '',
          },
        })
        .select()
        .single();
      
      if (claimError) throw claimError;
      
      // Success - show confirmation
      setStep(3);
    } catch (err) {
      console.error('Claim submission error:', err);
      setError(err.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Create new restaurant
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Create restaurant as draft
      const { data: restaurant, error: createError } = await supabase
        .from('restaurants')
        .insert({
          name: newRestaurantData.name,
          address: newRestaurantData.address,
          city: newRestaurantData.city,
          state: newRestaurantData.state,
          zip_code: newRestaurantData.zip_code,
          phone: newRestaurantData.phone,
          website: newRestaurantData.website,
          status: 'draft',
          created_by: user.id,
          is_active: false,
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      // Create a claim for this new restaurant
      const { error: claimError } = await supabase
        .from('claims')
        .insert({
          restaurant_id: restaurant.id,
          user_id: user.id,
          status: 'pending',
          evidence: {
            user_email: user.email,
            user_phone: user.user_metadata?.phone_number || '',
            is_new_restaurant: true,
          },
        });
      
      if (claimError) throw claimError;
      
      // Success - show confirmation
      setStep(3);
    } catch (err) {
      console.error('Create restaurant error:', err);
      setError(err.message || 'Failed to create restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  
  // Step 1: Choose Path
  if (step === 1) {
    return (
      <>
        <Head>
          <title>Restaurant Owner Setup - FindSoupNearMe</title>
        </Head>
        
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome, Restaurant Owner! 🏪
              </h1>
              <p className="text-lg text-gray-600">
                Let's get your restaurant set up on FindSoupNearMe
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Claim Existing */}
              <button
                onClick={() => {
                  setPath('claim');
                  setStep(2);
                }}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  My Restaurant is Already Listed
                </h3>
                <p className="text-gray-600 mb-4">
                  Search for your restaurant and claim ownership to start managing your listing
                </p>
                <div className="text-orange-600 font-medium flex items-center">
                  Claim Existing Restaurant
                  <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              
              {/* Create New */}
              <button
                onClick={() => {
                  setPath('create');
                  setStep(2);
                }}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <div className="text-5xl mb-4">➕</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  My Restaurant is Not Listed
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your restaurant to FindSoupNearMe and start attracting customers
                </p>
                <div className="text-orange-600 font-medium flex items-center">
                  Add New Restaurant
                  <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Step 2: Search or Create
  if (step === 2 && path === 'claim') {
    return (
      <>
        <Head>
          <title>Claim Your Restaurant - FindSoupNearMe</title>
        </Head>
        
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back
            </button>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Find Your Restaurant
              </h2>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by restaurant name, address, or city..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Search Results ({searchResults.length})
                  </h3>
                  
                  {searchResults.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedRestaurant?.id === restaurant.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                      onClick={() => setSelectedRestaurant(restaurant)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                          <p className="text-sm text-gray-600">
                            {restaurant.address}, {restaurant.city}, {restaurant.state}
                          </p>
                          {restaurant.phone && (
                            <p className="text-sm text-gray-500">{restaurant.phone}</p>
                          )}
                        </div>
                        {selectedRestaurant?.id === restaurant.id && (
                          <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* No Results */}
              {searchResults.length === 0 && searchQuery && !isSearching && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No restaurants found matching "{searchQuery}"
                  </p>
                  <button
                    onClick={() => {
                      setPath('create');
                      setNewRestaurantData(prev => ({ ...prev, name: searchQuery }));
                    }}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Add it as a new restaurant instead →
                  </button>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              {/* Submit Button */}
              {selectedRestaurant && (
                <div className="mt-8 pt-6 border-t">
                  <button
                    onClick={handleSubmitClaim}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 font-medium"
                  >
                    {isSubmitting ? 'Submitting Claim...' : 'Claim This Restaurant'}
                  </button>
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    We'll review your claim and verify ownership within 48 hours
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Step 2: Create New Restaurant
  if (step === 2 && path === 'create') {
    return (
      <>
        <Head>
          <title>Add Your Restaurant - FindSoupNearMe</title>
        </Head>
        
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
              ← Back
            </button>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add Your Restaurant
              </h2>
              
              <form onSubmit={handleCreateRestaurant} className="space-y-6">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRestaurantData.name}
                    onChange={(e) => setNewRestaurantData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="My Amazing Soup Restaurant"
                  />
                </div>
                
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRestaurantData.address}
                    onChange={(e) => setNewRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123 Main Street"
                  />
                </div>
                
                {/* City, State, ZIP */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRestaurantData.city}
                      onChange={(e) => setNewRestaurantData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Los Angeles"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRestaurantData.state}
                      onChange={(e) => setNewRestaurantData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="CA"
                      maxLength={2}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRestaurantData.zip_code}
                    onChange={(e) => setNewRestaurantData(prev => ({ ...prev, zip_code: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="90001"
                  />
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newRestaurantData.phone}
                    onChange={(e) => setNewRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                {/* Website (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={newRestaurantData.website}
                    onChange={(e) => setNewRestaurantData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://myrestaurant.com"
                  />
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                
                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your restaurant will be submitted for verification. 
                    You'll be able to fully manage your listing once we verify your ownership (usually within 48 hours).
                  </p>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Restaurant for Verification'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Step 3: Confirmation
  if (step === 3) {
    return (
      <>
        <Head>
          <title>Claim Submitted - FindSoupNearMe</title>
        </Head>
        
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Claim Submitted Successfully! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              We've received your restaurant claim and will review it soon.
            </p>
            
            {/* What's Next */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-left">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                What Happens Next?
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-2xl mr-4">1️⃣</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Verification (24-48 hours)</h3>
                    <p className="text-gray-600">Our team will review your claim and verify ownership</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-2xl mr-4">2️⃣</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Notification</h3>
                    <p className="text-gray-600">You'll receive an email when your claim is approved</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 text-2xl mr-4">3️⃣</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Start Managing</h3>
                    <p className="text-gray-600">Update your menu, hours, photos, and connect with customers</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              Browse Soup Restaurants
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </>
    );
  }
  
  return null;
}