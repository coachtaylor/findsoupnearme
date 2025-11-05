// src/pages/auth/register.js
/**
 * Enhanced Registration Page
 * Asks users if they're a Customer or Restaurant Owner
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

const RegisterPage = () => {
  const [step, setStep] = useState(1); // 1: Choose type, 2: Sign up form
  const [userType, setUserType] = useState(null); // 'customer' or 'owner'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    // Owner-specific fields
    restaurantName: '',
    phoneNumber: '',
    agreeToTerms: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { signUp, signInWithOAuth, error: authError, clearError, user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear errors
    if (formError) setFormError('');
    if (authError) clearError();
  };
  
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setFormError('Please enter your full name');
      return false;
    }
    
    if (!formData.email.trim()) {
      setFormError('Please enter your email');
      return false;
    }
    
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }
    
    if (userType === 'owner') {
      if (!formData.restaurantName.trim()) {
        setFormError('Please enter your restaurant name');
        return false;
      }
      
      if (!formData.phoneNumber.trim()) {
        setFormError('Please enter your phone number');
        return false;
      }
    }
    
    if (!formData.agreeToTerms) {
      setFormError('Please agree to the Terms of Service');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setFormError('');
    
    try {
      // Prepare user metadata
      const userData = {
        full_name: formData.fullName,
        user_type: userType,
        onboarding_complete: false,
      };
      
      // Add owner-specific data
      if (userType === 'owner') {
        userData.restaurant_name = formData.restaurantName;
        userData.phone_number = formData.phoneNumber;
      }
      
      const { user: newUser, error } = await signUp({
        email: formData.email,
        password: formData.password,
        userData,
      });
      
      if (error) {
        setFormError(error.message || 'Sign up failed');
      } else if (newUser) {
        // Redirect based on user type
        if (userType === 'customer') {
          router.push('/onboarding/customer');
        } else {
          router.push('/onboarding/owner');
        }
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOAuthSignUp = async (provider) => {
    if (!userType) {
      setFormError('Please select your account type first');
      return;
    }
    
    try {
      setFormError('');
      
      // Store user type in session storage for OAuth callback
      sessionStorage.setItem('signup_user_type', userType);
      
      const { error } = await signInWithOAuth(provider, {
        redirectTo: `${window.location.origin}/auth/callback?onboarding=true`,
      });
      
      if (error) {
        setFormError(error.message || 'OAuth sign-up failed');
      }
    } catch (err) {
      setFormError('An unexpected error occurred');
    }
  };
  
  // Step 1: Choose User Type
  if (step === 1) {
    return (
      <>
        <Head>
          <title>Sign Up - FindSoupNearMe</title>
          <meta name="description" content="Create your FindSoupNearMe account" />
        </Head>
        
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                  Sign in
                </Link>
              </p>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                I am a...
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Card */}
                <button
                  onClick={() => {
                    setUserType('customer');
                    setStep(2);
                  }}
                  className="relative rounded-lg border-2 border-gray-300 bg-white p-8 shadow-sm hover:border-orange-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-5xl mb-4">🍜</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Soup Lover
                    </h4>
                    <p className="text-sm text-gray-600">
                      I want to discover and favorite soup restaurants in my area and add reviews
                    </p>
                  </div>
                </button>
                
                {/* Restaurant Owner Card */}
                <button
                  onClick={() => {
                    setUserType('owner');
                    setStep(2);
                  }}
                  className="relative rounded-lg border-2 border-gray-300 bg-white p-8 shadow-sm hover:border-orange-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-5xl mb-4">🏪</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Restaurant Owner
                    </h4>
                    <p className="text-sm text-gray-600">
                      I want to manage my restaurant's listing and connect with customers
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // Step 2: Sign Up Form
  return (
    <>
      <Head>
        <title>Sign Up - FindSoupNearMe</title>
        <meta name="description" content="Create your FindSoupNearMe account" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back to account type
            </button>
            
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              {userType === 'customer' ? '🍜 Soup Lover' : '🏪 Restaurant Owner'} Sign Up
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                Sign in
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="John Doe"
              />
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            
            {/* Owner-specific fields */}
            {userType === 'owner' && (
              <>
                <div>
                  <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                    Restaurant Name *
                  </label>
                  <input
                    id="restaurantName"
                    name="restaurantName"
                    type="text"
                    required
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="My Soup Restaurant"
                  />
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </>
            )}
            
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="At least 6 characters"
              />
            </div>
            
            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Re-enter password"
              />
            </div>
            
            {/* Terms Agreement */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            {/* Error Message */}
            {(formError || authError) && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {formError || authError?.message || 'An error occurred'}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
            
            {/* OAuth Providers */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handleOAuthSignUp('google')}
                  className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Use no layout for auth pages
RegisterPage.getLayout = function getLayout(page) {
  return page;
};

export default RegisterPage;