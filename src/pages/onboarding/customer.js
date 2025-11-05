// src/pages/onboarding/customer.js
/**
 * Customer Onboarding Page
 * Simple welcome message and redirect to browse restaurants
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';

export default function CustomerOnboarding() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  const completeOnboarding = async () => {
    setIsCompleting(true);
    
    try {
      // Mark onboarding as complete
      const { error } = await supabase
        .from('users')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Redirect to homepage
      router.push('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Redirect anyway
      router.push('/');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Welcome to FindSoupNearMe!</title>
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Welcome Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to FindSoupNearMe! 🍜
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your account has been created successfully.
          </p>
          
          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              What you can do now:
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-semibold text-gray-900 mb-2">Discover</h3>
                <p className="text-sm text-gray-600">
                  Find amazing soup restaurants in your area
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="font-semibold text-gray-900 mb-2">Favorite</h3>
                <p className="text-sm text-gray-600">
                  Save your favorite spots for easy access
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="text-4xl mb-3">✍️</div>
                <h3 className="font-semibold text-gray-900 mb-2">Review</h3>
                <p className="text-sm text-gray-600">
                  Share your experiences with the community
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <button
            onClick={completeOnboarding}
            disabled={isCompleting}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                Start Exploring Soup Restaurants
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            You can change your account type anytime in settings
          </p>
        </div>
      </div>
    </>
  );
}