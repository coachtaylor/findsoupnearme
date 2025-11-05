// src/pages/auth/callback.js
/**
 * OAuth Callback Handler
 * Handles the redirect after OAuth authentication
 * Routes users based on their type (customer or owner)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this is an onboarding flow
        const isOnboarding = router.query.onboarding === 'true';
        
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          // No session, redirect to login
          router.push('/auth/login');
          return;
        }
        
        // If this is onboarding, get the user type from session storage
        if (isOnboarding) {
          const userType = sessionStorage.getItem('signup_user_type');
          sessionStorage.removeItem('signup_user_type'); // Clean up
          
          if (userType === 'customer') {
            router.push('/onboarding/customer');
          } else if (userType === 'owner') {
            router.push('/onboarding/owner');
          } else {
            // No user type set, go to home
            router.push('/');
          }
        } else {
          // Regular login, check if user has completed onboarding
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          // Get redirect URL from query params or default to home
          const redirectTo = router.query.redirectTo || '/';
          router.push(redirectTo);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };
    
    // Only run if router is ready
    if (router.isReady) {
      handleCallback();
    }
  }, [router, router.isReady, router.query]);
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-red-900">Authentication Error</h2>
            </div>
            <p className="text-red-800 mb-4">{error}</p>
            <p className="text-sm text-red-700">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

// No layout for callback page
AuthCallback.getLayout = function getLayout(page) {
  return page;
};