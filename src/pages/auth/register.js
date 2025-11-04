// src/pages/auth/register.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import Head from 'next/head';
import Link from 'next/link';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signUp, error: authError, clearError, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear form errors
    if (formError) setFormError('');
    if (authError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setFormError('');

    try {
      const { user, error } = await signUp({
        email: formData.email,
        password: formData.password,
        userData: {
          name: formData.name,
        },
      });

      if (error) {
        setFormError(error.message || 'Registration failed. Please try again.');
      } else if (user) {
        // Show success message and redirect
        router.push('/?message=Please check your email to confirm your account');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  return (
    <>
      <Head>
        <title>Create Account - FindSoupNearMe</title>
        <meta name="description" content="Create your FindSoupNearMe account and start discovering amazing soup spots" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg">
              <span className="text-3xl">🍜</span>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join FindSoupNearMe and discover amazing soup spots
            </p>
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={navigateToLogin}
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-10">
              {/* Error Messages */}
              {(formError || authError) && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {formError || authError}
                </div>
              )}

              {/* Registration Form */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      validationErrors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    placeholder="John Doe"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`appearance-none block w-full px-4 py-3 border ${
                      validationErrors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    placeholder="you@example.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-3 border ${
                        validationErrors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`appearance-none block w-full px-4 py-3 border ${
                        validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acceptTerms" className="text-gray-700 cursor-pointer">
                      I agree to the{' '}
                      <Link href="/terms" className="text-orange-600 hover:text-orange-500 font-medium">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-orange-600 hover:text-orange-500 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                    {validationErrors.acceptTerms && (
                      <p className="mt-1 text-red-600">{validationErrors.acceptTerms}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </span>
                    ) : (
                      'Create account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Email Verification Notice */}
          <div className="text-center text-xs text-gray-500 bg-gray-50 rounded-lg p-4">
            <p>
              📧 You&apos;ll receive a verification email after registration.
              Please check your inbox and click the link to activate your account.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;