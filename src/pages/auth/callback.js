// src/pages/auth/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';

const AuthCallback = () => {
  const router = useRouter();
  const { user, loading, error } = useAuth();
  const [processing, setProcessing] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setProcessing(true);
        
        // Wait for auth state to be initialized
        if (!loading) {
          if (user) {
            // User is authenticated, redirect to dashboard or home
            const redirectTo = router.query.redirectTo || '/dashboard';
            router.push(redirectTo);
          } else if (error) {
            // There was an authentication error
            setAuthError(error);
            setTimeout(() => {
              router.push('/auth/login');
            }, 3000);
          } else {
            // No user and no error, redirect to login
            router.push('/auth/login');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setAuthError(err);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } finally {
        setProcessing(false);
      }
    };

    handleCallback();
  }, [user, loading, error, router]);

  if (processing || loading) {
    return (
      <>
        <Head>
          <title>Processing Authentication - FindSoupNearMe</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Authentication
              </h2>
              <p className="text-gray-600">
                Please wait while we complete your sign-in...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (authError) {
    return (
      <>
        <Head>
          <title>Authentication Error - FindSoupNearMe</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {authError.message || 'There was an error during authentication.'}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default AuthCallback; 